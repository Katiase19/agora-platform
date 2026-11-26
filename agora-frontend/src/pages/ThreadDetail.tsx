import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Eye, Pencil, Trash2, Link2, Check, Clock } from "lucide-react";
import type { ThreadResponse, ReplyResponse, VoteTargetType } from "../types/forum";
import {
  getThreadById,
  getRepliesForThread,
  castVote,
  acceptReply,
  deleteThread,
  deleteReply,
  updateReply,
} from "../api/forumApi";
import { getErrorMessage } from "../api/config";
import { useAuth } from "../api/AuthContext";
import VoteButtons from "../components/VoteButtons";
import ReplyBox from "../components/ReplyBox";
import Avatar from "../components/Avatar";
import RichText from "../components/RichText";
import BookmarkButton from "../components/BookmarkButton";
import { formatDate, pluralize, timeAgo } from "../utils/format";

function ThreadDetail() {
  const { id } = useParams();
  const threadId = Number(id);
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [thread, setThread] = useState<ThreadResponse | null>(null);
  const [replies, setReplies] = useState<ReplyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getThreadById(threadId), getRepliesForThread(threadId)])
      .then(([threadData, repliesData]) => {
        if (cancelled) return;
        setThread(threadData);
        setReplies(repliesData);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, "Failed to load this thread. Is the backend running?"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // Reload when the user logs in/out so their own votes are shown
  }, [threadId, token]);

  const refreshReplies = useCallback(() => {
    getRepliesForThread(threadId)
      .then((data) => {
        setReplies(data);
        setThread((t) => (t ? { ...t, replyCount: data.length, isResolved: data.some((r) => r.isAccepted) } : t));
      })
      .catch(() => undefined);
  }, [threadId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <p className="text-sm text-gray-500">Loading thread...</p>
        <div className="bg-white border border-gray-200 rounded-xl p-6 mt-4 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-2/3 mb-4" />
          <div className="h-3 bg-gray-100 rounded w-full mb-2" />
          <div className="h-3 bg-gray-100 rounded w-5/6" />
        </div>
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-red-600">{error || "Thread not found."}</p>
        <Link to="/" className="text-blue-600 underline">
          Back to forum
        </Link>
      </div>
    );
  }

  const isThreadAuthor = user?.id === thread.authorId;
  const isModerator = user?.role === "MODERATOR" || user?.role === "ADMIN";

  function voteHandler(targetType: VoteTargetType, targetId: number, authorId: number) {
    if (!token) return undefined;
    if (user && user.id === authorId) return undefined;
    return (value: 1 | -1) => {
      setActionError("");
      castVote(targetType, targetId, value)
        .then((result) => {
          if (targetType === "THREAD") {
            setThread((t) => (t ? { ...t, voteScore: result.voteScore, userVote: result.userVote } : t));
          } else {
            setReplies((rs) =>
              rs.map((r) => (r.id === targetId ? { ...r, voteScore: result.voteScore, userVote: result.userVote } : r))
            );
          }
        })
        .catch((err) => setActionError(getErrorMessage(err, "Your vote could not be saved.")));
    };
  }

  function voteDisabledReason(authorId: number) {
    if (!token) return "Log in to vote";
    if (user?.id === authorId) return "You can't vote on your own post";
    return undefined;
  }

  function handleAccept(replyId: number) {
    setActionError("");
    acceptReply(threadId, replyId)
      .then(refreshReplies)
      .catch((err) => setActionError(getErrorMessage(err, "Could not update the accepted answer.")));
  }

  function handleDeleteThread() {
    if (!window.confirm("Delete this question and all its replies? This cannot be undone.")) return;
    deleteThread(threadId)
      .then(() => navigate("/"))
      .catch((err) => setActionError(getErrorMessage(err, "Could not delete the thread.")));
  }

  function handleDeleteReply(replyId: number) {
    if (!window.confirm("Delete this reply?")) return;
    deleteReply(replyId)
      .then(refreshReplies)
      .catch((err) => setActionError(getErrorMessage(err, "Could not delete the reply.")));
  }

  function handleCopyLink() {
    navigator.clipboard
      ?.writeText(window.location.href)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => undefined);
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600">
        <ArrowLeft size={16} /> Back to forum
      </Link>

      {/* Question */}
      <article className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 mt-4 flex gap-4">
        <VoteButtons
          voteScore={thread.voteScore}
          userVote={thread.userVote}
          onVote={voteHandler("THREAD", thread.id, thread.authorId)}
          disabledReason={voteDisabledReason(thread.authorId)}
        />

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">{thread.title}</h1>
            {thread.isResolved && (
              <span className="shrink-0 inline-flex items-center gap-1 text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                <CheckCircle2 size={12} /> Resolved
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-2 pb-3 border-b border-gray-100">
            <span className="inline-flex items-center gap-1" title={formatDate(thread.createdAt)}>
              <Clock size={13} /> Asked {timeAgo(thread.createdAt)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye size={13} /> {pluralize(thread.viewCount, "view")}
            </span>
          </div>

          <RichText text={thread.body} className="mt-4" />

          <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
            <div className="flex items-center gap-2">
              {thread.courseTag && (
                <Link
                  to={`/?course=${encodeURIComponent(thread.courseTag)}`}
                  className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded hover:bg-blue-100"
                >
                  {thread.courseTag}
                </Link>
              )}
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 px-2 py-1"
              >
                {copied ? <Check size={13} /> : <Link2 size={13} />}
                {copied ? "Copied!" : "Share"}
              </button>
              {token && (
                <BookmarkButton
                  threadId={thread.id}
                  bookmarked={!!thread.bookmarked}
                  onChange={(bookmarked) => setThread((t) => (t ? { ...t, bookmarked } : t))}
                />
              )}
              {isThreadAuthor && (
                <Link
                  to={`/threads/${thread.id}/edit`}
                  className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-blue-700 px-2 py-1"
                >
                  <Pencil size={13} /> Edit
                </Link>
              )}
              {(isThreadAuthor || isModerator) && (
                <button
                  onClick={handleDeleteThread}
                  className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 px-2 py-1"
                >
                  <Trash2 size={13} /> Delete
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 bg-blue-50/60 rounded-lg px-3 py-2">
              <Avatar name={thread.authorName} id={thread.authorId} />
              <div className="text-xs leading-tight">
                <p className="text-gray-500">asked by</p>
                <p className="font-medium text-gray-900">{thread.authorName}</p>
              </div>
            </div>
          </div>
        </div>
      </article>

      {actionError && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2" role="alert">
          {actionError}
        </div>
      )}

      {/* Replies */}
      <h2 className="text-lg font-semibold mt-8 mb-3 text-gray-900">
        {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
      </h2>

      {replies.length === 0 && (
        <p className="text-sm text-gray-500 bg-white border border-dashed border-gray-300 rounded-xl p-6 text-center">
          No replies yet. Know the answer? Help a coursemate out!
        </p>
      )}

      <div className="space-y-3">
        {replies.map((reply) => (
          <ReplyItem
            key={reply.id}
            reply={reply}
            canAccept={isThreadAuthor}
            canEdit={user?.id === reply.authorId}
            canDelete={user?.id === reply.authorId || isModerator}
            onVote={voteHandler("REPLY", reply.id, reply.authorId)}
            voteDisabledReason={voteDisabledReason(reply.authorId)}
            onAccept={() => handleAccept(reply.id)}
            onDelete={() => handleDeleteReply(reply.id)}
            onUpdated={(updated) => setReplies((rs) => rs.map((r) => (r.id === updated.id ? { ...r, body: updated.body } : r)))}
          />
        ))}
      </div>

      <div className="mt-8">
        {token ? (
          <ReplyBox threadId={threadId} onReplyAdded={refreshReplies} />
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-5 text-center text-sm text-gray-600">
            <Link to="/login" state={{ from: `/threads/${threadId}` }} className="text-blue-600 font-medium hover:underline">
              Log in
            </Link>{" "}
            or{" "}
            <Link to="/register" className="text-blue-600 font-medium hover:underline">
              create an account
            </Link>{" "}
            to reply and vote.
          </div>
        )}
      </div>
    </div>
  );
}

interface ReplyItemProps {
  reply: ReplyResponse;
  canAccept: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onVote?: (value: 1 | -1) => void;
  voteDisabledReason?: string;
  onAccept: () => void;
  onDelete: () => void;
  onUpdated: (reply: ReplyResponse) => void;
}

function ReplyItem({
  reply,
  canAccept,
  canEdit,
  canDelete,
  onVote,
  voteDisabledReason,
  onAccept,
  onDelete,
  onUpdated,
}: ReplyItemProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(reply.body);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function save() {
    if (!draft.trim()) return;
    setSaving(true);
    setError("");
    updateReply(reply.id, { body: draft.trim() })
      .then((updated) => {
        onUpdated(updated);
        setEditing(false);
      })
      .catch((err) => setError(getErrorMessage(err, "Could not save your changes.")))
      .finally(() => setSaving(false));
  }

  return (
    <div
      className={`bg-white border rounded-xl p-4 flex gap-3 sm:gap-4 ${
        reply.isAccepted ? "border-emerald-400 ring-1 ring-emerald-400 bg-emerald-50/40" : "border-gray-200"
      }`}
    >
      <div className="flex flex-col items-center gap-2">
        <VoteButtons
          voteScore={reply.voteScore}
          userVote={reply.userVote}
          onVote={onVote}
          disabledReason={voteDisabledReason}
        />
        {canAccept ? (
          <button
            onClick={onAccept}
            title={reply.isAccepted ? "Unmark as accepted answer" : "Mark as the accepted answer"}
            aria-label={reply.isAccepted ? "Unmark accepted answer" : "Accept this answer"}
            className={`p-1 rounded-full transition-colors ${
              reply.isAccepted ? "text-emerald-600" : "text-gray-300 hover:text-emerald-600"
            }`}
          >
            <CheckCircle2 size={22} />
          </button>
        ) : (
          reply.isAccepted && <CheckCircle2 size={22} className="text-emerald-600" aria-hidden="true" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        {reply.isAccepted && (
          <span className="text-xs font-semibold text-emerald-700">✓ Accepted Answer</span>
        )}

        {editing ? (
          <div className="mt-1">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={4}
              aria-label="Edit reply"
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
            <div className="flex gap-2 mt-2">
              <button
                onClick={save}
                disabled={saving || !draft.trim()}
                className="bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => {
                  setDraft(reply.body);
                  setEditing(false);
                }}
                className="text-xs text-gray-600 px-3 py-1.5 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <RichText text={reply.body} className="text-sm mt-1" />
        )}

        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-3">
          <span className="inline-flex items-center gap-1.5">
            <Avatar name={reply.authorName} id={reply.authorId} size="sm" />
            <span className="font-medium text-gray-700">{reply.authorName}</span>
            <span title={formatDate(reply.createdAt)}>· {timeAgo(reply.createdAt)}</span>
          </span>
          {!editing && canEdit && (
            <button onClick={() => setEditing(true)} className="inline-flex items-center gap-1 hover:text-blue-700">
              <Pencil size={12} /> Edit
            </button>
          )}
          {!editing && canDelete && (
            <button onClick={onDelete} className="inline-flex items-center gap-1 hover:text-red-600">
              <Trash2 size={12} /> Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ThreadDetail;
