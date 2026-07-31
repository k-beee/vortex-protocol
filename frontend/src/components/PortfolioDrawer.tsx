import React, { useState } from "react";
import { X, Wallet, Trophy, RefreshCw, AlertCircle, ArrowUpRight, CheckCircle } from "lucide-react";
import type { VortexMarketRecord } from "../types/vortex";

interface PortfolioDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userAddress: string | null;
  markets: VortexMarketRecord[];
  onClaimPayout: (vortexId: string) => Promise<void>;
  onClaimRefund: (vortexId: string) => Promise<void>;
}

export const PortfolioDrawer: React.FC<PortfolioDrawerProps> = ({
  isOpen,
  onClose,
  userAddress,
  markets,
  onClaimPayout,
  onClaimRefund,
}) => {
  const [claimingId, setClaimingId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Demo user positions matching sample markets
  const demoPositions = [
    {
      vortex_id: "3",
      pair: "AVAXUSDT",
      direction: "BULL",
      stake: "5.0 GEN",
      status: "WON",
      payout: "8.1 GEN",
      state: "SETTLED",
      claimable: true,
    },
    {
      vortex_id: "0",
      pair: "BTCUSDT",
      direction: "BULL",
      stake: "3.0 GEN",
      status: "ACTIVE",
      payout: "PENDING",
      state: "OPEN",
      claimable: false,
    }
  ];

  const handleClaim = async (vortexId: string, type: "PAYOUT" | "REFUND") => {
    try {
      setClaimingId(vortexId);
      if (type === "PAYOUT") {
        await onClaimPayout(vortexId);
      } else {
        await onClaimRefund(vortexId);
      }
      setTimeout(() => setClaimingId(null), 1000);
    } catch (err) {
      console.error(err);
      setClaimingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="terminal-pane w-full max-w-md h-full p-0 shadow-terminal flex flex-col justify-between animate-in slide-in-from-right duration-200">
        
        {/* Header Titlebar */}
        <div>
          <div className="pane-titlebar flex justify-between items-center">
            <span>// PORTFOLIO_POSITIONS // {userAddress ? userAddress.slice(0, 8) + "..." : "GUEST"}</span>
            <button onClick={onClose} className="hover:text-black">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 font-mono space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
            
            {/* Wallet Summary */}
            {!userAddress ? (
              <div className="bg-vortex-dim p-4 border border-vortex-border text-center space-y-2 text-xs">
                <Wallet className="w-6 h-6 mx-auto text-vortex-accent" />
                <p className="text-gray-700">Connect wallet to view active positions and claim payouts.</p>
              </div>
            ) : (
              <div className="bg-vortex-deep p-4 border border-vortex-border space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">CONNECTED WALLET:</span>
                  <span className="font-bold text-black">{userAddress.slice(0, 6)}...{userAddress.slice(-4)}</span>
                </div>
                <div className="flex justify-between border-t border-vortex-border pt-2">
                  <span className="text-gray-500">NETWORK:</span>
                  <span className="font-bold text-vortex-accent">GENLAYER STUDIONET</span>
                </div>
              </div>
            )}

            {/* Positions List */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs text-gray-500 uppercase">// YOUR PREDICTIONS</span>
                <span className="cyber-badge text-[10px]">{demoPositions.length} POSITIONS</span>
              </div>

              {demoPositions.map((pos) => (
                <div key={pos.vortex_id} className="border border-vortex-border p-4 space-y-3 bg-white">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-black">{pos.pair}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold ${
                      pos.direction === "BULL" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    }`}>
                      {pos.direction}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 bg-vortex-deep p-2 border border-vortex-border">
                    <div>STAKE: <span className="font-bold text-black">{pos.stake}</span></div>
                    <div>STATUS: <span className="font-bold text-vortex-accent">{pos.status}</span></div>
                  </div>

                  {pos.claimable && (
                    <button
                      onClick={() => handleClaim(pos.vortex_id, "PAYOUT")}
                      disabled={claimingId === pos.vortex_id}
                      className="w-full py-2 bg-black hover:bg-vortex-accent text-white font-bold text-xs uppercase flex items-center justify-center space-x-1"
                    >
                      <Trophy className="w-3.5 h-3.5 text-vortex-accent" />
                      <span>{claimingId === pos.vortex_id ? "CLAIMING PAYOUT..." : `[ CLAIM PAYOUT (${pos.payout}) ]`}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-vortex-border bg-vortex-deep text-center font-mono text-[10px] text-gray-500">
          GenLayer Studionet Contract Automation Active
        </div>

      </div>
    </div>
  );
};
