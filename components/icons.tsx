import type { ComponentProps } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type IconProps = { size?: number; color?: string; fill?: string; strokeWidth?: number };
function makeIcon(name: ComponentProps<typeof MaterialCommunityIcons>["name"]) {
  return function AppIcon({ size = 22, color = "#20342B" }: IconProps) {
    return <MaterialCommunityIcons name={name} size={size} color={color} />;
  };
}
export const Home = makeIcon("home-outline");
export const Bell = makeIcon("bell-outline");
export const MapPin = makeIcon("map-marker-outline");
export const ChevronRight = makeIcon("chevron-right");
export const Sparkles = makeIcon("creation-outline");
export const Shirt = makeIcon("tshirt-crew-outline");
export const ChefHat = makeIcon("chef-hat");
export const Grid2X2 = makeIcon("view-grid-outline");
export const Search = makeIcon("magnify");
export const SlidersHorizontal = makeIcon("tune-variant");
export const ShieldCheck = makeIcon("shield-check-outline");
export const Star = makeIcon("star");
export const CalendarDays = makeIcon("calendar-month-outline");
export const UserRound = makeIcon("account-outline");
export const CreditCard = makeIcon("credit-card-outline");
export const CircleHelp = makeIcon("help-circle-outline");
export const LogOut = makeIcon("logout");
export const ArrowLeft = makeIcon("arrow-left");
export const Clock3 = makeIcon("clock-outline");
export const Minus = makeIcon("minus");
export const Plus = makeIcon("plus");
export const Check = makeIcon("check");
export const CheckCircle2 = makeIcon("check-circle-outline");
export const Phone = makeIcon("phone-outline");
export const MessageCircle = makeIcon("message-outline");

export const House = makeIcon("home-outline");
export const BriefcaseBusiness = makeIcon("briefcase-outline");
export const LockKeyhole = makeIcon("lock-outline");
export const Mail = makeIcon("email-outline");
export const X = makeIcon("close");
export const Wallet = makeIcon("wallet-outline");

export const Camera = makeIcon("camera-outline");
