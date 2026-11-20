import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { MapPin, Clock3, CalendarDays, Check, X } from "@/components/icons";
import { Screen } from "@/components/Screen";
import { useAuth } from "@/context/AuthContext";
import { fetchProfessionalBookings, respondToBooking } from "@/services/bookingsService";
import type { BookingRecord } from "@/types/database";
import { colors } from "@/constants/theme";

export default function RequestsScreen() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchProfessionalBookings(user.id);
      setBookings(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadBookings();
    }, [loadBookings])
  );

  const pendingRequests = bookings.filter((b) => b.status === "pending");
  const acceptedRequests = bookings.filter((b) => b.status === "accepted");

  async function respond(id: string, accept: boolean) {
    const item = pendingRequests.find((r) => r.id === id);
    setUpdatingId(id);
    try {
      await respondToBooking(id, accept ? "accepted" : "rejected");
      setBookings((old) =>
        old.map((b) =>
          b.id === id ? { ...b, status: accept ? "accepted" : "rejected" } : b
        )
      );
      Alert.alert(
        accept ? "Solicitação aceita!" : "Solicitação recusada",
        accept
          ? `Você confirmou o serviço de ${item?.client_profile?.nome ?? "cliente"}. O cliente já vê a confirmação no app dele.`
          : "A solicitação foi recusada."
      );
    } catch (err: any) {
      Alert.alert("Erro", err?.message || "Não foi possível atualizar a solicitação.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <Screen>
      <View>
        <Text style={styles.kicker}>OPORTUNIDADES</Text>
        <Text style={styles.title}>Solicitações</Text>
        <Text style={styles.subtitle}>
          Pedidos enviados por clientes diretamente pelo aplicativo.
        </Text>
      </View>

      <View style={styles.counter}>
        <Text style={styles.counterNumber}>{pendingRequests.length}</Text>
        <Text style={styles.counterText}>
          {" "}
          solicitação(ões) aguardando sua resposta
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.green} style={{ marginTop: 20 }} />
      ) : null}

      {pendingRequests.map((item) => {
        const clientName = item.client_profile?.nome ?? "Cliente DiaristaJá";
        const busy = updatingId === item.id;
        return (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.badge}>NOVA SOLICITAÇÃO</Text>
              <Text style={styles.distance}>{item.horario}</Text>
            </View>
            <Text style={styles.client}>{clientName}</Text>
            <Text style={styles.service}>{item.servico}</Text>

            <View style={styles.info}>
              <CalendarDays color={colors.muted} size={15} />
              <Text style={styles.infoText}>
                {item.data_servico} • {item.horario}
              </Text>
            </View>
            <View style={styles.info}>
              <Clock3 color={colors.muted} size={15} />
              <Text style={styles.infoText}>{item.duracao_horas} horas</Text>
            </View>
            <View style={styles.info}>
              <MapPin color={colors.muted} size={15} />
              <Text style={styles.infoText}>{item.endereco}</Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Valor estimado para você</Text>
              <Text style={styles.price}>
                R$ {Number(item.valor_total).toFixed(2).replace(".", ",")}
              </Text>
            </View>

            <View style={styles.actions}>
              <Pressable
                disabled={busy}
                style={styles.reject}
                onPress={() => respond(item.id, false)}
              >
                <X color={colors.red} size={17} />
                <Text style={styles.rejectText}>Recusar</Text>
              </Pressable>
              <Pressable
                disabled={busy}
                style={styles.accept}
                onPress={() => respond(item.id, true)}
              >
                <Check color={colors.white} size={17} />
                <Text style={styles.acceptText}>
                  {busy ? "Salvando..." : "Aceitar serviço"}
                </Text>
              </Pressable>
            </View>
          </View>
        );
      })}

      {!loading && !pendingRequests.length ? (
        <View style={styles.empty}>
          <CalendarDays color={colors.green} size={35} />
          <Text style={styles.emptyTitle}>Tudo em dia!</Text>
          <Text style={styles.subtitle}>
            Não há novas solicitações pendentes no momento.
          </Text>
        </View>
      ) : null}

      {acceptedRequests.length > 0 ? (
        <>
          <Text style={styles.confirmedHeading}>
            Serviços já confirmados ({acceptedRequests.length})
          </Text>
          {acceptedRequests.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.badge}>CONFIRMADO</Text>
                <Text style={styles.distance}>
                  {item.data_servico} • {item.horario}
                </Text>
              </View>
              <Text style={styles.client}>
                {item.client_profile?.nome ?? "Cliente DiaristaJá"}
              </Text>
              <Text style={styles.infoText}>
                {item.servico} • {item.duracao_horas}h • {item.endereco}
              </Text>
              <Text style={styles.price}>
                R$ {Number(item.valor_total).toFixed(2).replace(".", ",")}
              </Text>
            </View>
          ))}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: { fontSize: 9, color: colors.green, fontWeight: "900", letterSpacing: 1 },
  title: { fontSize: 27, color: colors.ink, fontWeight: "900", marginTop: 5 },
  subtitle: { fontSize: 12, color: colors.muted, marginTop: 4 },
  counter: { backgroundColor: colors.mint, padding: 12, borderRadius: 14, flexDirection: "row", alignItems: "center" },
  counterNumber: { fontSize: 17, color: colors.green, fontWeight: "900" },
  counterText: { fontSize: 11, color: colors.green, fontWeight: "700" },
  card: { backgroundColor: colors.white, borderRadius: 19, padding: 15, borderWidth: 1, borderColor: colors.line, gap: 9 },
  cardTop: { flexDirection: "row", justifyContent: "space-between" },
  badge: { fontSize: 9, color: colors.green, fontWeight: "900", letterSpacing: 0.6 },
  distance: { fontSize: 10, color: colors.muted },
  client: { fontSize: 16, color: colors.ink, fontWeight: "900" },
  service: { fontSize: 12, color: colors.muted, marginTop: -6 },
  info: { flexDirection: "row", alignItems: "center", gap: 7 },
  infoText: { fontSize: 11, color: colors.muted, flex: 1 },
  priceRow: { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  priceLabel: { fontSize: 10, color: colors.muted },
  price: { fontSize: 17, color: colors.green, fontWeight: "900" },
  actions: { flexDirection: "row", gap: 8, marginTop: 3 },
  reject: { flex: 1, height: 45, borderRadius: 13, backgroundColor: "#FFF0EF", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 5 },
  rejectText: { fontSize: 12, color: colors.red, fontWeight: "800" },
  accept: { flex: 1.5, height: 45, borderRadius: 13, backgroundColor: colors.green, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 5 },
  acceptText: { fontSize: 12, color: colors.white, fontWeight: "800" },
  empty: { alignItems: "center", gap: 9, padding: 35, backgroundColor: colors.white, borderRadius: 18 },
  emptyTitle: { fontSize: 17, color: colors.ink, fontWeight: "900" },
  confirmedHeading: { fontSize: 16, fontWeight: "900", color: colors.ink, marginTop: 6 },
});
