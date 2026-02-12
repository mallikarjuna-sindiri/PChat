import { useEffect, useState } from "react";
import QRCode from "qrcode";

import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";

const Profile = () => {
  const { logout, token } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [uniqueId, setUniqueId] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [showQr, setShowQr] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    const loadProfile = async () => {
      try {
        const data = await apiFetch("/api/profile", { token });
        setDisplayName(data.display_name || "");
        setUniqueId(data.unique_id || "");
      } catch (err) {
        setError(err.message);
      }
    };
    loadProfile();
  }, [token]);

  useEffect(() => {
    if (!uniqueId) return;
    QRCode.toDataURL(uniqueId, { margin: 1, width: 160 })
      .then(setQrCodeUrl)
      .catch((err) => setError(err.message));
  }, [uniqueId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = await apiFetch("/api/profile", {
        method: "PUT",
        body: JSON.stringify({ display_name: displayName }),
        token
      });
      setDisplayName(data.display_name || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(uniqueId);
    } catch (err) {
      setError("Unable to copy ID");
    }
  };

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="glass-panel mx-auto max-w-3xl rounded-[32px] p-10">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="font-display text-2xl text-ink">Profile</h1>
            <p className="text-sm text-slate-500">Manage your identity and sharing options.</p>
          </div>
          <button onClick={logout} className="rounded-xl border border-slate-200 px-4 py-2 text-sm">
            Log out
          </button>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            <label className="text-sm text-slate-500">Display name</label>
            <input
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
            <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
              Save changes to update your profile across the app.
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
          <div className="rounded-2xl bg-white/70 p-4 text-center">
            <div className="relative mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt="User QR"
                  className={`h-28 w-28 transition ${showQr ? "" : "blur-md"}`}
                />
              ) : (
                <span className="text-xs text-slate-400">QR code</span>
              )}
              {qrCodeUrl && !showQr && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm">
                  <button
                    type="button"
                    onClick={() => setShowQr(true)}
                    className="rounded-lg bg-ink/90 px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Show QR
                  </button>
                </div>
              )}
            </div>
            <p className="mt-4 text-sm text-slate-500">Unique ID</p>
            <p className="font-semibold text-ink">{uniqueId}</p>
            <button
              onClick={handleCopy}
              className="mt-4 w-full rounded-xl bg-ink px-3 py-2 text-sm text-white"
            >
              Copy ID
            </button>
          </div>
        </div>
        {error && <p className="mt-4 text-sm text-rose">{error}</p>}
      </div>
    </div>
  );
};

export default Profile;
