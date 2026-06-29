import { ThumbsUp, ThumbsDown } from "lucide-react";

interface VoteButtonsProps {
  voteScore: number;
}

function VoteButtons({ voteScore }: VoteButtonsProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        className="text-gray-400 hover:text-green-600 transition-colors"
        aria-label="Upvote"
      >
        <ThumbsUp size={18} />
      </button>
      <span className="text-sm font-semibold text-gray-700">{voteScore}</span>
      <button
        className="text-gray-400 hover:text-red-600 transition-colors"
        aria-label="Downvote"
      >
        <ThumbsDown size={18} />
      </button>
    </div>
  );
}

export default VoteButtons;