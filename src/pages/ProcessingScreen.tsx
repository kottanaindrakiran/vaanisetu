import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mic, Brain, BarChart3, CheckCircle2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "@/LanguageContext";

const ProcessingScreen = () => {
  const { t, language } = useLanguage();

  const steps = [
    { icon: Mic, label: t("processing_step_1"), delay: 0 },
    { icon: Brain, label: t("processing_step_2"), delay: 1200 },
    { icon: BarChart3, label: t("processing_step_3"), delay: 2600 },
    { icon: CheckCircle2, label: t("processing_step_4"), delay: 4000 },
  ];

  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { query, demoMode, language: routeLanguage } = location.state || { query: "", demoMode: false, language: "en" };
  const currentLanguage = routeLanguage || language;

  useEffect(() => {
    const timers = steps.map((step, i) =>
      setTimeout(() => setActiveStep(i), step.delay)
    );

    let isSubscribed = true;
    const startTime = Date.now();

    const performAnalysis = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const url = `${apiUrl}/api/full-analysis${demoMode ? "?demo=true" : ""}`;

        const payload: any = {
          query: query || "",
          language: currentLanguage
        };

        // State hint heuristics
        if (currentLanguage === "ta") payload.state_hint = "Tamil Nadu";
        if (currentLanguage === "te") payload.state_hint = "Andhra Pradesh";
        if (currentLanguage === "hi") payload.state_hint = "Uttar Pradesh"; // or MP/Bihar etc as generic Hindi priority

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (isSubscribed) {
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(0, 5200 - elapsed);

          setTimeout(() => {
            navigate("/results", { state: { result: data } });
          }, remaining);
        }
      } catch (err) {
        console.error("API error:", err);
        if (isSubscribed) {
          setTimeout(() => {
            navigate("/results", { state: { result: null, error: true } });
          }, 5200);
        }
      }
    };

    performAnalysis();

    return () => {
      timers.forEach(clearTimeout);
      isSubscribed = false;
    };
  }, [query, demoMode, navigate]);

  return (
    <div className="gradient-bg fixed inset-0 z-50 flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-10 text-center"
      >
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Brain size={36} className="text-primary-foreground" />
          </motion.div>
        </div>
        <h2 className="text-xl font-extrabold text-foreground">{t("processing_checking")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("processing_wait")}</p>
      </motion.div>

      <div className="w-full max-w-xs space-y-4">
        {steps.map((step, i) => {
          const StepIcon = step.icon;
          const isActive = i === activeStep;
          const isDone = i < activeStep;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: i <= activeStep ? 1 : 0.3, x: 0 }}
              transition={{ delay: step.delay / 1000, duration: 0.4 }}
              className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${isDone
                ? "border-success/30 bg-success/10"
                : isActive
                  ? "border-primary/40 bg-primary/10"
                  : "border-border bg-card"
                }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isDone
                  ? "bg-success text-success-foreground"
                  : isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                  }`}
              >
                {isDone ? (
                  <CheckCircle2 size={18} />
                ) : isActive ? (
                  <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>
                    <StepIcon size={18} />
                  </motion.div>
                ) : (
                  <StepIcon size={18} />
                )}
              </div>
              <span
                className={`text-sm font-semibold ${isDone
                  ? "text-success"
                  : isActive
                    ? "text-foreground"
                    : "text-muted-foreground"
                  }`}
              >
                {step.label}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-8 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 5, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
};

export default ProcessingScreen;
