import logo from "../../assets/pchat-logo.png";

const Sidebar = ({
  chats,
  activeChatId,
  onSelectChat,
  searchQuery,
  onSearchChange,
  searchResults,
  onSearchSubmit,
  onSendRequest,
  friends,
  onStartChat,
  friendRequests,
  onAcceptRequest,
  onRejectRequest,
  groupName,
  onGroupNameChange,
  onCreateGroup,
  inviteCode,
  onInviteCodeChange,
  onJoinGroup
}) => {
  return (
    <aside className="h-full min-h-0 overflow-y-auto rounded-3xl border border-white/60 bg-white/60 p-5 shadow-sm">
      <div className="hidden items-center justify-between lg:flex">
        <div className="flex items-center gap-2">
          <img src={logo} alt="PChat" className="h-7 w-7 rounded-xl object-cover" />
          <h2 className="font-display text-lg text-ink">PChat</h2>
        </div>
        <span className="rounded-full bg-ink/5 px-2 py-0.5 text-xs text-slate-500">
          {chats.length}
        </span>
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/70 bg-white/90 px-3 py-2 shadow-sm">
        <svg
          className="h-4 w-4 text-slate-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          className="w-full bg-transparent text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none"
          placeholder="Search by username or ID"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onSearchSubmit(event.currentTarget.value);
            }
          }}
        />
      </div>
      {searchResults.length > 0 && (
        <div className="mt-4 space-y-2 rounded-2xl bg-white/80 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Results</p>
          {searchResults.map((user) => {
            const isFriend = friends.some((friend) => String(friend.id) === String(user.id));
            return (
              <div key={user.id} className="flex items-center justify-between rounded-xl bg-white px-3 py-2">
                <div>
                  <p className="text-sm font-semibold text-ink">{user.display_name || user.username}</p>
                  {!isFriend && <p className="text-xs text-slate-400">{user.unique_id}</p>}
                </div>
                {isFriend ? (
                  <button
                    onClick={() => onStartChat(user.id)}
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 transition hover:border-slate-300"
                  >
                    Open
                  </button>
                ) : (
                  <button
                    onClick={() => onSendRequest(user.id)}
                    className="rounded-lg bg-ink px-2.5 py-1 text-xs text-white transition hover:scale-[1.02]"
                  >
                    Add
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
      <div className="mt-6 space-y-3">
        {chats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`w-full rounded-2xl border px-4 py-3 text-left shadow-sm transition ${
              activeChatId === chat.id
                ? "border-ink bg-white"
                : "border-transparent bg-white/80 hover:border-slate-200 hover:bg-white"
            }`}
          >
            <p className="text-sm font-semibold text-ink">{chat.title}</p>
            <p className="text-xs text-slate-500">{chat.type === "group" ? "Group" : "Direct"}</p>
          </button>
        ))}
      </div>
      <div className="mt-6 rounded-2xl bg-white/70 p-4">
        <p className="text-xs font-semibold text-slate-500">Friend requests</p>
        {friendRequests.length === 0 ? (
          <p className="mt-2 text-xs text-slate-400">No requests</p>
        ) : (
          <div className="mt-2 space-y-2">
            {friendRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between rounded-xl bg-white px-3 py-2">
                <span className="text-xs text-slate-600">
                  {request.from_user.display_name || request.from_user.username}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => onAcceptRequest(request.id)}
                    className="rounded-md bg-ink px-2 py-1 text-[11px] text-white"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => onRejectRequest(request.id)}
                    className="rounded-md border border-slate-200 px-2 py-1 text-[11px] text-slate-500"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-6 space-y-2 rounded-2xl bg-white/70 p-4">
        <p className="text-xs font-semibold text-slate-500">Create group</p>
        <input
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
          placeholder="Group name"
          value={groupName}
          onChange={(event) => onGroupNameChange(event.target.value)}
        />
        <button
          onClick={onCreateGroup}
          className="w-full rounded-lg bg-ink px-3 py-2 text-xs text-white transition hover:scale-[1.01]"
        >
          Create
        </button>
      </div>
      <div className="mt-4 space-y-2 rounded-2xl bg-white/70 p-4">
        <p className="text-xs font-semibold text-slate-500">Join group</p>
        <input
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
          placeholder="Invite code"
          value={inviteCode}
          onChange={(event) => onInviteCodeChange(event.target.value)}
        />
        <button
          onClick={onJoinGroup}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 transition hover:border-slate-300"
        >
          Join
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
