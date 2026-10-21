import { Car, Truck, Gem, Snowflake, Navigation, Bluetooth, Baby, UserPlus, Fuel, Gauge, Users, Briefcase, ShieldCheck, Wifi, Sun, Music, Zap, KeyRound, MapPin, Tag } from "lucide-react";

function SportsCar(props) {
  return (
    <svg
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 16H3.2a.7.7 0 0 1-.7-.7v-1.8c0-.5.3-.9.8-1.1L8 11.4l2.3-1.6c.4-.3.8-.4 1.3-.4h1.5c.5 0 .9.2 1.3.5l1.6 1.5 4.8 1.2c.8.2 1.2.9 1.2 1.8v.9a.7.7 0 0 1-.7.7H19" />
      <path d="M9 16h6" />
      <circle cx="7" cy="16" r="2" />
      <circle cx="17" cy="16" r="2" />
    </svg>
  );
}

export const CATALOG_ICONS = {
  car: Car,
  sportscar: SportsCar,
  truck: Truck,
  gem: Gem,
  snowflake: Snowflake,
  navigation: Navigation,
  bluetooth: Bluetooth,
  baby: Baby,
  userplus: UserPlus,
  fuel: Fuel,
  gauge: Gauge,
  users: Users,
  briefcase: Briefcase,
  shield: ShieldCheck,
  wifi: Wifi,
  sun: Sun,
  music: Music,
  zap: Zap,
  key: KeyRound,
  pin: MapPin,
  tag: Tag,
};