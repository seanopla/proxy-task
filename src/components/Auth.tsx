import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) alert(error.message);
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) alert(error.message);
    else
      alert(
        "Berhasil daftar! Silakan cek email kamu untuk verifikasi (jika diaktifkan).",
      );
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark p-4">
      <div className="w-full max-w-md rounded-xl border border-primary/30 bg-dark p-8 shadow-[0_0_15px_rgba(82,198,245,0.2)]">
        <h1 className="mb-2 text-center text-3xl font-bold text-primary">
          Proxy Login
        </h1>
        <p className="mb-8 text-center text-sm text-gray-400">
          Masuk untuk mengelola Daily kamu
        </p>

        <form className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-gray-800 p-3 text-white focus:border-primary focus:outline-none"
              placeholder="proxy@mail.com"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-gray-800 p-3 text-white focus:border-primary focus:outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full rounded-lg bg-primary p-3 font-semibold text-dark transition-colors hover:bg-primary/80 disabled:opacity-50"
            >
              {loading ? "Memproses..." : "Login"}
            </button>
            <button
              onClick={handleSignUp}
              disabled={loading}
              className="w-full rounded-lg border border-accent p-3 font-semibold text-accent transition-colors hover:bg-accent/10 disabled:opacity-50"
            >
              {loading ? "Memproses..." : "Register (Pengguna Baru)"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
