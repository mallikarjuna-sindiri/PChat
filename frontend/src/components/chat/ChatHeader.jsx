import { useEffect, useState } from "react";
import QRCode from "qrcode";

const ChatHeader = ({ title, subtitle, inviteCode, members = [], isGroup = false }) => {
    const avatarClass = (seed) => {
      const palette = [
        "from-sky-400 to-blue-500",
        "from-emerald-400 to-teal-500",
        "from-amber-400 to-orange-500",
        "from-rose-400 to-pink-500",
        "from-violet-400 to-indigo-500",
        "from-lime-400 to-green-500",
        "from-cyan-400 to-sky-500",
        "from-fuchsia-400 to-purple-500"
      ];
      const num = Number(String(seed).replace(/\D/g, "")) || 0;
      return palette[num % palette.length];
    };
  const [inviteQr, setInviteQr] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const [showInviteQr, setShowInviteQr] = useState(false);

  useEffect(() => {
    if (!inviteCode) {
      setInviteQr("");
      return;
    }
    const envBase = import.meta.env.VITE_APP_URL;
    const baseUrl = envBase || window?.location?.origin || "";
    const inviteUrl = baseUrl ? `${baseUrl}/join/${inviteCode}` : inviteCode;
    QRCode.toDataURL(inviteUrl, { margin: 1, width: 96 })
      .then(setInviteQr)
      .catch(() => setInviteQr(""));
  }, [inviteCode]);

  return (
    <div className="border-b border-white/30 bg-gradient-to-r from-ocean via-blue-600 to-indigo-600 text-white">
      <div className="flex items-center justify-between px-4 py-4 lg:hidden">
        <p className="text-sm font-semibold tracking-tight text-white">{title}</p>
        {isGroup && inviteQr && (
          <div className="relative flex items-center gap-2">
            <button
              onClick={() => setShowMembers((prev) => !prev)}
              className="rounded-lg border border-white/30 bg-white/10 px-3 py-1 text-[11px] text-white"
            >
              People
            </button>
            <button onClick={() => setShowInviteQr(true)} className="rounded-lg">
              <img
                src={inviteQr}
                alt="Group QR"
                className="h-10 w-10 rounded-lg border border-white/40 bg-white"
              />
            </button>
            {showMembers && (
              <div className="absolute right-0 top-12 z-10 w-52 rounded-xl border border-white/70 bg-white p-3 text-xs shadow-lg">
                <p className="text-slate-400">Members</p>
                <div className="mt-2 space-y-2">
                  {members.length === 0 ? (
                    <p className="text-slate-400">No members found</p>
                  ) : (
                    members.map((member) => (
                      <div key={member.id} className="flex items-center gap-2">
                        <div
                          className={`h-6 w-6 rounded-full bg-gradient-to-br ${avatarClass(
                            member.id
                          )}`}
                        />
                        <span className="text-slate-600">
                          {member.display_name || member.username}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="hidden items-center justify-between px-8 py-6 lg:flex">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
              {subtitle}
            </span>
            <p className="text-base font-semibold tracking-tight text-white">{title}</p>
          </div>
          <p className="mt-1 text-xs text-white/80">Stay connected with your group.</p>
        </div>
        {inviteQr && (
          <div className="relative flex items-center gap-2">
            <button
              onClick={() => setShowMembers((prev) => !prev)}
              className="rounded-lg border border-white/30 bg-white/10 px-3 py-1 text-xs text-white"
            >
              People
            </button>
            <button onClick={() => setShowInviteQr(true)} className="rounded-xl">
              <img
                src={inviteQr}
                alt="Group QR"
                className="h-14 w-14 rounded-xl border border-white/40 bg-white"
              />
            </button>
            {showMembers && (
              <div className="absolute right-0 top-12 z-10 w-52 rounded-xl border border-white/70 bg-white p-3 text-xs shadow-lg">
                <p className="text-slate-400">Members</p>
                <div className="mt-2 space-y-2">
                  {members.length === 0 ? (
                    <p className="text-slate-400">No members found</p>
                  ) : (
                    members.map((member) => (
                      <div key={member.id} className="flex items-center gap-2">
                        <div
                          className={`h-6 w-6 rounded-full bg-gradient-to-br ${avatarClass(
                            member.id
                          )}`}
                        />
                        <span className="text-slate-600">
                          {member.display_name || member.username}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {showInviteQr && inviteQr && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
          onClick={() => setShowInviteQr(false)}
        >
          <div className="rounded-3xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <p className="text-center text-sm font-semibold text-slate-600">Group QR</p>
            <img src={inviteQr} alt="Group QR" className="mt-4 h-56 w-56" />
            <p className="mt-3 text-center text-sm font-semibold text-ink">{title || "Group"}</p>
            {inviteCode && (
              <p className="mt-1 text-center text-xs text-slate-500">{inviteCode}</p>
            )}
            <button
              onClick={() => setShowInviteQr(false)}
              className="mt-5 w-full rounded-xl bg-ink px-4 py-2 text-sm text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;
