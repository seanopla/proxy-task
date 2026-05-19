import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Swal from "sweetalert2";
import { HiBellAlert } from "react-icons/hi2";

interface Task {
  id: string;
  game_name: string;
  task_name: string;
  task_type: string;
  is_completed: boolean;
  next_reset: string;
  interval_days: number;
}

const GAME_CATALOG: Record<
  string,
  { name: string; type: string; interval: number; anchor: string }[]
> = {
  "Wuthering Waves": [
    {
      name: "Daily",
      type: "daily",
      interval: 1,
      anchor: "2026-05-01T20:00:00Z",
    },
    {
      name: "Weekly FOTG",
      type: "weekly",
      interval: 7,
      anchor: "2026-05-03T20:00:00Z",
    },
    {
      name: "Tower of Adversity",
      type: "endgame",
      interval: 28,
      anchor: "2026-04-26T20:00:00Z",
    },
    {
      name: "Whimpering Wastes",
      type: "endgame",
      interval: 28,
      anchor: "2026-05-10T20:00:00Z",
    },

    {
      name: "Endstate Matrix",
      type: "endgame",
      interval: 31,
      anchor: "2026-05-07T20:00:00Z",
    },
  ],
  "Genshin Impact": [
    {
      name: "Daily",
      type: "daily",
      interval: 1,
      anchor: "2026-05-01T20:00:00Z",
    },
    {
      name: "Spiral Abyss",
      type: "endgame",
      interval: 30,
      anchor: "2026-05-15T20:00:00Z",
    },
    {
      name: "Imaginarium Theater",
      type: "endgame",
      interval: 30,
      anchor: "2026-05-31T20:00:00Z",
    },
  ],
  "Honkai Star Rail": [
    {
      name: "Daily",
      type: "daily",
      interval: 1,
      anchor: "2026-05-01T20:00:00Z",
    },
    {
      name: "Weekly",
      type: "weekly",
      interval: 7,
      anchor: "2026-05-03T20:00:00Z",
    },
    {
      name: "Memory of Chaos",
      type: "endgame",
      interval: 42,
      anchor: "2026-05-24T20:00:00Z",
    },
    {
      name: "Pure Fiction",
      type: "endgame",
      interval: 42,
      anchor: "2026-05-10T20:00:00Z",
    },
    {
      name: "Apocalyptic Shadow",
      type: "endgame",
      interval: 42,
      anchor: "2026-04-26T20:00:00Z",
    },
  ],
  "Zenless Zone Zero": [
    {
      name: "Daily",
      type: "daily",
      interval: 1,
      anchor: "2026-05-01T20:00:00Z",
    },
    {
      name: "Weekly Hollow Zero",
      type: "weekly",
      interval: 7,
      anchor: "2026-05-03T20:00:00Z",
    },
    {
      name: "Deadly Assault",
      type: "endgame",
      interval: 14,
      anchor: "2026-05-07T20:00:00Z",
    },
    {
      name: "Shiyu Defense",
      type: "endgame",
      interval: 14,
      anchor: "2026-05-14T20:00:00Z",
    },
  ],
  "Arknights Endfield": [
    {
      name: "Daily",
      type: "daily",
      interval: 1,
      anchor: "2026-05-01T20:00:00Z",
    },
    {
      name: "Weekly",
      type: "weekly",
      interval: 7,
      anchor: "2026-05-03T20:00:00Z",
    },
  ],
  P5X: [
    {
      name: "Daily",
      type: "daily",
      interval: 1,
      anchor: "2026-05-01T20:00:00Z",
    },
    {
      name: "Weekly",
      type: "weekly",
      interval: 7,
      anchor: "2026-05-03T20:00:00Z",
    },
  ],
};
const GAMES = Object.keys(GAME_CATALOG);

const calculateNextReset = (anchorDateString: string, intervalDays: number) => {
  const now = new Date().getTime();
  let anchor = new Date(anchorDateString).getTime();
  const intervalMs = intervalDays * 24 * 60 * 60 * 1000;

  while (anchor <= now) {
    anchor += intervalMs;
  }
  return new Date(anchor).toISOString();
};

const getRemainingTime = (resetDate: string, now: Date) => {
  if (!resetDate) return "Tidak ada jadwal";
  const target = new Date(resetDate).getTime();
  const diff = target - now.getTime();

  if (diff <= 0) return "Reset sedang diproses...";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);

  let result = "";
  if (days > 0) result += `${days} hari `;
  if (hours > 0 || days > 0) result += `${hours} jam `;
  result += `${minutes} mnt`;

  return result.trim();
};

const swalDark = Swal.mixin({
  background: "#1f2937",
  color: "#ffffff",
  confirmButtonColor: "#52C6F5",
});

