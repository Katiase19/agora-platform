import { useState } from "react";
import { Bookmark } from "lucide-react";
import { addBookmark, removeBookmark } from "../api/bookmarkApi";

interface BookmarkButtonProps {
  threadId: number;
  bookmarked: boolean;
  onChange?: (bookmarked: boolean) => void;
  /** Show the "Save"/"Saved" text next to the icon. */
  showLabel?: boolean;
}

function BookmarkButton({ threadId, bookmarked, onChange, showLabel = true }: BookmarkButtonProps) {
  const [saving, setSaving] = useState(false);

  async function toggle() {
    if (saving) return;
    const next = !bookmarked;
    setSaving(true);
    onChange?.(next); // update right away, undo if the request fails
    try {
      if (next) await addBookmark(threadId);
      else await removeBookmark(threadId);
    } catch {
      onChange?.(!next);
    } finally {
      setSaving(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={saving}
      aria-pressed={bookmarked}
      aria-label={bookmarked ? "Remove bookmark" : "Bookmark this question"}
      title={bookmarked ? "Remove from saved" : "Save to read later"}
      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
        bookmarked ? "text-amber-600 hover:text-amber-700" : "text-gray-500 hover:text-gray-800"
      }`}
    >
      <Bookmark size={13} fill={bookmarked ? "currentColor" : "none"} />
      {showLabel && (bookmarked ? "Saved" : "Save")}
    </button>
  );
}

export default BookmarkButton;
