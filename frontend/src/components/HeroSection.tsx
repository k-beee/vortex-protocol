import React, { useState, useEffect } from "react";
import { Terminal, Shield, ArrowRight, Zap, CheckCircle2 } from "lucide-react";

interface HeroSectionProps {
  onBrowseClick: () => void;
  onArchitectureClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onBrowseClick,
  onArchitectureClick,
}) => {
  const [activeVenue, setActiveVenue] = useState(0);

  const venues = [
    { name: "BINANCE_SPOT_API", status: "200 OK", delay: "42ms", pair: "BTCUSDT" },
    { name: "BYBIT_SPOT_V5", status: "200 OK", delay: "38ms", pair: "ETHUSDT" },
    { name: "GATEIO_SPOT_V4", status: "200 OK", delay: "51ms", pair: "SOLUSDT" },
    { name: "MEXC_SPOT_V3", status: "200 OK", delay: "47ms", pair: "BNBUSDT" },
    { name: "BITGET_SPOT_V3", status: "200 OK", delay: "45ms", pair: "AVAXUSDT" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveVenue((prev) => (prev + 1) % venues.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        
        {/* Left Column - Main Copy */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-vortex-dim border border-vortex-border text-vortex-accent font-mono text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-vortex-accent animate-pulse" />
            <span>GenLayer Studionet Intelligent Contract</span>
          </div>

          <h1 className="font-heading font-black text-3xl sm:text-5xl text-black tracking-tight leading-tight uppercase">
            Decentralized <span className="text-vortex-accent underline decoration-vortex-purple/40">Multi-Venue</span> Prediction Engine
          </h1>

          <p className="text-gray-700 font-mono text-sm sm:text-base leading-relaxed max-w-2xl">
            Vortex lets users predict directional price movements for BTC, ETH, SOL, BNB, and AVAX. 
            Outcomes are settled by GenLayer Intelligent Contracts fetching completed candle data directly 
            across 5 major exchanges with 3-of-5 consensus verification.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={onBrowseClick}
              className="btn-cyber flex items-center space-x-2 shadow-cyber"
            >
              <span>[ BROWSE MARKETS ]</span>
              <ArrowRight className="w-4 h-4 text-vortex-accent" />
            </button>

            <button
              onClick={onArchitectureClick}
              className="btn-cyber-outline flex items-center space-x-2"
            >
              <Shield className="w-4 h-4" />
              <span>// HOW CONSENSUS WORKS</span>
            </button>
          </div>

          {/* Value Props Grid */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-vortex-border">
            <div className="space-y-1">
              <div className="text-xs font-mono text-gray-500 uppercase">VENUES:</div>
              <div className="font-bold font-mono text-black text-sm">5 Spot Exchanges</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-mono text-gray-500 uppercase">QUORUM:</div>
              <div className="font-bold font-mono text-vortex-accent text-sm">3-of-5 Consensus</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-mono text-gray-500 uppercase">NETWORK:</div>
              <div className="font-bold font-mono text-black text-sm">Studionet IC</div>
            </div>
          </div>

        </div>

        {/* Right Column - Cyber Terminal Panel */}
        <div className="lg:col-span-5">
          <div className="terminal-pane p-0 shadow-terminal">
            <div className="pane-titlebar flex justify-between items-center">
              <span>// VORTEX_ORACLE_MONITOR</span>
              <span className="text-[10px] text-emerald-600 font-normal">STUDIONET_POLLING</span>
            </div>

            <div className="p-5 font-mono text-xs space-y-4">
              <div className="text-gray-500 text-[11px]">
                Leader & Validator nodes fetching multi-exchange candle evidence via gl.nondet.web.get:
              </div>

              {/* Venues status stream */}
              <div className="space-y-2 bg-vortex-deep p-3 border border-vortex-border">
                {venues.map((venue, idx) => (
                  <div
                    key={venue.name}
                    className={`flex items-center justify-between p-2 transition-all ${
                      idx === activeVenue
                        ? "bg-vortex-dim border border-vortex-accent font-bold"
                        : "opacity-75"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${
                          idx === activeVenue ? "text-vortex-accent" : "text-gray-400"
                        }`}
                      />
                      <span className="text-black">{venue.name}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-[11px]">
                      <span className="text-gray-500">{venue.pair}</span>
                      <span className="text-emerald-700 font-bold">{venue.status}</span>
                      <span className="text-vortex-purple text-[10px]">{venue.delay}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Terminal status line */}
              <div className="pt-2 text-[11px] text-gray-600 flex justify-between items-center border-t border-vortex-border">
                <span>CONSENSUS_GATE: ACTIVE</span>
                <span className="text-vortex-accent font-bold">REQUIRED: &gt;= 3 MATCHING VOTES</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
