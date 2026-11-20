import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Bell, MapPin, ChevronRight, Sparkles, Shirt, ChefHat, Grid2X2 } from "@/components/icons";
import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { AppButton } from "@/components/AppButton";
import { services, professionals as mockProfessionals, type Professional } from "@/data/mock";
import { fetchApprovedProfessionals } from "@/services/professionalsService";
import { useAuth } from "@/context/AuthContext";
import { colors } from "@/constants/theme";
import { ProfessionalCard } from "@/components/ProfessionalCard";

const icons = { sparkles: Sparkles, shirt: Shirt, "chef-hat": ChefHat, "grid-2x2": Grid2X2 };

export default function HomeScreen() {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const compactLayout = windowWidth < 380;
  const { profile } = useAuth();
  const [featured, setFeatured] = useState<Professional[]>(mockProfessionals.slice(0, 2));
  const [loadingPros, setLoadingPros] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      fetchApprovedProfessionals(true)
        .then((list) => {
          if (active) setFeatured(list.slice(0, 3));
        })
        .finally(() => {
          if (active) setLoadingPros(false);
        });
      return () => {
        active = false;
      };
    }, [])
  );

  const firstName = profile?.nome ? profile.nome.split(" ")[0].toUpperCase() : "MARINA";
  const addressDisplay = profile?.endereco || "Rua Harmonia, 218";

  return (
    <Screen contentStyle={{ paddingTop: 8 }}>
      <View style={styles.top}>
        <View>
          <Text style={styles.eyebrow}>BOM DIA, {firstName}</Text>
          <Text style={styles.heading}>O que podemos deixar em ordem?</Text>
        </View>
        <Pressable style={styles.bell} onPress={() => router.push("/(tabs)/profile")}>
          <Bell size={21} color={colors.ink} />
          <View style={styles.dot} />
        </Pressable>
      </View>

      <Pressable style={styles.address} onPress={() => router.push("/booking")}>
        <View style={styles.pin}><MapPin size={19} color={colors.green} /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.small}>ENDEREÇO DO SERVIÇO</Text>
          <Text style={styles.addressText} numberOfLines={2} ellipsizeMode="tail">{addressDisplay}</Text>
        </View>
        <ChevronRight size={19} color={colors.muted} />
      </Pressable>

      <View style={styles.section}>
        <SectionTitle
          title="Escolha uma ajuda"
          action="Ver todos"
          onPress={() => router.push("/booking")}
        />
      </View>

      <View style={styles.grid}>
        {services.map((service) => {
          const Icon = icons[service.icon];
          return (
            <Pressable
              key={service.id}
              style={styles.service}
              onPress={() =>
                router.push({ pathname: "/booking", params: { service: service.title } })
              }
            >
              <View style={[styles.serviceIcon, { backgroundColor: service.tint }]}>
                <Icon size={24} color={colors.ink} />
              </View>
              <Text style={styles.serviceTitle}>{service.title}</Text>
              <Text style={styles.serviceSub}>{service.subtitle}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.promo, compactLayout && styles.promoCompact]}>
        <View style={styles.promoCopy}>
          <Text style={styles.pill}>PARA HOJE</Text>
          <Text style={styles.promoTitle}>Sua casa em ordem ainda hoje</Text>
          <Text style={styles.promoText}>
            Profissionais aprovadas e verificadas perto de você.
          </Text>
          <AppButton
            title="Encontrar agora"
            onPress={() => router.push("/(tabs)/search")}
            arrow
            style={{ alignSelf: "flex-start", paddingHorizontal: compactLayout ? 10 : 14, minHeight: 42, maxWidth: "100%" }}
          />
        </View>
        <View style={[styles.promoArt, compactLayout && styles.promoArtCompact]}>
          <Sparkles size={55} color={colors.green} />
          <View style={styles.artCircle} />
        </View>
      </View>

      <View style={styles.section}>
        <SectionTitle
          title="Profissionais em destaque"
          action="Ver todas"
          onPress={() => router.push("/(tabs)/search")}
        />
      </View>

      {loadingPros ? (
        <ActivityIndicator color={colors.green} />
      ) : (
        featured.map((p) => (
          <ProfessionalCard
            key={p.id}
            item={p}
            onPress={() => router.push(`/professional/${p.id}`)}
          />
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
    paddingTop: 8,
  },
  headerCopy: { flex: 1, minWidth: 0, paddingRight: 2 },
  eyebrow: { color: colors.green, fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  heading: {
    color: colors.ink,
    fontSize: 27,
    lineHeight: 33,
    fontWeight: "800",
    marginTop: 9,
    flexShrink: 1,
  },
  bell: {
    width: 42, height: 42, flexShrink: 0, borderRadius: 15,
    backgroundColor: colors.white, alignItems: "center", justifyContent: "center",
  },
  dot: { position: "absolute", width: 7, height: 7, borderRadius: 5, backgroundColor: colors.orange, right: 9, top: 8 },
  address: {
    backgroundColor: colors.white, borderRadius: 18, padding: 12,
    flexDirection: "row", alignItems: "center", gap: 10,
    borderWidth: 1, borderColor: colors.line,
  },
  pin: { width: 40, height: 40, flexShrink: 0, borderRadius: 14, backgroundColor: colors.mint, alignItems: "center", justifyContent: "center" },
  small: { color: colors.muted, fontSize: 9, fontWeight: "800", letterSpacing: 0.6 },
  addressText: { color: colors.ink, fontWeight: "800", marginTop: 3, flexShrink: 1 },
  section: { marginBottom: -6 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  service: {
    flexGrow: 1, flexBasis: "46%", minWidth: 0,
    backgroundColor: colors.white, borderRadius: 18, padding: 12,
    borderWidth: 1, borderColor: colors.line, gap: 4,
  },
  serviceIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  serviceTitle: { color: colors.ink, fontSize: 14, fontWeight: "800", flexShrink: 1 },
  serviceSub: { color: colors.muted, fontSize: 11, lineHeight: 15, flexShrink: 1 },
  promo: {
    backgroundColor: "#E3F1E6", borderRadius: 22, padding: 16,
    flexDirection: "row", alignItems: "center", gap: 8, overflow: "hidden",
  },
  promoCompact: { padding: 13, gap: 4 },
  promoCopy: { flex: 1, minWidth: 0, gap: 8 },
  pill: { color: colors.green, fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  promoTitle: { color: colors.ink, fontSize: 20, fontWeight: "800", lineHeight: 25, flexShrink: 1 },
  promoText: { color: "#617267", fontSize: 12, lineHeight: 17, maxWidth: 220, flexShrink: 1 },
  promoArt: { width: 72, flexShrink: 0, justifyContent: "center", alignItems: "center" },
  promoArtCompact: { width: 48 },
  artCircle: { width: 46, height: 46, borderRadius: 30, backgroundColor: "#C9E6D1", position: "absolute", zIndex: -1, right: 0, bottom: 8 },
});
