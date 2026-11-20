import { useState } from "react";
import { useRouter } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ChevronRight, UserRound, MapPin, CreditCard, Bell, CircleHelp, LogOut, Sparkles } from "@/components/icons";
import { Screen } from "@/components/Screen";
import { AppButton } from "@/components/AppButton";
import { useAuth } from "@/context/AuthContext";
import { colors } from "@/constants/theme";

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, signOut, updateClientAddress } = useAuth();
  const [editingAddress, setEditingAddress] = useState(false);
  const [addressDraft, setAddressDraft] = useState(
    profile?.endereco || "Rua Harmonia, 218 • Vila Madalena"
  );
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const displayName = profile?.nome || "Marina Costa";
  const displayEmail = profile?.email || "marina.costa@email.com";
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

  async function handleSaveAddress() {
    setSaving(true);
    try {
      await updateClientAddress(addressDraft);
      setEditingAddress(false);
      Alert.alert("Endereço atualizado", "Seu endereço foi salvo no Supabase.");
    } catch (err: any) {
      Alert.alert("Erro", err?.message || "Não foi possível atualizar.");
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

  const menu = [
    {
      title: "Dados pessoais",
      subtitle: profile?.telefone ? `${displayName} • ${profile.telefone}` : displayName,
      Icon: UserRound,
      onPress: () => Alert.alert("Dados pessoais", `Nome: ${displayName}
E-mail: ${displayEmail}`),
    },
    {
      title: "Meu endereço principal",
      subtitle: profile?.endereco || "Rua Harmonia, 218 • Vila Madalena",
      Icon: MapPin,
      onPress: () => {
        setAddressDraft(profile?.endereco || "");
        setEditingAddress((v) => !v);
      },
    },
    {
      title: "Pagamentos",
      subtitle: "Pagamento direto ao profissional",
      Icon: CreditCard,
      onPress: () => Alert.alert("Pagamentos", "O pagamento é combinado diretamente após a conclusão do serviço."),
    },
    {
      title: "Notificações",
      subtitle: "Alertas de confirmação de agendamento",
      Icon: Bell,
      onPress: () => Alert.alert("Notificações", "Você será notificado assim que a profissional aceitar."),
    },
    {
      title: "Ajuda e suporte",
      subtitle: "Fale com a equipe DiaristaJá",
      Icon: CircleHelp,
      onPress: () => Alert.alert("Suporte DiaristaJá", "Atendimento disponível todos os dias das 08h às 20h."),
    },
  ];

  return (
    <Screen>
      <View>
        <Text style={styles.kicker}>SUA CONTA</Text>
        <Text style={styles.title}>Perfil</Text>
      </View>

      <View style={styles.person}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>{initials || "DJ"}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.personName}>{displayName}</Text>
          <Text style={styles.email}>{displayEmail}</Text>
          <Text style={styles.edit}>Cliente verificada</Text>
        </View>
      </View>

      {editingAddress ? (
        <View style={styles.editBox}>
          <Text style={styles.itemTitle}>Atualizar endereço salvo</Text>
          <TextInput
            value={addressDraft}
            onChangeText={setAddressDraft}
            placeholder="Rua, número, bairro"
            style={styles.input}
          />
          <AppButton
            title={saving ? "Salvando..." : "Salvar endereço"}
            onPress={handleSaveAddress}
          />
        </View>
      ) : null}

      <View style={styles.benefit}>
        <Sparkles color={colors.green} />
        <View style={{ flex: 1 }}>
          <Text style={styles.benefitTitle}>Conta sincronizada com Supabase</Text>
          <Text style={styles.email}>Seus agendamentos atualizam em tempo real</Text>
        </View>
      </View>

      <View style={styles.menu}>
        {menu.map(({ title, subtitle, Icon, onPress }) => (
          <Pressable key={title} style={styles.item} onPress={onPress}>
            <View style={styles.menuIcon}>
              <Icon size={19} color={colors.green} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{title}</Text>
              <Text style={styles.email}>{subtitle}</Text>
            </View>
            <ChevronRight color={colors.muted} size={17} />
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.logout} onPress={handleLogout} disabled={loggingOut}>
        <LogOut size={18} color={colors.red} />
        <Text style={styles.logoutText}>
          {loggingOut ? "Saindo da conta..." : "Sair da conta"}
        </Text>
      </Pressable>

      <Text style={styles.version}>DiaristaJá • versão 1.1.0</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: { fontSize: 10, color: colors.green, fontWeight: "900", letterSpacing: 1 },
  title: { fontSize: 28, color: colors.ink, fontWeight: "800", marginTop: 5 },
  person: { flexDirection: "row", alignItems: "center", gap: 15, backgroundColor: colors.white, padding: 16, borderRadius: 20 },
  avatar: { width: 64, height: 64, borderRadius: 22, backgroundColor: colors.mint, alignItems: "center", justifyContent: "center" },
  initials: { fontSize: 20, color: colors.green, fontWeight: "900" },
  personName: { fontSize: 17, color: colors.ink, fontWeight: "800" },
  email: { fontSize: 11, color: colors.muted, marginTop: 3 },
  edit: { fontSize: 12, color: colors.green, fontWeight: "800", marginTop: 7 },
  editBox: { backgroundColor: colors.white, borderRadius: 18, padding: 15, gap: 10, borderWidth: 1, borderColor: colors.line },
  input: { height: 48, borderRadius: 12, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 12, fontSize: 13, color: colors.ink },
  benefit: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#E5F3E9", padding: 15, borderRadius: 17 },
  benefitTitle: { fontSize: 13, color: colors.ink, fontWeight: "800" },
  menu: { backgroundColor: colors.white, borderRadius: 18, paddingHorizontal: 13 },
  item: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.line },
  menuIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.mint, alignItems: "center", justifyContent: "center" },
  itemTitle: { fontSize: 13, color: colors.ink, fontWeight: "800" },
  logout: { flexDirection: "row", alignItems: "center", gap: 9, alignSelf: "center", padding: 10 },
  logoutText: { color: colors.red, fontWeight: "700" },
  version: { textAlign: "center", fontSize: 10, color: colors.muted },
});