export default function Dashboard({ userId }: { userId: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [selectedGame, setSelectedGame] = useState(GAMES[0]);
  const [selectedTaskName, setSelectedTaskName] = useState("ALL");

  // STATE BARU: Untuk mengatur buka/tutup panel notifikasi
  const [isUrgentOpen, setIsUrgentOpen] = useState(false);

  useEffect(() => {
    setSelectedTaskName("ALL");
  }, [selectedGame]);

  useEffect(() => {
    fetchTasks();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_tasks")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error) setTasks(data || []);
    setLoading(false);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedTaskName === "ALL") {
      const allTasksInGame = GAME_CATALOG[selectedGame];
      const newTasksToInsert = allTasksInGame.filter(
        (catalogTask) =>
          !tasks.some(
            (t) =>
              t.game_name === selectedGame && t.task_name === catalogTask.name,
          ),
      );

      if (newTasksToInsert.length === 0) {
        swalDark.fire({
          icon: "info",
          title: "Sudah Lengkap",
          text: "Semua tugas untuk game ini sudah ada di daftar kamu!",
        });
        return;
      }

      const payload = newTasksToInsert.map((t) => ({
        user_id: userId,
        game_name: selectedGame,
        task_name: t.name,
        task_type: t.type,
        next_reset: calculateNextReset(t.anchor, t.interval),
        interval_days: t.interval,
      }));

      const { data, error } = await supabase
        .from("user_tasks")
        .insert(payload)
        .select();
      if (!error && data) {
        setTasks([...tasks, ...data]);
        swalDark.fire({
          icon: "success",
          title: "Berhasil",
          text: "Semua tugas berhasil ditambahkan!",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } else {
      const taskDetails = GAME_CATALOG[selectedGame].find(
        (t) => t.name === selectedTaskName,
      );
      if (!taskDetails) return;

      if (
        tasks.some(
          (t) =>
            t.game_name === selectedGame && t.task_name === selectedTaskName,
        )
      ) {
        swalDark.fire({
          icon: "warning",
          title: "Tugas Duplikat",
          text: "Tugas ini sudah ada di daftar kamu!",
        });
        return;
      }

      const { data, error } = await supabase
        .from("user_tasks")
        .insert([
          {
            user_id: userId,
            game_name: selectedGame,
            task_name: taskDetails.name,
            task_type: taskDetails.type,
            next_reset: calculateNextReset(
              taskDetails.anchor,
              taskDetails.interval,
            ),
            interval_days: taskDetails.interval,
          },
        ])
        .select();

      if (!error && data) {
        setTasks([...tasks, data[0]]);
        swalDark.fire({
          icon: "success",
          title: "Berhasil",
          text: "Tugas ditambahkan!",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    }
  };

  const toggleTask = async (id: string, currentStatus: boolean) => {
    setTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, is_completed: !currentStatus } : t,
      ),
    );
    await supabase
      .from("user_tasks")
      .update({ is_completed: !currentStatus })
      .eq("id", id);
  };

  const deleteTask = async (id: string) => {
    const result = await swalDark.fire({
      title: "Hapus Tugas?",
      text: "Data yang dihapus tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      setTasks(tasks.filter((t) => t.id !== id));
      await supabase.from("user_tasks").delete().eq("id", id);
    }
  };

  const deleteAllTasksForGame = async (gameName: string) => {
    const result = await swalDark.fire({
      title: `Hapus semua misi ${gameName}?`,
      text: "Seluruh tugas pada game ini akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Bersihkan!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      setTasks(tasks.filter((t) => t.game_name !== gameName));
      await supabase.from("user_tasks").delete().eq("game_name", gameName);
      swalDark.fire({
        icon: "success",
        title: "Terhapus",
        text: `Daftar tugas ${gameName} telah dibersihkan.`,
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  const urgentTasks = tasks.filter((task) => {
    if (task.is_completed) return false;
    const target = new Date(task.next_reset).getTime();
    const now = currentTime.getTime();
    const diff = target - now;
    return diff > 0 && diff <= 3 * 24 * 60 * 60 * 1000;
  });

  return (
    <div className="space-y-8">
      {/* NOTIFICATION COLLAPSE */}
      {!loading && urgentTasks.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-accent bg-accent/10 shadow-[0_0_15px_rgba(255,148,82,0.15)] transition-all">
          {/* Header & Tombol Toggle */}
          <button
            onClick={() => setIsUrgentOpen(!isUrgentOpen)}
            className="flex w-full items-center justify-between p-5 transition-colors hover:bg-accent/20"
          >
            <h2 className="flex items-center gap-3 text-lg font-bold text-accent">
              <HiBellAlert className="h-6 w-6 text-accent" />
              Perhatian: Tenggat Waktu Dekat!
              <span className="ml-2 rounded-full bg-accent/20 px-2 py-0.5 text-xs text-accent">
                {urgentTasks.length} Misi
              </span>
            </h2>
            {/* Ikon panah yang berputar sesuai state */}
            <span
              className={`text-accent transition-transform duration-300 ${isUrgentOpen ? "rotate-180" : ""}`}
            >
              ▼
            </span>
          </button>

          {/* Area Konten (Tersembunyi/Muncul berdasarkan isUrgentOpen) */}
          {isUrgentOpen && (
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${isUrgentOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}
            >
              <div className="border-t border-accent/20 p-5 pt-2">
                <div className="grid gap-2 md:grid-cols-2">
                  {urgentTasks.map((task) => (
                    <div
                      key={`urgent-${task.id}`}
                      className="flex items-center justify-between rounded bg-gray-900/50 p-3 text-sm border border-accent/20"
                    >
                      <div>
                        <span className="font-bold text-white block">
                          {task.game_name}
                        </span>
                        <span className="text-gray-300">{task.task_name}</span>
                      </div>
                      <div className="text-right">
                        <span className="block font-semibold text-accent">
                          {getRemainingTime(task.next_reset, currentTime)}
                        </span>
                        <button
                          onClick={() => toggleTask(task.id, task.is_completed)}
                          className="mt-1 rounded bg-accent/20 px-2 py-0.5 text-[10px] font-bold hover:bg-accent hover:text-dark transition"
                        >
                          Tandai Selesai
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Form Input */}
      <div className="rounded-xl border border-gray-700 bg-gray-800 p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-primary">Daftarkan Misi</h2>
        <form
          onSubmit={handleAddTask}
          className="flex flex-col gap-4 md:flex-row"
        >
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="rounded-lg border border-gray-600 bg-gray-900 p-3 text-white focus:border-primary md:w-1/3"
          >
            {GAMES.map((game) => (
              <option key={game} value={game}>
                {game}
              </option>
            ))}
          </select>

          <select
            value={selectedTaskName}
            onChange={(e) => setSelectedTaskName(e.target.value)}
            className="flex-1 rounded-lg border border-gray-600 bg-gray-900 p-3 text-white focus:border-primary"
          >
            <option value="ALL" className="font-bold text-accent">
              -- Pilih Semua Task --
            </option>
            {GAME_CATALOG[selectedGame].map((task) => (
              <option key={task.name} value={task.name}>
                {task.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="rounded-lg bg-primary px-6 py-3 font-bold text-dark hover:bg-primary/80"
          >
            + Tambah
          </button>
        </form>
      </div>

      {/* List Tugas */}
      {loading ? (
        <p className="text-center text-gray-400">Menyinkronkan data...</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {GAMES.map((game) => {
            const gameTasks = tasks.filter((t) => t.game_name === game);
            if (gameTasks.length === 0) return null;

            return (
              <div
                key={game}
                className="rounded-xl border border-primary/20 bg-gray-900 p-5 shadow-lg"
              >
                <h3 className="mb-4 flex flex-col gap-3 border-b border-gray-700 pb-3 sm:flex-row sm:items-center sm:justify-between text-lg font-bold text-white">
                  <span>{game}</span>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-gray-800 px-2 py-1 text-xs text-accent">
                      {gameTasks.filter((t) => t.is_completed).length} /{" "}
                      {gameTasks.length} Selesai
                    </span>
                    <button
                      onClick={() => deleteAllTasksForGame(game)}
                      className="rounded bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-400 transition hover:bg-red-500 hover:text-white"
                      title={`Hapus semua tugas ${game}`}
                    >
                      Hapus Semua
                    </button>
                  </div>
                </h3>

                <ul className="space-y-4">
                  {gameTasks.map((task) => (
                    <li
                      key={task.id}
                      className="flex items-start justify-between group"
                    >
                      <label className="flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          checked={task.is_completed}
                          onChange={() =>
                            toggleTask(task.id, task.is_completed)
                          }
                          className="mt-1 h-5 w-5 shrink-0 rounded border-gray-500 text-primary"
                        />
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span
                              className={`${task.is_completed ? "text-gray-500 line-through" : "text-gray-200"}`}
                            >
                              {task.task_name}
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${task.task_type === "daily" ? "bg-primary/20 text-primary" : task.task_type === "weekly" ? "bg-accent/20 text-accent" : "bg-purple-500/20 text-purple-400"}`}
                            >
                              {task.task_type.toUpperCase()}
                            </span>
                          </div>
                          <span className="mt-0.5 text-xs text-gray-400 flex items-center gap-1">
                            ⏱ {getRemainingTime(task.next_reset, currentTime)}
                          </span>
                        </div>
                      </label>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-gray-500 opacity-0 hover:text-red-400 group-hover:opacity-100"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
