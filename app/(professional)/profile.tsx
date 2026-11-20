import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import {
  UserRound,
  MapPin,
  Star,
  Wallet,
  ShieldCheck,
  LogOut,
  ChevronRight,
} from "@/components/icons";
import { Screen } from "@/components/Screen";
import { AppButton } from "@/components/AppButton";
import { useAuth } from "@/context/AuthContext";
import { updateMyProfessionalData } from "@/services/professionalsService";
import { colors } from "@/constants/theme";

const STATUS_TEXT: Record<string, string> = {
  approved: "Aprovada (visível no app)",
  pending: "Pendente de aprovação no Painel Web",
  rejected: "Rejeitada pela moderação",
  suspended: "Suspensa temporariamente",
};

export default function ProfessionalProfile() {
  const router = useRouter();
  const { user, profile, professional, refreshProfile, signOut } = useAuth();

  const [editing, setEditing] = useState(false);
  const [cidade, setCidade] = useState(professional?.cidade ?? "");
  const [bairro, setBairro] = useState(professional?.bairro ?? "");
  const [valorHora, setValorHora] = useState(
    professional ? String(professional.valor_hora) : "45"
  );
  const [descricao, setDescricao] = useState(
    professional?.descricao_experiencia ?? ""
  );
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (professional) {
      setCidade(professional.cidade);
      setBairro(professional.bairro);
      setValorHora(String(professional.valor_hora));
      setDescricao(professional.descricao_experiencia);
    }
  }, [professional]);

  const displayName = profile?.nome || "Ana Paula";
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

  async function handleSave() {
    if (!user || !professional) return;
    setSaving(true);
    try {
      await updateMyProfessionalData(user.id, {
        cidade: cidade.trim() || professional.cidade,
        bairro: bairro.trim() || professional.bairro,
        valor_hora: parseFloat(valorHora.replace(",", ".")) || professional.valor_hora,
        servicos: professional.servicos,
        descricao_experiencia: descricao.trim() || professional.descricao_experiencia,
      });
      await refreshProfile();
      setEditing(false);
      Alert.alert(
        "Perfil atualizado!",
        "Suas alterações já foram sincronizadas com o Supabase e o Portal Web."
      );
    } catch (err: any) {
      Alert.alert("Erro ao salvar", err?.message || "Não foi possível atualizar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await signOut();
    } finally {
      setLoggingOut(false);
      if (router.canDismiss()) {
        router.dismissAll();
      }
      router.replace("/");
    }
  }

  const options = [
    {
      label: "Editar dados profissionais",
      detail: `${professional?.bairro ?? "Bairro"} • R$ ${
        professional?.valor_hora ?? 45
      }/hora`,
      Icon: UserRound,
      onPress: () => setEditing((v) => !v),
    },
    {
      label: "Região de atendimento",
      detail: professional
        ? `${professional.bairro}, ${professional.cidade}`
        : "Não informada",
      Icon: MapPin,
      onPress: () => setEditing(true),
    },
    {
      label: "Serviços cadastrados",
      detail: professional?.servicos?.join(", ") || "Limpeza completa",
      Icon: Star,
      onPress: () =>
        Alert.alert(
          "Serviços",
          professional?.servicos?.join("• ") || "Limpeza completa"
        ),
    },
    {
      label: "Valor por hora",
      detail: `R$ ${Number(professional?.valor_hora ?? 45).toFixed(2).replace(".", ",")} / hora`,
      Icon: Wallet,
      onPress: () => setEditing(true),
    },
    {
      label: "Status da moderação Web",
      detail: STATUS_TEXT[professional?.status ?? "pending"],
      Icon: ShieldCheck,
      onPress: () =>
        Alert.alert(
          "Status de aprovação",
          `Situação atual: ${STATUS_TEXT[professional?.status ?? "pending"]}`
        ),
    },
  ];

  return (
    <Screen>
      <View>
        <Text style={styles.kicker}>SUA CONTA PROFISSIONAL</Text>
        <Text style={styles.title}>Meu perfil</Text>
      </View>

      <View style={styles.person}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>{initials || "AP"}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{profile?.email ?? "Profissional"}</Text>
          <View style={styles.rating}>
            <Star size={13} color={colors.yellow} fill={colors.yellow} />
            <Text style={styles.ratingText}>
              {STATUS_TEXT[professional?.status ?? "pending"]}
            </Text>
          </View>
        </View>
      </View>

      {editing ? (
        <View style={styles.editCard}>
          <Text style={styles.itemTitle}>Atualizar perfil (sincroniza com a Web)</Text>
          <TextInput
            value={cidade}
            onChangeText={setCidade}
            placeholder="Cidade"
            style={styles.input}
          />
          <TextInput
            value={bairro}
            onChangeText={setBairro}
            placeholder="Bairro"
            style={styles.input}
          />
          <TextInput
            value={valorHora}
            onChangeText={setValorHora}
            keyboardType="decimal-pad"
            placeholder="Valor por hora (R$)"
            style={styles.input}
          />
          <TextInput
            value={descricao}
            onChangeText={setDescricao}
            multiline
            placeholder="Descrição de experiência"
            style={[styles.input, { height: 78, textAlignVertical: "top", paddingTop: 10 }]}
          />
          <AppButton
            title={saving ? "Salvando..." : "Salvar alterações"}
            onPress={handleSave}
          />
        </View>
      ) : null}

      <View style={styles.menu}>
        {options.map(({ label, detail, Icon, onPress }) => (
          <Pressable key={label} onPress={onPress} style={styles.item}>
            <View style={styles.icon}>
              <Icon size={19} color={colors.green} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{label}</Text>
              <Text style={styles.detail}>{detail}</Text>
            </View>
            <ChevronRight size={17} color={colors.muted} />
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.logout} onPress={handleLogout} disabled={loggingOut}>
        <LogOut size={18} color={colors.red} />
        <Text style={styles.logoutText}>
          {loggingOut ? "Saindo da conta..." : "Sair da conta"}
        </Text>
      </Pressable>

      <Text style={styles.version}>DiaristaJá • Área profissional • 1.1.0</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: { fontSize: 9, color: colors.green, fontWeight: "900", letterSpacing: 1 },
  title: { fontSize: 27, color: colors.ink, fontWeight: "900", marginTop: 5 },
  person: { backgroundColor: colors.white, borderRadius: 19, padding: 16, flexDirection: "row", alignItems: "center", gap: 13 },
  avatar: { width: 61, height: 61, borderRadius: 20, backgroundColor: "#FFF0E7", alignItems: "center", justifyContent: "center" },
  initials: { fontSize: 19, color: "#A65D35", fontWeight: "900" },
  name: { fontSize: 17, color: colors.ink, fontWeight: "900" },
  email: { fontSize: 11, color: colors.muted, marginTop: 3 },
  rating: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  ratingText: { fontSize: 10, color: colors.green, fontWeight: "800" },
  editCard: { backgroundColor: colors.white, borderRadius: 18, padding: 15, gap: 10, borderWidth: 1, borderColor: colors.line },
  input: { height: 46, borderRadius: 12, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 12, fontSize: 13, color: colors.ink },
  menu: { backgroundColor: colors.white, borderRadius: 18, paddingHorizontal: 13 },
  item: { flexDirection: "row", alignItems: "center", gap: 11, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.line },
  icon: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.mint, alignItems: "center", justifyContent: "center" },
  itemTitle: { fontSize: 12, color: colors.ink, fontWeight: "800" },
  detail: { fontSize: 10, color: colors.muted, marginTop: 3 },
  logout: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 12 },
  logoutText: { fontSize: 12, color: colors.red, fontWeight: "800" },
  version: { fontSize: 10, color: colors.muted, textAlign: "center" },
});
