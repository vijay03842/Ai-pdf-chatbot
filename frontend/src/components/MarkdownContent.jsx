import ReactMarkdown from "react-markdown";

export default function MarkdownContent({ content }) {
  return (
    <div className="prose prose-invert max-w-none text-sm">
      <ReactMarkdown>
        {content}
      </ReactMarkdown>
    </div>
  );
}