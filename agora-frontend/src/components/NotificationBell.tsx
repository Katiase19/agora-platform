import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, MessageSquare, CheckCircle2, ThumbsUp, Bookmark, CheckCheck } from "lucide-react";
import type { NotificationResponse, NotificationType } from "../types/forum";
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "../api/notificationApi";
import { timeAgo } from "../utils/format";

/** How often to check for new notifications while the tab is open. */
const POLL_INTERVAL_MS = 30_000;

const ICONS: Record<NotificationType, { icon: typeof Bell; className: string }> = {
  NEW_REPLY: { icon: MessageSquare, className: "text-blue-600 bg-blue-50" },
  BOOKMARKED_THREAD_REPLY: { icon: Bookmark, className: "text-amber-600 bg-amber-50" },
  ANSWER_ACCEPTED: { icon: CheckCircle2, className: "text-emerald-600 bg-emerald-50" },
  UPVOTE: { icon: ThumbsUp, className: "text-violet-600 bg-violet-50" },
};

function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const refreshCount = useCallback(() => {
    getUnreadCount()
      .then(setUnread)
      .catch(() => {});
  }, []);

  // Poll for the unread count, and check again whenever the user comes back to the tab
  useEffect(() => {
    refreshCount();
    const timer = window.setInterval(refreshCount, POLL_INTERVAL_MS);
    window.addEventListener("focus", refreshCount);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refreshCount);
    };
  }, [refreshCount]);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (!next) return;
    setLoading(true);
    try {
      const list = await getNotifications();
      setItems(list);
      setUnread(list.filter((n) => !n.isRead).length);
    } catch {
      // keep whatever was shown before
    } finally {
      setLoading(false);
    }
  }

  function handleClick(n: NotificationResponse) {
    if (!n.isRead) {
      setItems((list) => list.map((i) => (i.id === n.id ? { ...i, isRead: true } : i)));
      setUnread((c) => Math.max(0, c - 1));
      markNotificationRead(n.id).catch(() => {});
    }
    setOpen(false);
    if (n.threadId) navigate(`/threads/${n.threadId}`);
  }

  function handleMarkAll() {
    setItems((list) => list.map((i) => ({ ...i, isRead: true })));
    setUnread(0);
    markAllNotificationsRead().catch(refreshCount);
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={toggleOpen}
        aria-label={unread > 0 ? `Notifications (${unread} unread)` : "Notifications"}
        aria-expanded={open}
        className="relative p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-30"
          role="dialog"
          aria-label="Notifications"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="font-semibold text-gray-900 text-sm">Notifications</p>
            {items.some((n) => !n.isRead) && (
              <button
                onClick={handleMarkAll}
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
              >
                <CheckCheck size={14} /> Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && items.length === 0 && <p className="p-4 text-sm text-gray-500">Loading...</p>}
            {!loading && items.length === 0 && (
              <div className="p-6 text-center">
                <Bell className="mx-auto text-gray-300" size={28} />
                <p className="text-sm text-gray-600 mt-2">No notifications yet</p>
                <p className="text-xs text-gray-500 mt-1">
                  You'll hear about replies, likes and accepted answers here.
                </p>
              </div>
            )}
            <ul>
              {items.map((n) => {
                const { icon: Icon, className } = ICONS[n.type] ?? ICONS.NEW_REPLY;
                return (
                  <li key={n.id}>
                    <button
                      onClick={() => handleClick(n)}
                      className={`w-full text-left flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                        n.isRead ? "" : "bg-blue-50/60"
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${className}`}>
                        <Icon size={15} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm text-gray-800 leading-snug">
                          {n.actorName && <span className="font-semibold">{n.actorName} </span>}
                          {n.message}
                        </span>
                        <span className="block text-xs text-gray-500 mt-0.5">{timeAgo(n.createdAt)}</span>
                      </span>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0" aria-label="Unread" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
