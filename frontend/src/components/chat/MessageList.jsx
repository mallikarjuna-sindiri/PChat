import { useEffect, useRef } from "react";

const AVATAR_COLORS = [
  "from-sky-400 to-blue-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-pink-500",
  "from-violet-400 to-indigo-500",
  "from-lime-400 to-green-500",
  "from-cyan-400 to-sky-500",
  "from-fuchsia-400 to-purple-500"
];

const pickAvatarColor = (seed) => {
  if (!seed) return AVATAR_COLORS[0];
  const num = Number(String(seed).replace(/\D/g, "")) || 0;
  return AVATAR_COLORS[num % AVATAR_COLORS.length];
};

const MessageList = ({ messages, currentUserId }) => {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);
  if (!messages.length) {
    return (
      <div className="flex-1 min-h-0 px-6 py-10 text-center text-sm text-slate-400">
        No messages yet. Say hello!
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 space-y-4 overflow-y-auto px-6 py-6">
      {messages.map((message) => (
        <div
          key={message.id}
          className={
            message.sender_id === currentUserId || message.author === "me"
              ? "flex items-end justify-end gap-2"
              : "flex items-end justify-start gap-2"
          }
        >
          {!(message.sender_id === currentUserId || message.author === "me") && (
            <div
              className={`h-8 w-8 rounded-full bg-gradient-to-br ${pickAvatarColor(
                message.sender_id
              )}`}
            />
          )}
          <div
            className={`message-bubble ${
              message.sender_id === currentUserId || message.author === "me"
                ? "bg-ink text-white rounded-br-md"
                : "bg-white text-slate-600 rounded-bl-md"
            }`}
          >
            {message.content}
          </div>
          {(message.sender_id === currentUserId || message.author === "me") && (
            <div
              className={`h-8 w-8 rounded-full bg-gradient-to-br ${pickAvatarColor(
                message.sender_id || currentUserId
              )}`}
            />
          )}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
};

export default MessageList;
