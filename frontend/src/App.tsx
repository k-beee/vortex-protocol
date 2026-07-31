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
import { CreateMarketModal } from "./components/CreateMarketModal";
import { Footer } from "./components/Footer";

import {
  fetchProtocolTelemetry,
  fetchVortexMarkets,
  getHourlyRenewingMarkets,
  getProtocolTelemetry,
} from "./services/genlayerService";
import { VORTEX_CONTRACT_ADDRESS } from "./config/vortexConfig";
import type { VortexMarketRecord, ProtocolTelemetry } from "./types/vortex";
import { PlusCircle, RefreshCw } from "lucide-react";

export function App() {
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [markets, setMarkets] = useState<VortexMarketRecord[]>(getHourlyRenewingMarkets());
  const [telemetry, setTelemetry] = useState<ProtocolTelemetry>(getProtocolTelemetry());
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
  const [isCreateMarketOpen, setIsCreateMarketOpen] = useState<boolean>(false);

  // Load live Studionet contract data with hourly renewing fallback
  const loadContractData = async () => {
    try {
      const liveTelemetry = await fetchProtocolTelemetry();
      const liveMarkets = await fetchVortexMarkets();
      setTelemetry(liveTelemetry);
      setMarkets(liveMarkets);
    } catch (err) {
      console.warn("Studionet refresh warning:", err);
    }
  };

  useEffect(() => {
    loadContractData();
    const interval = setInterval(loadContractData, 15000); // Auto-refresh every 15s
    return () => clearInterval(interval);
  }, []);

  // Wallet Connection
  const handleConnectWallet = async () => {
    const provider = (window as unknown as { ethereum?: { request: (args: { method: string }) => Promise<string[]> } }).ethereum;
    if (provider) {
      try {
        const accounts = await provider.request({ method: "eth_requestAccounts" });
        if (accounts && accounts[0]) {
          setUserAddress(accounts[0]);
          return;
        }
      } catch (err) {
        console.warn("Wallet connect error:", err);
      }
    }
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
    const stakeWei = stakeGen * 1e18;

    // Update market pools dynamically
    setMarkets((prev) =>
      prev.map((m) => {
        if (m.vortex_id === vortexId) {
          const currentBull = Number(m.bull_pool_total);
          const currentBear = Number(m.bear_pool_total);
          const currentAgg = Number(m.aggregate_pool_total);
          const currentParticipants = Number(m.participant_count);

          const updatedBull = side === "BULL" ? currentBull + stakeWei : currentBull;
          const updatedBear = side === "BEAR" ? currentBear + stakeWei : currentBear;
          const updatedAgg = currentAgg + stakeWei;

          return {
            ...m,
            bull_pool_total: String(updatedBull),
            bear_pool_total: String(updatedBear),
            aggregate_pool_total: String(updatedAgg),
            participant_count: String(currentParticipants + 1),
          };
        }
        return m;
      })
    );

    // Update protocol telemetry total volume dynamically
    setTelemetry((prev) => {
      const currentVol = Number(prev.total_staked_volume);
      return {
        ...prev,
        total_staked_volume: String(currentVol + stakeWei),
      };
    });
  };

  const handleCreateMarket = async (asset: string, candleStart: number) => {
    console.log("Opening new market on Studionet:", asset, candleStart);
    setTimeout(loadContractData, 2000);
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
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <h2 className="font-heading font-extrabold text-xl text-black uppercase tracking-wider">
                // LIVE_ONE_HOUR_MARKETS
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Target: <strong className="text-vortex-accent">GenLayer Studionet ({VORTEX_CONTRACT_ADDRESS.slice(0, 6)}...{VORTEX_CONTRACT_ADDRESS.slice(-4)})</strong>
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsCreateMarketOpen(true)}
                className="btn-cyber flex items-center space-x-1.5"
              >
                <PlusCircle className="w-4 h-4 text-vortex-accent" />
                <span>[ OPEN MARKET ]</span>
              </button>

              <button
                onClick={loadContractData}
                className="p-2 border border-vortex-border bg-vortex-deep hover:bg-vortex-dim text-gray-700 hover:text-black transition-all"
                title="Refresh Contract Data"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
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

      <CreateMarketModal
        isOpen={isCreateMarketOpen}
        onClose={() => setIsCreateMarketOpen(false)}
        onCreateMarket={handleCreateMarket}
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
