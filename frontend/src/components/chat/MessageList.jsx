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

const MessageList = ({ messages, currentUserId, senderNameById = {} }) => {
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
      {messages.map((message) => {
        const isMine = message.sender_id === currentUserId || message.author === "me";
        const senderName = isMine
          ? "You"
          : senderNameById[message.sender_id] || message.sender_name || message.author || "User";

        return (
          <div
            key={message.id}
            className={isMine ? "flex items-start justify-end gap-2.5" : "flex items-start justify-start gap-2.5"}
          >
            {!isMine && (
              <div
                className={`mt-1 h-9 w-9 rounded-full bg-gradient-to-br ${pickAvatarColor(
                  message.sender_id
                )}`}
              />
            )}
            <div className={`flex max-w-[60%] flex-col ${isMine ? "items-end" : "items-start"}`}>
              <span
                className={`mb-1 text-[11px] font-semibold text-slate-400 ${
                  isMine ? "text-right" : "text-left"
                }`}
              >
                {senderName}
              </span>
              <div
                className={`message-bubble ${
                  isMine ? "bg-ink text-white rounded-br-md" : "bg-white text-slate-600 rounded-bl-md"
                }`}
              >
                {message.content}
              </div>
            </div>
            {isMine && (
              <div
                className={`mt-1 h-9 w-9 rounded-full bg-gradient-to-br ${pickAvatarColor(
                  message.sender_id || currentUserId
                )}`}
              />
            )}
          </div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
};

export default MessageList;
