import { useState } from "react";
import { Mic } from "lucide-react";
import { motion } from "framer-motion";

interface MicButtonProps {
  onRecordingChange?: (isRecording: boolean) => void;
}

const WaveBar = ({ i }: { i: number }) => (
  <motion.div
    className="w-[3px] rounded-full bg-destructive-foreground/80"
    animate={{ height: ["8px", `${14 + Math.random() * 14}px`, "8px"] }}
    transition={{ duration: 0.45 + Math.random() * 0.3, repeat: Infinity, delay: i * 0.06, ease: "easeInOut" }}
  />
);

const MicButton = ({ onRecordingChange }: MicButtonProps) => {
  const [isActive, setIsActive] = useState(false);

  const toggle = () => {
    const next = !isActive;
    setIsActive(next);
    onRecordingChange?.(next);
  };

  return (
    <div className="relative flex flex-col items-center justify-center gap-3">
      {/* Pulse rings */}
      {isActive && (
        <>
          <span className="mic-pulse-ring absolute h-32 w-32 rounded-full bg-destructive/20" />
          <span className="mic-pulse-ring absolute h-32 w-32 rounded-full bg-destructive/15" style={{ animationDelay: "0.4s" }} />
        </>
      )}

      {/* Glow */}
      {isActive && (
        <div className="absolute h-28 w-28 rounded-full bg-destructive/25 blur-xl" />
      )}

      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={toggle}
        className={`relative z-10 flex h-24 w-24 items-center justify-center rounded-full shadow-lg transition-colors ${
          isActive
            ? "bg-destructive text-destructive-foreground"
            : "bg-primary text-primary-foreground"
        }`}
        aria-label={isActive ? "Stop recording" : "Start recording"}
      >
        <Mic size={40} />
      </motion.button>

      {/* Recording waveform */}
      {isActive && (
        <div className="flex h-6 items-end gap-[3px]">
          {Array.from({ length: 16 }).map((_, i) => (
            <WaveBar key={i} i={i} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MicButton;
