import { Tabs } from "expo-router";
import { BriefcaseBusiness, CalendarDays, UserRound } from "@/components/icons";
import { colors } from "@/constants/theme";
export default function ProfessionalTabs(){
 return <Tabs screenOptions={{
  headerShown:false,tabBarActiveTintColor:colors.green,tabBarInactiveTintColor:"#9AA69E",
  tabBarStyle:{height:68,paddingTop:8,paddingBottom:9,borderTopColor:colors.line,backgroundColor:"#FFFFFF"},
  tabBarLabelStyle:{fontSize:10,fontWeight:"700"}
 }}>
  <Tabs.Screen name="index" options={{title:"Painel",tabBarIcon:({color,size})=><BriefcaseBusiness color={color} size={size}/>}}/>
  <Tabs.Screen name="requests" options={{title:"Solicitações",tabBarIcon:({color,size})=><CalendarDays color={color} size={size}/>}}/>
  <Tabs.Screen name="profile" options={{title:"Perfil",tabBarIcon:({color,size})=><UserRound color={color} size={size}/>}}/>
 </Tabs>;
}
