import { useState } from "react";
import { X, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProfileData {
  age: number;
  income: string;
  occupation: string;
  state: string;
  gender: string;
}

interface EditProfilePanelProps {
  open: boolean;
  onClose: () => void;
  profile: ProfileData;
  onSave: (data: ProfileData) => void;
}

const incomeOptions = ["Below ₹1 lakh", "₹1–2 lakh", "₹2–5 lakh", "₹5–10 lakh", "Above ₹10 lakh"];
const occupationOptions = ["Farmer", "Labourer", "Student", "Self-employed", "Unemployed", "Other"];
const stateOptions = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
  "Ladakh", "Lakshadweep", "Puducherry", "Unknown", "Other"
];
const genderOptions = ["Male", "Female", "Other", "Prefer not to say"];

const SelectField = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) => (
  <div>
    <label className="mb-1 block text-xs font-bold text-foreground">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border bg-card px-3 py-2.5 text-sm font-medium text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary"
    >
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  </div>
);

const EditProfilePanel = ({ open, onClose, profile, onSave }: EditProfilePanelProps) => {
  const [form, setForm] = useState<ProfileData>(profile);

  const update = (key: keyof ProfileData, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-foreground/40"
          />
          {/* Panel */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t bg-background px-4 pb-8 pt-4"
          >
            {/* Handle */}
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted-foreground/30" />

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-foreground">Edit Profile</h2>
              <button onClick={onClose} className="rounded-full p-2 text-muted-foreground hover:bg-muted">
                <X size={20} />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-foreground">Age</label>
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => update("age", parseInt(e.target.value) || 0)}
                  className="w-full rounded-lg border bg-card px-3 py-2.5 text-sm font-medium text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  min={1}
                  max={120}
                />
              </div>
              <SelectField label="Income Level" value={form.income} options={incomeOptions} onChange={(v) => update("income", v)} />
              <SelectField label="Occupation" value={form.occupation} options={occupationOptions} onChange={(v) => update("occupation", v)} />
              <SelectField label="State" value={form.state} options={stateOptions} onChange={(v) => update("state", v)} />
              <SelectField label="Gender (optional)" value={form.gender} options={genderOptions} onChange={(v) => update("gender", v)} />
            </div>

            <button
              onClick={() => { onSave(form); onClose(); }}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Save size={16} /> Save Changes
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EditProfilePanel;
export type { ProfileData };
