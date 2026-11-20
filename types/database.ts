export type AccountRole = "professional" | "admin" | "client";
export type ApprovalStatus = "pending" | "approved" | "rejected" | "suspended";
export type BookingStatus = "pending" | "accepted" | "rejected" | "completed" | "cancelled";

export interface Profile {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  endereco: string | null;
  foto_url?: string | null;
  tipo_conta: AccountRole;
  created_at: string;
}

export interface ProfessionalRecord {
  id: string;
  descricao_experiencia: string;
  cidade: string;
  bairro: string;
  valor_hora: number;
  servicos: string[];
  status: ApprovalStatus;
  created_at: string;
}

export interface BookingRecord {
  id: string;
  client_id: string;
  professional_id: string;
  servico: string;
  data_servico: string;
  horario: string;
  duracao_horas: number;
  endereco: string;
  valor_total: number;
  status: BookingStatus;
  created_at: string;
  client_profile?: {
    nome: string;
    telefone: string | null;
  } | null;
  professional_info?: {
    bairro: string;
    cidade: string;
    valor_hora: number;
    profiles: {
      nome: string;
      telefone: string | null;
    } | null;
  } | null;
}
