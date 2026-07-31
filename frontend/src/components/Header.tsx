import React, { useState } from "react";
import { Terminal, Shield, Zap, Globe, Wallet, ExternalLink } from "lucide-react";
import { VORTEX_CHAIN_NAME, VORTEX_CONTRACT_ADDRESS } from "../config/vortexConfig";

interface HeaderProps {
  userAddress: string | null;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
  onOpenPortfolio: () => void;
  onOpenHowItWorks: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userAddress,
  onConnectWallet,
  onDisconnectWallet,
  onOpenPortfolio,
  onOpenHowItWorks,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-vortex-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-black flex items-center justify-center text-vortex-accent font-bold">
            <Zap className="w-5 h-5 text-vortex-accent" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-heading font-extrabold text-base tracking-wider text-black">
                VORTEX
              </span>
              <span className="text-vortex-accent text-xs font-bold font-mono">
                // ENGINE
              </span>
            </div>
            <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">
              Decentralized Consensus Prediction
            </p>
          </div>
        </div>

        {/* Navigation / Actions */}
        <div className="flex items-center space-x-4">
          
          {/* Network Badge */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-vortex-dim border border-vortex-border rounded-none text-xs font-mono">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-vortex-accent font-semibold">{VORTEX_CHAIN_NAME}</span>
          </div>

          {/* How It Works Button */}
          <button
            onClick={onOpenHowItWorks}
            className="hidden md:flex items-center space-x-1 px-3 py-1.5 border border-vortex-border text-gray-700 hover:text-black hover:border-vortex-accent text-xs font-mono transition-all"
          >
            <Shield className="w-3.5 h-3.5 text-vortex-accent" />
            <span>// ARCHITECTURE</span>
          </button>

          {/* Portfolio Drawer Button */}
          <button
            onClick={onOpenPortfolio}
            className="flex items-center space-x-1 px-3 py-1.5 border border-vortex-border text-black hover:bg-vortex-dim text-xs font-mono transition-all"
          >
            <Terminal className="w-3.5 h-3.5 text-vortex-accent" />
            <span>PORTFOLIO</span>
          </button>

          {/* Wallet Connect / Disconnect Button */}
          <div className="relative">
            {userAddress ? (
              <div>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 px-4 py-1.5 bg-black text-white border border-black hover:bg-vortex-accent text-xs font-mono font-bold transition-all"
                >
                  <Wallet className="w-3.5 h-3.5 text-vortex-accent" />
                  <span>[ {shortenAddress(userAddress)} ]</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 terminal-pane p-4 shadow-terminal z-50">
                    <div className="pane-titlebar mb-3">// WALLET_SESSION</div>
                    <div className="text-xs text-gray-600 font-mono mb-2">Connected Account:</div>
                    <div className="text-xs font-mono font-bold text-black break-all bg-vortex-dim p-2 mb-4 border border-vortex-border">
                      {userAddress}
                    </div>
                    <button
                      onClick={() => {
                        onDisconnectWallet();
                        setDropdownOpen(false);
                      }}
                      className="w-full btn-cyber bg-red-600 border-red-600 hover:bg-red-700 text-white"
                    >
                      DISCONNECT WALLET
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onConnectWallet}
                className="btn-cyber flex items-center space-x-2"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>[ CONNECT WALLET ]</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
