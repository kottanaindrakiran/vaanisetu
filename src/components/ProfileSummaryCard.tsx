import { Pencil, User } from "lucide-react";

interface ProfileSummaryCardProps {
  summary: string;
  onEdit: () => void;
}

const ProfileSummaryCard = ({ summary, onEdit }: ProfileSummaryCardProps) => (
  <div className="flex items-center gap-3 rounded-xl border bg-accent p-4">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
      <User size={20} />
    </div>
    <p className="flex-1 text-sm font-semibold text-accent-foreground">{summary}</p>
    <button
      onClick={onEdit}
      className="shrink-0 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted"
      aria-label="Edit profile"
    >
      <Pencil size={16} />
    </button>
  </div>
);

export default ProfileSummaryCard;
