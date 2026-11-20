import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import {
  ArrowLeft,
  BriefcaseBusiness,
  House,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  UserRound,
  Camera,
} from "@/components/icons";
import { Screen } from "@/components/Screen";
import { AppButton } from "@/components/AppButton";
import { useAuth } from "@/context/AuthContext";
import { colors } from "@/constants/theme";

const SERVICOS_OPCOES = [
  "Limpeza completa",
  "Limpeza leve",
  "Limpeza pesada",
  "Passadoria",
  "Organização",
  "Cozinha",
  "Encanador",
  "Eletricista",
];

export default function RegisterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ role?: string }>();
  const role = params.role === "professional" ? "professional" : "client";
  const isPro = role === "professional";
  const { signUpClient, signUpProfessional } = useAuth();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [password, setPassword] = useState("");

  // Campos de Cliente
  const [endereco, setEndereco] = useState("");

  // Campos de Profissional (mesmos da tabela professionals do Web)
  const [cidade, setCidade] = useState("São Paulo");
  const [bairro, setBairro] = useState("");
  const [valorHora, setValorHora] = useState("45");
  const [servicos, setServicos] = useState<string[]>(["Limpeza completa"]);
  const [descricao, setDescricao] = useState("");
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function chooseProfilePhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permissão necessária",
        "Permita o acesso à galeria para escolher uma foto de perfil."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setFotoUri(result.assets[0].uri);
    }
  }

  function toggleServico(item: string) {
    setServicos((prev) =>
      prev.includes(item) ? prev.filter((s) => s !== item) : [...prev, item]
    );
  }

  async function handleRegister() {
    if (!nome.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Campos obrigatórios", "Preencha nome, e-mail e senha.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Senha curta", "A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      if (isPro) {
        if (!cidade.trim() || !bairro.trim() || !descricao.trim()) {
          Alert.alert(
            "Complete seu perfil",
            "Informe cidade, bairro e uma breve descrição da sua experiência."
          );
          setLoading(false);
          return;
        }
        if (servicos.length === 0) {
          Alert.alert("Serviços", "Selecione pelo menos um serviço.");
          setLoading(false);
          return;
        }
        const valorNum = parseFloat(valorHora.replace(",", ".")) || 40;
        const res = await signUpProfessional({
          nome,
          email,
          password,
          telefone,
          cidade,
          bairro,
          valorHora: valorNum,
          servicos,
          descricaoExperiencia: descricao,
          fotoUri,
        });

        if (res.needsEmailConfirm) {
          Alert.alert(
            "Confirme seu e-mail",
            "Enviamos um link de confirmação para seu e-mail. Depois de confirmar, faça login no app ou no site."
          );
          router.replace({ pathname: "/login", params: { role: "professional" } });
          return;
        }

        Alert.alert(
          "Cadastro enviado!",
          "Seu perfil já aparece no Painel Administrativo Web como pendente (pending). Assim que aprovado, você ficará visível para clientes no app!"
        );
        router.replace("/(professional)" as never);
      } else {
        const res = await signUpClient({
          nome,
          email,
          password,
          telefone,
          endereco: endereco || "Rua Harmonia, 218 • Vila Madalena",
        });

        if (res.needsEmailConfirm) {
          Alert.alert(
            "Confirme seu e-mail",
            "Enviamos um link de confirmação para seu e-mail. Depois de confirmar, faça login."
          );
          router.replace({ pathname: "/login", params: { role: "client" } });
          return;
        }

        router.replace("/(tabs)" as never);
      }
    } catch (err: any) {
      Alert.alert("Erro no cadastro", err?.message || "Não foi possível criar sua conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen contentStyle={styles.container}>
      <Pressable style={styles.back} onPress={() => router.back()}>
        <ArrowLeft color={colors.ink} />
        <Text style={styles.backText}>Voltar para login</Text>
      </Pressable>

      <View style={[styles.roleIcon, isPro && styles.roleIconPro]}>
        {isPro ? (
          <BriefcaseBusiness color="#A65D35" size={28} />
        ) : (
          <House color={colors.green} size={28} />
        )}
      </View>

      <Text style={styles.title}>
        Criar conta de {isPro ? "profissional" : "cliente"}
      </Text>
      <Text style={styles.subtitle}>
        {isPro
          ? "Seu cadastro será sincronizado com o Painel Web para aprovação."
          : "Cadastre-se para agendar serviços com profissionais verificadas."}
      </Text>

      <View style={styles.form}>
        <Text style={styles.label}>Nome completo *</Text>
        <View style={styles.inputWrap}>
          <UserRound color={colors.muted} size={18} />
          <TextInput
            value={nome}
            onChangeText={setNome}
            placeholder="Seu nome completo"
            placeholderTextColor="#A0AAA3"
            style={styles.input}
          />
        </View>

        <Text style={styles.label}>E-mail *</Text>
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

        <Text style={styles.label}>Telefone / WhatsApp</Text>
        <View style={styles.inputWrap}>
          <Phone color={colors.muted} size={18} />
          <TextInput
            value={telefone}
            onChangeText={setTelefone}
            keyboardType="phone-pad"
            placeholder="(11) 99999-9999"
            placeholderTextColor="#A0AAA3"
            style={styles.input}
          />
        </View>

        {!isPro ? (
          <>
            <Text style={styles.label}>Endereço principal</Text>
            <View style={styles.inputWrap}>
              <MapPin color={colors.muted} size={18} />
              <TextInput
                value={endereco}
                onChangeText={setEndereco}
                placeholder="Rua, número e bairro"
                placeholderTextColor="#A0AAA3"
                style={styles.input}
              />
            </View>
          </>
        ) : (
          <>
            <Text style={styles.label}>Foto de perfil</Text>
            <View style={styles.photoPickerRow}>
              <View style={styles.photoPreview}>
                {fotoUri ? (
                  <Image source={{ uri: fotoUri }} style={styles.photoImage} />
                ) : (
                  <UserRound size={30} color={colors.green} />
                )}
              </View>
              <View style={styles.photoPickerCopy}>
                <Text style={styles.photoPickerTitle}>
                  {fotoUri ? "Foto selecionada" : "Adicione uma foto sua"}
                </Text>
                <Text style={styles.photoPickerHint}>
                  Escolha uma imagem clara para que os clientes possam reconhecer você.
                </Text>
                <Pressable style={styles.photoButton} onPress={chooseProfilePhoto}>
                  <Camera size={15} color={colors.green} />
                  <Text style={styles.photoButtonText}>
                    {fotoUri ? "Trocar foto" : "Escolher foto"}
                  </Text>
                </Pressable>
                {fotoUri ? (
                  <Pressable onPress={() => setFotoUri(null)}>
                    <Text style={styles.removePhotoText}>Remover foto</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={styles.label}>Cidade *</Text>
                <View style={styles.inputWrap}>
                  <TextInput
                    value={cidade}
                    onChangeText={setCidade}
                    placeholder="São Paulo"
                    placeholderTextColor="#A0AAA3"
                    style={styles.input}
                  />
                </View>
              </View>
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={styles.label}>Bairro *</Text>
                <View style={styles.inputWrap}>
                  <TextInput
                    value={bairro}
                    onChangeText={setBairro}
                    placeholder="Vila Madalena"
                    placeholderTextColor="#A0AAA3"
                    style={styles.input}
                  />
                </View>
              </View>
            </View>

            <Text style={styles.label}>Valor por hora (R$) *</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.currency}>R$</Text>
              <TextInput
                value={valorHora}
                onChangeText={setValorHora}
                keyboardType="decimal-pad"
                placeholder="45.00"
                placeholderTextColor="#A0AAA3"
                style={styles.input}
              />
            </View>

            <Text style={styles.label}>Serviços oferecidos *</Text>
            <View style={styles.chips}>
              {SERVICOS_OPCOES.map((item) => {
                const active = servicos.includes(item);
                return (
                  <Pressable
                    key={item}
                    onPress={() => toggleServico(item)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {active ? "✓ " : "+ "}
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.label}>Experiência e apresentação *</Text>
            <View style={styles.textareaWrap}>
              <TextInput
                value={descricao}
                onChangeText={setDescricao}
                multiline
                numberOfLines={3}
                placeholder="Conte sua experiência com limpeza, passadoria ou cozinha..."
                placeholderTextColor="#A0AAA3"
                style={styles.textarea}
              />
            </View>
          </>
        )}

        <Text style={styles.label}>Senha (mín. 6 caracteres) *</Text>
        <View style={styles.inputWrap}>
          <LockKeyhole color={colors.muted} size={18} />
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Crie uma senha"
            placeholderTextColor="#A0AAA3"
            style={styles.input}
          />
        </View>
      </View>

      <AppButton
        title={
          loading
            ? "Cadastrando..."
            : isPro
            ? "Enviar cadastro profissional"
            : "Criar minha conta"
        }
        onPress={handleRegister}
        style={styles.submit}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingTop: 12, paddingBottom: 36, gap: 14 },
  back: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 8 },
  backText: { fontSize: 13, color: colors.ink, fontWeight: "700" },
  roleIcon: { width: 58, height: 58, borderRadius: 19, backgroundColor: colors.mint, alignItems: "center", justifyContent: "center" },
  roleIconPro: { backgroundColor: "#FFF0E7" },
  title: { fontSize: 25, color: colors.ink, fontWeight: "900" },
  subtitle: { fontSize: 12, color: colors.muted, lineHeight: 18, marginTop: -6 },
  form: { gap: 9, marginTop: 8 },
  row: { flexDirection: "row", gap: 10 },
  label: { fontSize: 12, color: colors.ink, fontWeight: "800", marginTop: 4 },
  inputWrap: { height: 50, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, flexDirection: "row", alignItems: "center", paddingHorizontal: 13, gap: 9 },
  input: { flex: 1, fontSize: 14, color: colors.ink },
  currency: { fontSize: 14, fontWeight: "800", color: colors.green },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  chip: { paddingHorizontal: 11, paddingVertical: 8, borderRadius: 12, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  chipActive: { backgroundColor: colors.green, borderColor: colors.green },
  chipText: { fontSize: 11, fontWeight: "700", color: colors.ink },
  chipTextActive: { color: colors.white },
  textareaWrap: { borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, padding: 12, minHeight: 84 },
  textarea: { fontSize: 13, color: colors.ink, textAlignVertical: "top" },
  photoPickerRow: { flexDirection: "row", alignItems: "center", gap: 13, backgroundColor: colors.white, borderRadius: 16, borderWidth: 1, borderColor: colors.line, padding: 12 },
  photoPreview: { width: 82, height: 82, borderRadius: 41, backgroundColor: colors.mint, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  photoImage: { width: "100%", height: "100%" },
  photoPickerCopy: { flex: 1, gap: 5 },
  photoPickerTitle: { fontSize: 12, color: colors.ink, fontWeight: "800" },
  photoPickerHint: { fontSize: 10, color: colors.muted, lineHeight: 15 },
  photoButton: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", backgroundColor: colors.mint, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, marginTop: 2 },
  photoButtonText: { color: colors.green, fontSize: 10, fontWeight: "800" },
  removePhotoText: { color: "#B54A45", fontSize: 10, fontWeight: "700", marginTop: 2 },
  submit: { marginTop: 10 },
});
