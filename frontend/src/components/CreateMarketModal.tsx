import React, { useState } from "react";
import { X, PlusCircle, Calendar, ShieldCheck, Zap } from "lucide-react";
import { SUPPORTED_ASSETS } from "../config/vortexConfig";

interface CreateMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateMarket: (asset: string, candleStartTimestamp: number) => Promise<void>;
  userAddress: string | null;
  onConnectWallet: () => void;
}

export const CreateMarketModal: React.FC<CreateMarketModalProps> = ({
  isOpen,
  onClose,
  onCreateMarket,
  userAddress,
  onConnectWallet,
}) => {
  const [selectedAsset, setSelectedAsset] = useState<string>("BTC");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  // Calculate next valid UTC hour candle (must be at least 30 minutes in future)
  const now = Math.floor(Date.now() / 1000);
  const nextHourStart = Math.ceil((now + 1800) / 3600) * 3600;
  const candleEnd = nextHourStart + 3600;

  const formatUtcTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toISOString().replace("T", " ").slice(0, 16) + " UTC";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAddress) {
      onConnectWallet();
      return;
    }

    try {
      setIsSubmitting(true);
      await onCreateMarket(selectedAsset, nextHourStart);
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="terminal-pane w-full max-w-lg p-0 shadow-terminal animate-in fade-in zoom-in-95 duration-150">
        
        {/* Titlebar */}
        <div className="pane-titlebar flex justify-between items-center">
          <span>// OPEN_STUDIONET_MARKET</span>
          <button onClick={onClose} className="hover:text-black">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 font-mono space-y-6">
          
          <div className="bg-vortex-dim p-4 border border-vortex-border">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-vortex-accent" />
              <span className="font-extrabold text-sm text-black uppercase">INITIALIZE STUDIONET MARKET</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Create an official 1-hour UTC prediction market on your deployed Studionet contract (0x439A...513e).
            </p>
          </div>

          {/* Select Asset */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">
              SELECT CRYPTO ASSET (USDT QUOTE):
            </label>
            <div className="grid grid-cols-5 gap-2">
              {SUPPORTED_ASSETS.map((asset) => (
                <button
                  type="button"
                  key={asset}
                  onClick={() => setSelectedAsset(asset)}
                  className={`py-2 text-xs font-bold border transition-all ${
                    selectedAsset === asset
                      ? "bg-vortex-accent text-white border-vortex-accent"
                      : "bg-vortex-deep text-gray-700 border-vortex-border hover:border-black"
                  }`}
                >
                  {asset}
                </button>
              ))}
            </div>
          </div>

          {/* Candle Interval Specs */}
          <div className="bg-vortex-deep p-4 border border-vortex-border space-y-2 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>TARGET PAIR:</span>
              <span className="font-bold text-black">{selectedAsset}/USDT</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>CANDLE START (UTC):</span>
              <span className="font-bold text-vortex-accent">{formatUtcTime(nextHourStart)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>CANDLE END (UTC):</span>
              <span className="font-bold text-black">{formatUtcTime(candleEnd)}</span>
            </div>
            <div className="text-[10px] text-gray-500 pt-2 border-t border-vortex-border">
              Requires 5-exchange web consensus (Binance, Bybit, Gate.io, MEXC, Bitget) upon candle completion.
            </div>
          </div>

          {/* Submit Button */}
          <div>
            {!userAddress ? (
              <button
                type="button"
                onClick={onConnectWallet}
                className="w-full btn-cyber"
              >
                [ CONNECT WALLET TO INITIALIZE ]
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-cyber flex items-center justify-center space-x-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isSubmitting ? "OPENING MARKET ON STUDIONET..." : `OPEN ${selectedAsset} MARKET`}</span>
              </button>
            )}
          </div>

        </form>

      </div>
    </div>
  );
};
