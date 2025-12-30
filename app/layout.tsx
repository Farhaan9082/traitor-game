import type { Metadata } from "next";
import { Space_Grotesk, Noto_Sans } from "next/font/google";
import "./globals.css";
import clsx from "clsx";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-noto-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Secret Keeper",
  description: "No chits. Just roles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body
        className={clsx(
          spaceGrotesk.variable,
          notoSans.variable,
          "font-display antialiased bg-background-light dark:bg-background-dark min-h-screen selection:bg-primary selection:text-white overflow-hidden"
        )}
      >
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4">
           {/* Background Ambience */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 dark:bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
           
           {/* Mobile Container Wrapper */}
           <div className="relative z-10 w-full max-w-[400px] flex flex-col gap-10 animate-fade-in">
              {children}
           </div>

            {/* Decorative corner elements */}
            <div className="absolute top-6 left-6 opacity-20 hidden md:block pointer-events-none">
                <span className="material-symbols-outlined text-6xl text-slate-500 rotate-12">casino</span>
            </div>
            <div className="absolute bottom-6 right-6 opacity-20 hidden md:block pointer-events-none">
                <span className="material-symbols-outlined text-6xl text-slate-500 -rotate-12">extension</span>
            </div>
        </div>
      </body>
    </html>
  );
}
