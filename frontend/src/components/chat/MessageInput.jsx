import { useState } from "react";

const MessageInput = ({ onSend, disabled }) => {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="mt-auto flex items-center gap-2 border-t border-white/60 bg-white/90 px-4 py-3 sm:bg-transparent sm:px-6 sm:py-4">
      <input
        className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white/90 px-4 py-2 text-sm sm:py-3"
        placeholder={disabled ? "Select a chat to start messaging..." : "Type your message..."}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      <button
        onClick={handleSend}
        disabled={disabled}
        className="shrink-0 rounded-2xl bg-ink px-3 py-2 text-xs text-white disabled:opacity-50 sm:px-4 sm:py-3 sm:text-sm"
      >
        Send
      </button>
    </div>
  );
};

export default MessageInput;
