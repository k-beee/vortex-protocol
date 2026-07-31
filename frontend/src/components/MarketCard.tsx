import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Clock, ShieldCheck, Users, ChevronRight } from "lucide-react";
import type { VortexMarketRecord } from "../types/vortex";

interface MarketCardProps {
  market: VortexMarketRecord;
  onOpenPrediction: (market: VortexMarketRecord, side: "BULL" | "BEAR") => void;
  onInspectConsensus: (market: VortexMarketRecord) => void;
}

export const MarketCard: React.FC<MarketCardProps> = ({
  market,
  onOpenPrediction,
  onInspectConsensus,
}) => {
  const [timeLeft, setTimeLeft] = useState<string>("");

  const bullWei = Number(market.bull_pool_total);
  const bearWei = Number(market.bear_pool_total);
  const totalWei = bullWei + bearWei;

  const bullPct = totalWei > 0 ? Math.round((bullWei / totalWei) * 100) : 50;
  const bearPct = 100 - bullPct;

  const formatGen = (weiStr: string) => {
    const val = Number(weiStr) / 1e18;
    return val.toLocaleString(undefined, { maximumFractionDigits: 1 }) + " GEN";
  };

  const formatUtcTime = (timestampStr: string) => {
    const d = new Date(Number(timestampStr) * 1000);
    return d.toISOString().slice(11, 16) + " UTC";
  };

  useEffect(() => {
    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      const target = Number(market.candle_start);
      const diff = target - now;

      if (diff <= 0) {
        if (market.state === "OPEN") {
          setTimeLeft("INTERVAL IN PROGRESS");
        } else {
          setTimeLeft(market.state);
        }
      } else {
        const mins = Math.floor(diff / 60);
        const secs = diff % 60;
        setTimeLeft(`${mins}m ${secs < 10 ? "0" : ""}${secs}s TO CLOSE`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [market]);

  return (
    <div className="terminal-pane p-5 shadow-terminal flex flex-col justify-between hover:border-vortex-accent transition-all font-mono">
      
      {/* Card Header */}
      <div>
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-2">
            <span className="font-heading font-extrabold text-lg text-black tracking-wide">
              {market.pair}
            </span>
            <span className="cyber-badge text-[10px]">
              {market.time_frame}
            </span>
          </div>

          {/* Status Flag */}
          {market.state === "OPEN" ? (
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
              ● OPEN
            </span>
          ) : market.state === "SETTLED" ? (
            <span className="px-2 py-0.5 bg-vortex-dim text-vortex-accent border border-vortex-border text-[10px] font-bold">
              ✓ SETTLED ({market.outcome})
            </span>
          ) : (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold">
              ⚠️ {market.state}
            </span>
          )}
        </div>

        {/* Question Title */}
        <p className="text-xs text-gray-600 mb-4 line-clamp-2">
          {market.title_question}
        </p>

        {/* Time Window Details */}
        <div className="bg-vortex-deep p-3 border border-vortex-border mb-4 text-xs space-y-1">
          <div className="flex justify-between text-gray-500 text-[11px]">
            <span>UTC INTERVAL:</span>
            <span className="text-black font-bold">
              {formatUtcTime(market.candle_start)} - {formatUtcTime(market.candle_end)}
            </span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-vortex-border/50 text-[11px]">
            <span className="flex items-center text-gray-500">
              <Clock className="w-3 h-3 mr-1 text-vortex-accent" /> COUNTDOWN:
            </span>
            <span className="font-bold text-vortex-accent">{timeLeft}</span>
          </div>
        </div>

        {/* Pool Ratio Progress Bar */}
        <div className="space-y-1.5 mb-4">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-emerald-600 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> BULL {bullPct}%
            </span>
            <span className="text-rose-600 flex items-center">
              BEAR {bearPct}% <TrendingDown className="w-3.5 h-3.5 ml-1" />
            </span>
          </div>

          <div className="w-full bg-rose-200 h-2.5 flex overflow-hidden border border-vortex-border">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${bullPct}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-gray-500 pt-0.5">
            <span>Pool: {formatGen(market.bull_pool_total)}</span>
            <span>Total: {formatGen(market.aggregate_pool_total)}</span>
            <span>Pool: {formatGen(market.bear_pool_total)}</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-vortex-border space-y-2">
        {market.state === "OPEN" ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onOpenPrediction(market, "BULL")}
              className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase transition-all flex items-center justify-center"
            >
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> PREDICT BULL
            </button>

            <button
              onClick={() => onOpenPrediction(market, "BEAR")}
              className="py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase transition-all flex items-center justify-center"
            >
              <TrendingDown className="w-3.5 h-3.5 mr-1" /> PREDICT BEAR
            </button>
          </div>
        ) : (
          <button
            onClick={() => onInspectConsensus(market)}
            className="w-full btn-cyber-outline py-2 flex items-center justify-center space-x-1"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-vortex-accent" />
            <span>INSPECT CONSENSUS AUDIT</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

    </div>
  );
};
