import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { apiFetch } from "../services/api";
import { useAuth } from "../context/AuthContext";

const JoinGroup = () => {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [status, setStatus] = useState("joining");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!inviteCode) {
      setStatus("error");
      setError("Invalid invite code");
      return;
    }

    if (!token) {
      localStorage.setItem("pending_group_invite", inviteCode);
      navigate("/login");
      return;
    }

    const join = async () => {
      try {
        const result = await apiFetch("/api/groups/join", {
          method: "POST",
          body: JSON.stringify({ invite_code: inviteCode }),
          token
        });
        localStorage.removeItem("pending_group_invite");
        setStatus("joined");
        navigate(`/chat?chatId=${result.chat_id}`);
      } catch (err) {
        setStatus("error");
        setError(err.message);
      }
    };

    join();
  }, [inviteCode, token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-panel w-full max-w-md rounded-3xl p-8 text-center">
        {status === "joining" && <p className="text-sm text-slate-500">Joining group...</p>}
        {status === "joined" && <p className="text-sm text-emerald-600">Joined! Redirecting...</p>}
        {status === "error" && <p className="text-sm text-rose">{error}</p>}
      </div>
    </div>
  );
};

export default JoinGroup;
