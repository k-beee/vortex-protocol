import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { LiveTelemetryBanner } from "./components/LiveTelemetryBanner";
import { HeroSection } from "./components/HeroSection";
import { MarketFilters } from "./components/MarketFilters";
import { MarketCard } from "./components/MarketCard";
import { PredictionModal } from "./components/PredictionModal";
import { PortfolioDrawer } from "./components/PortfolioDrawer";
import { ConsensusInspector } from "./components/ConsensusInspector";
import { HowItWorksModal } from "./components/HowItWorksModal";
import { Footer } from "./components/Footer";

import { getMockMarkets, getMockTelemetry } from "./services/genlayerService";
import type { VortexMarketRecord, ProtocolTelemetry } from "./types/vortex";

export function App() {
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [markets, setMarkets] = useState<VortexMarketRecord[]>(getMockMarkets());
  const [telemetry, setTelemetry] = useState<ProtocolTelemetry>(getMockTelemetry());

  // Filter States
  const [selectedAsset, setSelectedAsset] = useState<string>("ALL");
  const [selectedState, setSelectedState] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal States
  const [predictionMarket, setPredictionMarket] = useState<VortexMarketRecord | null>(null);
  const [predictionDirection, setPredictionDirection] = useState<"BULL" | "BEAR">("BULL");
  const [isPredictionOpen, setIsPredictionOpen] = useState<boolean>(false);

  const [inspectedMarket, setInspectedMarket] = useState<VortexMarketRecord | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);

  const [isPortfolioOpen, setIsPortfolioOpen] = useState<boolean>(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState<boolean>(false);

  // Wallet Connection Simulation
  const handleConnectWallet = () => {
    setUserAddress("0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
  };

  const handleDisconnectWallet = () => {
    setUserAddress(null);
  };

  // Prediction Handlers
  const handleOpenPrediction = (market: VortexMarketRecord, side: "BULL" | "BEAR") => {
    setPredictionMarket(market);
    setPredictionDirection(side);
    setIsPredictionOpen(true);
  };

  const handleSubmitPrediction = async (vortexId: string, side: "BULL" | "BEAR", stakeGen: number) => {
    const weiAmount = String(stakeGen * 1e18);
    setMarkets((prev) =>
      prev.map((m) => {
        if (m.vortex_id === vortexId) {
          const currentBull = Number(m.bull_pool_total);
          const currentBear = Number(m.bear_pool_total);
          const currentAgg = Number(m.aggregate_pool_total);

          const updatedBull = side === "BULL" ? currentBull + stakeGen * 1e18 : currentBull;
          const updatedBear = side === "BEAR" ? currentBear + stakeGen * 1e18 : currentBear;
          const updatedAgg = currentAgg + stakeGen * 1e18;

          return {
            ...m,
            bull_pool_total: String(updatedBull),
            bear_pool_total: String(updatedBear),
            aggregate_pool_total: String(updatedAgg),
          };
        }
        return m;
      })
    );
  };

  const handleInspectConsensus = (market: VortexMarketRecord) => {
    setInspectedMarket(market);
    setIsInspectorOpen(true);
  };

  const handleClaimPayout = async (vortexId: string) => {
    console.log("Claiming payout for market:", vortexId);
  };

  const handleClaimRefund = async (vortexId: string) => {
    console.log("Claiming refund for market:", vortexId);
  };

  // Filtered Markets Calculation
  const filteredMarkets = markets.filter((market) => {
    if (selectedAsset !== "ALL" && market.asset !== selectedAsset) return false;
    if (selectedState !== "ALL" && market.state !== selectedState) return false;
    if (
      searchQuery.trim() !== "" &&
      !market.pair.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col font-mono selection:bg-vortex-dim selection:text-vortex-accent">
      
      {/* Header */}
      <Header
        userAddress={userAddress}
        onConnectWallet={handleConnectWallet}
        onDisconnectWallet={handleDisconnectWallet}
        onOpenPortfolio={() => setIsPortfolioOpen(true)}
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
      />

      {/* Live Telemetry Banner */}
      <LiveTelemetryBanner telemetry={telemetry} />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* Hero Section */}
        <HeroSection
          onBrowseClick={() => {
            const el = document.getElementById("market-browser");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
          onArchitectureClick={() => setIsHowItWorksOpen(true)}
        />

        {/* Market Browser Section */}
        <section id="market-browser" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-extrabold text-xl text-black uppercase tracking-wider">
              // LIVE_ONE_HOUR_MARKETS
            </h2>
            <span className="cyber-badge text-[10px]">
              {filteredMarkets.length} MARKETS AVAILABLE
            </span>
          </div>

          {/* Filters */}
          <MarketFilters
            selectedAsset={selectedAsset}
            onSelectAsset={setSelectedAsset}
            selectedState={selectedState}
            onSelectState={setSelectedState}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Market Cards Grid */}
          {filteredMarkets.length === 0 ? (
            <div className="terminal-pane p-12 text-center text-gray-500 font-mono space-y-2">
              <p className="font-bold text-sm uppercase">NO MARKETS MATCH CURRENT FILTER</p>
              <p className="text-xs">Adjust asset or status filters to view active markets.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMarkets.map((market) => (
                <MarketCard
                  key={market.vortex_id}
                  market={market}
                  onOpenPrediction={handleOpenPrediction}
                  onInspectConsensus={handleInspectConsensus}
                />
              ))}
            </div>
          )}

        </section>

      </main>

      {/* Modals & Drawers */}
      <PredictionModal
        market={predictionMarket}
        direction={predictionDirection}
        isOpen={isPredictionOpen}
        onClose={() => setIsPredictionOpen(false)}
        onSubmitPrediction={handleSubmitPrediction}
        userAddress={userAddress}
        onConnectWallet={handleConnectWallet}
      />

      <ConsensusInspector
        market={inspectedMarket}
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
      />

      <PortfolioDrawer
        isOpen={isPortfolioOpen}
        onClose={() => setIsPortfolioOpen(false)}
        userAddress={userAddress}
        markets={markets}
        onClaimPayout={handleClaimPayout}
        onClaimRefund={handleClaimRefund}
      />

      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
      />

      {/* Footer */}
      <Footer />

    </div>
  );
}

export default App;
