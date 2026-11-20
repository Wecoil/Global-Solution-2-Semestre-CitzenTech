import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { professionals as mockProfessionals, type Professional } from "@/data/mock";
import type { ProfessionalRecord } from "@/types/database";

const AVATAR_POOL = [
  "https://images.unsplash.com/photo-1704579924216-31ef96f7e008?crop=faces&fit=crop&w=500&h=500&q=85",
  "https://images.unsplash.com/photo-1517945577684-acd9255116a7?crop=faces&fit=crop&w=500&h=500&q=85",
  "https://images.unsplash.com/photo-1694185766501-487b73d10332?crop=faces&fit=crop&w=500&h=500&q=85",
];

function getAvatarForId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_POOL[Math.abs(hash) % AVATAR_POOL.length];
}

function mapSupabaseProfessional(row: any): Professional {
  const nome = row.profiles?.nome ?? "Profissional DiaristaJá";
  const servicos = Array.isArray(row.servicos) && row.servicos.length > 0
    ? row.servicos
    : ["Limpeza completa"];

  return {
    id: row.id,
    name: nome,
    photo: row.profiles?.foto_url || getAvatarForId(row.id),
    rating: "4,95",
    jobs: 12,
    price: Number(row.valor_hora) || 40,
    tag: "Verificada",
    distance: row.cidade || "São Paulo",
    neighborhood: row.bairro || "Centro",
    description:
      row.descricao_experiencia ||
      "Profissional verificada cadastrada na plataforma DiaristaJá.",
    skills: servicos,
    availability: ["Seg", "Ter", "Qua", "Qui", "Sex"],
  };
}

/**
 * Busca todas as profissionais com status 'approved' no Supabase (cadastradas na Web ou no App).
 * Mantém também os perfis demonstrativos caso o banco ainda esteja vazio, ou combina ambos.
 */
export async function fetchApprovedProfessionals(
  includeMockFallback = true
): Promise<Professional[]> {
  if (!isSupabaseConfigured) {
    return mockProfessionals;
  }

  const { data, error } = await supabase
    .from("professionals")
    .select(
      `
      id,
      descricao_experiencia,
      cidade,
      bairro,
      valor_hora,
      servicos,
      status,
      created_at,
      profiles (
        nome,
        email,
        telefone,
        foto_url
      )
    `
    )
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Erro ao buscar profissionais no Supabase:", error.message);
    return mockProfessionals;
  }

  const liveList = (data ?? []).map(mapSupabaseProfessional);

  if (liveList.length === 0 && includeMockFallback) {
    return mockProfessionals;
  }

  return liveList;
}

export async function fetchProfessionalById(
  id: string
): Promise<Professional | null> {
  const mockMatch = mockProfessionals.find((p) => p.id === id);
  if (!isSupabaseConfigured || mockMatch) {
    return mockMatch ?? mockProfessionals[0];
  }

  const { data, error } = await supabase
    .from("professionals")
    .select(
      `
      id,
      descricao_experiencia,
      cidade,
      bairro,
      valor_hora,
      servicos,
      status,
      created_at,
      profiles (
        nome,
        email,
        telefone,
        foto_url
      )
    `
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapSupabaseProfessional(data);
}

export async function updateMyProfessionalData(
  userId: string,
  updates: {
    nome?: string;
    telefone?: string;
    cidade: string;
    bairro: string;
    valor_hora: number;
    servicos: string[];
    descricao_experiencia: string;
  }
): Promise<ProfessionalRecord> {
  if (updates.nome || updates.telefone !== undefined) {
    await supabase
      .from("profiles")
      .update({
        ...(updates.nome ? { nome: updates.nome } : {}),
        ...(updates.telefone !== undefined ? { telefone: updates.telefone } : {}),
      })
      .eq("id", userId);
  }

  const { data, error } = await supabase
    .from("professionals")
    .update({
      cidade: updates.cidade,
      bairro: updates.bairro,
      valor_hora: updates.valor_hora,
      servicos: updates.servicos,
      descricao_experiencia: updates.descricao_experiencia,
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data as ProfessionalRecord;
}
