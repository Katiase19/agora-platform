import { ThumbsUp, ThumbsDown } from "lucide-react";

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
  const liked = userVote === 1;
  const disliked = userVote === -1;

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <button
        type="button"
        onClick={() => onVote?.(1)}
        disabled={inactive}
        title={inactive ? disabledReason : liked ? "Remove thumbs up" : "Thumbs up"}
        aria-label="Upvote"
        aria-pressed={liked}
        className={`p-1.5 rounded-full transition-all active:scale-90 disabled:cursor-not-allowed disabled:opacity-50 ${
          liked
            ? "text-emerald-600 bg-emerald-100 hover:bg-emerald-200"
            : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
        }`}
      >
        <ThumbsUp size={18} strokeWidth={2} fill={liked ? "currentColor" : "none"} />
      </button>
      <span
        className={`text-sm font-bold tabular-nums ${
          liked ? "text-emerald-600" : disliked ? "text-rose-600" : "text-gray-700"
        }`}
        aria-label={`Score ${voteScore}`}
      >
        {voteScore}
      </span>
      <button
        type="button"
        onClick={() => onVote?.(-1)}
        disabled={inactive}
        title={inactive ? disabledReason : disliked ? "Remove thumbs down" : "Thumbs down"}
        aria-label="Downvote"
        aria-pressed={disliked}
        className={`p-1.5 rounded-full transition-all active:scale-90 disabled:cursor-not-allowed disabled:opacity-50 ${
          disliked
            ? "text-rose-600 bg-rose-100 hover:bg-rose-200"
            : "text-gray-400 hover:text-rose-600 hover:bg-rose-50"
        }`}
      >
        <ThumbsDown size={18} strokeWidth={2} fill={disliked ? "currentColor" : "none"} />
      </button>
    </div>
  );
}

export default VoteButtons;
