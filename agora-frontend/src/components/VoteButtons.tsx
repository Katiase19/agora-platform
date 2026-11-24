import { ChevronUp, ChevronDown } from "lucide-react";

interface VoteButtonsProps {
  voteScore: number;
  /** The current user's vote: 1, -1 or 0. */
  userVote?: number | null;
  /** Called with +1 or -1. When missing (e.g. logged out) the buttons are disabled. */
  onVote?: (value: 1 | -1) => void;
  disabled?: boolean;
  /** Tooltip explaining why voting is unavailable. */
  disabledReason?: string;
}

function VoteButtons({
  voteScore,
  userVote = 0,
  onVote,
  disabled = false,
  disabledReason,
}: VoteButtonsProps) {
  const inactive = disabled || !onVote;
  const title = inactive ? disabledReason : undefined;

  return (
    <div className="flex flex-col items-center gap-0.5 select-none">
      <button
        type="button"
        onClick={() => onVote?.(1)}
        disabled={inactive}
        title={title}
        aria-label="Upvote"
        aria-pressed={userVote === 1}
        className={`p-1 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          userVote === 1
            ? "text-white bg-emerald-500 hover:bg-emerald-600"
            : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
        }`}
      >
        <ChevronUp size={20} strokeWidth={2.5} />
      </button>
      <span
        className={`text-sm font-bold tabular-nums ${
          userVote === 1 ? "text-emerald-600" : userVote === -1 ? "text-rose-600" : "text-gray-700"
        }`}
        aria-label={`Score ${voteScore}`}
      >
        {voteScore}
      </span>
      <button
        type="button"
        onClick={() => onVote?.(-1)}
        disabled={inactive}
        title={title}
        aria-label="Downvote"
        aria-pressed={userVote === -1}
        className={`p-1 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          userVote === -1
            ? "text-white bg-rose-500 hover:bg-rose-600"
            : "text-gray-400 hover:text-rose-600 hover:bg-rose-50"
        }`}
      >
        <ChevronDown size={20} strokeWidth={2.5} />
      </button>
    </div>
  );
}

export default VoteButtons;
