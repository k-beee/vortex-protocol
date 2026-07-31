import { createClient } from "genlayer-js";
import type { Address, EIP1193Provider } from "viem";
import { VORTEX_CONTRACT_ADDRESS, VORTEX_NETWORK, readClient } from "../config/vortexConfig";
import type { ProtocolTelemetry, UserPredictionStatus, VortexMarketRecord } from "../types/vortex";

export function createWriteClient(address: Address, provider: EIP1193Provider) {
  return createClient({
    chain: VORTEX_NETWORK,
    account: address,
    provider,
  });
}

// Generates fallback mock telemetry for demonstration prior to Studionet deployment
export function getMockTelemetry(): ProtocolTelemetry {
  return {
    admin: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    operator: "0x3C44CdD45a940F94638a4269e80e468241474936",
    vortex_counter: "8",
    active_markets: "3",
    settled_markets: "4",
    aborted_markets: "0",
    inconclusive_markets: "1",
    total_staked_volume: "1450000000000000000000", // 1450 GEN
    total_payouts: "890000000000000000000",       // 890 GEN
    total_refunds: "120000000000000000000",       // 120 GEN
    contract_balance: "440000000000000000000",
    supported_assets: ["BTC", "ETH", "SOL", "BNB", "AVAX"],
    venues: ["BINANCE", "BYBIT", "GATEIO", "MEXC", "BITGET"],
  };
}

// Generates rich initial demo markets for UI walkthrough
export function getMockMarkets(): VortexMarketRecord[] {
  const now = Math.floor(Date.now() / 1000);
  const currentHour = Math.floor(now / 3600) * 3600;
  
  return [
    {
      vortex_id: "0",
      lookup_key: "BTC:1H_UTC_INTERVAL:" + (currentHour + 3600),
      creator: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      asset: "BTC",
      pair: "BTCUSDT",
      category: "DECISION_MARKET",
      time_frame: "1H_UTC_INTERVAL",
      title_question: "Will BTCUSDT close higher than open during 1H interval?",
      bull_rule: "Closing candle price strictly exceeds opening candle price.",
      bear_rule: "Closing candle price is equal to or lower than opening candle price.",
      betting_cutoff: String(currentHour + 3600),
      candle_start: String(currentHour + 3600),
      candle_end: String(currentHour + 7200),
      resolution_time: String(currentHour + 7320),
      created_at: String(now - 1800),
      resolved_at: "0",
      state: "OPEN",
      outcome: "UNRESOLVED",
      bull_pool_total: "420000000000000000000", // 420 GEN
      bear_pool_total: "280000000000000000000", // 280 GEN
      aggregate_pool_total: "700000000000000000000", // 700 GEN
      participant_count: "34",
      live_status: "OPEN",
    },
    {
      vortex_id: "1",
      lookup_key: "ETH:1H_UTC_INTERVAL:" + (currentHour + 3600),
      creator: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      asset: "ETH",
      pair: "ETHUSDT",
      category: "DECISION_MARKET",
      time_frame: "1H_UTC_INTERVAL",
      title_question: "Will ETHUSDT close higher than open during 1H interval?",
      bull_rule: "Closing candle price strictly exceeds opening candle price.",
      bear_rule: "Closing candle price is equal to or lower than opening candle price.",
      betting_cutoff: String(currentHour + 3600),
      candle_start: String(currentHour + 3600),
      candle_end: String(currentHour + 7200),
      resolution_time: String(currentHour + 7320),
      created_at: String(now - 1200),
      resolved_at: "0",
      state: "OPEN",
      outcome: "UNRESOLVED",
      bull_pool_total: "150000000000000000000", // 150 GEN
      bear_pool_total: "250000000000000000000", // 250 GEN
      aggregate_pool_total: "400000000000000000000", // 400 GEN
      participant_count: "19",
      live_status: "OPEN",
    },
    {
      vortex_id: "2",
      lookup_key: "SOL:1H_UTC_INTERVAL:" + (currentHour + 3600),
      creator: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      asset: "SOL",
      pair: "SOLUSDT",
      category: "DECISION_MARKET",
      time_frame: "1H_UTC_INTERVAL",
      title_question: "Will SOLUSDT close higher than open during 1H interval?",
      bull_rule: "Closing candle price strictly exceeds opening candle price.",
      bear_rule: "Closing candle price is equal to or lower than opening candle price.",
      betting_cutoff: String(currentHour + 3600),
      candle_start: String(currentHour + 3600),
      candle_end: String(currentHour + 7200),
      resolution_time: String(currentHour + 7320),
      created_at: String(now - 900),
      resolved_at: "0",
      state: "OPEN",
      outcome: "UNRESOLVED",
      bull_pool_total: "180000000000000000000", // 180 GEN
      bear_pool_total: "170000000000000000000", // 170 GEN
      aggregate_pool_total: "350000000000000000000", // 350 GEN
      participant_count: "15",
      live_status: "OPEN",
    },
    {
      vortex_id: "3",
      lookup_key: "AVAX:1H_UTC_INTERVAL:" + (currentHour - 3600),
      creator: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      asset: "AVAX",
      pair: "AVAXUSDT",
      category: "DECISION_MARKET",
      time_frame: "1H_UTC_INTERVAL",
      title_question: "Will AVAXUSDT close higher than open during 1H interval?",
      bull_rule: "Closing candle price strictly exceeds opening candle price.",
      bear_rule: "Closing candle price is equal to or lower than opening candle price.",
      betting_cutoff: String(currentHour - 3600),
      candle_start: String(currentHour - 3600),
      candle_end: String(currentHour),
      resolution_time: String(currentHour + 120),
      created_at: String(now - 7200),
      resolved_at: String(currentHour + 180),
      state: "SETTLED",
      outcome: "BULL",
      bull_pool_total: "310000000000000000000", // 310 GEN
      bear_pool_total: "190000000000000000000", // 190 GEN
      aggregate_pool_total: "500000000000000000000", // 500 GEN
      participant_count: "22",
      live_status: "SETTLED",
      consensus_summary: {
        asset: "AVAX",
        candle_start: String(currentHour - 3600),
        candle_end: String(currentHour),
        outcome: "BULL",
        bull_votes: 4,
        bear_votes: 1,
        invalid_votes: 0,
        venues: {
          BINANCE: { valid: true, venue: "BINANCE", open: "28.40", close: "29.15", direction: "BULL" },
          BYBIT: { valid: true, venue: "BYBIT", open: "28.41", close: "29.14", direction: "BULL" },
          GATEIO: { valid: true, venue: "GATEIO", open: "28.39", close: "29.16", direction: "BULL" },
          MEXC: { valid: true, venue: "MEXC", open: "28.40", close: "29.15", direction: "BULL" },
          BITGET: { valid: true, venue: "BITGET", open: "28.42", close: "29.10", direction: "BEAR" },
        }
      }
    }
  ];
}
