import { Pressable, Text, StyleSheet, ViewStyle } from "react-native";
import { ChevronRight } from "@/components/icons";
import { colors } from "@/constants/theme";

type Props = { title: string; onPress: () => void; secondary?: boolean; style?: ViewStyle; arrow?: boolean };
export function AppButton({ title, onPress, secondary, style, arrow }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.button, secondary && styles.secondary, pressed && styles.pressed, style]}>
      <Text style={[styles.text, secondary && styles.secondaryText]}>{title}</Text>
      {arrow ? <ChevronRight size={18} color={secondary ? colors.green : colors.white} /> : null}
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: { minHeight: 52, borderRadius: 16, backgroundColor: colors.green, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  secondary: { backgroundColor: colors.mint },
  text: { color: colors.white, fontSize: 15, fontWeight: "700" },
  secondaryText: { color: colors.green },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] }
});
