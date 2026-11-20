import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BriefcaseBusiness, House, ShieldCheck, Sparkles } from "@/components/icons";
import { Screen } from "@/components/Screen";
import { useAuth } from "@/context/AuthContext";
import { colors } from "@/constants/theme";

export default function WelcomeScreen() {
  const router = useRouter();
  const { profile, loading } = useAuth();

  return (
    <Screen contentStyle={styles.container}>
      <View style={styles.brand}>
        <View style={styles.logo}><Sparkles size={31} color={colors.white} /></View>
        <Text style={styles.brandName}>DiaristaJá</Text>
        <Text style={styles.tagline}>Sua casa em boas mãos.</Text>
      </View>

      {!loading && profile ? (
        <Pressable
          style={styles.resumeBanner}
          onPress={() =>
            router.replace(
              (profile.tipo_conta === "professional"
                ? "/(professional)"
                : "/(tabs)") as never
            )
          }
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.resumeKicker}>SESSÃO ATIVA</Text>
            <Text style={styles.resumeTitle}>Continuar como {profile.nome}</Text>
          </View>
          <Text style={styles.resumeArrow}>›</Text>
        </Pressable>
      ) : null}

      <View style={styles.intro}>
        <Text style={styles.title}>Como deseja acessar?</Text>
        <Text style={styles.subtitle}>Escolha o tipo de conta para continuar.</Text>
      </View>

      <Pressable
        style={({ pressed }) => [styles.choice, pressed && styles.pressed]}
        onPress={() => router.push({ pathname: "/login", params: { role: "client" } })}
      >
        <View style={styles.clientIcon}><House size={27} color={colors.green} /></View>
        <View style={styles.choiceCopy}>
          <Text style={styles.choiceTitle}>Sou cliente</Text>
          <Text style={styles.choiceDescription}>
            Quero encontrar e contratar profissionais.
          </Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.choice, styles.proChoice, pressed && styles.pressed]}
        onPress={() =>
          router.push({ pathname: "/login", params: { role: "professional" } })
        }
      >
        <View style={styles.proIcon}><BriefcaseBusiness size={27} color="#A65D35" /></View>
        <View style={styles.choiceCopy}>
          <Text style={styles.choiceTitle}>Sou profissional</Text>
          <Text style={styles.choiceDescription}>
            Quero oferecer meus serviços e receber solicitações.
          </Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </Pressable>

      <View style={styles.footer}>
        <ShieldCheck size={16} color={colors.green} />
        <Text style={styles.footerText}>
          Sincronizado em tempo real com o Portal Web DiaristaJá
        </Text>
      </View>
      <Text style={styles.version}>DIARISTAJÁ • VERSÃO 1.1 • SUPABASE</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", paddingTop: 30, paddingBottom: 30, gap: 22 },
  brand: { alignItems: "center", gap: 5, marginBottom: 6 },
  logo: { width: 66, height: 66, borderRadius: 23, backgroundColor: colors.green, alignItems: "center", justifyContent: "center", marginBottom: 7 },
  brandName: { fontSize: 29, fontWeight: "900", color: colors.green, letterSpacing: -0.7 },
  tagline: { fontSize: 12, color: colors.muted },
  resumeBanner: { backgroundColor: colors.mint, borderRadius: 18, padding: 14, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#C5E3CD" },
  resumeKicker: { fontSize: 9, fontWeight: "900", color: colors.green, letterSpacing: 1 },
  resumeTitle: { fontSize: 14, fontWeight: "800", color: colors.ink, marginTop: 2 },
  resumeArrow: { fontSize: 26, color: colors.green, fontWeight: "700" },
  intro: { gap: 6, marginTop: 4 },
  title: { fontSize: 25, fontWeight: "900", color: colors.ink },
  subtitle: { fontSize: 13, color: colors.muted },
  choice: { backgroundColor: colors.white, borderRadius: 20, borderWidth: 1, borderColor: colors.line, padding: 16, flexDirection: "row", alignItems: "center", gap: 13, minHeight: 108 },
  proChoice: { backgroundColor: "#FFFAF6", borderColor: "#F3DFD1" },
  clientIcon: { width: 54, height: 54, borderRadius: 17, backgroundColor: colors.mint, alignItems: "center", justifyContent: "center" },
  proIcon: { width: 54, height: 54, borderRadius: 17, backgroundColor: "#FFF0E7", alignItems: "center", justifyContent: "center" },
  choiceCopy: { flex: 1, gap: 5 },
  choiceTitle: { fontSize: 16, fontWeight: "800", color: colors.ink },
  choiceDescription: { fontSize: 11, color: colors.muted, lineHeight: 16 },
  arrow: { fontSize: 29, color: colors.muted, marginLeft: 2 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.99 }] },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 10 },
  footerText: { fontSize: 11, color: colors.muted },
  version: { fontSize: 9, color: "#A4AEA7", letterSpacing: 1, textAlign: "center", marginTop: 4 },
});
