import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";
import Auth from "./components/Auth";
import Dashboard from "./components/dashboard";

function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-dark p-4 font-sans text-white md:p-8">
      <div className="mx-auto max-w-5xl">
        {/* Header Profil */}
        <div className="mb-8 flex flex-col items-center justify-between gap-4 rounded-xl border border-primary/20 bg-gray-900 p-6 shadow-[0_0_15px_rgba(82,198,245,0.1)] md:flex-row">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-xl font-bold text-primary border border-primary">
              {session.user.email?.[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary tracking-wide">
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

        {/* Memanggil Komponen Dashboard dan mengirim User ID */}
        <Dashboard userId={session.user.id} />
      </div>
    </div>
  );
}

export default App;
