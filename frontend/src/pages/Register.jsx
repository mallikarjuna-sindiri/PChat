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
  const [showPassword, setShowPassword] = useState(false);

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
          <div className="relative">
            <input
              className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 text-sm"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 12s3-6 9-6c1.5 0 2.9.3 4 .8" />
                  <path d="M21 12s-3 6-9 6c-1.5 0-2.9-.3-4-.8" />
                  <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                  <path d="M14.1 9.9 8 16" />
                </svg>
              )}
            </button>
          </div>
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
