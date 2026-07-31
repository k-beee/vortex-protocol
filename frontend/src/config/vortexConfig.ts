import { createClient, chains } from "genlayer-js";
import type { Address } from "viem";

// Target Network: GenLayer Studionet
export const VORTEX_NETWORK = chains.studionet;
export const VORTEX_CHAIN_NAME = "GenLayer Studionet";
export const VORTEX_CHAIN_ID = VORTEX_NETWORK.id || 61757;

// Deployed Intelligent Contract Address on Studionet
export const VORTEX_CONTRACT_ADDRESS = (import.meta.env.VITE_VORTEX_CONTRACT_ADDRESS ??
  "0x439A57ae7163a9100fCA2a04dfB827475Db3513e") as Address;

// GenLayer Read Client configured for Studionet RPC
export const readClient = createClient({
  chain: VORTEX_NETWORK,
});

/**
 * Prompts browser Web3 provider (MetaMask / OKX / Rabby) to switch or add GenLayer Studionet
 */
export async function ensureStudionetNetwork(provider: any) {
  if (!provider || !provider.request) return;

  const hexChainId = "0x" + Number(VORTEX_CHAIN_ID).toString(16);

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: hexChainId }],
    });
  } catch (switchError: any) {
    if (switchError?.code === 4902 || switchError?.data?.originalError?.code === 4902) {
      try {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: hexChainId,
              chainName: VORTEX_CHAIN_NAME,
              nativeCurrency: {
                name: "GEN",
                symbol: "GEN",
                decimals: 18,
              },
              rpcUrls: ["https://studio.genlayer.com/api"],
              blockExplorerUrls: ["https://studio.genlayer.com"],
            },
          ],
        });
      } catch (addError) {
        console.warn("Network prompt warning:", addError);
      }
    }
  }
}

export const SUPPORTED_ASSETS = ["BTC", "ETH", "SOL", "BNB", "AVAX"] as const;
export type AssetSymbol = typeof SUPPORTED_ASSETS[number];

export const VENUE_LIST = [
  { id: "BINANCE", name: "Binance Spot API", icon: "⚡" },
  { id: "BYBIT", name: "Bybit Spot v5", icon: "🌐" },
  { id: "GATEIO", name: "Gate.io v4", icon: "📊" },
  { id: "MEXC", name: "MEXC Spot v3", icon: "📈" },
  { id: "BITGET", name: "Bitget Spot v3", icon: "🔍" },
];
