import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ArrowLeft, Clock3, MapPin, Minus, Plus } from "@/components/icons";
import { Screen } from "@/components/Screen";
import { AppButton } from "@/components/AppButton";
import { useAuth } from "@/context/AuthContext";
import { colors } from "@/constants/theme";

export default function BookingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ service?: string; professionalId?: string }>();
  const { profile } = useAuth();

  const [service, setService] = useState(params.service ?? "Limpeza completa");
  const [date, setDate] = useState("Hoje");
  const [hours, setHours] = useState(4);
  const [address, setAddress] = useState(
    profile?.endereco || "Rua Harmonia, 218 • Vila Madalena"
  );

  const dates = [
    { label: "Hoje", day: "22", week: "QUI" },
    { label: "Amanhã", day: "23", week: "SEX" },
    { label: "Sáb, 24", day: "24", week: "SÁB" },
  ];

  return (
    <Screen contentStyle={{ paddingTop: 10 }}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <ArrowLeft color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Agendar ajuda</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.step}>PASSO 1 DE 3</Text>
      <Text style={styles.title}>Como podemos ajudar?</Text>

      <Text style={styles.label}>Tipo de serviço</Text>
      <Text style={styles.serviceHint}>Também é possível contratar profissionais para manutenção residencial.</Text>
      <View style={styles.chips}>
        {["Limpeza completa", "Passadoria", "Cozinha", "Encanador", "Eletricista"].map((s) => (
          <Pressable
            key={s}
            onPress={() => setService(s)}
            style={[styles.chip, service === s && styles.selected]}
          >
            <Text style={[styles.chipText, service === s && styles.selectedText]}>
              {s}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Quando?</Text>
      <View style={styles.dates}>
        {dates.map((d) => (
          <Pressable
            key={d.label}
            onPress={() => setDate(d.label)}
            style={[styles.date, date === d.label && styles.selected]}
          >
            <Text style={[styles.week, date === d.label && styles.selectedText]}>
              {d.week}
            </Text>
            <Text style={[styles.day, date === d.label && styles.selectedText]}>
              {d.day}
            </Text>
            <Text style={[styles.dateLabel, date === d.label && styles.selectedText]}>
              {d.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Horário de início</Text>
      <View style={styles.field}>
        <Clock3 color={colors.green} />
        <Text style={styles.fieldText}>09:00</Text>
      </View>

      <View style={styles.duration}>
        <View>
          <Text style={styles.label}>Duração</Text>
          <Text style={styles.helper}>Recomendado: 4h</Text>
        </View>
        <View style={styles.stepper}>
          <Pressable
            onPress={() => setHours(Math.max(2, hours - 1))}
            style={styles.stepButton}
          >
            <Minus size={16} color={colors.green} />
          </Pressable>
          <Text style={styles.hours}>{hours}h</Text>
          <Pressable
            onPress={() => setHours(Math.min(8, hours + 1))}
            style={styles.stepButton}
          >
            <Plus size={16} color={colors.green} />
          </Pressable>
        </View>
      </View>

      <Text style={styles.label}>Onde?</Text>
      <View style={styles.field}>
        <MapPin color={colors.green} />
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder="Informe o endereço completo"
          placeholderTextColor="#9AA69E"
          style={styles.addressInput}
        />
      </View>

      <View style={styles.bottom}>
        <View>
          <Text style={styles.helper}>A partir de</Text>
          <Text style={styles.total}>R$ {hours * 38},00</Text>
        </View>
        <AppButton
          title="Continuar"
          arrow
          onPress={() =>
            router.push({
              pathname: "/professionals",
              params: {
                service,
                hours: String(hours),
                date,
                address,
                ...(params.professionalId
                  ? { professionalId: params.professionalId }
                  : {}),
              },
            })
          }
          style={{ flex: 1 }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { fontSize: 17, color: colors.ink, fontWeight: "800" },
  step: { fontSize: 9, color: colors.green, fontWeight: "900", letterSpacing: 1 },
  title: { fontSize: 26, color: colors.ink, fontWeight: "800", marginTop: -12 },
  label: { fontSize: 13, color: colors.ink, fontWeight: "800", marginBottom: -12 },
  serviceHint: { fontSize: 10, color: colors.muted, lineHeight: 15, marginTop: -8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 11, borderRadius: 13, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  selected: { backgroundColor: colors.green, borderColor: colors.green },
  chipText: { fontSize: 12, color: colors.ink, fontWeight: "700" },
  selectedText: { color: colors.white },
  dates: { flexDirection: "row", gap: 9 },
  date: { flex: 1, backgroundColor: colors.white, borderRadius: 15, paddingVertical: 12, alignItems: "center", gap: 3, borderWidth: 1, borderColor: colors.line },
  week: { fontSize: 9, color: colors.muted, fontWeight: "800" },
  day: { fontSize: 23, color: colors.ink, fontWeight: "800" },
  dateLabel: { fontSize: 10, color: colors.muted },
  field: { minHeight: 54, backgroundColor: colors.white, borderRadius: 15, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 10 },
  fieldText: { fontSize: 13, color: colors.ink, fontWeight: "700" },
  addressInput: { flex: 1, fontSize: 13, color: colors.ink, fontWeight: "600" },
  helper: { fontSize: 10, color: colors.muted, marginTop: 3 },
  duration: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  stepper: { flexDirection: "row", alignItems: "center", gap: 15 },
  stepButton: { width: 34, height: 34, borderRadius: 12, backgroundColor: colors.mint, alignItems: "center", justifyContent: "center" },
  hours: { fontSize: 16, color: colors.ink, fontWeight: "800" },
  bottom: { marginTop: 4, flexDirection: "row", alignItems: "center", gap: 15 },
  total: { fontSize: 19, color: colors.ink, fontWeight: "900" },
});
