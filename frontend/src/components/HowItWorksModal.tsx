import React from "react";
import { X, Shield, Globe, Cpu, Trophy, RefreshCw } from "lucide-react";

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const steps = [
    {
      num: "01",
      title: "MARKET INITIALIZATION",
      desc: "Authorized market operator creates a decision market for BTC, ETH, SOL, BNB, or AVAX.",
      icon: Shield,
    },
    {
      num: "02",
      title: "PREDICTION STAKING",
      desc: "Participants select BULL or BEAR and stake between 1 GEN and 10 GEN. Betting closes as soon as the candle window begins.",
      icon: Cpu,
    },
    {
      num: "03",
      title: "5-EXCHANGE WEB FETCHING",
      desc: "When the candle interval closes, GenLayer Leader & Validator nodes query Binance, Bybit, Gate.io, MEXC, and Bitget spot APIs directly via gl.nondet.web.get.",
      icon: Globe,
    },
    {
      num: "04",
      title: "3-OF-5 CONSENSUS GATE",
      desc: "At least 3 matching directional votes are required to settle a market. Stale timestamps, outages, or disagreements trigger an INCONCLUSIVE outcome.",
      icon: RefreshCw,
    },
    {
      num: "05",
      title: "ON-CHAIN DISBURSAL",
      desc: "Winning participants claim proportional pari-mutuel payouts directly from contract storage. Inconclusive or aborted markets allow 100% GEN refunds.",
      icon: Trophy,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="terminal-pane w-full max-w-3xl p-0 shadow-terminal animate-in fade-in zoom-in-95 duration-150">
        
        {/* Titlebar */}
        <div className="pane-titlebar flex justify-between items-center">
          <span>// PROTOCOL_ARCHITECTURE_SPECIFICATION</span>
          <button onClick={onClose} className="hover:text-black">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 font-mono space-y-6 max-h-[85vh] overflow-y-auto">
          
          <div className="bg-vortex-dim p-4 border border-vortex-border">
            <h2 className="font-heading font-extrabold text-base text-black uppercase">
              VORTEX ENGINE ARCHITECTURE // GENLAYER STUDIONET
            </h2>
            <p className="text-xs text-gray-700 mt-1">
              Vortex Protocol eliminates oracle central points of failure by embedding multi-venue Web API consensus directly inside GenLayer Intelligent Contracts.
            </p>
          </div>

          {/* Workflow Steps Grid */}
          <div className="space-y-3">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.num} className="bg-vortex-deep p-4 border border-vortex-border flex items-start space-x-4">
                  <div className="w-8 h-8 bg-black text-vortex-accent flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {step.num}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4 text-vortex-accent" />
                      <span className="font-bold text-sm text-black">{step.title}</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <button onClick={onClose} className="w-full btn-cyber">
            [ CLOSE ARCHITECTURE SPECIFICATION ]
          </button>

        </div>

      </div>
    </div>
  );
};
