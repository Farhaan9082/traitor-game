"use client";

import { getRole } from "../../actions";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import clsx from "clsx";
import { Role } from "../../types";

export default function GameScreen({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
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
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isRevealed && countdown === 0) {
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
        setIsLocked(true);
      }
    } catch (e) {
      setError("An unexpected error occurred");
    }
  }

  return (
    <div className="flex flex-col h-screen w-full bg-[#121118] text-white overflow-hidden">
      {/* Ambient Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/20 blur-[100px] rounded-full pointer-events-none opacity-50"></div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-white/5 bg-[#121118]/80 backdrop-blur-md">
        <div className="flex items-center gap-3 text-white">
          <span
            className="material-symbols-outlined text-primary"
            style={{ fontSize: "24px" }}
          >
            theater_comedy
          </span>
          <h2 className="text-lg font-bold tracking-tight">Secret Keeper</h2>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10 p-6 overflow-y-auto">
        {/* Safety Warning */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="flex items-center gap-2 text-yellow-500 bg-yellow-500/10 px-3 py-1.5 rounded-full border border-yellow-500/20">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "16px" }}
            >
              visibility_off
            </span>
            <span className="text-xs font-bold uppercase tracking-wider">
              Private Eye Only
            </span>
          </div>
          <h1 className="text-white text-center text-xl font-medium leading-snug">
            Make sure no one is watching{" "}
            <span className="align-middle">👀</span>
          </h1>
        </div>

        {/* The Flip Card Area */}
        <div className="flex-1 flex items-center justify-center perspective-1000 my-4 group">
          <div
            onClick={handleReveal}
            className={clsx(
              "relative w-full max-w-[320px] h-full cursor-pointer transition-transform duration-700 transform-style-3d",
              isRevealed ? "rotate-y-180" : ""
            )}
          >
            {/* FACE 1: HIDDEN STATE (Card Back) */}
            <div className="absolute inset-0 w-full h-full backface-hidden">
              <div className="w-full h-full rounded-2xl bg-[#1e1c26] border border-white/10 shadow-xl overflow-hidden flex flex-col items-center justify-center relative">
                {/* Pattern Background */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary via-[#1e1c26] to-[#1e1c26]"></div>

                {/* Center Content */}
                <div className="relative z-10 flex flex-col items-center gap-6 animate-pulse-slow">
                  <div className="size-20 rounded-full bg-gradient-to-tr from-primary to-purple-400 p-[2px] shadow-[0_0_30px_rgba(79,48,232,0.6)]">
                    <div className="w-full h-full rounded-full bg-[#121118] flex items-center justify-center">
                      <span
                        className="material-symbols-outlined text-white"
                        style={{ fontSize: "40px" }}
                      >
                        {isLocked ? "lock" : "fingerprint"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <p className="text-white text-xl font-bold tracking-[0.2em] uppercase">
                      {isLocked ? "LOCKED" : "Tap to Reveal"}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Secret Role Assignment
                    </p>
                  </div>
                </div>

                {/* Decorative Corners */}
                <div className="absolute top-4 left-4 size-3 border-t-2 border-l-2 border-primary/50 rounded-tl-lg"></div>
                <div className="absolute top-4 right-4 size-3 border-t-2 border-r-2 border-primary/50 rounded-tr-lg"></div>
                <div className="absolute bottom-4 left-4 size-3 border-b-2 border-l-2 border-primary/50 rounded-bl-lg"></div>
                <div className="absolute bottom-4 right-4 size-3 border-b-2 border-r-2 border-primary/50 rounded-br-lg"></div>
              </div>
            </div>

            {/* FACE 2: REVEALED STATE (Card Face) */}
            <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
              <div
                className={clsx(
                  "w-full h-full rounded-2xl border shadow-[0_0_40px_-10px_rgba(79,48,232,0.4)] overflow-hidden flex flex-col relative",
                  role === "traitor"
                    ? "bg-red-950 border-red-500/50"
                    : role === "host"
                    ? "bg-amber-950 border-amber-500/50"
                    : "bg-[#1e1c26] border-primary/50"
                )}
              >
                {/* Card Header */}
                <div className="p-6 pb-2 text-center relative z-10">
                  <p className="text-[#a29db8] text-xs font-bold uppercase tracking-widest mb-1">
                    Your Identity
                  </p>
                  <h2
                    className={clsx(
                      "text-4xl font-black uppercase tracking-tight text-transparent bg-clip-text drop-shadow-sm",
                      role === "traitor"
                        ? "bg-gradient-to-br from-red-100 via-red-500 to-red-900"
                        : role === "host"
                        ? "bg-gradient-to-br from-amber-100 via-amber-500 to-amber-900"
                        : "bg-gradient-to-br from-white via-white to-gray-400"
                    )}
                  >
                    {role}
                  </h2>
                </div>

                {/* Card Image Area */}
                <div className="flex-1 relative flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-gradient-to-b from-[#1e1c26] via-primary/10 to-[#1e1c26] opacity-60"></div>

                  {/* Character Icon */}
                  <div className="relative w-48 h-48 rounded-full border-4 border-[#2b2938] shadow-2xl bg-[#141121] overflow-hidden flex items-center justify-center">
                    <span
                      className={clsx(
                        "material-symbols-outlined relative z-10 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]",
                        role === "traitor"
                          ? "text-red-500"
                          : role === "host"
                          ? "text-amber-500"
                          : "text-blue-500"
                      )}
                      style={{ fontSize: "80px" }}
                    >
                      {role === "traitor"
                        ? "domino_mask"
                        : role === "host"
                        ? "local_police"
                        : "person"}
                    </span>
                  </div>
                </div>

                {/* Card Content Area */}
                <div className="p-6 pt-2 text-center relative z-10 bg-gradient-to-t from-[#141121] via-[#141121] to-transparent">
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 mb-4">
                    <p className="text-gray-300 text-sm leading-relaxed font-medium">
                      {role === "traitor"
                        ? "Eliminate the crew without getting caught. Sabotage the mission."
                        : role === "host"
                        ? "Guide the game and ensure fair play. You are the moderator."
                        : "Find the traitor among you. Trust no one but yourself."}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "18px" }}
                    >
                      vpn_key_off
                    </span>
                    <span className="text-xs font-bold uppercase tracking-widest">
                      Top Secret
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status & Timer */}
        <div className="mt-6 flex flex-col gap-4">
          <div className="text-center space-y-1">
            <p className="text-white text-lg font-bold animate-pulse">
              Keep a straight face 😐
            </p>
            <p className="text-[#a29db8] text-sm">
              Don't let them see you react
            </p>
          </div>

          {/* Progress Bar */}
          {isRevealed && (
            <div className="bg-[#2b2938] rounded-full h-1.5 w-full overflow-hidden">
              <div
                className="bg-white h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-1000 ease-linear"
                style={{ width: `${(countdown / 5) * 100}%` }}
              ></div>
            </div>
          )}

          <div className="flex justify-between items-center text-xs text-[#6e6a7c] font-medium px-1">
            <span>{isRevealed ? "Auto-locking card..." : "Card locked"}</span>
            <span>{isRevealed ? `${countdown}s` : ""}</span>
          </div>
        </div>
      </main>

      {/* Footer Action */}
      <footer className="p-6 pt-2 relative z-10 bg-[#121118]">
        <button
          className="w-full h-14 bg-[#2b2938] text-[#6e6a7c] rounded-xl font-bold text-base tracking-wide flex items-center justify-center gap-2 cursor-not-allowed opacity-80"
          disabled
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "20px" }}
          >
            lock_clock
          </span>
          {isLocked ? "Card Locked" : "Wait for lock..."}
        </button>
      </footer>

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
        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}
