import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";

export default function ChatTab({
  pdfFileName,
  messages,
  inputValue,
  onInputChange,
  onSend,
  isLoading,
  disabled,
  onClearChat,
}) {
  return (
    <div className="h-full flex flex-col">

      {/* Header */}
      <div className="h-14 border-b border-[#2d2d2d] px-5 flex items-center justify-between">

        <div>
          <p className="text-sm font-semibold">
            Chat with PDF
          </p>

          <p className="text-xs text-zinc-500 truncate max-w-[300px]">
            {pdfFileName}
          </p>
        </div>

        <button
          onClick={onClearChat}
          className="text-xs text-zinc-500 hover:text-white"
        >
          Clear Chat
        </button>

      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5">

        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">

            <div className="text-center">

              <h2 className="text-xl font-semibold">
                Ask a question
              </h2>

              <p className="text-sm text-zinc-500 mt-2">
                Ask anything about your uploaded PDF.
              </p>

            </div>

          </div>
        ) : (
          <div className="space-y-4">

            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                role={message.role}
                content={message.content}
                isError={message.isError}
              />
            ))}

            {isLoading && (
              <div className="text-sm text-zinc-500">
                AI is thinking...
              </div>
            )}

          </div>
        )}

      </div>

      {/* Input */}
      <ChatInput
        value={inputValue}
        onChange={onInputChange}
        onSend={onSend}
        disabled={disabled}
        isLoading={isLoading}
      />

    </div>
  );
}