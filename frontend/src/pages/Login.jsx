import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { apiFetch } from "../services/api";
import logo from "../assets/pchat-logo.png";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(form)
      });
      login(data.access_token);
      const pendingFriend = localStorage.getItem("pending_friend_invite");
      const pendingInvite = localStorage.getItem("pending_group_invite");
      if (pendingFriend) {
        navigate(`/add/${pendingFriend}`);
      } else if (pendingInvite) {
        navigate(`/join/${pendingInvite}`);
      } else {
        navigate("/chat");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-panel w-full max-w-md rounded-3xl p-8">
        <div className="flex flex-col items-center gap-3">
          <img
            src={logo}
            alt="PChat"
            className="h-14 w-14 rounded-2xl object-cover"
          />
          <h1 className="font-display text-2xl text-ink">Welcome back</h1>
          <p className="text-sm text-slate-500">Log in to continue your conversations.</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
          />
          <input
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />
          {error && <p className="text-sm text-rose">{error}</p>}
          <button className="w-full rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white">
            Login
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          New here? <Link className="text-ocean font-semibold" to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
