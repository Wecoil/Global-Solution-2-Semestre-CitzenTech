import { useCallback, useState } from "react";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { ArrowLeft, MapPin, Clock3, Phone, MessageCircle, ShieldCheck, CheckCircle2 } from "@/components/icons";
import { Screen } from "@/components/Screen";
import { AppButton } from "@/components/AppButton";
import { fetchBookingById } from "@/services/bookingsService";
import type { BookingRecord } from "@/types/database";
import { professionals } from "@/data/mock";
import { colors } from "@/constants/theme";

export default function TrackingScreen() {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>();
  const [booking, setBooking] = useState<BookingRecord | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!bookingId) return;
      fetchBookingById(bookingId).then(setBooking);
    }, [bookingId])
  );

  const workerName =
    booking?.professional_info?.profiles?.nome ?? professionals[0].name;
  const neighborhood =
    booking?.professional_info?.bairro ?? "Vila Madalena";
  const city = booking?.professional_info?.cidade ?? "São Paulo";
  const address = booking?.endereco ?? "Rua Harmonia, 218 • Vila Madalena";
  const schedule = booking
    ? `${booking.data_servico}, ${booking.horario} • Duração de ${booking.duracao_horas} horas`
    : "Hoje, 09:00 • Duração de 4 horas";

  const isAccepted = booking?.status === "accepted";
  const isRejected = booking?.status === "rejected";

  return (
    <Screen contentStyle={{ paddingTop: 8 }}>
      <Pressable onPress={() => router.back()}>
        <ArrowLeft color={colors.ink} />
      </Pressable>

      <Text style={styles.kicker}>ACOMPANHAMENTO</Text>
      <Text style={styles.title}>
        {isRejected
          ? "Solicitação recusada"
          : isAccepted
          ? "Sua ajuda está confirmada"
          : "Aguardando confirmação"}
      </Text>
      <Text style={styles.subtitle}>
        {isRejected
          ? "A profissional não pôde aceitar este horário. Você pode escolher outra profissional."
          : isAccepted
          ? "A profissional aceitou o serviço e chegará no horário combinado."
          : "Sua solicitação foi enviada para a profissional e aguarda resposta."}
      </Text>

      <View style={styles.map}>
        <View style={styles.roadA} />
        <View style={styles.roadB} />
        <View style={styles.mapPin}>
          <MapPin color={colors.white} />
        </View>
        <View style={styles.mapCaption}>
          <Text style={styles.mapCaptionText}>
            {neighborhood} • {city}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.status}>
          <CheckCircle2 color={isRejected ? colors.red : colors.green} />
          <Text
            style={[
              styles.statusText,
              { color: isRejected ? colors.red : colors.green },
            ]}
          >
            {isRejected
              ? "SOLICITAÇÃO RECUSADA"
              : isAccepted
              ? "SERVIÇO CONFIRMADO"
              : "SOLICITAÇÃO ENVIADA (PENDENTE)"}
          </Text>
        </View>

        <View style={styles.person}>
          <Image source={{ uri: professionals[0].photo }} style={styles.photo} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{workerName}</Text>
            <Text style={styles.sub}>⭐ 4,98 • Profissional verificada</Text>
          </View>
          <View style={styles.action}>
            <Phone color={colors.green} size={18} />
          </View>
          <View style={styles.action}>
            <MessageCircle color={colors.green} size={18} />
          </View>
        </View>

        <View style={styles.info}>
          <Clock3 color={colors.green} size={17} />
          <Text style={styles.sub}>{schedule}</Text>
        </View>
        <View style={styles.info}>
          <MapPin color={colors.green} size={17} />
          <Text style={styles.sub}>{address}</Text>
        </View>
      </View>

      <View style={styles.steps}>
        <View style={styles.step}>
          <CheckCircle2 color={colors.green} />
          <View style={{ flex: 1 }}>
            <Text style={styles.stepTitle}>Solicitação registrada</Text>
            <Text style={styles.sub}>Pedido enviado para {workerName}.</Text>
          </View>
        </View>
        <View style={styles.step}>
          <Clock3 color={isAccepted ? colors.green : colors.muted} />
          <View style={{ flex: 1 }}>
            <Text style={styles.stepTitle}>
              {isAccepted ? "Profissional confirmou!" : "Aguardando aceite da profissional"}
            </Text>
            <Text style={styles.sub}>
              Assim que ela aceitar no app dela, o status muda automaticamente aqui.
            </Text>
          </View>
        </View>
        <View style={styles.step}>
          <ShieldCheck color={colors.green} />
          <View style={{ flex: 1 }}>
            <Text style={styles.stepTitle}>Serviço protegido</Text>
            <Text style={styles.sub}>Conte com nosso suporte durante o atendimento.</Text>
          </View>
        </View>
      </View>

      <AppButton
        title="Voltar para início"
        secondary
        onPress={() => router.replace("/(tabs)")}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: { fontSize: 10, color: colors.green, fontWeight: "900", letterSpacing: 1 },
  title: { fontSize: 27, color: colors.ink, fontWeight: "900", lineHeight: 33 },
  subtitle: { fontSize: 12, color: colors.muted, lineHeight: 19 },
  map: { height: 180, borderRadius: 22, backgroundColor: "#E7F0E7", overflow: "hidden", alignItems: "center", justifyContent: "center" },
  roadA: { position: "absolute", height: 18, width: "130%", backgroundColor: "#FFFFFF", transform: [{ rotate: "-17deg" }] },
  roadB: { position: "absolute", height: 15, width: "120%", backgroundColor: "#FFFFFF", transform: [{ rotate: "48deg" }] },
  mapPin: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.green, alignItems: "center", justifyContent: "center", borderWidth: 5, borderColor: "#CBE3D0" },
  mapCaption: { position: "absolute", bottom: 10, backgroundColor: "#FFFFFF", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  mapCaptionText: { fontSize: 10, color: colors.ink, fontWeight: "800" },
  card: { backgroundColor: colors.white, borderRadius: 20, padding: 15, gap: 13 },
  status: { flexDirection: "row", alignItems: "center", gap: 7 },
  statusText: { fontSize: 10, color: colors.green, fontWeight: "900" },
  person: { flexDirection: "row", alignItems: "center", gap: 10 },
  photo: { width: 52, height: 52, borderRadius: 16 },
  name: { fontSize: 15, color: colors.ink, fontWeight: "800" },
  sub: { fontSize: 10, color: colors.muted, marginTop: 3 },
  action: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.mint, alignItems: "center", justifyContent: "center" },
  info: { flexDirection: "row", alignItems: "center", gap: 8 },
  steps: { gap: 16 },
  step: { flexDirection: "row", gap: 11, alignItems: "flex-start" },
  stepTitle: { fontSize: 12, color: colors.ink, fontWeight: "800", marginBottom: 2 },
});
