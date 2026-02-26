import { useState, useEffect, useCallback } from "react";
import { Search, Lightbulb, WifiOff, ToggleLeft, ToggleRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MicButton from "@/components/MicButton";
import LanguageSelector from "@/components/LanguageSelector";
import TrustBar from "@/components/TrustBar";
import { useLanguage } from "@/LanguageContext";

const Index = () => {
  const { t, language } = useLanguage();
  const [query, setQuery] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [demoMode, setDemoMode] = useState(false);
  const navigate = useNavigate();

  const hints = [
    t("hint_farmer"),
    t("hint_widow"),
    t("hint_student"),
  ];

  useEffect(() => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      const rec = new SpeechRec();
      rec.continuous = false;
      rec.interimResults = false;

      const langMapping: Record<string, string> = {
        "en": "en-IN",
        "hi": "hi-IN",
        "ta": "ta-IN",
        "te": "te-IN"
      };
      rec.lang = langMapping[language] || "en-IN";

      rec.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setQuery(text);
        setIsRecording(false);
        navigate("/processing", { state: { query: text, demoMode, language } });
      };

      rec.onerror = (e: any) => {
        console.error("Speech recognition error", e);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      setRecognition(rec);
    }
  }, [demoMode, navigate]);

  const handleSubmit = useCallback(() => {
    if (query.trim() || demoMode) {
      navigate("/processing", { state: { query, demoMode, language } });
    }
  }, [query, demoMode, language, navigate]);

  // Demo mode auto-trigger
  useEffect(() => {
    if (!demoMode) return;
    setQuery(t("hint_farmer"));
    const timer = setTimeout(() => {
      navigate("/processing", { state: { query: t("hint_farmer"), demoMode: true, language } });
    }, 1500);
    return () => clearTimeout(timer);
  }, [demoMode, language, navigate, t]);

  const handleMicToggle = (recording: boolean) => {
    if (recording && recognition) {
      try {
        recognition.start();
        setIsRecording(true);
      } catch (e) {
        setIsRecording(false);
      }
    } else if (!recording && recognition) {
      recognition.stop();
      setIsRecording(false);
    } else {
      // Fallback if no speech recognition
      setIsRecording(recording);
      if (!recording) navigate("/processing", { state: { query, demoMode, language } });
    }
  };

  return (
    <div className="gradient-bg flex min-h-screen flex-col pb-20">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-4">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">{t("app_title")}</h1>
          <p className="text-xs font-medium text-muted-foreground">
            {t("app_subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Demo mode toggle */}
          <button
            onClick={() => setDemoMode(!demoMode)}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors ${demoMode ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
          >
            {demoMode ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
            {t("demo_mode")}
          </button>
          <LanguageSelector />
        </div>
      </header>

      {/* Trust bar */}
      <TrustBar />

      {/* Offline banner */}
      <div className="mx-4 mt-2 flex items-center gap-2 rounded-lg bg-accent px-3 py-2">
        <WifiOff size={14} className="shrink-0 text-accent-foreground" />
        <p className="text-xs font-medium text-accent-foreground">
          {t("offline_banner")}
        </p>
      </div>

      {/* Main */}
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
        <MicButton onRecordingChange={handleMicToggle} />
        <p className="text-base font-semibold text-muted-foreground">
          {isRecording ? t("mic_listening") : t("mic_tap")}
        </p>

        {/* Text input */}
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 rounded-xl border bg-card px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-primary">
            <Search size={18} className="text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder={t("search_placeholder")}
              className="flex-1 bg-transparent text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            {query && (
              <button
                onClick={handleSubmit}
                className="rounded-lg bg-primary px-3 py-1 text-xs font-bold text-primary-foreground"
              >
                {t("search_button")}
              </button>
            )}
          </div>

          {/* Hints */}
          <div className="mt-4 space-y-2">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Lightbulb size={14} /> {t("try_saying")}
            </p>
            {hints.map((hint) => (
              <button
                key={hint}
                onClick={() => {
                  setQuery(hint);
                  navigate("/processing", { state: { query: hint, demoMode, language } });
                }}
                className="block w-full rounded-lg border bg-card px-3 py-2 text-left text-sm text-card-foreground transition-colors hover:bg-accent"
              >
                "{hint}"
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom info */}
      <div className="mx-4 mb-2 rounded-xl border bg-card p-4 text-center shadow-sm">
        <p className="text-sm font-semibold text-card-foreground">
          {t("footer_text")}
        </p>
      </div>
    </div>
  );
};

export default Index;
