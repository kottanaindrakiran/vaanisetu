import { useState, useEffect } from "react";
import { Share2, Heart, Briefcase, DollarSign } from "lucide-react";
import ProfileSummaryCard from "@/components/ProfileSummaryCard";
import SpeechBubble from "@/components/SpeechBubble";
import SchemeCard from "@/components/SchemeCard";
import NoMatchesState from "@/components/NoMatchesState";
import EditProfilePanel from "@/components/EditProfilePanel";
import type { ProfileData } from "@/components/EditProfilePanel";
import { useLocation, useNavigate } from "react-router-dom";
import { mockSchemes } from "@/data/mockSchemes";
import { useLanguage } from "@/LanguageContext";

const Results = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  const [showNoMatches, setShowNoMatches] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  // Use backend profile if available, else fallback to mock/defaults
  const [profile, setProfile] = useState<ProfileData>({
    age: result?.profile?.age || 45,
    income: result?.profile?.income ? `₹${result.profile.income}` : "Below ₹1 lakh",
    occupation: result?.profile?.occupation || "Farmer",
    state: result?.profile?.state || "Tamil Nadu",
    gender: "Male",
  });

  const summaryStr = t("results_summary")
    .replace("{age}", String(profile.age))
    .replace("{occupation}", String(profile.occupation))
    .replace("{state}", String(profile.state))
    .replace("{income}", String(profile.income));

  const summary = result?.profile_summary || summaryStr;

  const schemes = result?.schemes || mockSchemes;
  const speakableText = result?.speakable_text || "Based on your profile, I found 4 government schemes you may be eligible for.";
  const showFallbackWarning = !result?.schemes;

  useEffect(() => {
    if (schemes.length === 0) setShowNoMatches(true);
  }, [schemes]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "VaaniSetu Schemes",
          text: "I found some government schemes I might be eligible for on VaaniSetu!",
          url: window.location.href,
        });
      } else {
        alert("Sharing is not supported on this browser.");
      }
    } catch (error) {
      console.log("Share failed", error);
    }
  };

  return (
    <div className="gradient-bg min-h-screen pb-20">
      <header className="px-4 pt-4">
        <h1 className="text-xl font-extrabold text-primary">{t("results_title")}</h1>
      </header>

      <div className="space-y-4 px-4 pt-4">
        <ProfileSummaryCard summary={summary} onEdit={() => setEditOpen(true)} />

        <SpeechBubble message={speakableText} />

        {showFallbackWarning && (
          <div className="rounded-lg bg-warning/20 p-3 text-sm font-semibold text-warning-foreground">
            Using offline fallback data.
          </div>
        )}

        {showNoMatches ? (
          <NoMatchesState
            onAnswerMore={() => setShowNoMatches(false)}
            onShowAnyway={() => setShowNoMatches(false)}
          />
        ) : (
          <div className="space-y-3">
            {schemes.map((scheme: any, idx: number) => (
              <SchemeCard key={scheme.id || idx} scheme={scheme} />
            ))}
          </div>
        )}

        {/* Impact Summary Footer */}
        <div className="rounded-xl border bg-success/10 p-4">
          <h3 className="text-sm font-extrabold text-foreground">{t("results_benefits_title")}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("results_benefits_desc")}
          </p>
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success/20">
                <DollarSign size={14} className="text-success" />
              </div>
              <span className="text-xs font-semibold text-foreground">{t("results_benefit_1")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success/20">
                <Heart size={14} className="text-success" />
              </div>
              <span className="text-xs font-semibold text-foreground">{t("results_benefit_2")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success/20">
                <Briefcase size={14} className="text-success" />
              </div>
              <span className="text-xs font-semibold text-foreground">{t("results_benefit_3")}</span>
            </div>
          </div>
        </div>

        {/* Share button */}
        <button
          onClick={handleShare}
          className="flex w-full items-center justify-center gap-2 rounded-xl border bg-card py-3 text-sm font-bold text-card-foreground shadow-sm transition-colors hover:bg-accent"
        >
          <Share2 size={16} className="text-success" /> {t("results_share")}
        </button>
      </div>

      <EditProfilePanel
        open={editOpen}
        onClose={() => setEditOpen(false)}
        profile={profile}
        onSave={setProfile}
      />
    </div>
  );
};

export default Results;
