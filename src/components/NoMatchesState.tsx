import { SearchX, HelpCircle, List } from "lucide-react";
import { motion } from "framer-motion";

interface NoMatchesStateProps {
  onAnswerMore: () => void;
  onShowAnyway: () => void;
}

const NoMatchesState = ({ onAnswerMore, onShowAnyway }: NoMatchesStateProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center rounded-xl border bg-card px-6 py-10 text-center shadow-sm"
  >
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-warning/15">
      <SearchX size={32} className="text-warning" />
    </div>
    <h3 className="text-base font-bold text-card-foreground">No Strong Matches Yet</h3>
    <p className="mt-2 max-w-xs text-sm text-muted-foreground">
      We need a little more information to find the best schemes for you.
    </p>
    <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
      <button
        onClick={onAnswerMore}
        className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
      >
        <HelpCircle size={16} /> Answer a few more questions
      </button>
      <button
        onClick={onShowAnyway}
        className="flex items-center justify-center gap-2 rounded-xl border bg-card py-3 text-sm font-semibold text-card-foreground transition-colors hover:bg-accent"
      >
        <List size={16} /> Show possible schemes anyway
      </button>
    </div>
  </motion.div>
);

export default NoMatchesState;
