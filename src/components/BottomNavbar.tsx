import { Mic, List, MapPin } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const tabs = [
  { path: "/", label: "Home", icon: Mic },
  { path: "/results", label: "Results", icon: List },
  { path: "/help-centers", label: "Centers", icon: MapPin },
];

const BottomNavbar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-lg">
        {tabs.map((tab) => {
          const active = pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-semibold transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <tab.icon size={22} strokeWidth={active ? 2.5 : 2} />
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavbar;
