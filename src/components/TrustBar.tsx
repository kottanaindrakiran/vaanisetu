import { ShieldCheck, Users, Lock } from "lucide-react";

const items = [
  { icon: ShieldCheck, text: "Official government sources" },
  { icon: Users, text: "Designed for rural citizens" },
  { icon: Lock, text: "No personal data stored" },
];

const TrustBar = () => (
  <div className="mx-4 mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 rounded-lg bg-success/10 px-3 py-2">
    {items.map((item) => (
      <span key={item.text} className="flex items-center gap-1 text-[11px] font-semibold text-success">
        <item.icon size={12} /> {item.text}
      </span>
    ))}
  </div>
);

export default TrustBar;
