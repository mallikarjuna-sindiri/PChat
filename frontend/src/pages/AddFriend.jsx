import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { apiFetch } from "../services/api";
import { useAuth } from "../context/AuthContext";

const AddFriend = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [targetUser, setTargetUser] = useState(null);

  useEffect(() => {
    if (!userId) {
      setStatus("error");
      setError("Invalid user code");
      return;
    }

    if (!token) {
      localStorage.setItem("pending_friend_invite", userId);
      navigate("/login");
      return;
    }

    const loadUser = async () => {
      try {
        const results = await apiFetch(`/api/users/search?query=${encodeURIComponent(userId)}`, {
          token
        });
        const exact = results.find((user) => user.unique_id === userId) || null;
        if (!exact) {
          setStatus("error");
          setError("User not found");
          return;
        }
        localStorage.removeItem("pending_friend_invite");
        setTargetUser(exact);
        setStatus("confirm");
      } catch (err) {
        setStatus("error");
        setError(err.message);
      }
    };

    loadUser();
  }, [userId, token, navigate]);

  const handleSend = async () => {
    if (!targetUser) return;
    setStatus("sending");
    try {
      await apiFetch("/api/friends/requests", {
        method: "POST",
        body: JSON.stringify({ to_user_id: targetUser.id }),
        token
      });
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-panel w-full max-w-md rounded-3xl p-8 text-center">
        {status === "loading" && <p className="text-sm text-slate-500">Loading user...</p>}
        {status === "confirm" && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">Send friend request to</p>
            <div>
              <p className="text-lg font-semibold text-ink">
                {targetUser?.display_name || targetUser?.username}
              </p>
              <p className="text-xs text-slate-500">{targetUser?.unique_id}</p>
            </div>
            <button
              onClick={handleSend}
              className="w-full rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white"
            >
              Send request
            </button>
          </div>
        )}
        {status === "sending" && <p className="text-sm text-slate-500">Sending request...</p>}
        {status === "sent" && (
          <div className="space-y-3">
            <p className="text-sm text-emerald-600">Request sent!</p>
            <button
              onClick={() => navigate("/chat")}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-600"
            >
              Go to chat
            </button>
          </div>
        )}
        {status === "error" && <p className="text-sm text-rose">{error}</p>}
      </div>
    </div>
  );
};

export default AddFriend;
