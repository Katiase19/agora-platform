import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, MessageSquare, Eye, CheckCircle2, Plus, X, TrendingUp, Download } from "lucide-react";
import type { ResourceResponse, ThreadResponse } from "../types/forum";
import { getThreads } from "../api/forumApi";
import { getTrendingResources } from "../api/resourceApi";
import { getErrorMessage } from "../api/config";
import { useAuth } from "../api/AuthContext";
import Avatar from "../components/Avatar";
import { pluralize, timeAgo } from "../utils/format";

type SortKey = "newest" | "votes" | "views" | "replies";
type FilterKey = "all" | "unanswered" | "open" | "solved";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "newest", label: "Newest" },
  { key: "votes", label: "Top voted" },
  { key: "views", label: "Most viewed" },
  { key: "replies", label: "Most replies" },
];

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unanswered", label: "Unanswered" },
  { key: "open", label: "Open" },
  { key: "solved", label: "Solved" },
];

const PAGE_SIZE = 15;

function ThreadList() {
  const [threads, setThreads] = useState<ThreadResponse[]>([]);
  const [trending, setTrending] = useState<ResourceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [reloadKey, setReloadKey] = useState(0);
  const { token } = useAuth();

  // Search/filter state lives in the URL so it survives refreshes and can be linked to
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const course = params.get("course") ?? "";
  const sort = (params.get("sort") as SortKey) || "newest";
  const filter = (params.get("filter") as FilterKey) || "all";

  function updateParam(key: string, value: string, defaultValue = "") {
    const next = new URLSearchParams(params);
    if (value && value !== defaultValue) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
    setVisible(PAGE_SIZE);
  }

  useEffect(() => {
    let cancelled = false;
    getThreads()
      .then((data) => {
        if (!cancelled) {
          setThreads(data);
          setError("");
        }
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, "Failed to load threads. Is the backend running?"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  useEffect(() => {
    getTrendingResources()
      .then((data) => setTrending(Array.isArray(data) ? data.slice(0, 5) : []))
      .catch(() => setTrending([]));
  }, []);

  const courseCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of threads) {
      if (t.courseTag) counts.set(t.courseTag, (counts.get(t.courseTag) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [threads]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = threads.filter((t) => {
      if (course && t.courseTag !== course) return false;
      if (filter === "unanswered" && t.replyCount > 0) return false;
      if (filter === "open" && t.isResolved) return false;
      if (filter === "solved" && !t.isResolved) return false;
      if (!q) return true;
      return [t.title, t.body, t.courseTag ?? "", t.authorName].some((field) =>
        field.toLowerCase().includes(q)
      );
    });

    const byDate = (a: ThreadResponse, b: ThreadResponse) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    const sorters: Record<SortKey, (a: ThreadResponse, b: ThreadResponse) => number> = {
      newest: byDate,
      votes: (a, b) => b.voteScore - a.voteScore || byDate(a, b),
      views: (a, b) => b.viewCount - a.viewCount || byDate(a, b),
      replies: (a, b) => b.replyCount - a.replyCount || byDate(a, b),
    };
    return [...result].sort(sorters[sort] ?? byDate);
  }, [threads, query, course, filter, sort]);

  const stats = useMemo(
    () => ({
      total: threads.length,
      solved: threads.filter((t) => t.isResolved).length,
      unanswered: threads.filter((t) => t.replyCount === 0).length,
    }),
    [threads]
  );

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <p className="text-sm text-gray-500 mb-4">Loading threads...</p>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-full mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-5">
          <p>{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              setReloadKey((k) => k + 1);
            }}
            className="mt-3 text-sm font-medium underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const hasActiveFilters = Boolean(query || course || filter !== "all");

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="flex flex-wrap justify-between items-end gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Discussion Forum</h1>
          <p className="text-sm text-gray-500 mt-1">
            Ask questions, share answers and learn together with your coursemates.
          </p>
        </div>
        {token && (
          <Link
            to="/create"
            className="inline-flex items-center gap-1 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} /> New question
          </Link>
        )}
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-6">
        <div>
          {/* Search */}
          <div className="relative mb-3">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => updateParam("q", e.target.value)}
              placeholder="Search questions, courses or people..."
              aria-label="Search threads"
              className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Filters & sorting */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg" role="group" aria-label="Filter threads">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => updateParam("filter", f.key, "all")}
                  aria-pressed={filter === f.key}
                  className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                    filter === f.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-xs text-gray-500">
              Sort by
              <select
                value={sort}
                onChange={(e) => updateParam("sort", e.target.value, "newest")}
                className="bg-white border border-gray-300 rounded-md px-2 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-3 text-sm text-gray-600">
              <span>{pluralize(filtered.length, "result")}</span>
              {course && (
                <button
                  onClick={() => updateParam("course", "")}
                  className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded-full hover:bg-blue-100"
                >
                  Course: {course} <X size={12} />
                </button>
              )}
              <button onClick={() => setParams({}, { replace: true })} className="text-xs text-blue-600 hover:underline">
                Clear all
              </button>
            </div>
          )}

          {/* Thread list */}
          {filtered.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center">
              <MessageSquare className="mx-auto text-gray-300" size={40} />
              <p className="mt-3 font-medium text-gray-700">
                {threads.length === 0 ? "No questions yet" : "No questions match your search"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {threads.length === 0 ? "Be the first to start a discussion." : "Try different keywords or filters."}
              </p>
              {token && (
                <Link
                  to="/create"
                  className="inline-block mt-4 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Ask a question
                </Link>
              )}
            </div>
          ) : (
            <ul className="space-y-3">
              {filtered.slice(0, visible).map((thread) => (
                <li key={thread.id}>
                  <ThreadCard thread={thread} onCourseClick={(c) => updateParam("course", c)} />
                </li>
              ))}
            </ul>
          )}

          {filtered.length > visible && (
            <button
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="mt-4 w-full bg-white border border-gray-200 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Show more ({filtered.length - visible} remaining)
            </button>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 grid grid-cols-3 text-center">
            <Stat value={stats.total} label="Questions" />
            <Stat value={stats.solved} label="Solved" />
            <Stat value={stats.unanswered} label="Need help" />
          </div>

          {courseCounts.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Browse by course</h2>
              <div className="flex flex-wrap gap-2">
                {courseCounts.map(([tag, count]) => (
                  <button
                    key={tag}
                    onClick={() => updateParam("course", course === tag ? "" : tag)}
                    aria-pressed={course === tag}
                    aria-label={`Filter by course ${tag}`}
                    className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${
                      course === tag
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-700"
                    }`}
                  >
                    {tag} <span className="opacity-60">{count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {trending.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
                <TrendingUp size={15} className="text-blue-600" /> Popular resources
              </h2>
              <ul className="space-y-2.5">
                {trending.map((r) => (
                  <li key={r.id}>
                    <Link to={`/resources?q=${encodeURIComponent(r.title)}`} className="group block">
                      <p className="text-sm text-gray-800 group-hover:text-blue-700 line-clamp-1">{r.title}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-2">
                        {r.courseCode}
                        <span className="inline-flex items-center gap-0.5">
                          <Download size={11} /> {r.downloadCount}
                        </span>
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link to="/resources" className="block mt-3 text-xs font-medium text-blue-600 hover:underline">
                Browse all resources →
              </Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-[11px] text-gray-500">{label}</p>
    </div>
  );
}

function ThreadCard({
  thread,
  onCourseClick,
}: {
  thread: ThreadResponse;
  onCourseClick: (course: string) => void;
}) {
  return (
    <article className="relative bg-white border border-gray-200 rounded-xl p-4 sm:p-5 hover:border-blue-300 hover:shadow-sm transition-all flex gap-4">
      {/* Counters */}
      <div className="hidden sm:flex flex-col items-center gap-2 text-xs text-gray-500 w-16 shrink-0">
        <div className="text-center">
          <p className="text-base font-semibold text-gray-800">{thread.voteScore}</p>
          <p>votes</p>
        </div>
        <div
          className={`text-center rounded-md px-2 py-1 w-full ${
            thread.isResolved
              ? "bg-emerald-600 text-white"
              : thread.replyCount > 0
                ? "border border-emerald-600 text-emerald-700"
                : ""
          }`}
        >
          <p className="text-base font-semibold">{thread.replyCount}</p>
          <p>{thread.replyCount === 1 ? "reply" : "replies"}</p>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-3">
          <h2 className="text-base sm:text-lg font-semibold text-blue-700 leading-snug">
            {/* Stretched link: the whole card is clickable */}
            <Link to={`/threads/${thread.id}`} className="after:absolute after:inset-0 hover:underline">
              {thread.title}
            </Link>
          </h2>
          {thread.isResolved && (
            <span className="shrink-0 inline-flex items-center gap-1 text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
              <CheckCircle2 size={12} /> Resolved
            </span>
          )}
        </div>

        <p className="text-gray-600 text-sm mt-1 line-clamp-2">{thread.body}</p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 mt-3">
          {thread.courseTag && (
            <button
              onClick={() => onCourseClick(thread.courseTag!)}
              className="relative z-10 bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded hover:bg-blue-100"
            >
              {thread.courseTag}
            </button>
          )}
          <span className="sm:hidden">{pluralize(thread.voteScore, "vote")}</span>
          <span className="sm:hidden">{pluralize(thread.replyCount, "reply", "replies")}</span>
          <span className="inline-flex items-center gap-1">
            <Eye size={13} /> {thread.viewCount}
          </span>
          <span className="inline-flex items-center gap-1.5 ml-auto">
            <Avatar name={thread.authorName} id={thread.authorId} size="sm" />
            <span>by {thread.authorName}</span>
            <span className="text-gray-400">· {timeAgo(thread.createdAt)}</span>
          </span>
        </div>
      </div>
    </article>
  );
}

export default ThreadList;
