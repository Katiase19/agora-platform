import { useParams, Link } from "react-router-dom";
import { dummyThreads, dummyReplies } from "../api/dummyData";

function ThreadDetail() {
  const { id } = useParams();
  const threadId = Number(id);

  const thread = dummyThreads.find((t) => t.id === threadId);
  const replies = dummyReplies.filter((r) => r.threadId === threadId);

  if (!thread) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-red-600">Thread not found.</p>
        <Link to="/" className="text-blue-600 underline">
          Back to forum
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Link to="/" className="text-blue-600 underline text-sm">
        ← Back to forum
      </Link>

      <div className="border border-gray-200 rounded-lg p-4 mt-4">
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
          <span>{thread.voteScore} votes</span>
          <span>{thread.viewCount} views</span>
          <span>by {thread.authorName}</span>
        </div>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-3">
        {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
      </h2>

      <div className="space-y-3">
        {replies.map((reply) => (
          <div
            key={reply.id}
            className={`border rounded-lg p-3 ${
              reply.isAccepted
                ? "border-green-400 bg-green-50"
                : "border-gray-200"
            }`}
          >
            {reply.isAccepted && (
              <span className="text-xs font-semibold text-green-700">
                ✓ Accepted Answer
              </span>
            )}
            <p className="text-gray-700 text-sm mt-1">{reply.body}</p>
            <div className="flex gap-4 text-xs text-gray-500 mt-2">
              <span>{reply.voteScore} votes</span>
              <span>by {reply.authorName}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ThreadDetail;