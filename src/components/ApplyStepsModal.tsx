import { X, MapPin, FileEdit, FileCheck, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const timelineSteps = [
  { icon: MapPin, title: "Visit nearest center", desc: "Go to your nearest CSC or Gram Panchayat office." },
  { icon: FileEdit, title: "Fill application form", desc: "Fill out the scheme application form with your details." },
  { icon: FileCheck, title: "Submit required documents", desc: "Attach Aadhaar, income proof, and other documents." },
  { icon: Award, title: "Receive approval & benefit", desc: "Once verified, benefits are credited to your bank account." },
];

interface ApplyStepsModalProps {
  open: boolean;
  onClose: () => void;
  schemeName: string;
}

const ApplyStepsModal = ({ open, onClose, schemeName }: ApplyStepsModalProps) => (
  <AnimatePresence>
    {open && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-foreground/40"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="fixed inset-x-4 top-[10%] z-50 mx-auto max-w-sm overflow-hidden rounded-2xl border bg-background shadow-xl"
        >
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="text-base font-extrabold text-foreground">How to Apply</h2>
            <button onClick={onClose} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted">
              <X size={18} />
            </button>
          </div>
          <div className="px-4 pb-5 pt-3">
            <p className="mb-4 text-sm font-semibold text-primary">{schemeName}</p>
            <div className="relative space-y-5 pl-5">
              {/* Timeline line */}
              <div className="absolute bottom-2 left-[13px] top-2 w-0.5 bg-border" />
              {timelineSteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.12 }}
                    className="relative flex gap-3"
                  >
                    <div className="absolute -left-5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background">
                      <Icon size={14} className="text-primary" />
                    </div>
                    <div className="ml-5">
                      <p className="text-sm font-bold text-foreground">{step.title}</p>
                      <p className="text-xs text-muted-foreground">{step.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

export default ApplyStepsModal;
