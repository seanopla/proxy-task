import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface Task {
  id: string;
  game_name: string;
  task_name: string;
  task_type: "daily" | "weekly";
  is_completed: boolean;
}

const GAMES = [
  "Wuthering Waves",
  "Zenless Zone Zero",
  "Arknights Endfield",
  "P5X",
];

export default function Dashboard({ userId }: { userId: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // State untuk form tambah tugas
  const [newTask, setNewTask] = useState("");
  const [selectedGame, setSelectedGame] = useState(GAMES[0]);
  const [selectedType, setSelectedType] = useState<"daily" | "weekly">("daily");

  // Mengambil data dari Supabase saat komponen dimuat
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_tasks")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) console.error("Gagal mengambil data:", error);
    else setTasks(data || []);
    setLoading(false);
  };

  // Fungsi menambah tugas baru
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const { data, error } = await supabase
      .from("user_tasks")
      .insert([
        {
          user_id: userId,
          game_name: selectedGame,
          task_name: newTask,
          task_type: selectedType,
        },
      ])
      .select();

    if (error) {
      console.error("Gagal menambah tugas:", error);
    } else if (data) {
      setTasks([...tasks, data[0]]);
      setNewTask(""); // Kosongkan input setelah berhasil
    }
  };

  // Fungsi mencentang/menghapus centang tugas
  const toggleTask = async (id: string, currentStatus: boolean) => {
    // Update state lokal dulu agar UI terasa cepat (Optimistic UI)
    setTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, is_completed: !currentStatus } : t,
      ),
    );

    const { error } = await supabase
      .from("user_tasks")
      .update({ is_completed: !currentStatus })
      .eq("id", id);

    if (error) {
      console.error("Gagal update status:", error);
      fetchTasks(); // Kembalikan ke semula jika gagal di database
    }
  };

  // Fungsi menghapus tugas
  const deleteTask = async (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
    await supabase.from("user_tasks").delete().eq("id", id);
  };

  return (
    <div className="space-y-8">
      {/* Area Input Tugas Baru */}
      <div className="rounded-xl border border-gray-700 bg-gray-800 p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-primary">
          Tambah Misi Baru
        </h2>
        <form
          onSubmit={handleAddTask}
          className="flex flex-col gap-3 md:flex-row"
        >
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="rounded-lg border border-gray-600 bg-gray-900 p-3 text-white focus:border-primary focus:outline-none md:w-1/4"
          >
            {GAMES.map((game) => (
              <option key={game} value={game}>
                {game}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) =>
              setSelectedType(e.target.value as "daily" | "weekly")
            }
            className="rounded-lg border border-gray-600 bg-gray-900 p-3 text-white focus:border-primary focus:outline-none md:w-1/5"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>

          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Nama tugas (misal: Simulated Universe)..."
            className="flex-1 rounded-lg border border-gray-600 bg-gray-900 p-3 text-white focus:border-primary focus:outline-none"
          />

          <button
            type="submit"
            className="rounded-lg bg-primary px-6 py-3 font-bold text-dark transition hover:bg-primary/80"
          >
            + Tambah
          </button>
        </form>
      </div>

      {/* Menampilkan Daftar Tugas dikelompokkan per Game */}
      {loading ? (
        <p className="text-center text-gray-400">Memuat data proxy...</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {GAMES.map((game) => {
            // Filter tugas hanya untuk game yang sedang di-looping
            const gameTasks = tasks.filter((t) => t.game_name === game);
            if (gameTasks.length === 0) return null; // Sembunyikan card jika tidak ada tugas

            return (
              <div
                key={game}
                className="rounded-xl border border-primary/20 bg-gray-900 p-5 shadow-lg"
              >
                <h3 className="mb-4 flex items-center justify-between border-b border-gray-700 pb-2 text-lg font-bold text-white">
                  {game}
                  <span className="rounded bg-gray-800 px-2 py-1 text-xs text-accent">
                    {gameTasks.filter((t) => t.is_completed).length} /{" "}
                    {gameTasks.length} Selesai
                  </span>
                </h3>

                <ul className="space-y-3">
                  {gameTasks.map((task) => (
                    <li
                      key={task.id}
                      className="flex items-center justify-between group"
                    >
                      <label className="flex cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          checked={task.is_completed}
                          onChange={() =>
                            toggleTask(task.id, task.is_completed)
                          }
                          className="h-5 w-5 rounded border-gray-500 text-primary accent-primary focus:ring-primary"
                        />
                        <span
                          className={`${task.is_completed ? "text-gray-500 line-through" : "text-gray-200"} transition-all`}
                        >
                          {task.task_name}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${task.task_type === "daily" ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"}`}
                        >
                          {task.task_type}
                        </span>
                      </label>

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-gray-500 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
                        title="Hapus Misi"
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
