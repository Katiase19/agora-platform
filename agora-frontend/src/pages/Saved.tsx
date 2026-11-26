import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, CheckCircle2 } from "lucide-react";
import type { ThreadResponse } from "../types/forum";
import { getBookmarks, removeBookmark } from "../api/bookmarkApi";
import { getErrorMessage } from "../api/config";
import { pluralize, timeAgo } from "../utils/format";

function Saved() {
  const [threads, setThreads] = useState<ThreadResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getBookmarks()
      .then(setThreads)
      .catch((err) => setError(getErrorMessage(err, "Could not load your saved questions")))
      .finally(() => setLoading(false));
  }, []);

  async function handleRemove(id: number) {
    const previous = threads;
    setThreads((list) => list.filter((t) => t.id !== id));
    try {
      await removeBookmark(id);
    } catch {
      setThreads(previous);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Bookmark className="text-amber-500" size={22} /> Saved questions
      </h1>
      <p className="text-sm text-gray-500 mt-1">
        Questions you bookmarked. You'll get a notification when someone replies to them.
      </p>

      <div className="mt-6">
        {loading && <p className="text-sm text-gray-500">Loading saved questions...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && threads.length === 0 && (
          <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center">
            <p className="text-sm text-gray-600">You haven't saved any questions yet.</p>
            <p className="text-xs text-gray-500 mt-1">
              Open a question and click <span className="font-medium">Save</span> to keep it here.
            </p>
            <Link to="/" className="inline-block mt-3 text-sm font-medium text-blue-600 hover:underline">
              Browse the forum
            </Link>
          </div>
        )}

        {threads.length > 0 && (
          <ul className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
            {threads.map((t) => (
              <li key={t.id} className="flex items-center gap-3 p-4 hover:bg-gray-50">
                <Link to={`/threads/${t.id}`} className="min-w-0 flex-1">
                  <p className="font-medium text-blue-700 truncate flex items-center gap-2">
                    {t.title}
                    {t.isResolved && (
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" aria-label="Resolved" />
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {t.courseTag && <span className="mr-2">{t.courseTag}</span>}
                    by {t.authorName} · {pluralize(t.replyCount, "reply", "replies")} · {timeAgo(t.createdAt)}
                  </p>
                </Link>
                <button
                  onClick={() => handleRemove(t.id)}
                  className="text-xs text-gray-500 hover:text-red-600 px-2 py-1 shrink-0"
                  aria-label={`Remove ${t.title} from saved`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Saved;
