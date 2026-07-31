import { createClient, chains } from "genlayer-js";
import type { Address } from "viem";

// Target Network: GenLayer Studionet
export const VORTEX_NETWORK = chains.studionet;
export const VORTEX_CHAIN_NAME = "GenLayer Studionet";
export const VORTEX_CHAIN_ID = VORTEX_NETWORK.id;

// Deployed Intelligent Contract Address on Studionet
export const VORTEX_CONTRACT_ADDRESS = (import.meta.env.VITE_VORTEX_CONTRACT_ADDRESS ??
  "0x439A57ae7163a9100fCA2a04dfB827475Db3513e") as Address;

// GenLayer Read Client configured for Studionet RPC
export const readClient = createClient({
  chain: VORTEX_NETWORK,
});

export const SUPPORTED_ASSETS = ["BTC", "ETH", "SOL", "BNB", "AVAX"] as const;
export type AssetSymbol = typeof SUPPORTED_ASSETS[number];

export const VENUE_LIST = [
  { id: "BINANCE", name: "Binance Spot API", icon: "⚡" },
  { id: "BYBIT", name: "Bybit Spot v5", icon: "🌐" },
  { id: "GATEIO", name: "Gate.io v4", icon: "📊" },
  { id: "MEXC", name: "MEXC Spot v3", icon: "📈" },
  { id: "BITGET", name: "Bitget Spot v3", icon: "🔍" },
];
