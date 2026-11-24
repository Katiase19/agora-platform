import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { createThread, getThreadById, updateThread } from "../api/forumApi";
import { getErrorMessage } from "../api/config";
import RichText from "../components/RichText";
import { normalizeCourseCode } from "../utils/format";

const DRAFT_KEY = "agora:thread-draft";
const TITLE_MAX = 200;
const BODY_MAX = 10000;

interface Draft {
  title: string;
  body: string;
  courseTag: string;
}

function loadDraft(): Draft {
  try {
    const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "null");
    if (saved && typeof saved === "object") {
      return { title: saved.title ?? "", body: saved.body ?? "", courseTag: saved.courseTag ?? "" };
    }
  } catch {
    // ignore corrupt drafts
  }
  return { title: "", body: "", courseTag: "" };
}

/** Used both for asking a new question (/create) and editing one (/threads/:id/edit). */
function CreateThread() {
  const { id } = useParams();
  const editId = id ? Number(id) : null;
  const isEditing = editId !== null;

  const [initial] = useState<Draft>(() => (isEditing ? { title: "", body: "", courseTag: "" } : loadDraft()));
  const [title, setTitle] = useState(initial.title);
  const [body, setBody] = useState(initial.body);
  const [courseTag, setCourseTag] = useState(initial.courseTag);
  const [preview, setPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingThread, setLoadingThread] = useState(isEditing);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Edit mode: load the existing question
  useEffect(() => {
    if (editId === null) return;
    getThreadById(editId)
      .then((thread) => {
        setTitle(thread.title);
        setBody(thread.body);
        setCourseTag(thread.courseTag ?? "");
      })
      .catch((err) => setError(getErrorMessage(err, "Could not load this question.")))
      .finally(() => setLoadingThread(false));
  }, [editId]);

  // Create mode: keep an autosaved draft so nothing is lost on refresh
  useEffect(() => {
    if (isEditing) return;
    if (title || body || courseTag) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, body, courseTag }));
    } else {
      localStorage.removeItem(DRAFT_KEY);
    }
  }, [isEditing, title, body, courseTag]);

  function handleSubmit(event?: FormEvent) {
    event?.preventDefault();
    if (title.trim() === "" || body.trim() === "") {
      setError("Please add a title and some details for your question.");
      return;
    }
    if (submitting) return;
    setError("");
    setSubmitting(true);

    const payload = {
      title: title.trim(),
      body: body.trim(),
      courseTag: normalizeCourseCode(courseTag),
    };

    const request = editId !== null ? updateThread(editId, payload) : createThread(payload);
    request
      .then((thread) => {
        if (!isEditing) localStorage.removeItem(DRAFT_KEY);
        navigate(thread?.id ? `/threads/${thread.id}` : "/");
      })
      .catch((err) => {
        setError(
          getErrorMessage(
            err,
            isEditing ? "Failed to save your changes." : "Failed to create thread. Make sure you're logged in."
          )
        );
      })
      .finally(() => setSubmitting(false));
  }

  if (loadingThread) {
    return <div className="max-w-3xl mx-auto p-6 text-sm text-gray-500">Loading question...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <Link
        to={isEditing ? `/threads/${editId}` : "/"}
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600"
      >
        <ArrowLeft size={16} /> {isEditing ? "Back to question" : "Back to forum"}
      </Link>

      <h1 className="text-2xl font-bold mt-3 mb-1 text-gray-900">
        {isEditing ? "Edit your question" : "Ask a Question"}
      </h1>
      {!isEditing && (
        <p className="text-sm text-gray-500 mb-5">
          Be specific: say what you tried and where you got stuck. Good questions get faster answers.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 bg-white border border-gray-200 rounded-xl p-4 sm:p-6 mt-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            maxLength={TITLE_MAX}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. How does recursion work in Java?"
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">
            {title.length}/{TITLE_MAX}
          </p>
        </div>

        <div>
          <label htmlFor="courseTag" className="block text-sm font-medium mb-1">Course Tag</label>
          <input
            id="courseTag"
            type="text"
            value={courseTag}
            maxLength={20}
            onChange={(e) => setCourseTag(e.target.value)}
            placeholder="e.g. CS201"
            className="w-full sm:w-60 border border-gray-300 rounded-lg p-2.5 text-sm uppercase placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <p className="text-xs text-gray-400 mt-1">Optional. Helps coursemates find your question.</p>
        </div>

        <div>
          <div className="flex justify-between items-end mb-1">
            <label htmlFor="body" className="block text-sm font-medium">Details</label>
            <div className="flex text-xs bg-gray-100 rounded-md p-0.5">
              <button
                type="button"
                onClick={() => setPreview(false)}
                className={`px-2 py-1 rounded ${!preview ? "bg-white shadow-sm" : "text-gray-500"}`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setPreview(true)}
                className={`px-2 py-1 rounded ${preview ? "bg-white shadow-sm" : "text-gray-500"}`}
              >
                Preview
              </button>
            </div>
          </div>
          {preview ? (
            <div className="min-h-40 border border-gray-200 rounded-lg p-3 bg-gray-50">
              {body.trim() ? <RichText text={body} className="text-sm" /> : <p className="text-sm text-gray-400">Nothing to preview yet.</p>}
            </div>
          ) : (
            <textarea
              id="body"
              value={body}
              maxLength={BODY_MAX}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Describe your question in detail..."
              rows={9}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          )}
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>
              Wrap code in <code className="bg-gray-100 px-1 rounded">```</code> for a code block, or{" "}
              <code className="bg-gray-100 px-1 rounded">`backticks`</code> inline.
            </span>
            <span>
              {body.length}/{BODY_MAX}
            </span>
          </div>
        </div>

        {error && <p className="text-red-600 text-sm" role="alert">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {submitting ? (isEditing ? "Saving..." : "Posting...") : isEditing ? "Save Changes" : "Post Question"}
          </button>
          {!isEditing && (title || body || courseTag) && (
            <button
              type="button"
              onClick={() => {
                setTitle("");
                setBody("");
                setCourseTag("");
              }}
              className="text-sm text-gray-500 hover:text-red-600"
            >
              Discard draft
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default CreateThread;
