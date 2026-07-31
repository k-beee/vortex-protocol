import React, { useState } from "react";
import { X, TrendingUp, TrendingDown, ShieldAlert, ArrowRight, Check } from "lucide-react";
import type { VortexMarketRecord } from "../types/vortex";

interface PredictionModalProps {
  market: VortexMarketRecord | null;
  direction: "BULL" | "BEAR";
  isOpen: boolean;
  onClose: () => void;
  onSubmitPrediction: (vortexId: string, side: "BULL" | "BEAR", stakeGen: number) => Promise<void>;
  userAddress: string | null;
  onConnectWallet: () => void;
}

export const PredictionModal: React.FC<PredictionModalProps> = ({
  market,
  direction: initialDirection,
  isOpen,
  onClose,
  onSubmitPrediction,
  userAddress,
  onConnectWallet,
}) => {
  const [selectedDirection, setSelectedDirection] = useState<"BULL" | "BEAR">(initialDirection);
  const [stakeAmount, setStakeAmount] = useState<number>(2); // Default 2 GEN
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  if (!isOpen || !market) return null;

  const currentBullWei = Number(market.bull_pool_total) / 1e18;
  const currentBearWei = Number(market.bear_pool_total) / 1e18;
  const currentTotalWei = Number(market.aggregate_pool_total) / 1e18;

  // Pari-Mutuel return estimation logic
  const newTotal = currentTotalWei + stakeAmount;
  const newWinningPool = selectedDirection === "BULL" ? currentBullWei + stakeAmount : currentBearWei + stakeAmount;
  const estimatedReturn = newWinningPool > 0 ? (stakeAmount * newTotal) / newWinningPool : stakeAmount;
  const estimatedMultiplier = stakeAmount > 0 ? (estimatedReturn / stakeAmount).toFixed(2) : "1.00";

  const handleSubmit = async () => {
    if (!userAddress) {
      onConnectWallet();
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmitPrediction(market.vortex_id, selectedDirection, stakeAmount);
      setTxHash("0x8f3c...9a21");
      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="terminal-pane w-full max-w-lg p-0 shadow-terminal animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Titlebar */}
        <div className="pane-titlebar flex justify-between items-center">
          <span>// ENTER_PREDICTION // {market.pair}</span>
          <button onClick={onClose} className="hover:text-black">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 font-mono space-y-6">
          
          {/* Market Summary Header */}
          <div className="bg-vortex-deep p-4 border border-vortex-border">
            <div className="flex justify-between items-center mb-1">
              <span className="font-extrabold text-sm text-black">{market.pair}</span>
              <span className="cyber-badge text-[10px]">{market.time_frame}</span>
            </div>
            <p className="text-xs text-gray-600">{market.title_question}</p>
          </div>

          {/* Direction Selector Tabs */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">
              CHOOSE DIRECTIONAL POSITION:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedDirection("BULL")}
                className={`py-3 px-4 border font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                  selectedDirection === "BULL"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-cyber"
                    : "bg-vortex-deep text-gray-700 border-vortex-border hover:border-emerald-600"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>PREDICT BULL</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedDirection("BEAR")}
                className={`py-3 px-4 border font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                  selectedDirection === "BEAR"
                    ? "bg-rose-600 text-white border-rose-600 shadow-cyber"
                    : "bg-vortex-deep text-gray-700 border-vortex-border hover:border-rose-600"
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                <span>PREDICT BEAR</span>
              </button>
            </div>
          </div>

          {/* Stake Amount Selector */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-gray-500">STAKE AMOUNT (GEN):</span>
              <span className="font-bold text-vortex-accent text-sm">{stakeAmount} GEN</span>
            </div>

            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(Number(e.target.value))}
              className="w-full h-2 bg-vortex-deep rounded-lg appearance-none cursor-pointer accent-vortex-accent"
            />

            <div className="flex justify-between text-[10px] text-gray-400">
              <span>MIN: 1 GEN</span>
              <span>MAX: 10 GEN</span>
            </div>
          </div>

          {/* Pari-Mutuel Return Estimate */}
          <div className="bg-vortex-dim border border-vortex-border p-4 space-y-2 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>ESTIMATED RETURN:</span>
              <span className="font-bold text-black">{estimatedReturn.toFixed(2)} GEN</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>POOL PAYOUT MULTIPLIER:</span>
              <span className="font-bold text-vortex-accent">{estimatedMultiplier}x</span>
            </div>
            <div className="text-[10px] text-gray-500 pt-1 border-t border-vortex-border">
              Pari-mutuel calculation based on final pool ratios. Losing positions receive zero.
            </div>
          </div>

          {/* Wallet Directional Lock Warning */}
          <div className="flex items-start space-x-2 text-[11px] text-amber-800 bg-amber-50 p-3 border border-amber-200">
            <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Direction Lock:</strong> Once staked, your wallet cannot take the opposing position in this exact market interval.
            </span>
          </div>

          {/* Submit Transaction Button */}
          <div>
            {!userAddress ? (
              <button
                type="button"
                onClick={onConnectWallet}
                className="w-full btn-cyber"
              >
                [ CONNECT WALLET TO STAKE ]
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full btn-cyber flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <span>SUBMITTING SIGNED TRANSACTION...</span>
                ) : txHash ? (
                  <span className="text-emerald-400 flex items-center">
                    <Check className="w-4 h-4 mr-1" /> CONFIRMED ON STUDIONET!
                  </span>
                ) : (
                  <>
                    <span>SUBMIT PREDICTION ({stakeAmount} GEN)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
