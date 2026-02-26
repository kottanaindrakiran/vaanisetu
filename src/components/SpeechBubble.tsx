import { Volume2 } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface SpeechBubbleProps {
  message: string;
}

const WaveformBar = ({ delay }: { delay: number }) => (
  <motion.div
    className="w-0.5 rounded-full bg-primary-foreground/70"
    animate={{ height: ["6px", "16px", "6px"] }}
    transition={{ duration: 0.6, repeat: Infinity, delay, ease: "easeInOut" }}
  />
);

const SpeechBubble = ({ message }: SpeechBubbleProps) => {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    return () => window.speechSynthesis.cancel();
  }, []);

  const togglePlay = () => {
    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.onend = () => setPlaying(false);
      utterance.onerror = () => setPlaying(false);
      window.speechSynthesis.speak(utterance);
      setPlaying(true);
    }
  };

  return (
    <div className="flex items-start gap-3">
      <div className="flex-1 rounded-2xl rounded-tl-sm bg-primary p-4 text-sm leading-relaxed text-primary-foreground shadow-sm">
        {message}
        {playing && (
          <div className="mt-3 flex items-end gap-0.5">
            {Array.from({ length: 20 }).map((_, i) => (
              <WaveformBar key={i} delay={i * 0.05} />
            ))}
          </div>
        )}
      </div>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={togglePlay}
        className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${playing
            ? "bg-primary text-primary-foreground"
            : "bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground"
          }`}
        aria-label="Play audio response"
      >
        <Volume2 size={20} />
      </motion.button>
    </div>
  );
};

export default SpeechBubble;
