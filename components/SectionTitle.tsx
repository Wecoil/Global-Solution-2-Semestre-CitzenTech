import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronRight } from "@/components/icons";
import { colors } from "@/constants/theme";
export function SectionTitle({ title, action, onPress }: { title: string; action?: string; onPress?: () => void }) {
  return <View style={styles.row}><Text style={styles.title}>{title}</Text>{action ? <Pressable onPress={onPress} style={styles.action}><Text style={styles.actionText}>{action}</Text><ChevronRight size={15} color={colors.green}/></Pressable> : null}</View>;
}
const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  title: { color: colors.ink, fontSize: 17, lineHeight: 22, fontWeight: "800", flex: 1, flexShrink: 1 },
  action: { flexDirection: "row", alignItems: "center", flexShrink: 0 },
  actionText: { color: colors.green, fontWeight: "700", fontSize: 12 },
});
