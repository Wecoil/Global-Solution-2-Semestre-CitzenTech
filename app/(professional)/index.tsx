import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CalendarDays, CheckCircle2, Clock3, MapPin, Wallet } from "@/components/icons";
import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { useAuth } from "@/context/AuthContext";
import { fetchProfessionalBookings } from "@/services/bookingsService";
import type { BookingRecord } from "@/types/database";
import { colors } from "@/constants/theme";

const STATUS_BANNER: Record<
  string,
  { bg: string; title: string; desc: string; dot: string }
> = {
  approved: {
    bg: colors.green,
    title: "Perfil aprovado e visível no app",
    desc: "Clientes já encontram seu perfil nas buscas e podem enviar solicitações.",
    dot: "#A8E0B8",
  },
  pending: {
    bg: "#9C6B19",
    title: "Cadastro em análise (pending)",
    desc: "Seu perfil foi enviado e aguarda aprovação no Painel Administrativo Web.",
    dot: "#FDE68A",
  },
  rejected: {
    bg: colors.red,
    title: "Cadastro não aprovado (rejected)",
    desc: "Revise seus dados na aba Perfil ou no Portal Web para nova análise.",
    dot: "#FECACA",
  },
  suspended: {
    bg: "#475569",
    title: "Perfil temporariamente suspenso",
    desc: "Seu perfil está oculto das buscas públicas no momento.",
    dot: "#CBD5E1",
  },
};

