import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Award, GraduationCap, Mail, CalendarDays, CheckCircle2, MessageSquare, Download } from "lucide-react";
import type { ResourceResponse, ThreadResponse } from "../types/forum";
import { useAuth } from "../api/AuthContext";
import { getThreadsByUser } from "../api/forumApi";
import { getResourcesByUser } from "../api/resourceApi";
import Avatar from "../components/Avatar";
import { RESOURCE_TYPE_LABELS, formatDate, pluralize, timeAgo } from "../utils/format";

type Tab = "questions" | "uploads";

function Profile() {
  const { user, refreshUser } = useAuth();
  const [threads, setThreads] = useState<ThreadResponse[]>([]);
  const [uploads, setUploads] = useState<ResourceResponse[]>([]);
  const [tab, setTab] = useState<Tab>("questions");

  // Get a fresh reputation score every time the profile is opened
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const userId = user?.id;
  useEffect(() => {
    if (!userId) return;
    getThreadsByUser(userId).then(setThreads).catch(() => setThreads([]));
    getResourcesByUser(userId).then(setUploads).catch(() => setUploads([]));
  }, [userId]);

  if (!user) {
    return <div className="max-w-4xl mx-auto p-6 text-sm text-gray-500">Loading profile...</div>;
  }

  const fullName = `${user.firstName} ${user.lastName}`;
  const solved = threads.filter((t) => t.isResolved).length;
  const totalDownloads = uploads.reduce((sum, r) => sum + r.downloadCount, 0);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row gap-5 sm:items-center">
        <Avatar name={fullName} id={user.id} size="lg" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
            {user.role !== "STUDENT" && (
              <span className="text-xs font-medium bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                {user.role.toLowerCase()}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500 mt-2">
            <span className="inline-flex items-center gap-1.5"><Mail size={14} /> {user.email}</span>
            {(user.courseOfStudy || user.academicYear) && (
              <span className="inline-flex items-center gap-1.5">
                <GraduationCap size={14} />
                {[user.courseOfStudy, user.academicYear ? `Year ${user.academicYear}` : null].filter(Boolean).join(" · ")}
              </span>
            )}
            {user.createdAt && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={14} /> Joined {formatDate(user.createdAt)}
              </span>
            )}
          </div>
        </div>
        <div className="text-center bg-amber-50 border border-amber-200 rounded-xl px-5 py-3">
          <Award className="mx-auto text-amber-500" size={22} />
          <p className="text-2xl font-bold text-amber-700">{user.reputationScore}</p>
          <p className="text-xs text-amber-700">reputation</p>
        </div>
      </section>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <StatCard icon={<MessageSquare size={16} />} value={threads.length} label="Questions asked" />
        <StatCard icon={<CheckCircle2 size={16} />} value={solved} label="Questions solved" />
        <StatCard icon={<Download size={16} />} value={totalDownloads} label="Downloads of your uploads" />
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Earn reputation when others upvote your posts (+5) and when your answer is accepted (+15).
      </p>

      <div className="flex gap-1 border-b border-gray-200 mt-6" role="tablist">
        <TabButton active={tab === "questions"} onClick={() => setTab("questions")}>
          Questions ({threads.length})
        </TabButton>
        <TabButton active={tab === "uploads"} onClick={() => setTab("uploads")}>
          Uploads ({uploads.length})
        </TabButton>
      </div>

      <div className="mt-4">
        {tab === "questions" &&
          (threads.length === 0 ? (
            <Empty text="You haven't asked any questions yet." link="/create" linkText="Ask your first question" />
          ) : (
            <ul className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
              {threads.map((t) => (
                <li key={t.id}>
                  <Link to={`/threads/${t.id}`} className="flex items-center justify-between gap-3 p-4 hover:bg-gray-50">
                    <div className="min-w-0">
                      <p className="font-medium text-blue-700 truncate">{t.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {t.courseTag && <span className="mr-2">{t.courseTag}</span>}
                        {pluralize(t.voteScore, "vote")} · {pluralize(t.replyCount, "reply", "replies")} · {timeAgo(t.createdAt)}
                      </p>
                    </div>
                    {t.isResolved && <CheckCircle2 size={18} className="text-emerald-600 shrink-0" aria-label="Resolved" />}
                  </Link>
                </li>
              ))}
            </ul>
          ))}

        {tab === "uploads" &&
          (uploads.length === 0 ? (
            <Empty text="You haven't shared any resources yet." link="/resources/upload" linkText="Upload a resource" />
          ) : (
            <ul className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
              {uploads.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{r.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {r.courseCode} · {RESOURCE_TYPE_LABELS[r.resourceType] ?? r.resourceType} · {timeAgo(r.createdAt)}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 inline-flex items-center gap-1 shrink-0">
                    <Download size={13} /> {r.downloadCount}
                  </span>
                </li>
              ))}
            </ul>
          ))}
      </div>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: ReactNode; value: number; label: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4">
      <div className="text-blue-600">{icon}</div>
      <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
        active ? "border-blue-600 text-blue-700" : "border-transparent text-gray-500 hover:text-gray-800"
      }`}
    >
      {children}
    </button>
  );
}

function Empty({ text, link, linkText }: { text: string; link: string; linkText: string }) {
  return (
    <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center">
      <p className="text-sm text-gray-600">{text}</p>
      <Link to={link} className="inline-block mt-3 text-sm font-medium text-blue-600 hover:underline">
        {linkText}
      </Link>
    </div>
  );
}

export default Profile;
