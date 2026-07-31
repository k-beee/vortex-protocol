import { createClient, chains } from "genlayer-js";
import type { Address } from "viem";

// Target Network: GenLayer Studionet (Exact Chain ID: 61999 / 0xF22F)
export const VORTEX_NETWORK = chains.studionet;
export const VORTEX_CHAIN_NAME = "Genlayer Studio Network";
export const VORTEX_CHAIN_ID = VORTEX_NETWORK.id || 61999;

// Deployed Intelligent Contract Address on Studionet (Admin: 0x4d6D430B92c6252b21278Eb7a71eB61e4CC50f74)
export const VORTEX_CONTRACT_ADDRESS = (import.meta.env.VITE_VORTEX_CONTRACT_ADDRESS ??
  "0x9E0Fa9AE695F98Cb66F2e7c758C24e9AAdeC8DA9") as Address;

// GenLayer Read Client configured for Studionet RPC
export const readClient = createClient({
  chain: VORTEX_NETWORK,
});

/**
 * Prompts browser Web3 provider (MetaMask / OKX / Rabby) to switch or add GenLayer Studionet (Chain ID: 61999)
 */
export async function ensureStudionetNetwork(provider: any) {
  if (!provider || !provider.request) return;

  const numericChainId = VORTEX_CHAIN_ID;
  const hexChainId = "0x" + Number(numericChainId).toString(16); // 0xF22F for 61999

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
                name: "GEN Token",
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
