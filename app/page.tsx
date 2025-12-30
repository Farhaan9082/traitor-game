import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Branding / Header Section */}
      <div className="flex flex-col items-center justify-center gap-4 text-center py-6">
        {/* Icon/Logo Placeholder */}
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-surface-dark shadow-2xl shadow-primary/20 border border-white/5 mb-2">
          <span className="material-symbols-outlined text-4xl text-primary">
            visibility_off
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-slate-900 dark:text-white text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            SECRET
            <br />
            KEEPER
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-relaxed">
            No chits. Just roles.
          </p>
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="flex flex-col gap-4 w-full">
        {/* Create Game Button */}
        <Link
          href="/create"
          className="group relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-16 px-6 bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="material-symbols-outlined mr-3 text-[22px]">
            add_circle
          </span>
          <span className="text-lg font-bold tracking-wide">Create Game</span>
        </Link>

        {/* Join Game Button */}
        <Link
          href="/join"
          className="group relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-16 px-6 bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-[#252238] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          <span className="material-symbols-outlined mr-3 text-[22px] text-slate-400 dark:text-slate-500 group-hover:text-primary transition-colors">
            login
          </span>
          <span className="text-lg font-bold tracking-wide">Join Game</span>
        </Link>
      </div>

      {/* Footer / Meta Info */}
      <div className="mt-8 flex flex-col items-center justify-center gap-4">
        <div className="h-px w-16 bg-slate-200 dark:bg-white/10"></div>
        <p className="text-slate-400 dark:text-slate-600 text-xs font-medium tracking-widest uppercase">
          v1.0 • Beta
        </p>
      </div>
    </>
  );
}
