"use client";

import { getGameStatus, startGame } from "../../actions";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import { toast } from "../../components/Toaster";

interface Player {
  id: string;
  name: string;
  roleSeen: boolean;
}

export default function Lobby({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [status, setStatus] = useState<string>("waiting");
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    const storedId = localStorage.getItem(`player_id_${code}`);
    if (storedId) {
      setPlayerId(storedId);
    } else {
      router.push("/join");
    }

    const interval = setInterval(async () => {
      const result = await getGameStatus(code);
      if (result.success && result.game) {
        setPlayers(result.game.players);
        setStatus(result.game.status);

        if (result.game.status === "started") {
          router.push(`/game/${code}`);
        }
      } else {
        setError("Lobby not found");
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [code, router]);

  async function handleStartGame() {
    setIsStarting(true);
    try {
      const result = await startGame(code);
      if (!result.success) {
        setError(result.error || "Failed to start game");
        setIsStarting(false);
      }
    } catch (e) {
      setError("An unexpected error occurred");
      setIsStarting(false);
    }
  }

  const isHost = players.length > 0 && playerId === players[0].id;

  return (
    <div className="flex flex-col h-screen w-full my-6">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#2b2938] px-6 py-4 bg-[#121118]/90 backdrop-blur-md sticky top-0 z-20 -mx-4 -mt-4 mb-6">
        <div className="flex items-center gap-3 text-white">
          <div className="flex items-center justify-center size-8 rounded-lg bg-primary/20 text-primary">
            <span className="material-symbols-outlined text-[20px]">
              extension
            </span>
          </div>
          <h2 className="text-base font-bold tracking-wide uppercase">
            Secret Keeper
          </h2>
        </div>
      </header>

      {/* Room Code Hero */}
      <div className="mb-8 flex flex-col gap-2 rounded-2xl bg-surface-dark border border-slate-800 p-6 text-center relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/10 blur-[50px] rounded-full"></div>
        <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">
          Room Code
        </p>
        <div className="flex items-center justify-center gap-3">
          <h1 className="text-5xl font-black tracking-tighter text-white">
            {code}
          </h1>
          <button
            onClick={() => {
              navigator.clipboard.writeText(code);
              toast("Code copied!", "success");
            }}
            className="text-slate-400 hover:text-white transition-colors"
            title="Copy Code"
          >
            <span className="material-symbols-outlined text-[20px]">
              content_copy
            </span>
          </button>
        </div>
        <p className="mt-2 text-[#a29db8] text-sm font-body">
          Lobby - Waiting for players to join...
        </p>
      </div>

      {/* Player Count Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">groups</span>
          {players.length} Players Joined
        </h2>
        {players.length >= 3 && (
          <span className="text-xs font-bold bg-primary/20 text-primary px-2 py-1 rounded-md uppercase tracking-wider">
            Ready
          </span>
        )}
      </div>

      {/* Players Grid */}
      <div className="grid grid-cols-2 gap-3 mb-20">
        {players.map((player, index) => (
          <div
            key={player.id}
            className={`group flex items-center gap-3 rounded-xl border p-3 transition-all ${
              player.id === playerId
                ? "border-primary/50 bg-primary/10"
                : "border-slate-800 bg-surface-dark hover:border-primary/30"
            }`}
          >
            <div
              className={`flex size-10 items-center justify-center rounded-full shadow-lg ${
                player.id === playerId
                  ? "bg-primary text-white shadow-primary/30"
                  : "bg-[#2b2938] text-[#a29db8] group-hover:text-white transition-colors"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {index === 0 ? "person_check" : "face"}
              </span>
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-bold leading-tight text-white">
                {player.name} {player.id === playerId && "(You)"}
              </span>
              <span
                className={`text-[10px] uppercase font-bold tracking-wide ${
                  index === 0 ? "text-primary" : "text-slate-500"
                }`}
              >
                {index === 0 ? "Host" : "Ready"}
              </span>
            </div>
          </div>
        ))}

        {/* Invite Card */}
        <button
          onClick={() => {
            const url = `${window.location.origin}/join?code=${code}`;
            navigator.clipboard.writeText(url);
            toast("Link copied!", "success");
          }}
          className="group flex items-center gap-3 rounded-xl border border-dashed border-[#2b2938] bg-transparent p-3 hover:border-primary/50 hover:bg-[#1e1c26] transition-all"
        >
          <div className="flex size-10 items-center justify-center rounded-full bg-[#2b2938]/50 text-[#a29db8] group-hover:text-white group-hover:bg-primary/20 transition-colors">
            <span className="material-symbols-outlined text-[20px]">add</span>
          </div>
          <div className="flex flex-col items-start overflow-hidden">
            <span className="truncate text-sm font-bold leading-tight text-slate-400 group-hover:text-white">
              Invite Player
            </span>
          </div>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
          {error}
        </div>
      )}

      {/* Bottom Floating Action Bar */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#121118] via-[#121118] to-transparent z-10 flex justify-center pointer-events-none">
        <div className="w-full max-w-[400px] flex flex-col gap-3 pointer-events-auto">
          {/* Tip */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mb-1 opacity-70">
            <span className="material-symbols-outlined text-[14px]">
              tips_and_updates
            </span>
            <span>Tip: The imposter can disable lights.</span>
          </div>

          {isHost ? (
            <button
              onClick={handleStartGame}
              disabled={players.length < 3 || isStarting}
              className="relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 bg-primary text-white shadow-[0_0_20px_rgba(79,48,232,0.4)] hover:shadow-[0_0_30px_rgba(79,48,232,0.6)] hover:bg-[#5f42f5] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              <span className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity"></span>
              <div className="flex items-center gap-2">
                {isStarting ? (
                  <span className="material-symbols-outlined animate-spin">
                    progress_activity
                  </span>
                ) : (
                  <>
                    <span className="text-base font-bold tracking-wide">
                      Assign Roles & Start
                    </span>
                    <span className="material-symbols-outlined text-[20px]">
                      arrow_forward
                    </span>
                  </>
                )}
              </div>
            </button>
          ) : (
            <div className="w-full h-14 bg-[#2b2938] text-[#6e6a7c] rounded-xl font-bold text-base tracking-wide flex items-center justify-center gap-2 cursor-not-allowed opacity-80">
              <span
                className="material-symbols-outlined animate-pulse"
                style={{ fontSize: "20px" }}
              >
                hourglass_empty
              </span>
              Waiting for host...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
