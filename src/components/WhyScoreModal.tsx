import { X, Briefcase, DollarSign, Calendar, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Scheme } from "@/data/mockSchemes";

const explainData: Record<string, { occupation: string; income: string; age: string; location: string }> = {
  high: {
    occupation: "✅ Your occupation matches this scheme's target group",
    income: "✅ Your income level is within the eligible range",
    age: "✅ Your age qualifies for this benefit",
    location: "✅ This scheme is available in your state",
  },
  medium: {
    occupation: "✅ Your occupation partially matches",
    income: "⚠️ Your income is near the eligibility boundary",
    age: "✅ Your age qualifies",
    location: "✅ Available in your state",
  },
  low: {
    occupation: "⚠️ This scheme targets a different occupation group",
    income: "❌ Your income may be outside the eligible range",
    age: "✅ Your age qualifies",
    location: "✅ Available in your state",
  },
};

interface WhyScoreModalProps {
  open: boolean;
  onClose: () => void;
  scheme: Scheme;
}

const rows = [
  { key: "occupation" as const, icon: Briefcase, label: "Occupation" },
  { key: "income" as const, icon: DollarSign, label: "Income" },
  { key: "age" as const, icon: Calendar, label: "Age" },
  { key: "location" as const, icon: MapPin, label: "Location" },
];

const WhyScoreModal = ({ open, onClose, scheme }: WhyScoreModalProps) => {
  const data = explainData[scheme.eligibilityScore];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-50 bg-foreground/40" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[15%] z-50 mx-auto max-w-sm rounded-2xl border bg-background p-5 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-foreground">Why this score?</h3>
              <button onClick={onClose} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"><X size={18} /></button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{scheme.name}</p>
            <div className="mt-4 space-y-3">
              {rows.map((r) => (
                <div key={r.key} className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent">
                    <r.icon size={14} className="text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{r.label}</p>
                    <p className="text-xs text-muted-foreground">{data[r.key]}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WhyScoreModal;
