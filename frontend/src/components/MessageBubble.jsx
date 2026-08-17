import MarkdownContent from "./MarkdownContent";

export default function MessageBubble({
  role,
  content,
  isError,
}) {
  const isUser = role === "user";

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
          isUser
            ? "bg-[#2f2f2f]"
            : isError
            ? "bg-red-950/30 border border-red-900 text-red-300"
            : "bg-[#171717] border border-[#2d2d2d]"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">
            {content}
          </p>
        ) : (
          <MarkdownContent content={content} />
        )}
      </div>
    </div>
  );
}