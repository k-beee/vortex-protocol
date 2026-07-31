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

// Default initial state when contract is fresh
export const INITIAL_TELEMETRY: ProtocolTelemetry = {
  admin: "0x0000000000000000000000000000000000000000",
  operator: "0x0000000000000000000000000000000000000000",
  vortex_counter: "0",
  active_markets: "0",
  settled_markets: "0",
  aborted_markets: "0",
  inconclusive_markets: "0",
  total_staked_volume: "0",
  total_payouts: "0",
  total_refunds: "0",
  contract_balance: "0",
  supported_assets: ["BTC", "ETH", "SOL", "BNB", "AVAX"],
  venues: ["BINANCE", "BYBIT", "GATEIO", "MEXC", "BITGET"],
};

/**
 * Fetch live protocol telemetry from deployed GenLayer Studionet contract
 */
export async function fetchProtocolTelemetry(): Promise<ProtocolTelemetry> {
  if (!VORTEX_CONTRACT_ADDRESS || VORTEX_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
    return INITIAL_TELEMETRY;
  }

  try {
    const rawData = await readClient.readContract({
      address: VORTEX_CONTRACT_ADDRESS,
      functionName: "get_protocol_telemetry",
      args: [],
    });

    if (typeof rawData === "string") {
      const parsed = JSON.parse(rawData);
      return {
        ...INITIAL_TELEMETRY,
        ...parsed,
      };
    }
    return INITIAL_TELEMETRY;
  } catch (error) {
    console.warn("Live Studionet telemetry read warning:", error);
    return INITIAL_TELEMETRY;
  }
}

/**
 * Fetch live market records from deployed GenLayer Studionet contract
 */
export async function fetchVortexMarkets(): Promise<VortexMarketRecord[]> {
  if (!VORTEX_CONTRACT_ADDRESS || VORTEX_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
    return [];
  }

  try {
    const telemetry = await fetchProtocolTelemetry();
    const count = parseInt(telemetry.vortex_counter, 10);
    if (isNaN(count) || count === 0) {
      return [];
    }

    const markets: VortexMarketRecord[] = [];
    for (let i = 0; i < count; i++) {
      try {
        const rawMarket = await readClient.readContract({
          address: VORTEX_CONTRACT_ADDRESS,
          functionName: "get_vortex_market",
          args: [BigInt(i)],
        });

        if (typeof rawMarket === "string") {
          const parsed = JSON.parse(rawMarket);
          markets.push(parsed as VortexMarketRecord);
        }
      } catch (err) {
        console.warn(`Error reading market ${i} from contract:`, err);
      }
    }
    return markets;
  } catch (error) {
    console.warn("Live Studionet markets read warning:", error);
    return [];
  }
}

/**
 * Fetch live user position status from deployed contract
 */
export async function fetchUserPosition(vortexId: string, wallet: string): Promise<UserPredictionStatus | null> {
  if (!VORTEX_CONTRACT_ADDRESS || !wallet) return null;

  try {
    const rawData = await readClient.readContract({
      address: VORTEX_CONTRACT_ADDRESS,
      functionName: "get_user_prediction_status",
      args: [BigInt(vortexId), wallet],
    });

    if (typeof rawData === "string") {
      return JSON.parse(rawData) as UserPredictionStatus;
    }
    return null;
  } catch (error) {
    console.warn("Error fetching user position:", error);
    return null;
  }
}
