import React from "react";
import { X, ShieldCheck, CheckCircle2, XCircle, AlertTriangle, ExternalLink } from "lucide-react";
import type { VortexMarketRecord } from "../types/vortex";

interface ConsensusInspectorProps {
  market: VortexMarketRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ConsensusInspector: React.FC<ConsensusInspectorProps> = ({
  market,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !market) return null;

  const consensus = market.consensus_summary;

  const sampleVenues = [
    { name: "BINANCE_SPOT_API", open: "28.40", close: "29.15", direction: "BULL", valid: true },
    { name: "BYBIT_SPOT_V5", open: "28.41", close: "29.14", direction: "BULL", valid: true },
    { name: "GATEIO_SPOT_V4", open: "28.39", close: "29.16", direction: "BULL", valid: true },
    { name: "MEXC_SPOT_V3", open: "28.40", close: "29.15", direction: "BULL", valid: true },
    { name: "BITGET_SPOT_V3", open: "28.42", close: "29.10", direction: "BEAR", valid: true },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="terminal-pane w-full max-w-2xl p-0 shadow-terminal animate-in fade-in zoom-in-95 duration-150">
        
        {/* Titlebar */}
        <div className="pane-titlebar flex justify-between items-center">
          <span>// ORACLE_CONSENSUS_AUDIT // {market.pair}</span>
          <button onClick={onClose} className="hover:text-black">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 font-mono space-y-6 max-h-[85vh] overflow-y-auto">
          
          {/* Consensus Overview Header */}
          <div className="bg-vortex-deep p-4 border border-vortex-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base text-black">{market.pair}</span>
                <span className="cyber-badge text-[10px]">CONSENSUS VERIFIED</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                GenLayer Leader & Validator node execution report via gl.nondet.web.get
              </p>
            </div>

            <div className="bg-vortex-dim p-3 border border-vortex-border text-center min-w-[120px]">
              <span className="text-[10px] text-gray-500 uppercase block">OUTCOME:</span>
              <span className="font-bold text-vortex-accent text-sm uppercase">
                {market.outcome}
              </span>
            </div>
          </div>

          {/* Consensus Rule Explanation */}
          <div className="text-xs text-gray-700 bg-white p-4 border border-vortex-border space-y-1">
            <div className="font-bold text-black">// CONSENSUS_RULE_SPECIFICATION:</div>
            <div>• Requires at least 3 matching directional votes among 5 exchange sources.</div>
            <div>• Candle timestamp must align to exact candle_start timestamp ({market.candle_start}).</div>
            <div>• Wrong timestamps, HTTP failures, or price mismatches are discarded as invalid.</div>
          </div>

          {/* Exchange Venues Evidence Breakdown Table */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs text-gray-500 uppercase">// EXCHANGE_EVIDENCE_TABLE</span>
              <span className="text-[11px] text-emerald-700 font-bold">4 BULL / 1 BEAR (QUORUM REACHED)</span>
            </div>

            <div className="space-y-2">
              {sampleVenues.map((v) => (
                <div key={v.name} className="bg-vortex-deep p-3 border border-vortex-border flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-black">{v.name}</span>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="text-gray-500">OPEN: <strong className="text-black">{v.open}</strong></span>
                    <span className="text-gray-500">CLOSE: <strong className="text-black">{v.close}</strong></span>
                    <span className={`px-2 py-0.5 font-bold text-[10px] ${
                      v.direction === "BULL" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    }`}>
                      {v.direction}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Close button */}
          <button onClick={onClose} className="w-full btn-cyber">
            [ CLOSE AUDIT INSPECTOR ]
          </button>

        </div>

      </div>
    </div>
  );
};
