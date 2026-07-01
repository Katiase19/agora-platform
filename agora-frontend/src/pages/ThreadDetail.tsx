import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import type { ThreadResponse, ReplyResponse } from "../types/forum";
import { getThreadById, getRepliesForThread } from "../api/forumApi";
import VoteButtons from "../components/VoteButtons";
import ReplyBox from "../components/ReplyBox";

function ThreadDetail() {
  const { id } = useParams();
  const threadId = Number(id);

  const [thread, setThread] = useState<ThreadResponse | null>(null);
  const [replies, setReplies] = useState<ReplyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getThreadById(threadId), getRepliesForThread(threadId)])
      .then(([threadData, repliesData]) => {
        setThread(threadData);
        setReplies(repliesData);
      })
      .catch(() => setError("Failed to load this thread. Is the backend running?"))
      .finally(() => setLoading(false));
  }, [threadId]);

  if (loading) {
    return <div className="max-w-3xl mx-auto p-6">Loading thread...</div>;
  }

  if (error || !thread) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-red-600">{error || "Thread not found."}</p>
        <Link to="/" className="text-blue-600 underline">
          Back to forum
        </Link>
      </div>
    );
  }

  function refreshReplies() {
    getRepliesForThread(threadId).then((data) => setReplies(data));
}

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Link to="/" className="text-blue-600 underline text-sm">
        ← Back to forum
      </Link>

      <div className="border border-gray-200 rounded-lg p-4 mt-4 flex gap-4">
        <VoteButtons voteScore={thread.voteScore} />

        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h1 className="text-xl font-bold">{thread.title}</h1>
            {thread.isResolved && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                Resolved
              </span>
            )}
          </div>

          <p className="text-gray-700 mt-2">{thread.body}</p>

          <div className="flex gap-4 text-xs text-gray-500 mt-3">
            <span>{thread.courseTag}</span>
            <span>{thread.viewCount} views</span>
            <span>by {thread.authorName}</span>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-3">
        {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
      </h2>

      <div className="space-y-3">
        {replies.map((reply) => (
          <div
            key={reply.id}
            className={`border rounded-lg p-3 flex gap-3 ${
              reply.isAccepted
                ? "border-green-400 bg-green-50"
                : "border-gray-200"
            }`}
          >
            <VoteButtons voteScore={reply.voteScore} />

            <div className="flex-1">
              {reply.isAccepted && (
                <span className="text-xs font-semibold text-green-700">
                  ✓ Accepted Answer
                </span>
              )}
              <p className="text-gray-700 text-sm mt-1">{reply.body}</p>
              <div className="flex gap-4 text-xs text-gray-500 mt-2">
                <span>by {reply.authorName}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ReplyBox threadId={threadId} onReplyAdded={refreshReplies} />
    </div>
  );
}

export default ThreadDetail;