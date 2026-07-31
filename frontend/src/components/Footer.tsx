import React from "react";
import { Zap, ExternalLink, Github, Terminal } from "lucide-react";
import { VORTEX_CHAIN_NAME } from "../config/vortexConfig";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-vortex-border bg-white py-8 px-4 font-mono mt-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* Left Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 bg-black text-vortex-accent flex items-center justify-center font-bold">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="font-heading font-extrabold text-sm text-black tracking-wider">
              VORTEX PROTOCOL
            </span>
            <span className="text-[10px] text-vortex-accent font-bold block">
              GENLAYER STUDIONET
            </span>
          </div>
        </div>

        {/* Center Status */}
        <div className="text-xs text-gray-500 text-center">
          <div>VORTEX ENGINE v1.0.0 // STUDIONET DEPLOYMENT READY</div>
          <div className="text-[10px] text-gray-400 mt-0.5">
            5 Spot Exchanges (Binance · Bybit · Gate.io · MEXC · Bitget)
          </div>
        </div>

        {/* Right Links */}
        <div className="flex items-center space-x-4 text-xs">
          <a
            href="https://github.com/k-beee/vortex-protocol"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-black hover:text-vortex-accent font-bold"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GITHUB_REPOSITORY</span>
          </a>
        </div>

      </div>
    </footer>
  );
};
