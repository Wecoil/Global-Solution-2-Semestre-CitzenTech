import { useCallback, useMemo, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Search, SlidersHorizontal, ShieldCheck } from "@/components/icons";
import { Screen } from "@/components/Screen";
import { ProfessionalCard } from "@/components/ProfessionalCard";
import { fetchApprovedProfessionals } from "@/services/professionalsService";
import { professionals as mockProfessionals, type Professional } from "@/data/mock";
import { colors } from "@/constants/theme";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<Professional[]>(mockProfessionals);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchApprovedProfessionals(true);
      setItems(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const filtered = useMemo(
    () =>
      items.filter((p) =>
        `${p.name} ${p.neighborhood} ${p.distance} ${p.skills.join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [items, query]
  );

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>ENCONTRE SUA AJUDA</Text>
          <Text style={styles.title}>Profissionais perto de você</Text>
        </View>
        <Pressable style={styles.filter} onPress={loadData}>
          <SlidersHorizontal color={colors.ink} />
        </Pressable>
      </View>

      <View style={styles.search}>
        <Search size={19} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Nome, bairro, cidade ou serviço"
          placeholderTextColor="#9AA69E"
          style={styles.input}
        />
      </View>

      <View style={styles.summary}>
        <View>
          <Text style={styles.count}>
            {filtered.length}{" "}
            {filtered.length === 1
              ? "profissional disponível"
              : "profissionais disponíveis"}
          </Text>
          <Text style={styles.sub}>Sincronizado com aprovações da Web</Text>
        </View>
        <View style={styles.verified}>
          <ShieldCheck size={15} color={colors.green} />
          <Text style={styles.verifiedText}>Aprovadas</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.green} style={{ marginTop: 20 }} />
      ) : (
        filtered.map((p) => (
          <ProfessionalCard
            key={p.id}
            item={p}
            onPress={() => router.push(`/professional/${p.id}`)}
          />
        ))
      )}

      {!loading && !filtered.length ? (
        <Text style={styles.empty}>
          Nenhuma profissional encontrada. Tente outro nome, bairro ou serviço.
        </Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  kicker: { fontSize: 10, color: colors.green, fontWeight: "900", letterSpacing: 1 },
  title: { fontSize: 24, color: colors.ink, fontWeight: "800", marginTop: 5, maxWidth: 270 },
  filter: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
  search: { height: 52, backgroundColor: colors.white, borderRadius: 16, borderWidth: 1, borderColor: colors.line, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, gap: 10 },
  input: { flex: 1, color: colors.ink, fontSize: 14 },
  summary: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  count: { fontSize: 14, color: colors.ink, fontWeight: "800" },
  sub: { fontSize: 11, color: colors.muted, marginTop: 3 },
  verified: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.mint, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 20 },
  verifiedText: { fontSize: 10, color: colors.green, fontWeight: "800" },
  empty: { textAlign: "center", color: colors.muted, lineHeight: 22, padding: 30 },
});
