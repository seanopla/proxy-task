import { useState } from "react";
import { supabase } from "../lib/supabase";
import Swal from "sweetalert2";

const swalDark = Swal.mixin({
  background: "#1f2937",
  color: "#ffffff",
  confirmButtonColor: "#52C6F5",
});

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  // State view sekarang mendukung 4 mode: login, register, forgot, verify
  const [view, setView] = useState<"login" | "register" | "forgot" | "verify">(
    "login",
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) swalDark.fire("Gagal Login", error.message, "error");
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      swalDark.fire("Gagal Mendaftar", error.message, "error");
    } else {
      // Pindah ke layar verifikasi kode OTP jika berhasil daftar
      setView("verify");
      swalDark.fire(
        "Cek Email!",
        "Kode verifikasi 6-digit telah dikirim ke email kamu.",
        "success",
      );
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "signup",
    });

    if (error) {
      swalDark.fire(
        "Kode Salah",
        "Kode verifikasi tidak valid atau sudah kedaluwarsa.",
        "error",
      );
    } else {
      swalDark.fire(
        "Berhasil!",
        "Akun terverifikasi. Mengalihkan ke dashboard...",
        "success",
      );
      // Tidak perlu setView('login') karena App.tsx akan otomatis mendeteksi session dan memuat Dashboard
    }
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });

    if (error) {
      swalDark.fire("Gagal", error.message, "error");
    } else {
      swalDark.fire(
        "Cek Email",
        "Link untuk mereset password telah dikirim ke email kamu.",
        "success",
      );
      setView("login");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark p-4">
      <div className="w-full max-w-md rounded-xl border border-primary/30 bg-gray-900 p-8 shadow-[0_0_20px_rgba(82,198,245,0.15)]">
        <h1 className="mb-2 text-center text-3xl font-bold text-primary">
          Proxy Task
        </h1>
        <p className="mb-8 text-center text-sm text-gray-400">
          Masukan Email dan Password untuk masuk ke akun
        </p>

        {view === "verify" ? (
          /* --- TAMPILAN VERIFIKASI OTP 6-DIGIT --- */
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <p className="text-center text-sm text-gray-300">
              Masukkan 6 digit kode verifikasi yang telah dikirimkan ke <br />
              <span className="font-bold text-accent">{email}</span>
            </p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="w-full rounded-lg border border-gray-600 bg-gray-800 p-4 text-center text-2xl tracking-widest text-white focus:border-primary focus:outline-none"
              placeholder="••••••"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-lg bg-primary p-3 font-bold text-dark transition hover:bg-primary/80 disabled:opacity-50"
            >
              {loading ? "Memverifikasi..." : "Verifikasi Kode"}
            </button>
            <button
              type="button"
              onClick={() => setView("login")}
              className="text-sm text-gray-400 hover:text-white"
            >
              Kembali ke Login
            </button>
          </form>
        ) : view === "forgot" ? (
          /* --- TAMPILAN LUPA PASSWORD --- */
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            <p className="text-sm text-gray-300">
              Masukkan email yang terdaftar. Kami akan mengirimkan tautan untuk
              mereset password.
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-gray-800 p-3 text-white focus:border-primary focus:outline-none"
              placeholder="proxy@mail.com"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-lg bg-primary p-3 font-bold text-dark transition hover:bg-primary/80 disabled:opacity-50"
            >
              {loading ? "Mengirim..." : "Kirim Link Reset"}
            </button>
            <button
              type="button"
              onClick={() => setView("login")}
              className="text-sm text-gray-400 hover:text-white"
            >
              Kembali ke Login
            </button>
          </form>
        ) : (
          /* --- TAMPILAN LOGIN & REGISTER --- */
          <>
            <div className="mb-6 flex rounded-lg bg-gray-800 p-1">
              <button
                onClick={() => setView("login")}
                className={`w-1/2 rounded-md py-2 text-sm font-bold transition-all ${
                  view === "login"
                    ? "bg-primary text-dark shadow"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Masuk
              </button>
              <button
                onClick={() => setView("register")}
                className={`w-1/2 rounded-md py-2 text-sm font-bold transition-all ${
                  view === "register"
                    ? "bg-accent text-dark shadow"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Daftar
              </button>
            </div>

            <form
              onSubmit={view === "login" ? handleLogin : handleSignUp}
              className="flex flex-col gap-4"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-600 bg-gray-800 p-3 text-white focus:border-primary focus:outline-none"
                placeholder="proxy@mail.com"
                required
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-600 bg-gray-800 p-3 pr-10 text-white focus:border-primary focus:outline-none"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {view === "login" && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setView("forgot")}
                    className="text-xs text-primary hover:underline"
                  >
                    Lupa Password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`mt-2 w-full rounded-lg p-3 font-bold text-dark transition disabled:opacity-50 ${
                  view === "login"
                    ? "bg-primary hover:bg-primary/80"
                    : "bg-accent hover:bg-accent/80"
                }`}
              >
                {loading
                  ? "Memproses..."
                  : view === "login"
                    ? "Masuk"
                    : "Daftar Akun Baru"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
