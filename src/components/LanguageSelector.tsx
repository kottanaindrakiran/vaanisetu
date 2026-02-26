import { useState } from "react";
import { Globe } from "lucide-react";
import { useLanguage } from "@/LanguageContext";

const languages = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
];

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
      >
        <Globe size={16} />
        {languages.find((l) => l.code === language)?.label || "English"}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[120px] rounded-lg border bg-card p-1 shadow-lg">
          {languages.map((lang: any) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setOpen(false);
              }}
              className={`block w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${language === lang.code
                  ? "bg-primary text-primary-foreground"
                  : "text-card-foreground hover:bg-accent"
                }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
