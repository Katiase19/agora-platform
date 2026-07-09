import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createThread } from "../api/forumApi";

function CreateThread() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [courseTag, setCourseTag] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState("");

 function handleSubmit() {
  if (title.trim() === "" || body.trim() === "") return;

  createThread({ title, body, courseTag })
    .then(() => {
      navigate("/");
    })
    .catch(() => {
      setError("Failed to create thread. Make sure you're logged in.");
    });
}
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Ask a Question</h1>

      <div className="space-y-4">
        <div>
  <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
  <input
    id="title"
    type="text"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    placeholder="e.g. How does recursion work in Java?"
    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
  />
</div>

<div>
  <label htmlFor="courseTag" className="block text-sm font-medium mb-1">Course Tag</label>
  <input
    id="courseTag"
    type="text"
    value={courseTag}
    onChange={(e) => setCourseTag(e.target.value)}
    placeholder="e.g. CS201"
    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
  />
</div>

<div>
  <label htmlFor="body" className="block text-sm font-medium mb-1">Details</label>
  <textarea
    id="body"
    value={body}
    onChange={(e) => setBody(e.target.value)}
    placeholder="Describe your question in detail..."
    rows={6}
    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
  />
</div>
        
        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Post Question
        </button>
      </div>
    </div>
  );
}

export default CreateThread;