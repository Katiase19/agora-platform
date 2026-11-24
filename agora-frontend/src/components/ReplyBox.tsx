import { useState, type FormEvent } from "react";
import { createReply } from "../api/forumApi";
import { getErrorMessage } from "../api/config";

interface ReplyBoxProps {
  threadId: number;
  onReplyAdded: () => void;
}

const MAX_LENGTH = 5000;

function ReplyBox({ threadId, onReplyAdded }: ReplyBoxProps) {
  const [replyText, setReplyText] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event?: FormEvent) {
    event?.preventDefault();
    if (replyText.trim() === "" || submitting) return;
    setError("");
    setSubmitting(true);

    createReply(threadId, { body: replyText.trim() })
      .then(() => {
        setReplyText("");
        onReplyAdded();
      })
      .catch((err) => {
        setError(getErrorMessage(err, "Failed to post reply. Make sure you're logged in."));
      })
      .finally(() => setSubmitting(false));
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-4">
      <h3 className="text-sm font-semibold mb-2 text-gray-900">Your answer</h3>
      <textarea
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        onKeyDown={(e) => {
          // Ctrl/Cmd + Enter posts the reply
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSubmit();
        }}
        placeholder="Share your answer or thoughts..."
        maxLength={MAX_LENGTH}
        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        rows={5}
      />
      <div className="flex flex-wrap items-center justify-between gap-2 mt-1 text-xs text-gray-400">
        <span>
          Tip: wrap code in <code className="bg-gray-100 px-1 rounded">```</code> for a code block.
          Ctrl+Enter to post.
        </span>
        <span>
          {replyText.length}/{MAX_LENGTH}
        </span>
      </div>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      <button
        type="submit"
        disabled={submitting || replyText.trim() === ""}
        className="mt-3 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Posting..." : "Post Reply"}
      </button>
    </form>
  );
}

export default ReplyBox;