export default function ProfessionalHome() {
  const router = useRouter();
  const { user, profile, professional, refreshProfile } = useAuth();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);

  useFocusEffect(
    useCallback(() => {
      refreshProfile();
      if (!user) return;
      fetchProfessionalBookings(user.id).then(setBookings);
    }, [user, refreshProfile])
  );

  const proName = profile?.nome || "Ana Paula";
  const initials = proName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

  const currentStatus = professional?.status ?? "pending";
  const banner = STATUS_BANNER[currentStatus] ?? STATUS_BANNER.pending;

  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const confirmedList = bookings.filter(
    (b) => b.status === "accepted" || b.status === "completed"
  );
  const totalEarnings = confirmedList.reduce(
    (acc, item) => acc + Number(item.valor_total || 0),
    0
  );
  const nextService = bookings.find((b) => b.status === "accepted");

  return (
    <Screen>
      <View style={styles.top}>
        <View>
          <Text style={styles.kicker}>ÁREA DA PROFISSIONAL</Text>
          <Text style={styles.title}>Olá, {proName.split(" ")[0]}!</Text>
          <Text style={styles.subtitle}>
            {professional
              ? `${professional.bairro} • R$ ${Number(professional.valor_hora).toFixed(0)}/hora`
              : "Veja como está seu dia."}
          </Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.initials}>{initials || "AP"}</Text>
        </View>
      </View>

      <View style={[styles.statusCard, { backgroundColor: banner.bg }]}>
        <View style={styles.statusLine}>
          <View style={[styles.onlineDot, { backgroundColor: banner.dot }]} />
          <Text style={styles.onlineText}>{banner.title}</Text>
        </View>
        <Text style={styles.statusDescription}>{banner.desc}</Text>
        <Pressable onPress={() => router.push("/(professional)/requests")}>
          <Text style={styles.statusAction}>
            {pendingCount > 0
              ? `Você tem ${pendingCount} solicitação(ões) pendente(s) →`
              : "Ver solicitações →"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Wallet color={colors.green} />
          <Text style={styles.statValue}>R$ {totalEarnings.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Ganhos confirmados</Text>
        </View>
        <View style={styles.stat}>
          <CheckCircle2 color={colors.green} />
          <Text style={styles.statValue}>{confirmedList.length}</Text>
          <Text style={styles.statLabel}>Serviços confirmados</Text>
        </View>
      </View>

      <SectionTitle title="Próximo serviço confirmado" />
      {nextService ? (
        <Pressable
          style={styles.nextCard}
          onPress={() => router.push("/(professional)/requests")}
        >
          <View style={styles.nextTop}>
            <Text style={styles.nextTag}>CONFIRMADO</Text>
            <Text style={styles.nextDate}>
              {nextService.data_servico} • {nextService.horario}
            </Text>
          </View>
          <Text style={styles.clientName}>
            {nextService.client_profile?.nome ?? "Cliente DiaristaJá"}
          </Text>
          <View style={styles.detail}>
            <MapPin size={14} color={colors.muted} />
            <Text style={styles.detailText}>{nextService.endereco}</Text>
          </View>
          <View style={styles.detail}>
            <Clock3 size={14} color={colors.muted} />
            <Text style={styles.detailText}>
              {nextService.servico} • {nextService.duracao_horas} horas
            </Text>
          </View>
          <View style={styles.nextBottom}>
            <Text style={styles.earnings}>
              Você recebe R$ {Number(nextService.valor_total).toFixed(2).replace(".", ",")}
            </Text>
            <Text style={styles.link}>Gerenciar →</Text>
          </View>
        </Pressable>
      ) : (
        <View style={styles.nextCard}>
          <Text style={styles.clientName}>Nenhum serviço confirmado ainda</Text>
          <Text style={styles.detailText}>
            Quando clientes contratarem você pelo app, as solicitações aparecerão na
            aba Solicitações.
          </Text>
        </View>
      )}

      <SectionTitle title="Atalhos" />
      <View style={styles.shortcuts}>
        <Pressable
          style={styles.shortcut}
          onPress={() => router.push("/(professional)/requests")}
        >
          <CalendarDays color={colors.green} />
          <Text style={styles.shortcutText}>Solicitações ({pendingCount})</Text>
        </Pressable>
        <Pressable
          style={styles.shortcut}
          onPress={() => router.push("/(professional)/profile")}
        >
          <Wallet color={colors.green} />
          <Text style={styles.shortcutText}>Editar perfil</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  kicker: { fontSize: 9, color: colors.green, fontWeight: "900", letterSpacing: 1 },
  title: { fontSize: 25, color: colors.ink, fontWeight: "900", marginTop: 5 },
  subtitle: { fontSize: 12, color: colors.muted, marginTop: 3 },
  avatar: { width: 52, height: 52, borderRadius: 18, backgroundColor: "#FFF0E7", alignItems: "center", justifyContent: "center" },
  initials: { fontSize: 16, color: "#A65D35", fontWeight: "900" },
  statusCard: { backgroundColor: colors.green, borderRadius: 20, padding: 17, gap: 8 },
  statusLine: { flexDirection: "row", alignItems: "center", gap: 7 },
  onlineDot: { width: 8, height: 8, borderRadius: 5, backgroundColor: "#A8E0B8" },
  onlineText: { fontSize: 13, color: colors.white, fontWeight: "800" },
  statusDescription: { fontSize: 11, color: "#F1F5F9", lineHeight: 17 },
  statusAction: { fontSize: 11, color: colors.white, fontWeight: "900", marginTop: 3 },
  stats: { flexDirection: "row", gap: 10 },
  stat: { flex: 1, backgroundColor: colors.white, borderRadius: 17, padding: 14, gap: 7, borderWidth: 1, borderColor: colors.line },
  statValue: { fontSize: 20, color: colors.ink, fontWeight: "900" },
  statLabel: { fontSize: 10, color: colors.muted },
  nextCard: { backgroundColor: colors.white, borderRadius: 19, padding: 15, gap: 9, borderWidth: 1, borderColor: colors.line },
  nextTop: { flexDirection: "row", justifyContent: "space-between" },
  nextTag: { fontSize: 9, color: colors.green, fontWeight: "900", letterSpacing: 0.7 },
  nextDate: { fontSize: 10, color: colors.muted, fontWeight: "700" },
  clientName: { fontSize: 16, color: colors.ink, fontWeight: "900" },
  detail: { flexDirection: "row", alignItems: "center", gap: 6 },
  detailText: { fontSize: 11, color: colors.muted, lineHeight: 16 },
  nextBottom: { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 10, marginTop: 3, flexDirection: "row", justifyContent: "space-between" },
  earnings: { fontSize: 12, color: colors.ink, fontWeight: "900" },
  link: { fontSize: 11, color: colors.green, fontWeight: "800" },
  shortcuts: { flexDirection: "row", gap: 10 },
  shortcut: { flex: 1, backgroundColor: colors.white, borderRadius: 16, padding: 15, alignItems: "center", gap: 8, borderWidth: 1, borderColor: colors.line },
  shortcutText: { fontSize: 11, color: colors.ink, fontWeight: "800" },
});
