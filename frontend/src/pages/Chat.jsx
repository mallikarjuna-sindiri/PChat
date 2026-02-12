import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import ChatWindow from "../components/layout/ChatWindow";
import RightPanel from "../components/layout/RightPanel";
import { createChatSocket } from "../services/websocket";
import { apiFetch } from "../services/api";
import logo from "../assets/pchat-logo.png";
import { useAuth } from "../context/AuthContext";

const Chat = () => {
  const { token, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const chatIdParam = searchParams.get("chatId");
  const [currentUser, setCurrentUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]); 
  const [groups, setGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState(null);
  const [wsStatus, setWsStatus] = useState("disconnected");
  const [groupMembers, setGroupMembers] = useState([]);
  const [mobileView, setMobileView] = useState("home");

  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === activeChatId) || null,
    [chats, activeChatId]
  );

  const senderNameById = useMemo(() => {
    const map = {};
    if (activeChat?.type === "group") {
      groupMembers.forEach((member) => {
        map[member.id] = member.display_name || member.username;
      });
    }
    if (activeChat?.type === "direct" && activeChat.peer_id) {
      map[activeChat.peer_id] = activeChat.title;
    }
    return map;
  }, [activeChat, groupMembers]);

  const appendMessage = (message) => {
    setMessages((prev) =>
      prev.some((item) => String(item.id) === String(message.id)) ? prev : [...prev, message]
    );
  };

  useEffect(() => {
    if (!token) return;
    const loadInitial = async () => {
      try {
          const [me, chatList, friendList, requests, groupList] = await Promise.all([
          apiFetch("/api/users/me", { token }),
          apiFetch("/api/chats", { token }),
          apiFetch("/api/friends/list", { token }),
            apiFetch("/api/friends/requests", { token }),
            apiFetch("/api/groups", { token })
        ]);
        setCurrentUser(me);
        setChats(chatList);
        setFriends(friendList.map((item) => item.friend));
        setFriendRequests(requests);
          setGroups(groupList);
        if (chatIdParam) {
          const matched = chatList.find((chat) => String(chat.id) === String(chatIdParam));
          if (matched) {
            setActiveChatId(matched.id);
            return;
          }
        }
        if (chatList.length && !activeChatId) {
          setActiveChatId(chatList[0].id);
        }
      } catch (err) {
        setError(err.message);
      }
    };
    loadInitial();
  }, [token]);

  useEffect(() => {
    if (!token || !activeChatId) return;
    const loadMessages = async () => {
      try {
        const data = await apiFetch(`/api/messages/chat/${activeChatId}`, { token });
        setMessages(data);
      } catch (err) {
        setError(err.message);
      }
    };
    loadMessages();

    const socket = createChatSocket({
      chatId: activeChatId,
      token,
      onMessage: (data) => {
        if (data.sender_id && data.sender_id === currentUser?.id) return;
        appendMessage(data);
      },
      onStatus: setWsStatus
    });

    return () => socket.close();
  }, [activeChatId, token]);

  useEffect(() => {
    if (!token || !activeChat || activeChat.type !== "group") {
      setGroupMembers([]);
      return;
    }
    const loadMembers = async () => {
      try {
        const members = await apiFetch(`/api/groups/${activeChat.id}/members`, { token });
        setGroupMembers(members);
      } catch (err) {
        setError(err.message);
      }
    };
    loadMembers();
  }, [activeChat, token]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const handler = setTimeout(async () => {
      try {
        const results = await apiFetch(`/api/users/search?query=${encodeURIComponent(searchQuery)}`, {
          token
        });
        setSearchResults(results);
      } catch (err) {
        setError(err.message);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery, token]);

  const refreshChats = async () => {
    const chatList = await apiFetch("/api/chats", { token });
    setChats(chatList);
  };

  const handleSend = async (text) => {
    if (!activeChatId) return;
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      chat_id: activeChatId,
      sender_id: currentUser?.id,
      content: text,
      created_at: new Date().toISOString()
    };
    appendMessage(optimistic);
    try {
      const message = await apiFetch("/api/messages", {
        method: "POST",
        body: JSON.stringify({ chat_id: activeChatId, content: text }),
        token
      });
      setMessages((prev) => prev.map((item) => (item.id === tempId ? message : item)));
    } catch (err) {
      setMessages((prev) => prev.filter((item) => item.id !== tempId));
      setError(err.message);
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      await apiFetch("/api/friends/requests", {
        method: "POST",
        body: JSON.stringify({ to_user_id: userId }),
        token
      });
      setSearchResults((prev) => prev.filter((user) => user.id !== userId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSearchSubmit = async (value) => {
    const query = value.trim();
    if (!query) return;
    setSearchQuery(query);
    try {
      const results = await apiFetch(`/api/users/search?query=${encodeURIComponent(query)}`, {
        token
      });
      const exact = results.find(
        (user) => user.unique_id === query || user.username.toLowerCase() === query.toLowerCase()
      );
      if (exact) {
        await handleSendRequest(exact.id);
        setSearchQuery("");
        setSearchResults([]);
      } else {
        setSearchResults(results);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await apiFetch(`/api/friends/requests/${requestId}/accept`, { method: "POST", token });
      const [friendList, requests] = await Promise.all([
        apiFetch("/api/friends/list", { token }),
        apiFetch("/api/friends/requests", { token })
      ]);
      setFriends(friendList.map((item) => item.friend));
      setFriendRequests(requests);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await apiFetch(`/api/friends/requests/${requestId}/reject`, { method: "POST", token });
      const requests = await apiFetch("/api/friends/requests", { token });
      setFriendRequests(requests);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return;
    try {
      await apiFetch("/api/groups", {
        method: "POST",
        body: JSON.stringify({ name: groupName.trim() }),
        token
      });
      setGroupName("");
      await refreshChats();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleJoinGroup = async () => {
    if (!inviteCode.trim()) return;
    try {
      await apiFetch("/api/groups/join", {
        method: "POST",
        body: JSON.stringify({ invite_code: inviteCode.trim() }),
        token
      });
      setInviteCode("");
      await refreshChats();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStartChat = async (friendId) => {
    try {
      const chat = await apiFetch(`/api/chats/direct/${friendId}`, { method: "POST", token });
      await refreshChats();
      setActiveChatId(chat.id);
      setMobileView("chat");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSelectChat = (chatId) => {
    setActiveChatId(chatId);
    setMobileView("chat");
  };

  return (
    <div className="min-h-screen w-full px-2 py-2">
      <div className="glass-panel grid h-[calc(100vh-16px)] w-full grid-cols-1 gap-4 overflow-hidden rounded-[32px] p-4 lg:grid-cols-[280px_1fr_320px]">
        <div className="flex h-full min-h-0 flex-col lg:hidden">
          <div className="mb-4 flex items-center justify-between rounded-2xl border border-white/60 bg-white/90 px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2">
              <img src={logo} alt="PChat" className="h-7 w-7 rounded-xl object-cover" />
              <p className="text-sm font-semibold text-ink">PChat</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileView("home")}
                className={`rounded-xl px-3 py-1.5 text-[11px] font-semibold transition ${
                  mobileView === "home" ? "bg-ink text-white" : "bg-white text-slate-600"
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setMobileView("chat")}
                className={`rounded-xl px-3 py-1.5 text-[11px] font-semibold transition ${
                  mobileView === "chat" ? "bg-ink text-white" : "bg-white text-slate-600"
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setMobileView("profile")}
                className={`rounded-xl px-3 py-1.5 text-[11px] font-semibold transition ${
                  mobileView === "profile" ? "bg-ink text-white" : "bg-white text-slate-600"
                }`}
              >
                Profile
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            {mobileView === "home" && (
              <div className="h-full min-h-0">
                <Sidebar
                  chats={chats}
                  activeChatId={activeChatId}
                  onSelectChat={handleSelectChat}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  searchResults={searchResults}
                  onSearchSubmit={handleSearchSubmit}
                  onSendRequest={handleSendRequest}
                  friends={friends}
                  onStartChat={handleStartChat}
                  friendRequests={friendRequests}
                  onAcceptRequest={handleAcceptRequest}
                  onRejectRequest={handleRejectRequest}
                  groupName={groupName}
                  onGroupNameChange={setGroupName}
                  onCreateGroup={handleCreateGroup}
                  inviteCode={inviteCode}
                  onInviteCodeChange={setInviteCode}
                  onJoinGroup={handleJoinGroup}
                />
              </div>
            )}
            {mobileView === "chat" && (
              <div className="h-full min-h-0">
                <ChatWindow
                  activeChat={activeChat}
                  messages={messages}
                  onSend={handleSend}
                  currentUserId={currentUser?.id}
                  groupMembers={groupMembers}
                  senderNameById={senderNameById}
                />
              </div>
            )}
            {mobileView === "profile" && (
              <div className="h-full min-h-0">
                <RightPanel
                  currentUser={currentUser}
                  friends={friends}
                  groups={groups}
                  onStartChat={handleStartChat}
                  onLogout={logout}
                />
              </div>
            )}
          </div>
        </div>
        <div className="hidden lg:block h-full min-h-0">
          <Sidebar
            chats={chats}
            activeChatId={activeChatId}
            onSelectChat={handleSelectChat}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchResults={searchResults}
            onSearchSubmit={handleSearchSubmit}
            onSendRequest={handleSendRequest}
            friends={friends}
            onStartChat={handleStartChat}
            friendRequests={friendRequests}
            onAcceptRequest={handleAcceptRequest}
            onRejectRequest={handleRejectRequest}
            groupName={groupName}
            onGroupNameChange={setGroupName}
            onCreateGroup={handleCreateGroup}
            inviteCode={inviteCode}
            onInviteCodeChange={setInviteCode}
            onJoinGroup={handleJoinGroup}
          />
        </div>
        <div className="hidden lg:block h-full min-h-0">
          <ChatWindow
            activeChat={activeChat}
            messages={messages}
            onSend={handleSend}
            currentUserId={currentUser?.id}
            groupMembers={groupMembers}
            senderNameById={senderNameById}
          />
        </div>
        <div className="hidden lg:block h-full min-h-0">
          <RightPanel
            currentUser={currentUser}
            friends={friends}
            groups={groups}
            onStartChat={handleStartChat}
            onLogout={logout}
          />
        </div>
      </div>
      {error && (
        <div className="mx-auto mt-4 max-w-6xl rounded-xl bg-rose/20 px-4 py-2 text-sm text-rose">
          {error}
        </div>
      )}
      {wsStatus !== "connected" && activeChat && (
        <div className="mx-auto mt-2 max-w-6xl rounded-xl bg-amber-100 px-4 py-2 text-xs text-amber-700">
          Realtime updates are {wsStatus}. Messages may appear after refresh.
        </div>
      )}
    </div>
  );
};

export default Chat;
