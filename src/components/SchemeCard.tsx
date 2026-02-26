import { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink, FileText, ListChecks, Download, ClipboardList, CheckSquare, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Scheme } from "@/data/mockSchemes";
import ApplyStepsModal from "@/components/ApplyStepsModal";
import WhyScoreModal from "@/components/WhyScoreModal";
import { useLanguage } from "@/LanguageContext";

const scoreBadge: any = {
  high: "bg-success text-success-foreground",
  medium: "bg-warning text-warning-foreground",
  low: "bg-destructive text-destructive-foreground",
};

const getScoreKey = (scheme: any) => (scheme.confidence || scheme.eligibilityScore || "low").toLowerCase();

const SchemeCard = ({ scheme }: { scheme: any }) => {
  const { t } = useLanguage();

  const formatUrl = (url: string | undefined): string => {
    if (!url || url === "#") return "";
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return "https://" + url;
    }
    return url;
  };
  const [expanded, setExpanded] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showWhyScore, setShowWhyScore] = useState(false);

  const scoreLabel: any = {
    high: t("card_high_match"),
    medium: t("card_partial_match"),
    low: t("card_low_match")
  };



  return (
    <>
      <div className="rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="text-base font-bold text-card-foreground">{scheme.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{scheme.simple_reason || scheme.reason}</p>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${scoreBadge[getScoreKey(scheme)]}`}>
            {scoreLabel[getScoreKey(scheme)]}
          </span>
        </div>

        {/* Why this score link */}
        <button
          onClick={() => setShowWhyScore(true)}
          className="mt-2 flex items-center gap-1 text-xs font-semibold text-primary transition-opacity hover:opacity-80"
        >
          <Info size={12} /> {t("card_why_score")}
        </button>

        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg bg-accent py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          {expanded ? t("card_hide_details") : t("card_view_details")}
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-4 border-t pt-3">
                <div>
                  <div className="mb-2 flex items-center gap-1.5 text-sm font-bold text-card-foreground">
                    <FileText size={14} /> {t("card_doc_checklist")}
                  </div>
                  <div className="space-y-1.5">
                    {scheme.documents.map((d) => (
                      <div key={d} className="flex items-center gap-2 rounded-lg bg-accent/60 px-3 py-2">
                        <CheckSquare size={14} className="shrink-0 text-success" />
                        <span className="text-sm text-card-foreground">{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-1.5 text-sm font-bold text-card-foreground">
                    <ListChecks size={14} /> {t("card_apply_steps")}
                  </div>
                  <ol className="ml-5 list-decimal space-y-0.5 text-sm text-muted-foreground">
                    {scheme.steps.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setShowApplyModal(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      <ClipboardList size={14} /> {t("card_see_how_apply")}
                    </button>
                    {scheme.sample_form_url ? (
                      <a
                        href={scheme.sample_form_url}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-4 py-2 text-sm font-semibold text-card-foreground transition-colors hover:bg-accent"
                      >
                        <Download size={14} /> {t("card_download_form")}
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary/80">
                        <ExternalLink size={14} /> Application available online via official portal
                      </span>
                    )}
                    {(() => {
                      const linkUrl = formatUrl(scheme.official_url || scheme.officialLink);
                      if (linkUrl) {
                        return (
                          <a
                            href={linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-4 py-2 text-sm font-semibold text-card-foreground transition-colors hover:bg-accent"
                          >
                            <ExternalLink size={14} /> {t("card_official_website")}
                          </a>
                        );
                      } else {
                        console.error(`Missing official_url for scheme: ${scheme.name}`);
                        return (
                          <button
                            disabled
                            className="inline-flex items-center gap-1.5 rounded-lg border bg-muted px-4 py-2 text-sm font-semibold text-muted-foreground opacity-50 cursor-not-allowed"
                          >
                            <ExternalLink size={14} /> {t("error_link_unavailable")}
                          </button>
                        );
                      }
                    })()}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ApplyStepsModal open={showApplyModal} onClose={() => setShowApplyModal(false)} schemeName={scheme.name} />
      <WhyScoreModal open={showWhyScore} onClose={() => setShowWhyScore(false)} scheme={scheme} />
    </>
  );
};

export default SchemeCard;
