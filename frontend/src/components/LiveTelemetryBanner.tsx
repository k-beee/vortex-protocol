import React from "react";
import { Activity, ShieldCheck, Database, Cpu } from "lucide-react";
import type { ProtocolTelemetry } from "../types/vortex";

interface LiveTelemetryBannerProps {
  telemetry: ProtocolTelemetry;
}

export const LiveTelemetryBanner: React.FC<LiveTelemetryBannerProps> = ({ telemetry }) => {
  const formatWeiToGen = (weiStr: string) => {
    const val = Number(weiStr) / 1e18;
    return val.toLocaleString(undefined, { maximumFractionDigits: 2 }) + " GEN";
  };

  return (
    <div className="w-full bg-vortex-deep border-b border-vortex-border py-2 px-4 overflow-x-auto font-mono text-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between space-x-6 min-w-[700px]">
        
        {/* Active Markets */}
        <div className="flex items-center space-x-2">
          <Activity className="w-3.5 h-3.5 text-vortex-accent" />
          <span className="text-gray-500 uppercase tracking-wider text-[10px]">ACTIVE_MARKETS:</span>
          <span className="font-bold text-vortex-accent">{telemetry.active_markets}</span>
        </div>

        {/* Consensus Quorum */}
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-gray-500 uppercase tracking-wider text-[10px]">CONSENSUS_QUORUM:</span>
          <span className="font-bold text-black">3/5 VENUES MATCH</span>
        </div>

        {/* Total Staked Volume */}
        <div className="flex items-center space-x-2">
          <Database className="w-3.5 h-3.5 text-vortex-purple" />
          <span className="text-gray-500 uppercase tracking-wider text-[10px]">STAKED_VOLUME:</span>
          <span className="font-bold text-vortex-accent">{formatWeiToGen(telemetry.total_staked_volume)}</span>
        </div>

        {/* Network Mode */}
        <div className="flex items-center space-x-2">
          <Cpu className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-gray-500 uppercase tracking-wider text-[10px]">NETWORK:</span>
          <span className="font-bold text-black">GENLAYER STUDIONET</span>
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[10px] text-emerald-600 font-bold tracking-widest">TELEMETRY_ONLINE</span>
        </div>

      </div>
    </div>
  );
};
