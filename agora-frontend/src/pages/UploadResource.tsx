import { useRef, useState, type DragEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, UploadCloud, FileText, X } from "lucide-react";
import type { ResourceType } from "../types/forum";
import { uploadResource } from "../api/resourceApi";
import { getErrorMessage } from "../api/config";
import { RESOURCE_TYPE_LABELS, normalizeCourseCode } from "../utils/format";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // matches spring.servlet.multipart.max-file-size
const ACCEPTED = ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md,.zip,.png,.jpg,.jpeg";

const inputClass =
  "w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function UploadResource() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [resourceType, setResourceType] = useState<ResourceType>("LECTURE_NOTES");
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  function pickFile(selected: File | undefined | null) {
    if (!selected) return;
    if (selected.size > MAX_FILE_SIZE) {
      setError("That file is larger than 50MB.");
      return;
    }
    setError("");
    setFile(selected);
    // Pre-fill the title from the file name
    if (!title) setTitle(selected.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "));
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    pickFile(event.dataTransfer.files?.[0]);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || !courseCode.trim() || !file) {
      setError("Please add a title, a course code and a file.");
      return;
    }
    setError("");
    setProgress(0);

    uploadResource(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        resourceType,
        courseCode: normalizeCourseCode(courseCode),
        courseName: courseName.trim() || undefined,
        year: year ? Number(year) : undefined,
        semester: semester || undefined,
        file,
      },
      setProgress
    )
      .then(() => navigate("/resources"))
      .catch((err) => {
        setError(getErrorMessage(err, "Upload failed. Please try again."));
        setProgress(null);
      });
  }

  const uploading = progress !== null;
  const currentYear = new Date().getFullYear();

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <Link to="/resources" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600">
        <ArrowLeft size={16} /> Back to resources
      </Link>
      <h1 className="text-2xl font-bold mt-3 text-gray-900">Share a resource</h1>
      <p className="text-sm text-gray-500 mb-5">Upload notes, past questions or other study materials for your coursemates.</p>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
        {/* File picker */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
            dragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
        >
          {file ? (
            <div className="flex items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="text-blue-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
                </div>
              </div>
              <button type="button" onClick={() => setFile(null)} aria-label="Remove file" className="text-gray-400 hover:text-red-600">
                <X size={18} />
              </button>
            </div>
          ) : (
            <>
              <UploadCloud className="mx-auto text-gray-400" size={36} />
              <p className="text-sm text-gray-700 mt-2">
                Drag and drop a file here, or{" "}
                <button type="button" onClick={() => fileInput.current?.click()} className="text-blue-600 font-medium hover:underline">
                  browse
                </button>
              </p>
              <p className="text-xs text-gray-400 mt-1">PDF, Word, PowerPoint, Excel, images or ZIP · max 50MB</p>
            </>
          )}
          <input
            ref={fileInput}
            type="file"
            accept={ACCEPTED}
            className="hidden"
            aria-label="File"
            onChange={(e) => pickFile(e.target.files?.[0])}
          />
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">Title <span className="text-red-500">*</span></label>
          <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200}
            placeholder="e.g. Data Structures – Week 3 lecture slides" className={inputClass} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="resourceType" className="block text-sm font-medium mb-1">Type <span className="text-red-500">*</span></label>
            <select id="resourceType" value={resourceType} onChange={(e) => setResourceType(e.target.value as ResourceType)} className={inputClass}>
              {(Object.keys(RESOURCE_TYPE_LABELS) as ResourceType[]).map((t) => (
                <option key={t} value={t}>{RESOURCE_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="courseCode" className="block text-sm font-medium mb-1">Course code <span className="text-red-500">*</span></label>
            <input id="courseCode" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} maxLength={20}
              placeholder="e.g. CS201" className={`${inputClass} uppercase placeholder:normal-case`} />
          </div>
          <div>
            <label htmlFor="courseName" className="block text-sm font-medium mb-1">Course name</label>
            <input id="courseName" value={courseName} onChange={(e) => setCourseName(e.target.value)}
              placeholder="e.g. Data Structures" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="year" className="block text-sm font-medium mb-1">Year</label>
              <select id="year" value={year} onChange={(e) => setYear(e.target.value)} className={inputClass}>
                <option value="">—</option>
                {Array.from({ length: 8 }, (_, i) => currentYear - i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="semester" className="block text-sm font-medium mb-1">Semester</label>
              <select id="semester" value={semester} onChange={(e) => setSemester(e.target.value)} className={inputClass}>
                <option value="">—</option>
                <option value="Semester 1">Semester 1</option>
                <option value="Semester 2">Semester 2</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
            placeholder="What does this cover? Any tips for using it?" className={inputClass} />
        </div>

        {error && <p className="text-red-600 text-sm" role="alert">{error}</p>}

        {uploading && (
          <div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-gray-500 mt-1">Uploading... {progress}%</p>
          </div>
        )}

        <button
          type="submit"
          disabled={uploading}
          className="bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
}

export default UploadResource;
