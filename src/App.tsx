import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import Swal from "sweetalert2";

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);

      // Menangkap event jika user datang dari link reset password
      if (event === "PASSWORD_RECOVERY") {
        setRecoveryMode(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Fungsi untuk menyimpan password baru
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.message,
        background: "#1f2937",
        color: "#fff",
      });
    } else {
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Password berhasil diubah!",
        background: "#1f2937",
        color: "#fff",
      });
      setRecoveryMode(false); // Keluar dari mode recovery, lanjut ke Dashboard
    }
  };

  // Jika belum login, tampilkan halaman Login/Register
  if (!session) {
    return <Auth />;
  }

  // Jika sedang dalam mode ganti password (setelah klik link dari email)
  if (recoveryMode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark p-4 text-white">
        <div className="w-full max-w-md rounded-xl border border-accent bg-gray-900 p-8 shadow-lg">
          <h2 className="mb-4 text-2xl font-bold text-accent">
            Buat Password Baru
          </h2>
          <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Masukkan password baru..."
              required
              className="w-full rounded-lg border border-gray-600 bg-gray-800 p-3 text-white focus:border-accent focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-lg bg-accent p-3 font-bold text-dark hover:bg-accent/80"
            >
              Simpan Password
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Jika sudah login normal, tampilkan Dashboard
  return (
    <div className="min-h-screen bg-dark p-4 font-sans text-white md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col items-center justify-between gap-4 rounded-xl border border-primary/20 bg-gray-900 p-6 shadow-[0_0_15px_rgba(82,198,245,0.1)] md:flex-row">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary bg-primary/20 text-xl font-bold text-primary">
              {session.user.email?.[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-wide text-primary">
                Proxy Task
              </h1>
              <p className="text-sm text-gray-400">
                Proxy ID: {session.user.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-accent bg-transparent px-5 py-2 font-bold text-accent transition hover:bg-accent/10"
          >
            Logout
          </button>
        </div>
        <Dashboard userId={session.user.id} />
      </div>
    </div>
  );
}

export default App;
