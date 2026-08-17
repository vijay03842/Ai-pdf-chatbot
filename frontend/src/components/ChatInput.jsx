export default function ChatInput({
  value,
  onChange,
  onSend,
  disabled,
  isLoading,
}) {
  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  };

  return (
    <div className="border-t border-[#2d2d2d] p-4">

      <div className="max-w-4xl mx-auto flex gap-2">

        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isLoading}
          rows={1}
          placeholder="Ask something about your PDF..."
          className="flex-1 resize-none rounded-xl bg-[#171717] border border-[#3d3d3d] px-4 py-3 text-sm outline-none focus:border-[#666]"
        />

        <button
          onClick={onSend}
          disabled={
            disabled ||
            isLoading ||
            !value.trim()
          }
          className="px-5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-zinc-200 disabled:opacity-40"
        >
          {isLoading ? "..." : "Send"}
        </button>

      </div>

      <p className="text-[11px] text-zinc-600 text-center mt-2">
        Ask questions based on your uploaded PDF.
      </p>

    </div>
  );
}