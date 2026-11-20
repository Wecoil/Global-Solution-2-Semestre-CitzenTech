import type { PropsWithChildren } from "react";
import { ScrollView, StyleSheet, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/constants/theme";

type Props = PropsWithChildren<{ scroll?: boolean; contentStyle?: ViewStyle }>;
export function Screen({ children, scroll = true, contentStyle }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {scroll ? <ScrollView contentContainerStyle={[styles.content, contentStyle]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">{children}</ScrollView> : <View style={[styles.content, contentStyle]}>{children}</View>}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.mintSoft },
  content: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 42, gap: 20, flexGrow: 1 }
});
