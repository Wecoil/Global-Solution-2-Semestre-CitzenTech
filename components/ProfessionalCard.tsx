import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { MapPin, Star, ShieldCheck, ChevronRight } from "@/components/icons";
import type { Professional } from "@/data/mock";
import { colors } from "@/constants/theme";

export function ProfessionalCard({ item, onPress, compact = false }: { item: Professional; onPress: () => void; compact?: boolean }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}>
      <Image source={{ uri: item.photo }} style={[styles.photo, compact && styles.compactPhoto]} />
      <View style={styles.info}>
        <Text style={styles.tag}>{item.tag}</Text>
        <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
        <View style={styles.meta}><Star size={14} color={colors.yellow} fill={colors.yellow}/><Text style={styles.rating}>{item.rating}</Text><Text style={styles.jobs}>({item.jobs} serviços)</Text></View>
        <View style={styles.meta}><MapPin size={13} color={colors.muted}/><Text style={styles.distance} numberOfLines={1} ellipsizeMode="tail">{item.distance} • {item.neighborhood}</Text></View>
      </View>
      <View style={styles.price}><Text style={styles.priceValue}>R$ {item.price}</Text><Text style={styles.per}>/hora</Text><ChevronRight size={17} color={colors.muted}/></View>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: 20, padding: 10, flexDirection: "row", alignItems: "center", gap: 9, borderWidth: 1, borderColor: colors.line },
  photo: { width: 68, height: 68, flexShrink: 0, borderRadius: 16, backgroundColor: colors.mint },
  compactPhoto: { width: 62, height: 62 },
  info: { flex: 1, minWidth: 0, gap: 4 },
  tag: { color: colors.green, fontSize: 10, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 },
  name: { color: colors.ink, fontSize: 14, fontWeight: "800", flexShrink: 1 },
  meta: { flexDirection: "row", alignItems: "center", gap: 4 },
  rating: { color: colors.ink, fontSize: 12, fontWeight: "800" },
  jobs: { color: colors.muted, fontSize: 11 },
  distance: { color: colors.muted, fontSize: 10, flexShrink: 1 },
  price: { width: 62, flexShrink: 0, alignItems: "flex-end", gap: 1 },
  priceValue: { color: colors.ink, fontSize: 13, fontWeight: "800" },
  per: { color: colors.muted, fontSize: 10 }
});
