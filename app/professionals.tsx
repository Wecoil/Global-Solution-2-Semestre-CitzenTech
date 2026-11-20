import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { ArrowLeft, ShieldCheck } from "@/components/icons";
import { Screen } from "@/components/Screen";
import { ProfessionalCard } from "@/components/ProfessionalCard";
import { AppButton } from "@/components/AppButton";
import { fetchApprovedProfessionals } from "@/services/professionalsService";
import { professionals as mockProfessionals, type Professional } from "@/data/mock";
import { colors } from "@/constants/theme";

export default function ProfessionalsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    hours?: string;
    service?: string;
    date?: string;
    address?: string;
    professionalId?: string;
    service?: string;
  }>();

  const [list, setList] = useState<Professional[]>(mockProfessionals);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(true);
  const hours = Number(params.hours ?? 4);

  useEffect(() => {
    const isMaintenanceService =
      params.service === "Encanador" || params.service === "Eletricista";

    fetchApprovedProfessionals(!isMaintenanceService)
      .then((data) => {
        const requestedService = params.service?.trim().toLocaleLowerCase("pt-BR");
        const filteredData = requestedService
          ? data.filter((item) =>
              item.skills.some(
                (skill) => skill.trim().toLocaleLowerCase("pt-BR") === requestedService
              )
            )
          : data;
        setList(filteredData);
        if (params.professionalId) {
          const idx = data.findIndex((item) => item.id === params.professionalId);
          if (idx >= 0) setSelected(idx);
        }
      })
      .finally(() => setLoading(false));
  }, [params.professionalId, params.service]);

  const chosen = list[selected] ?? list[0];

  return (
    <Screen contentStyle={{ paddingTop: 10 }}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <ArrowLeft color={colors.ink} />
        </Pressable>
        <Text style={styles.title}>Escolha seu profissional</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.summary}>
        <View>
          <Text style={styles.count}>{list.length} profissionais disponíveis</Text>
          <Text style={styles.sub}>
            {params.date ?? "Hoje"}, 09:00 • {hours} horas
          </Text>
        </View>
        <View style={styles.verified}>
          <ShieldCheck size={14} color={colors.green} />
          <Text style={styles.verifiedText}>Aprovadas</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.green} style={{ marginVertical: 20 }} />
      ) : (
        list.map((p, i) => (
          <Pressable
            key={p.id}
            onPress={() => setSelected(i)}
            style={[styles.option, selected === i && styles.selected]}
          >
            <View style={[styles.radio, selected === i && styles.radioOn]}>
              {selected === i ? <View style={styles.radioDot} /> : null}
            </View>
            <View style={{ flex: 1 }}>
              <ProfessionalCard
                item={p}
                onPress={() => router.push(`/professional/${p.id}`)}
                compact
              />
            </View>
          </Pressable>
        ))
      )}

      {!loading && list.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Nenhum profissional disponível ainda</Text>
          <Text style={styles.sub}>
            Não encontramos profissionais aprovados para "{params.service ?? "este serviço"}".
            Tente novamente mais tarde.
          </Text>
        </View>
      ) : null}

      <View style={styles.safety}>
        <ShieldCheck color={colors.green} />
        <View style={{ flex: 1 }}>
          <Text style={styles.safetyTitle}>Serviço protegido</Text>
          <Text style={styles.sub}>
            Profissionais aprovadas pela moderação DiaristaJá.
          </Text>
        </View>
      </View>

      {chosen && list.length > 0 ? (
        <View style={styles.bottom}>
          <View>
            <Text style={styles.sub}>Total estimado</Text>
            <Text style={styles.total}>R$ {chosen.price * hours},00</Text>
          </View>
          <AppButton
            title={`Escolher ${chosen.name.split(" ")[0]}`}
            onPress={() =>
              router.push({
                pathname: "/confirmation",
                params: {
                  id: chosen.id,
                  hours: String(hours),
                  service: params.service ?? "Limpeza completa",
                  date: params.date ?? "Hoje",
                  address: params.address ?? "Rua Harmonia, 218 • Vila Madalena",
                },
              })
            }
            style={{ flex: 1 }}
          />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 13 },
  title: { fontSize: 18, color: colors.ink, fontWeight: "800", flex: 1 },
  summary: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  count: { fontSize: 14, color: colors.ink, fontWeight: "800" },
  sub: { fontSize: 10, color: colors.muted, marginTop: 3 },
  verified: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.mint, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 20 },
  verifiedText: { fontSize: 9, color: colors.green, fontWeight: "800" },
  option: { flexDirection: "row", alignItems: "center", gap: 9, padding: 5, borderRadius: 20, borderWidth: 1, borderColor: "transparent" },
  selected: { borderColor: colors.green, backgroundColor: "#EFF8F1" },
  radio: { width: 19, height: 19, borderRadius: 10, borderWidth: 1.5, borderColor: "#B9C6BD", alignItems: "center", justifyContent: "center" },
  radioOn: { borderColor: colors.green },
  radioDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.green },
  empty: { backgroundColor: colors.white, borderRadius: 16, padding: 16, gap: 6, borderWidth: 1, borderColor: colors.line },
  emptyTitle: { fontSize: 13, color: colors.ink, fontWeight: "800" },
  safety: { backgroundColor: colors.mint, borderRadius: 16, padding: 13, flexDirection: "row", gap: 10, alignItems: "center" },
  safetyTitle: { fontSize: 12, color: colors.ink, fontWeight: "800" },
  bottom: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 4 },
  total: { fontSize: 19, color: colors.ink, fontWeight: "900" },
});
