import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { apiFetch } from "../services/api";
import logo from "../assets/pchat-logo.png";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    display_name: "",
    password: ""
  });
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    try {
      await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(form)
      });
      navigate("/login");
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
          <h1 className="font-display text-2xl text-ink">Create account</h1>
          <p className="text-sm text-slate-500">Join and start chatting in seconds.</p>
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
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />
          <input
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            name="display_name"
            placeholder="Display name"
            value={form.display_name}
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
            Sign up
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          Have an account? <Link className="text-ocean font-semibold" to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
