import React, { useState, useEffect } from "react";
import { Shield, BookOpen, Layers, Github, LineChart } from "lucide-react";

interface NavbarProps {
  currentView: "dashboard" | "methodology" | "ticker-deep-dive";
  onViewChange: (view: "dashboard" | "methodology" | "ticker-deep-dive") => void;
  selectedTicker?: string;
}

export default function Navbar({ currentView, onViewChange, selectedTicker }: NavbarProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const formattedDate = time.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Brand Logo */}
        <button
          onClick={() => onViewChange("dashboard")}
          className="flex items-center gap-3 transition-all group cursor-pointer"
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded border border-red-500/20 bg-zinc-50 shadow-inner transition group-hover:border-red-500/50">
            {/* Corner brackets simulating scanner HUD */}
            <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-red-500/60 rounded-tl-sm transition group-hover:border-red-400"></div>
            <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-red-500/60 rounded-tr-sm transition group-hover:border-red-400"></div>
            <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-red-500/60 rounded-bl-sm transition group-hover:border-red-400"></div>
            <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-red-500/60 rounded-br-sm transition group-hover:border-red-400"></div>
            
            <LineChart className="h-5 w-5 text-red-600 transition group-hover:scale-105" />
          </div>
          
          <div className="flex flex-col items-start text-left leading-none">
            <span className="font-mono text-xs sm:text-sm font-black tracking-[0.25em] text-zinc-900 uppercase">
              Fin<span className="text-red-600">Signal</span>
            </span>
            <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-zinc-400 mt-1 font-bold">
              Forensic Suite
            </span>
          </div>
        </button>

        {/* Navigation Items */}
        <nav className="flex items-center gap-2 sm:gap-6">
          <button
            onClick={() => onViewChange("dashboard")}
            className={`px-1 py-1.5 text-[10px] sm:text-[11px] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-medium transition ${
              currentView === "dashboard"
                ? "text-zinc-900 border-b-2 border-red-600 font-semibold"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            Live Feed
          </button>

          <button
            onClick={() => onViewChange("methodology")}
            className={`px-1 py-1.5 text-[10px] sm:text-[11px] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-medium transition ${
              currentView === "methodology"
                ? "text-zinc-900 border-b-2 border-red-600 font-semibold"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            Methodology
          </button>

          {selectedTicker && (
            <button
              onClick={() => onViewChange("ticker-deep-dive")}
              className={`px-1 py-1.5 text-[10px] sm:text-[11px] uppercase tracking-[0.15em] sm:tracking-[0.2em] font-medium transition ${
                currentView === "ticker-deep-dive"
                  ? "text-zinc-900 border-b-2 border-red-600 font-semibold"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              Deep Dive ({selectedTicker})
            </button>
          )}
        </nav>

        {/* GitHub link & Local Clock */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-zinc-100 border border-zinc-200 rounded-full font-mono text-[10px] text-zinc-500">
            <span>{formattedDate}</span>
            <span className="text-zinc-300">|</span>
            <span className="text-zinc-800 font-bold tracking-wider">{formattedTime}</span>
          </div>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-zinc-950 transition"
          >
            <Github className="h-4.5 w-4.5" />
          </a>
        </div>
      </div>
    </header>
  );
}
