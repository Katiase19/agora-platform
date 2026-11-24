import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Upload, Download, Eye, FileText, Trash2, BookOpen } from "lucide-react";
import type { ResourceResponse, ResourceType } from "../types/forum";
import { getResources, registerDownload, deleteResource } from "../api/resourceApi";
import { fileUrl, getErrorMessage } from "../api/config";
import { useAuth } from "../api/AuthContext";
import { RESOURCE_TYPE_LABELS, pluralize, timeAgo } from "../utils/format";

type SortKey = "newest" | "downloads" | "views";

const FILE_COLORS: Record<string, string> = {
  PDF: "bg-red-100 text-red-700",
  DOC: "bg-blue-100 text-blue-700",
  DOCX: "bg-blue-100 text-blue-700",
  PPT: "bg-orange-100 text-orange-700",
  PPTX: "bg-orange-100 text-orange-700",
  XLS: "bg-emerald-100 text-emerald-700",
  XLSX: "bg-emerald-100 text-emerald-700",
  ZIP: "bg-violet-100 text-violet-700",
};

function Resources() {
  const [resources, setResources] = useState<ResourceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const { token, user } = useAuth();

  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const type = (params.get("type") as ResourceType | null) ?? "";
  const course = params.get("course") ?? "";
  const sort = (params.get("sort") as SortKey) || "newest";

  function updateParam(key: string, value: string, defaultValue = "") {
    const next = new URLSearchParams(params);
    if (value && value !== defaultValue) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  }

  useEffect(() => {
    getResources()
      .then(setResources)
      .catch((err) => setError(getErrorMessage(err, "Failed to load resources. Is the backend running?")))
      .finally(() => setLoading(false));
  }, []);

  const courses = useMemo(
    () => [...new Set(resources.map((r) => r.courseCode))].sort(),
    [resources]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = resources.filter((r) => {
      if (type && r.resourceType !== type) return false;
      if (course && r.courseCode !== course) return false;
      if (!q) return true;
      return [r.title, r.description ?? "", r.courseCode, r.courseName ?? "", r.uploaderName].some((f) =>
        f.toLowerCase().includes(q)
      );
    });
    const byDate = (a: ResourceResponse, b: ResourceResponse) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sort === "downloads") return [...list].sort((a, b) => b.downloadCount - a.downloadCount || byDate(a, b));
    if (sort === "views") return [...list].sort((a, b) => b.viewCount - a.viewCount || byDate(a, b));
    return [...list].sort(byDate);
  }, [resources, query, type, course, sort]);

  function handleDownload(resource: ResourceResponse) {
    setActionError("");
    // Open the tab synchronously so pop-up blockers allow it, then point it at the file
    const tab = window.open("", "_blank");
    registerDownload(resource.id)
      .then((path) => {
        const url = fileUrl(path || resource.fileUrl);
        if (tab) tab.location.href = url;
        else window.location.href = url;
        setResources((list) =>
          list.map((r) => (r.id === resource.id ? { ...r, downloadCount: r.downloadCount + 1 } : r))
        );
      })
      .catch((err) => {
        tab?.close();
        setActionError(getErrorMessage(err, "Download failed."));
      });
  }

  function handleDelete(resource: ResourceResponse) {
    if (!window.confirm(`Delete "${resource.title}"? This cannot be undone.`)) return;
    deleteResource(resource.id)
      .then(() => setResources((list) => list.filter((r) => r.id !== resource.id)))
      .catch((err) => setActionError(getErrorMessage(err, "Could not delete the resource.")));
  }

  const isModerator = user?.role === "MODERATOR" || user?.role === "ADMIN";

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="flex flex-wrap justify-between items-end gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Study Resources</h1>
          <p className="text-sm text-gray-500 mt-1">
            Lecture notes, past questions and study materials shared by students.
          </p>
        </div>
        {token ? (
          <Link
            to="/resources/upload"
            className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Upload size={16} /> Upload resource
          </Link>
        ) : (
          <Link to="/login" state={{ from: "/resources/upload" }} className="text-sm text-blue-600 hover:underline">
            Log in to share a resource
          </Link>
        )}
      </div>

      {/* Search & filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => updateParam("q", e.target.value)}
            placeholder="Search by title, course or uploader..."
            aria-label="Search resources"
            className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <select
          value={course}
          onChange={(e) => updateParam("course", e.target.value)}
          aria-label="Filter by course"
          className="bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">All courses</option>
          {courses.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => updateParam("sort", e.target.value, "newest")}
          aria-label="Sort resources"
          className="bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="newest">Newest</option>
          <option value="downloads">Most downloaded</option>
          <option value="views">Most viewed</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2 mb-5" role="group" aria-label="Filter by type">
        <TypeChip label="All types" active={!type} onClick={() => updateParam("type", "")} />
        {(Object.keys(RESOURCE_TYPE_LABELS) as ResourceType[]).map((t) => (
          <TypeChip
            key={t}
            label={RESOURCE_TYPE_LABELS[t]}
            active={type === t}
            onClick={() => updateParam("type", type === t ? "" : t)}
          />
        ))}
      </div>

      {actionError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2" role="alert">
          {actionError}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading resources...</p>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-5">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center">
          <BookOpen className="mx-auto text-gray-300" size={40} />
          <p className="mt-3 font-medium text-gray-700">
            {resources.length === 0 ? "No resources shared yet" : "No resources match your filters"}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {resources.length === 0 ? "Help your coursemates by uploading your notes." : "Try a different search."}
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-500 mb-3">{pluralize(filtered.length, "resource")}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((r) => (
              <article key={r.id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col hover:shadow-sm hover:border-blue-200 transition-all">
                <div className="flex items-start gap-3">
                  <span
                    className={`shrink-0 w-11 h-11 rounded-lg flex flex-col items-center justify-center text-[10px] font-bold ${
                      FILE_COLORS[r.fileType] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <FileText size={16} />
                    {r.fileType || "FILE"}
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-gray-900 leading-snug line-clamp-2">{r.title}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">{RESOURCE_TYPE_LABELS[r.resourceType] ?? r.resourceType}</p>
                  </div>
                </div>

                {r.description && <p className="text-sm text-gray-600 mt-3 line-clamp-3">{r.description}</p>}

                <div className="flex flex-wrap gap-1.5 mt-3 text-xs">
                  <button
                    onClick={() => updateParam("course", r.courseCode)}
                    className="bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded hover:bg-blue-100"
                  >
                    {r.courseCode}
                  </button>
                  {r.courseName && <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{r.courseName}</span>}
                  {(r.year || r.semester) && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {[r.year, r.semester].filter(Boolean).join(" · ")}
                    </span>
                  )}
                </div>

                <div className="mt-auto pt-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span className="truncate">
                      by {r.uploaderName} · {timeAgo(r.createdAt)}
                    </span>
                    <span className="flex items-center gap-2 shrink-0">
                      <span className="inline-flex items-center gap-0.5" title="Downloads">
                        <Download size={12} /> {r.downloadCount}
                      </span>
                      <span className="inline-flex items-center gap-0.5" title="Views">
                        <Eye size={12} /> {r.viewCount}
                      </span>
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownload(r)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 bg-blue-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-blue-700"
                    >
                      <Download size={15} /> Download
                    </button>
                    {(user?.id === r.uploaderId || isModerator) && (
                      <button
                        onClick={() => handleDelete(r)}
                        aria-label={`Delete ${r.title}`}
                        className="px-3 border border-gray-200 rounded-lg text-gray-500 hover:text-red-600 hover:border-red-200"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function TypeChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
        active ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-gray-200 text-gray-700 hover:border-blue-300"
      }`}
    >
      {label}
    </button>
  );
}

export default Resources;
