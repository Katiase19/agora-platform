import { useState } from "react";

function ReplyBox() {
  const [replyText, setReplyText] = useState("");

  function handleSubmit() {
    if (replyText.trim() === "") return;
    console.log("Submitting reply:", replyText);
    setReplyText("");
  }

  return (
    <div className="mt-6 border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold mb-2">Write a reply</h3>
      <textarea
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        placeholder="Share your answer or thoughts..."
        className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        rows={4}
      />
      <button
        onClick={handleSubmit}
        className="mt-2 bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
      >
        Post Reply
      </button>
    </div>
  );
}

export default ReplyBox;