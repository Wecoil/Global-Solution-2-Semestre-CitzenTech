import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { ArrowLeft, MapPin, Star, ShieldCheck, Check } from "@/components/icons";
import { Screen } from "@/components/Screen";
import { AppButton } from "@/components/AppButton";
import { fetchProfessionalById } from "@/services/professionalsService";
import { professionals, type Professional } from "@/data/mock";
import { colors } from "@/constants/theme";

export default function ProfessionalDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [worker, setWorker] = useState<Professional>(professionals[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    fetchProfessionalById(id)
      .then((found) => {
        if (found) setWorker(found);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Screen contentStyle={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={colors.green} size="large" />
      </Screen>
    );
  }

  return (
    <Screen contentStyle={{ paddingTop: 8 }}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <ArrowLeft color={colors.ink} />
        </Pressable>
        <View style={styles.verified}>
          <ShieldCheck color={colors.green} size={15} />
          <Text style={styles.verifiedText}>Aprovada</Text>
        </View>
      </View>

      <Image source={{ uri: worker.photo }} style={styles.hero} />

      <View style={styles.intro}>
        <Text style={styles.tag}>{worker.tag}</Text>
        <Text style={styles.name}>{worker.name}</Text>
        <View style={styles.location}>
          <MapPin size={14} color={colors.muted} />
          <Text style={styles.muted}>
            {worker.neighborhood} • {worker.distance}
          </Text>
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Star color={colors.yellow} fill={colors.yellow} />
            <Text style={styles.statValue}>{worker.rating}</Text>
            <Text style={styles.muted}>Avaliação</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{worker.jobs}</Text>
            <Text style={styles.muted}>Serviços</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>Verificada</Text>
            <Text style={styles.muted}>Cadastro Web/App</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sobre mim</Text>
        <Text style={styles.description}>{worker.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>O que eu faço</Text>
        {worker.skills.map((s) => (
          <View key={s} style={styles.skill}>
            <Text style={styles.skillText}>{s}</Text>
            <Check color={colors.green} size={17} />
          </View>
        ))}
      </View>

      <View style={styles.bottom}>
        <View>
          <Text style={styles.muted}>A partir de</Text>
          <Text style={styles.price}>R$ {worker.price}/hora</Text>
        </View>
        <AppButton
          title="Contratar"
          arrow
          onPress={() =>
            router.push({
              pathname: "/booking",
              params: {
                service: worker.skills[0] ?? "Limpeza completa",
                professionalId: worker.id,
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
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  verified: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: colors.mint, padding: 8, borderRadius: 20 },
  verifiedText: { fontSize: 11, color: colors.green, fontWeight: "800" },
  hero: { height: 230, width: "100%", borderRadius: 24, backgroundColor: colors.mint },
  intro: { gap: 6 },
  tag: { fontSize: 10, color: colors.green, fontWeight: "900", letterSpacing: 1 },
  name: { fontSize: 27, color: colors.ink, fontWeight: "900" },
  location: { flexDirection: "row", alignItems: "center", gap: 4 },
  muted: { fontSize: 11, color: colors.muted },
  stats: { flexDirection: "row", justifyContent: "space-around", backgroundColor: colors.white, borderRadius: 18, padding: 15, marginTop: 8 },
  stat: { alignItems: "center", gap: 4 },
  statValue: { fontSize: 16, color: colors.ink, fontWeight: "900" },
  section: { gap: 10 },
  sectionTitle: { fontSize: 17, color: colors.ink, fontWeight: "800" },
  description: { fontSize: 13, lineHeight: 21, color: "#637268" },
  skill: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.white, padding: 13, borderRadius: 13 },
  skillText: { fontSize: 13, color: colors.ink, fontWeight: "700" },
  bottom: { flexDirection: "row", alignItems: "center", gap: 12 },
  price: { fontSize: 19, color: colors.ink, fontWeight: "900" },
});
