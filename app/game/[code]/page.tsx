"use client";

import { getRole } from "../../actions";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import clsx from "clsx";
import { Role } from "../../types";

export default function GameScreen({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(5);
  const [playerId, setPlayerId] = useState<string | null>(null);

  useEffect(() => {
    const storedId = localStorage.getItem(`player_id_${code}`);
    if (storedId) {
      setPlayerId(storedId);
    } else {
      router.push("/join");
    }
  }, [code, router]);

  useEffect(() => {
    if (isRevealed && countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isRevealed && countdown === 0) {
      // Auto-hide
      setIsRevealed(false);
      setIsLocked(true);
    }
  }, [isRevealed, countdown]);

  async function handleReveal() {
    if (isLocked || isRevealed || !playerId) return;

    try {
      const result = await getRole(code, playerId);
      if (result.success && result.role) {
        setRole(result.role);
        setIsRevealed(true);
      } else {
        setError(result.error || "Failed to reveal role");
        setIsLocked(true); // Lock if error (e.g. already seen)
      }
    } catch (e) {
      setError("An unexpected error occurred");
    }
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center gap-4 text-center py-6">
        <h1 className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">
          Your Role
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          {isLocked 
            ? "Your role is now hidden forever." 
            : "Tap the card to reveal your role."}
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center w-full perspective-1000 min-h-[400px]">
        <div 
          onClick={handleReveal}
          className={clsx(
            "relative w-full max-w-[320px] aspect-[3/4] transition-all duration-700 transform-style-3d cursor-pointer",
            isRevealed ? "rotate-y-180" : ""
          )}
        >
          {/* Front of Card (Face Down) */}
          <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl bg-surface-dark border border-white/10 shadow-2xl flex flex-col items-center justify-center gap-6 p-8 overflow-hidden group">
            {/* Pattern */}
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
            
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500">
              <span className="material-symbols-outlined text-5xl text-slate-400">
                {isLocked ? "lock" : "touch_app"}
              </span>
            </div>
            
            <div className="text-center">
              <h3 className="text-white text-xl font-bold mb-2">
                {isLocked ? "LOCKED" : "TAP TO REVEAL"}
              </h3>
              <p className="text-slate-400 text-sm">
                {isLocked ? "You have already seen your role" : "You can only see this once"}
              </p>
            </div>
          </div>

          {/* Back of Card (Face Up - Role) */}
          <div className={clsx(
            "absolute inset-0 w-full h-full backface-hidden rounded-2xl shadow-2xl flex flex-col items-center justify-center gap-6 p-8 rotate-y-180 border",
            role === "traitor" ? "bg-red-950 border-red-500/30" : 
            role === "host" ? "bg-amber-950 border-amber-500/30" : 
            "bg-blue-950 border-blue-500/30"
          )}>
            <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white">
              {countdown}
            </div>

            <div className={clsx(
              "w-32 h-32 rounded-full flex items-center justify-center border-2 mb-4",
              role === "traitor" ? "bg-red-500/20 border-red-500 text-red-500" : 
              role === "host" ? "bg-amber-500/20 border-amber-500 text-amber-500" : 
              "bg-blue-500/20 border-blue-500 text-blue-500"
            )}>
              <span className="material-symbols-outlined text-6xl">
                {role === "traitor" ? "theater_comedy" : 
                 role === "host" ? "local_police" : 
                 "person"}
              </span>
            </div>
            
            <div className="text-center">
              <h2 className={clsx(
                "text-3xl font-bold mb-2 uppercase tracking-widest",
                role === "traitor" ? "text-red-500" : 
                role === "host" ? "text-amber-500" : 
                "text-blue-500"
              )}>
                {role}
              </h2>
              <p className="text-white/60 text-sm">
                {role === "traitor" ? "Eliminate the innocents." : 
                 role === "host" ? "Guide the game." : 
                 "Find the traitor."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center mt-4">
          {error}
        </div>
      )}
      
      {/* CSS for 3D Transform */}
      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </>
  );
}
