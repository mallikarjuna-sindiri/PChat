import { useEffect, useState } from "react";
import QRCode from "qrcode";

const RightPanel = ({ currentUser, friends, groups, onStartChat, onLogout }) => {
  const [userQr, setUserQr] = useState("");
  const [showUserQr, setShowUserQr] = useState(false);

  useEffect(() => {
    if (!currentUser?.unique_id) {
      setUserQr("");
      return;
    }
    const envBase = import.meta.env.VITE_APP_URL;
    const baseUrl = envBase || window?.location?.origin || "";
    const userUrl = baseUrl ? `${baseUrl}/add/${currentUser.unique_id}` : currentUser.unique_id;
    QRCode.toDataURL(userUrl, { margin: 1, width: 140 })
      .then(setUserQr)
      .catch(() => setUserQr(""));
  }, [currentUser]);

  return (
    <aside className="h-full min-h-0 overflow-y-auto rounded-3xl border border-white/60 bg-white/60 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-ink">Profile</h3>
        <button
          onClick={onLogout}
          className="rounded-full bg-red-600 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white shadow"
        >
          Logout
        </button>
      </div>
      <div className="mt-6 rounded-2xl bg-white/80 p-4 text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-ocean to-wave" />
        <p className="mt-3 font-semibold text-ink">
          {currentUser?.display_name || currentUser?.username || "Your profile"}
        </p>
        <p className="text-xs text-slate-500">{currentUser?.unique_id || ""}</p>
      </div>
      <div className="mt-5 rounded-2xl bg-white/80 p-4 text-center">
        <p className="text-xs font-semibold text-slate-500">Your QR</p>
        <div className="mt-3 flex items-center justify-center">
          {userQr ? (
            <div className="relative h-28 w-28 overflow-hidden rounded-xl">
              <img src={userQr} alt="User QR" className="h-28 w-28 blur-md" />
              <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => setShowUserQr(true)}
                  className="rounded-lg bg-ink/90 px-3 py-1.5 text-xs font-semibold text-white"
                >
                  Show QR
                </button>
              </div>
            </div>
          ) : (
            <span className="text-xs text-slate-400">QR unavailable</span>
          )}
        </div>
      </div>
      {showUserQr && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
          onClick={() => setShowUserQr(false)}
        >
          <div className="rounded-3xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <p className="text-center text-sm font-semibold text-slate-600">Your QR</p>
            <img src={userQr} alt="User QR" className="mt-4 h-56 w-56" />
            <p className="mt-3 text-center text-sm font-semibold text-ink">
              {currentUser?.display_name || currentUser?.username || "Your profile"}
            </p>
            {currentUser?.unique_id && (
              <p className="mt-1 text-center text-xs text-slate-500">{currentUser.unique_id}</p>
            )}
            <button
              onClick={() => setShowUserQr(false)}
              className="mt-5 w-full rounded-xl bg-ink px-4 py-2 text-sm text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-ink">Friends</h4>
        {friends.length === 0 ? (
          <p className="mt-2 text-xs text-slate-400">No friends yet.</p>
        ) : (
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            {friends.map((friend) => (
              <button
                key={friend.id}
                onClick={() => onStartChat(friend.id)}
                className="w-full rounded-xl bg-white/70 px-3 py-2 text-left"
              >
                {friend.display_name || friend.username}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-ink">Groups</h4>
        {groups.length === 0 ? (
          <p className="mt-2 text-xs text-slate-400">No groups yet.</p>
        ) : (
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            {groups.map((group) => (
              <div key={group.id} className="w-full rounded-xl bg-white/70 px-3 py-2 text-left">
                {group.name || "Group chat"}
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};

export default RightPanel;
