import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { ThreadResponse } from "../types/forum";
import { getThreads } from "../api/forumApi";
import { useAuth} from "../api/AuthContext";

function ThreadList() {
  const [threads, setThreads] = useState<ThreadResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { token } = useAuth();

  useEffect(() => {
    getThreads()
      .then((data) => setThreads(data))
      .catch(() => setError("Failed to load threads. Is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="max-w-3xl mx-auto p-6">Loading threads...</div>;
  }

  if (error) {
    return <div className="max-w-3xl mx-auto p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Discussion Forum</h1>
        {token &&(
        <Link
          to="/create"
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Ask a Question
        </Link>
        )}
      </div>

      <div className="space-y-4">
        {threads.map((thread) => (
          <Link
            key={thread.id}
            to={`/threads/${thread.id}`}
            className="block border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <h2 className="text-lg font-semibold text-blue-700">
                {thread.title}
              </h2>
              {thread.isResolved && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  Resolved
                </span>
              )}
            </div>

            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
              {thread.body}
            </p>

            <div className="flex gap-4 text-xs text-gray-500 mt-3">
              <span>{thread.courseTag}</span>
              <span>{thread.voteScore} votes</span>
              <span>{thread.replyCount} replies</span>
              <span>{thread.viewCount} views</span>
              <span>by {thread.authorName}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default ThreadList;