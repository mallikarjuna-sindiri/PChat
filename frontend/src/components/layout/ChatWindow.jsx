import ChatHeader from "../chat/ChatHeader";
import MessageList from "../chat/MessageList";
import MessageInput from "../chat/MessageInput";

const ChatWindow = ({ activeChat, messages, onSend, currentUserId, groupMembers, senderNameById }) => {
  return (
    <section className="flex h-full min-h-0 flex-col rounded-3xl border border-white/60 bg-white/70 shadow-sm">
      <ChatHeader
        title={activeChat?.title || "Select a conversation"}
        subtitle={
          activeChat ? (activeChat.type === "group" ? "Group chat" : "Direct chat") : "Pick a chat"
        }
        isGroup={activeChat?.type === "group"}
        inviteCode={activeChat?.type === "group" ? activeChat.invite_code : null}
        members={activeChat?.type === "group" ? groupMembers : []}
      />
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        senderNameById={senderNameById}
      />
      <MessageInput onSend={onSend} disabled={!activeChat} />
    </section>
  );
};

export default ChatWindow;
