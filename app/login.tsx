import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, TextInput, View, Alert } from "react-native";
import { ArrowLeft, BriefcaseBusiness, House, LockKeyhole, Mail } from "@/components/icons";
import { Screen } from "@/components/Screen";
import { AppButton } from "@/components/AppButton";
import { useAuth } from "@/context/AuthContext";
import { isSupabaseConfigured } from "@/lib/supabase";
import { colors } from "@/constants/theme";

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ role?: string }>();
  const role = params.role === "professional" ? "professional" : "client";
  const isPro = role === "professional";
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function enter() {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Preencha os campos", "Informe seu e-mail e sua senha para continuar.");
      return;
    }

    if (!isSupabaseConfigured) {
      Alert.alert(
        "Configuração pendente",
        "Adicione EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY no arquivo .env."
      );
      return;
    }

    setLoading(true);
    try {
      const result = await signIn(email, password);
      if (result.role === "professional") {
        router.replace("/(professional)" as never);
      } else {
        router.replace("/(tabs)" as never);
      }
    } catch (err: any) {
      Alert.alert(
        "Falha ao entrar",
        err?.message || "Verifique seu e-mail e senha e tente novamente."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen contentStyle={styles.container}>
      <Pressable style={styles.back} onPress={() => router.back()}>
        <ArrowLeft color={colors.ink} />
        <Text style={styles.backText}>Voltar</Text>
      </Pressable>

      <View style={[styles.roleIcon, isPro && styles.roleIconPro]}>
        {isPro ? (
          <BriefcaseBusiness color="#A65D35" size={29} />
        ) : (
          <House color={colors.green} size={29} />
        )}
      </View>

      <Text style={styles.title}>Entrar como {isPro ? "profissional" : "cliente"}</Text>
      <Text style={styles.subtitle}>
        {isPro
          ? "Use a mesma conta cadastrada no site ou no app para gerenciar seus serviços."
          : "Encontre profissionais aprovadas e cuide da sua casa com praticidade."}
      </Text>

      <View style={styles.form}>
        <Text style={styles.label}>E-mail</Text>
        <View style={styles.inputWrap}>
          <Mail color={colors.muted} size={18} />
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="seu@email.com"
            placeholderTextColor="#A0AAA3"
            style={styles.input}
          />
        </View>

        <Text style={styles.label}>Senha</Text>
        <View style={styles.inputWrap}>
          <LockKeyhole color={colors.muted} size={18} />
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Sua senha"
            placeholderTextColor="#A0AAA3"
            style={styles.input}
          />
        </View>
      </View>

      <AppButton
        title={loading ? "Entrando..." : "Entrar"}
        onPress={enter}
        style={styles.submit}
      />

      <View style={styles.register}>
        <Text style={styles.registerText}>Ainda não tem uma conta?</Text>
        <Pressable
          onPress={() =>
            router.push({ pathname: "/register", params: { role } } as never)
          }
        >
          <Text style={styles.registerLink}> Criar conta</Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.switch}
        onPress={() =>
          router.replace({
            pathname: "/login",
            params: { role: isPro ? "client" : "professional" },
          })
        }
      >
        <Text style={styles.switchText}>
          Entrar como {isPro ? "cliente" : "profissional"} em vez disso
        </Text>
      </Pressable>

      <Text style={styles.note}>
        {isSupabaseConfigured
          ? "Conectado ao Supabase • Sincronizado com o Portal Web"
          : "Configure o .env com a URL e Anon Key do Supabase"}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingTop: 15, gap: 15 },
  back: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 20 },
  backText: { fontSize: 13, color: colors.ink, fontWeight: "700" },
  roleIcon: { width: 62, height: 62, borderRadius: 20, backgroundColor: colors.mint, alignItems: "center", justifyContent: "center" },
  roleIconPro: { backgroundColor: "#FFF0E7" },
  title: { fontSize: 26, color: colors.ink, fontWeight: "900", marginTop: 4 },
  subtitle: { fontSize: 13, color: colors.muted, lineHeight: 20, marginTop: -7 },
  form: { gap: 10, marginTop: 14 },
  label: { fontSize: 12, color: colors.ink, fontWeight: "800", marginTop: 5 },
  inputWrap: { height: 53, borderRadius: 15, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, gap: 10 },
  input: { flex: 1, fontSize: 14, color: colors.ink },
  submit: { marginTop: 12 },
  register: { flexDirection: "row", justifyContent: "center", marginTop: 8 },
  registerText: { fontSize: 12, color: colors.muted },
  registerLink: { fontSize: 12, color: colors.green, fontWeight: "800" },
  switch: { alignItems: "center", padding: 12 },
  switchText: { fontSize: 12, color: colors.green, fontWeight: "800" },
  note: { fontSize: 10, color: colors.muted, textAlign: "center", lineHeight: 15, marginTop: "auto" },
});
