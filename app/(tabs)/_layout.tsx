import { Tabs } from "expo-router";
import { Home, Search, CalendarDays, UserRound } from "@/components/icons";
import { colors } from "@/constants/theme";
export default function TabLayout() {
  return <Tabs screenOptions={{
    headerShown: false, tabBarActiveTintColor: colors.green, tabBarInactiveTintColor: "#9AA69E",
    tabBarStyle: { height: 68, paddingTop: 8, paddingBottom: 9, borderTopColor: colors.line, backgroundColor: "#FFFFFF" },
    tabBarLabelStyle: { fontSize: 10, fontWeight: "700" }
  }}>
    <Tabs.Screen name="index" options={{ title: "Início", tabBarIcon: ({ color, size }) => <Home color={color} size={size}/> }}/>
    <Tabs.Screen name="search" options={{ title: "Buscar", tabBarIcon: ({ color, size }) => <Search color={color} size={size}/> }}/>
    <Tabs.Screen name="activity" options={{ title: "Atividades", tabBarIcon: ({ color, size }) => <CalendarDays color={color} size={size}/> }}/>
    <Tabs.Screen name="profile" options={{ title: "Perfil", tabBarIcon: ({ color, size }) => <UserRound color={color} size={size}/> }}/>
  </Tabs>;
}
