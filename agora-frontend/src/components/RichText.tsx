import type { ReactNode } from "react";

/**
 * Renders user-written text safely (no HTML injection) with light formatting
 * that is handy for a CS forum:
 *   ```code blocks```  and  `inline code`
 * Line breaks are preserved.
 */
function RichText({ text, className = "" }: { text: string; className?: string }) {
  const blocks = text.split(/```/);

  return (
    <div className={`text-gray-800 leading-relaxed break-words ${className}`}>
      {blocks.map((block, index) => {
        // Odd segments are inside ``` fences
        if (index % 2 === 1) {
          // Drop an optional language name on the first line (```java)
          const code = block.replace(/^[a-zA-Z0-9+#-]*\n/, "");
          return (
            <pre
              key={index}
              className="my-2 bg-gray-900 text-gray-100 text-sm rounded-lg p-3 overflow-x-auto"
            >
              <code>{code.replace(/\n$/, "")}</code>
            </pre>
          );
        }
        if (!block) return null;
        return (
          <p key={index} className="whitespace-pre-wrap">
            {renderInlineCode(block)}
          </p>
        );
      })}
    </div>
  );
}

function renderInlineCode(text: string): ReactNode[] {
  return text.split(/(`[^`\n]+`)/).map((part, i) =>
    part.startsWith("`") && part.endsWith("`") && part.length > 2 ? (
      <code key={i} className="bg-gray-100 text-pink-700 px-1 py-0.5 rounded text-[0.9em]">
        {part.slice(1, -1)}
      </code>
    ) : (
      part
    )
  );
}

export default RichText;
