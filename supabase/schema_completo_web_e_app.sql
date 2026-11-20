-- ============================================================================
-- DIARISTAJÁ - SCHEMA COMPLETO & BIDIRECIONAL (WEB + APP MOBILE)
-- Execute este script no SQL Editor do Supabase (mesmo projeto do diaristaja-web)
-- ============================================================================

-- 1. Tabela de perfis básicos (vinculada ao auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  email text not null unique,
  telefone text,
  endereco text,
  tipo_conta text not null default 'client'
    check (tipo_conta in ('professional', 'admin', 'client')),
  created_at timestamptz not null default now()
);

-- Garante coluna endereco caso a tabela profiles já tenha sido criada anteriormente
alter table public.profiles add column if not exists endereco text;

-- 2. Tabela de dados profissionais
create table if not exists public.professionals (
  id uuid primary key references public.profiles(id) on delete cascade,
  descricao_experiencia text not null,
  cidade text not null,
  bairro text not null,
  valor_hora numeric(10, 2) not null check (valor_hora >= 0),
  servicos text[] not null default '{}',
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'suspended')),
  created_at timestamptz not null default now()
);

create index if not exists idx_professionals_status on public.professionals(status);
create index if not exists idx_professionals_cidade on public.professionals(cidade);

-- 3. Tabela de solicitações / agendamentos (sincroniza Cliente <-> Profissional)
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  professional_id uuid not null references public.professionals(id) on delete cascade,
  servico text not null,
  data_servico text not null,
  horario text not null default '09:00',
  duracao_horas integer not null default 4 check (duracao_horas >= 1),
  endereco text not null,
  valor_total numeric(10, 2) not null check (valor_total >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists idx_bookings_client on public.bookings(client_id);
create index if not exists idx_bookings_professional on public.bookings(professional_id);
create index if not exists idx_bookings_status on public.bookings(status);

-- 4. Trigger automático ao criar usuário no Supabase Auth (Web ou App)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nome, email, telefone, endereco, tipo_conta)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'telefone',
    new.raw_user_meta_data->>'endereco',
    coalesce(new.raw_user_meta_data->>'tipo_conta', 'client')
  )
  on conflict (id) do update set
    nome = excluded.nome,
    telefone = coalesce(excluded.telefone, public.profiles.telefone),
    endereco = coalesce(excluded.endereco, public.profiles.endereco),
    tipo_conta = coalesce(excluded.tipo_conta, public.profiles.tipo_conta);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Função auxiliar para verificar admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and tipo_conta = 'admin'
  );
$$;

-- 6. Habilitar RLS
alter table public.profiles enable row level security;
alter table public.professionals enable row level security;
alter table public.bookings enable row level security;

-- ============================================================================
-- POLÍTICAS RLS: PROFILES
-- ============================================================================
drop policy if exists "Perfis de profissionais aprovados sao publicos" on public.profiles;
create policy "Perfis de profissionais aprovados sao publicos"
  on public.profiles for select
  using (
    exists (
      select 1 from public.professionals p
      where p.id = profiles.id and p.status = 'approved'
    )
  );

drop policy if exists "Profissional ve perfil de clientes com agendamento" on public.profiles;
create policy "Profissional ve perfil de clientes com agendamento"
  on public.profiles for select
  using (
    exists (
      select 1 from public.bookings b
      where b.client_id = profiles.id and b.professional_id = auth.uid()
    )
  );

drop policy if exists "Usuario ve proprio perfil e admin ve todos" on public.profiles;
create policy "Usuario ve proprio perfil e admin ve todos"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

drop policy if exists "Usuario insere proprio perfil" on public.profiles;
create policy "Usuario insere proprio perfil"
  on public.profiles for insert
  with check (auth.uid() = id and tipo_conta <> 'admin');

drop policy if exists "Usuario atualiza proprio perfil" on public.profiles;
create policy "Usuario atualiza proprio perfil"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and (tipo_conta <> 'admin' or public.is_admin())
  );

-- ============================================================================
-- POLÍTICAS RLS: PROFESSIONALS
-- ============================================================================
drop policy if exists "Apenas profissionais aprovados sao visiveis publicamente" on public.professionals;
create policy "Apenas profissionais aprovados sao visiveis publicamente"
  on public.professionals for select
  using (status = 'approved');

drop policy if exists "Profissional ve proprio status e admin ve todos" on public.professionals;
create policy "Profissional ve proprio status e admin ve todos"
  on public.professionals for select
  using (auth.uid() = id or public.is_admin());

drop policy if exists "Profissional cria cadastro como pending" on public.professionals;
create policy "Profissional cria cadastro como pending"
  on public.professionals for insert
  with check (auth.uid() = id and status = 'pending');

drop policy if exists "Profissional edita dados mantendo status" on public.professionals;
create policy "Profissional edita dados mantendo status"
  on public.professionals for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and status = (select p.status from public.professionals p where p.id = auth.uid())
  );

drop policy if exists "Admin atualiza qualquer profissional" on public.professionals;
create policy "Admin atualiza qualquer profissional"
  on public.professionals for update
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- POLÍTICAS RLS: BOOKINGS (AGENDAMENTOS)
-- ============================================================================
drop policy if exists "Cliente e profissional veem proprios agendamentos" on public.bookings;
create policy "Cliente e profissional veem proprios agendamentos"
  on public.bookings for select
  using (
    auth.uid() = client_id
    or auth.uid() = professional_id
    or public.is_admin()
  );

drop policy if exists "Cliente cria agendamento" on public.bookings;
create policy "Cliente cria agendamento"
  on public.bookings for insert
  with check (auth.uid() = client_id);

drop policy if exists "Profissional e cliente atualizam agendamento" on public.bookings;
create policy "Profissional e cliente atualizam agendamento"
  on public.bookings for update
  using (
    auth.uid() = professional_id
    or auth.uid() = client_id
    or public.is_admin()
  );
