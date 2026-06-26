import { dummyThreads } from "../api/dummyData";

function ThreadList() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Discussion Forum</h1>

      <div className="space-y-4">
        {dummyThreads.map((thread) => (
          <div
            key={thread.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
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
          </div>
        ))}
      </div>
    </div>
  );
}

export default ThreadList;