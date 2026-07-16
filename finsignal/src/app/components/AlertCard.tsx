import React from "react";
import { AlertTriangle, TrendingUp, Volume2, Users, ArrowUpRight } from "lucide-react";
import { AnomalyAlert } from "../types";

interface AlertCardProps {
  alert: AnomalyAlert;
  onClick: (symbol: string) => void;
  key?: React.Key;
}

const SEVERITY_STYLES = {
  HIGH: {
    border: "border-b border-zinc-200/80 bg-red-50/60 hover:bg-zinc-50 border-l-4 border-l-red-600",
    badge: "text-red-600",
  },
  MEDIUM: {
    border: "border-b border-zinc-200/80 bg-white hover:bg-zinc-50 border-l-4 border-l-amber-500",
    badge: "text-amber-600",
  },
  LOW: {
    border: "border-b border-zinc-200/80 bg-white hover:bg-zinc-50 border-l-4 border-l-blue-500",
    badge: "text-blue-600",
  },
};

const TYPE_CONFIG = {
  VOLUME_SPIKE: {
    icon: Volume2,
    label: "VOLUME SPIKE",
  },
  PRICE_SURGE: {
    icon: TrendingUp,
    label: "PRICE SURGE",
  },
  PUMP_SIGNAL: {
    icon: AlertTriangle,
    label: "PUMP SIGNAL",
  },
  INSIDER_CLUSTER: {
    icon: Users,
    label: "INSIDER CLUSTER",
  },
  SHORT_SQUEEZE: {
    icon: TrendingUp,
    label: "SHORT SQUEEZE",
  },
};

export default function AlertCard({ alert, onClick }: AlertCardProps) {
  const sevStyle = alert.mitigated
    ? {
        border: "border-b border-zinc-200/80 bg-emerald-50/50 hover:bg-zinc-50 border-l-4 border-l-emerald-600",
        badge: "text-emerald-700",
      }
    : (SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.LOW);

  const typeStyle = TYPE_CONFIG[alert.type] || TYPE_CONFIG.VOLUME_SPIKE;

  return (
    <div
      onClick={() => onClick(alert.symbol)}
      className={`group p-4 transition-all duration-300 cursor-pointer ${sevStyle.border}`}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-lg font-bold text-zinc-900 tracking-tight flex items-center gap-2">
          {alert.symbol}
          {alert.mitigated && (
            <span className="rounded bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 text-[8px] font-mono font-bold text-emerald-800 uppercase tracking-widest animate-pulse">
              Mitigated
            </span>
          )}
        </span>
        <span className={`font-mono text-[10px] font-bold tracking-wider uppercase ${sevStyle.badge}`}>
          {alert.mitigated ? "LOW RISK" : `${alert.severity} RISK`}
        </span>
      </div>

      {/* Signal Row with elegant serif styling */}
      <div className="text-[11px] text-zinc-700 font-serif italic mb-1.5 flex items-center gap-1.5">
        <span>{typeStyle.label}</span>
      </div>

      {/* Detail description */}
      <p className="text-[12px] text-zinc-600 leading-snug mb-2">
        {alert.detail}
      </p>

      {/* Footer info: rule + timestamp */}
      <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono mt-1 pt-1.5 border-t border-zinc-100">
        <span className="truncate max-w-[200px] sm:max-w-[320px] font-sans text-[10px] text-zinc-400 italic">
          Lead: {alert.rule}
        </span>
        <span className="shrink-0 flex items-center gap-1 text-zinc-400 group-hover:text-red-600 transition-colors">
          {alert.timestamp} <ArrowUpRight className="h-3 w-3 inline" />
        </span>
      </div>
    </div>
  );
}
