"use client";

import { createGame } from "../actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function CreateGame() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError("");
    
    const name = formData.get("name") as string;
    
    if (!name || name.trim().length === 0) {
      setError("Please enter your name");
      setIsLoading(false);
      return;
    }

    try {
      const result = await createGame(name);
      if (result.success && result.code) {
        // Store playerId in localStorage for persistence across refreshes if needed
        // For MVP, we'll pass it via URL or just rely on the session if we had one
        // But since we don't have auth, we need to store it locally to identify the player
        localStorage.setItem(`player_id_${result.code}`, result.playerId!);
        router.push(`/lobby/${result.code}`);
      } else {
        setError("Failed to create game");
      }
    } catch (e) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center gap-4 text-center py-6">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-surface-dark border border-white/5 mb-2">
          <span className="material-symbols-outlined text-3xl text-primary">add_circle</span>
        </div>
        <h1 className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">
          Create Game
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Start a new session as the host
        </p>
      </div>

      <form action={handleSubmit} className="flex flex-col gap-6 w-full">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
            Your Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Enter your name"
            required
            className="w-full h-14 px-4 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="group relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-6 bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
          ) : (
            <span className="text-lg font-bold tracking-wide">Create Lobby</span>
          )}
        </button>
      </form>

      <Link
        href="/"
        className="mt-4 text-slate-500 dark:text-slate-400 text-sm hover:text-primary transition-colors text-center"
      >
        Cancel
      </Link>
    </>
  );
}
