import { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Check, CalendarDays, MapPin } from "@/components/icons";
import { Screen } from "@/components/Screen";
import { AppButton } from "@/components/AppButton";
import { fetchProfessionalById } from "@/services/professionalsService";
import { createBooking } from "@/services/bookingsService";
import { useAuth } from "@/context/AuthContext";
import { professionals, type Professional } from "@/data/mock";
import { colors } from "@/constants/theme";

export default function ConfirmationScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { id, hours, service, date, address } = useLocalSearchParams<{
    id: string;
    hours: string;
    service?: string;
    date?: string;
    address?: string;
  }>();

  const [worker, setWorker] = useState<Professional>(professionals[0]);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(true);
  const createdOnce = useRef(false);

  const durationHours = Number(hours || 4);
  const serviceName = service || "Limpeza completa";
  const serviceDate = date || "Hoje";
  const serviceAddress = address || "Rua Harmonia, 218 • Vila Madalena";

  useEffect(() => {
    async function initBooking() {
      const found = id ? await fetchProfessionalById(id) : professionals[0];
      const targetWorker = found ?? professionals[0];
      setWorker(targetWorker);

      if (!createdOnce.current && user) {
        createdOnce.current = true;
        try {
          const created = await createBooking({
            clientId: user.id,
            professionalId: targetWorker.id,
            servico: serviceName,
            dataServico: serviceDate,
            horario: "09:00",
            duracaoHoras: durationHours,
            endereco: serviceAddress,
            valorTotal: targetWorker.price * durationHours,
          });
          if (created?.id) {
            setBookingId(created.id);
          }
        } catch (err: any) {
          Alert.alert(
            "Aviso de sincronização",
            err?.message || "Não foi possível salvar o agendamento no banco."
          );
        }
      }
      setSaving(false);
    }

    initBooking();
  }, [id, user, serviceName, serviceDate, durationHours, serviceAddress]);

  return (
    <Screen contentStyle={styles.container}>
      <View style={styles.check}>
        <Check color={colors.white} size={40} strokeWidth={3} />
      </View>
      <Text style={styles.eyebrow}>TUDO CERTO!</Text>
      <Text style={styles.title}>
        {saving ? "Enviando solicitação..." : "Solicitação enviada"}
      </Text>
      <Text style={styles.copy}>
        Sua solicitação foi encaminhada para {worker.name}. Ela já aparece na aba
        Solicitações da profissional.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Resumo do serviço</Text>
        <Text style={styles.name}>{worker.name}</Text>
        <View style={styles.line}>
          <CalendarDays size={16} color={colors.green} />
          <Text style={styles.copyLine}>
            {serviceDate}, às 09:00 • {durationHours} horas ({serviceName})
          </Text>
        </View>
        <View style={styles.line}>
          <MapPin size={16} color={colors.green} />
          <Text style={styles.copyLine}>{serviceAddress}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.copy}>Total estimado</Text>
          <Text style={styles.total}>R$ {worker.price * durationHours},00</Text>
        </View>
      </View>

      <AppButton
        title="Acompanhar solicitação"
        onPress={() =>
          router.replace({
            pathname: "/tracking",
            params: bookingId ? { bookingId } : {},
          })
        }
      />
      <AppButton
        title="Voltar ao início"
        secondary
        onPress={() => router.replace("/(tabs)")}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", alignItems: "center", paddingTop: 30 },
  check: { width: 82, height: 82, borderRadius: 30, backgroundColor: colors.green, alignItems: "center", justifyContent: "center", marginBottom: 18 },
  eyebrow: { fontSize: 10, color: colors.green, fontWeight: "900", letterSpacing: 1.5 },
  title: { fontSize: 28, color: colors.ink, fontWeight: "900", marginTop: 8 },
  copy: { fontSize: 13, color: colors.muted, lineHeight: 21, textAlign: "center", maxWidth: 310 },
  card: { width: "100%", backgroundColor: colors.white, borderRadius: 20, padding: 18, gap: 13, marginVertical: 15 },
  cardTitle: { fontSize: 15, color: colors.ink, fontWeight: "800" },
  name: { fontSize: 16, color: colors.ink, fontWeight: "800" },
  line: { flexDirection: "row", alignItems: "center", gap: 8 },
  copyLine: { fontSize: 12, color: colors.muted, flex: 1 },
  totalRow: { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 13, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  total: { fontSize: 18, color: colors.ink, fontWeight: "900" },
});
