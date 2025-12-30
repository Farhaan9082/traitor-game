"use client";

import { getGameStatus, startGame } from "../../actions";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import Link from "next/link";

interface Player {
  id: string;
  name: string;
  roleSeen: boolean;
}

export default function Lobby({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [status, setStatus] = useState<string>("waiting");
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    // Get playerId from localStorage
    const storedId = localStorage.getItem(`player_id_${code}`);
    if (storedId) {
      setPlayerId(storedId);
    } else {
      // If no player ID, redirect to join (or home)
      router.push("/join");
    }

    // Poll for game status
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
      // If success, the polling will catch the status change and redirect
    } catch (e) {
      setError("An unexpected error occurred");
      setIsStarting(false);
    }
  }

  // Check if current player is host (first player in list usually, but we should verify with ID if we had hostId in game object)
  // For MVP, we'll assume the first player in the list is the host since they created it.
  // Ideally, the backend should return "isHost" flag for the requesting player, but we are polling publicly.
  // Let's assume the first player in the array is the host.
  const isHost = players.length > 0 && playerId === players[0].id;

  return (
    <>
      <div className="flex flex-col items-center justify-center gap-4 text-center py-6">
        <div className="flex flex-col gap-1">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-widest">
            Game Code
          </p>
          <h1 className="text-slate-900 dark:text-white text-5xl font-bold tracking-tight font-display">
            {code}
          </h1>
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full flex-1">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-slate-900 dark:text-white text-lg font-bold">
            Players ({players.length})
          </h2>
          {players.length < 3 && (
            <span className="text-amber-500 text-xs font-medium bg-amber-500/10 px-2 py-1 rounded-md">
              Need 3+ to start
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3 w-full max-h-[400px] overflow-y-auto no-scrollbar">
          {players.map((player, index) => (
            <div
              key={player.id}
              className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 shadow-sm"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-lg">
                {player.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-slate-900 dark:text-white font-medium">
                  {player.name} {player.id === playerId && "(You)"}
                </span>
                {index === 0 && (
                  <span className="text-xs text-primary font-medium uppercase tracking-wider">
                    Host
                  </span>
                )}
              </div>
            </div>
          ))}
          
          {players.length === 0 && !error && (
            <div className="flex items-center justify-center p-8 text-slate-400 text-sm">
              Loading players...
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
          {error}
        </div>
      )}

      <div className="mt-auto w-full pt-6">
        {isHost ? (
          <button
            onClick={handleStartGame}
            disabled={players.length < 3 || isStarting}
            className="group relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-16 px-6 bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isStarting ? (
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
            ) : (
              <>
                <span className="material-symbols-outlined mr-3 text-[22px]">play_arrow</span>
                <span className="text-lg font-bold tracking-wide">Start Game</span>
              </>
            )}
          </button>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-center p-4 rounded-xl bg-white/5 border border-white/5">
            <span className="material-symbols-outlined text-slate-400 animate-pulse">hourglass_empty</span>
            <p className="text-slate-400 text-sm">Waiting for host to start...</p>
          </div>
        )}
        
        <Link
            href="/"
            className="mt-4 block text-slate-500 dark:text-slate-400 text-sm hover:text-primary transition-colors text-center"
        >
            Leave Lobby
        </Link>
      </div>
    </>
  );
}
