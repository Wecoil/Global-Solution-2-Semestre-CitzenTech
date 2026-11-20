import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { BookingRecord, BookingStatus } from "@/types/database";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUuid(id: string): boolean {
  return UUID_REGEX.test(id);
}

export async function createBooking(input: {
  clientId: string;
  professionalId: string;
  servico: string;
  dataServico: string;
  horario?: string;
  duracaoHoras: number;
  endereco: string;
  valorTotal: number;
}): Promise<BookingRecord | null> {
  if (!isSupabaseConfigured || !isValidUuid(input.professionalId)) {
    // Se o usuário selecionou um card mock (ex: id="ana") sem UUID real do Supabase,
    // retorna null para permitir o fluxo visual sem quebrar.
    return null;
  }

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      client_id: input.clientId,
      professional_id: input.professionalId,
      servico: input.servico,
      data_servico: input.dataServico,
      horario: input.horario ?? "09:00",
      duracao_horas: input.duracaoHoras,
      endereco: input.endereco,
      valor_total: input.valorTotal,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw error;
  return data as BookingRecord;
}

export async function fetchClientBookings(
  clientId: string
): Promise<BookingRecord[]> {
  if (!isSupabaseConfigured || !clientId) return [];

  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      id,
      client_id,
      professional_id,
      servico,
      data_servico,
      horario,
      duracao_horas,
      endereco,
      valor_total,
      status,
      created_at,
      professional_info:professionals (
        bairro,
        cidade,
        valor_hora,
        profiles (
          nome,
          telefone
        )
      )
    `
    )
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Erro ao buscar agendamentos do cliente:", error.message);
    return [];
  }

  return (data ?? []) as unknown as BookingRecord[];
}

export async function fetchProfessionalBookings(
  professionalId: string
): Promise<BookingRecord[]> {
  if (!isSupabaseConfigured || !professionalId) return [];

  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      id,
      client_id,
      professional_id,
      servico,
      data_servico,
      horario,
      duracao_horas,
      endereco,
      valor_total,
      status,
      created_at,
      client_profile:profiles!bookings_client_id_fkey (
        nome,
        telefone
      )
    `
    )
    .eq("professional_id", professionalId)
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Erro ao buscar solicitações da profissional:", error.message);
    return [];
  }

  return (data ?? []) as unknown as BookingRecord[];
}

export async function fetchBookingById(
  bookingId: string
): Promise<BookingRecord | null> {
  if (!isSupabaseConfigured || !isValidUuid(bookingId)) return null;

  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      id,
      client_id,
      professional_id,
      servico,
      data_servico,
      horario,
      duracao_horas,
      endereco,
      valor_total,
      status,
      created_at,
      professional_info:professionals (
        bairro,
        cidade,
        valor_hora,
        profiles (
          nome,
          telefone
        )
      )
    `
    )
    .eq("id", bookingId)
    .maybeSingle();

  if (error || !data) return null;
  return data as unknown as BookingRecord;
}

export async function respondToBooking(
  bookingId: string,
  status: Extract<BookingStatus, "accepted" | "rejected" | "completed" | "cancelled">
): Promise<void> {
  if (!isSupabaseConfigured || !isValidUuid(bookingId)) return;

  const { error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", bookingId);

  if (error) throw error;
}
