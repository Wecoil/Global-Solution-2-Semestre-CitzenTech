import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronRight, MapPin, Sparkles } from "@/components/icons";
import { Screen } from "@/components/Screen";
import { useAuth } from "@/context/AuthContext";
import { fetchClientBookings } from "@/services/bookingsService";
import type { BookingRecord } from "@/types/database";
import { professionals } from "@/data/mock";
import { colors } from "@/constants/theme";

const STATUS_LABEL: Record<string, { text: string; color: string }> = {
  pending: { text: "AGUARDANDO CONFIRMAÇÃO", color: "#B7791F" },
  accepted: { text: "CONFIRMADO", color: colors.green },
  rejected: { text: "RECUSADO PELA PROFISSIONAL", color: colors.red },
  completed: { text: "CONCLUÍDO", color: colors.green },
  cancelled: { text: "CANCELADO", color: colors.muted },
};

export default function ActivityScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      if (!user) {
        setLoading(false);
        return;
      }
      fetchClientBookings(user.id)
        .then((data) => {
          if (active) setBookings(data);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }, [user])
  );

  const upcoming = bookings.filter((b) => b.status === "pending" || b.status === "accepted");
  const history = bookings.filter(
    (b) => b.status === "completed" || b.status === "rejected" || b.status === "cancelled"
  );

  return (
    <Screen>
      <View>
        <Text style={styles.kicker}>SEUS SERVIÇOS</Text>
        <Text style={styles.title}>Atividades</Text>
      </View>

      <View style={styles.tabs}>
        <Text style={styles.activeTab}>Próximas ({upcoming.length})</Text>
        <Text style={styles.inactiveTab}>Histórico ({history.length})</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.green} style={{ marginTop: 20 }} />
      ) : null}

      {!loading && upcoming.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.name}>Nenhum agendamento ativo</Text>
          <Text style={styles.address}>
            Escolha uma profissional na aba Buscar para solicitar um serviço.
          </Text>
        </View>
      ) : null}

      {upcoming.map((item) => {
        const proName = item.professional_info?.profiles?.nome ?? "Profissional";
        const st = STATUS_LABEL[item.status] ?? STATUS_LABEL.pending;
        return (
          <Pressable
            key={item.id}
            style={styles.card}
            onPress={() =>
              router.push({ pathname: "/tracking", params: { bookingId: item.id } })
            }
          >
            <View style={styles.status}>
              <View style={[styles.statusDot, { backgroundColor: st.color }]} />
              <Text style={[styles.statusText, { color: st.color }]}>{st.text}</Text>
            </View>
            <View style={styles.row}>
              <View style={styles.date}>
                <Text style={styles.dateNumber}>{item.duracao_horas}h</Text>
                <Text style={styles.dateDay}>
                  {item.data_servico.toUpperCase()}
                  {""}
                  {item.horario}
                </Text>
              </View>
              <Image source={{ uri: professionals[0].photo }} style={styles.photo} />
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.mini}>
                  {item.servico.toUpperCase()} • R$ {Number(item.valor_total).toFixed(0)}
                </Text>
                <Text style={styles.name}>{proName}</Text>
                <View style={styles.location}>
                  <MapPin size={13} color={colors.muted} />
                  <Text style={styles.address}>{item.endereco}</Text>
                </View>
              </View>
              <ChevronRight size={18} color={colors.muted} />
            </View>
          </Pressable>
        );
      })}

      <Text style={styles.section}>Histórico</Text>
      {history.length === 0 ? (
        <Text style={styles.address}>Seus serviços concluídos aparecerão aqui.</Text>
      ) : (
        history.map((item) => (
          <View key={item.id} style={styles.past}>
            <View style={styles.pastIcon}>
              <Sparkles color={colors.green} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.servico}</Text>
              <Text style={styles.address}>
                {item.data_servico} •{" "}
                {item.professional_info?.profiles?.nome ?? "Profissional"}
              </Text>
            </View>
            <Text style={styles.amount}>R$ {Number(item.valor_total).toFixed(0)}</Text>
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: { fontSize: 10, color: colors.green, fontWeight: "900", letterSpacing: 1 },
  title: { fontSize: 28, color: colors.ink, fontWeight: "800", marginTop: 5 },
  tabs: { flexDirection: "row", gap: 22, borderBottomWidth: 1, borderBottomColor: colors.line, paddingBottom: 12 },
  activeTab: { color: colors.green, fontWeight: "800", borderBottomWidth: 2, borderBottomColor: colors.green, paddingBottom: 10, marginBottom: -13 },
  inactiveTab: { color: colors.muted, fontWeight: "600" },
  emptyCard: { backgroundColor: colors.white, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: colors.line, gap: 6 },
  card: { backgroundColor: colors.white, borderRadius: 20, padding: 15, borderWidth: 1, borderColor: colors.line, gap: 15 },
  status: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusDot: { width: 7, height: 7, borderRadius: 5, backgroundColor: colors.green },
  statusText: { fontSize: 9, color: colors.green, fontWeight: "900", letterSpacing: 0.8 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  date: { width: 48, alignItems: "center" },
  dateNumber: { fontSize: 21, color: colors.ink, fontWeight: "800" },
  dateDay: { fontSize: 9, color: colors.muted, fontWeight: "700", textAlign: "center", lineHeight: 13 },
  photo: { width: 49, height: 49, borderRadius: 14 },
  mini: { fontSize: 9, color: colors.muted, fontWeight: "800" },
  name: { fontSize: 14, color: colors.ink, fontWeight: "800" },
  location: { flexDirection: "row", alignItems: "center", gap: 3 },
  address: { fontSize: 11, color: colors.muted },
  section: { fontSize: 17, color: colors.ink, fontWeight: "800", marginTop: 6 },
  past: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.white, padding: 13, borderRadius: 16 },
  pastIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.mint, alignItems: "center", justifyContent: "center" },
  amount: { fontSize: 13, color: colors.ink, fontWeight: "800" },
});
