import { createClient, chains } from "genlayer-js";
import { privateKeyToAccount } from "viem/accounts";

const STUDIONET_CHAIN = chains.studionet;
const CONTRACT_ADDRESS = "0x439A57ae7163a9100fCA2a04dfB827475Db3513e";
const FUNDING_PRIVATE_KEY = "0x865c6773bcd46f894a56092ca318c2d4931d49ed8e60ddc4c8a709b67683e699";

const fundingAccount = privateKeyToAccount(FUNDING_PRIVATE_KEY);
const writeClient = createClient({ chain: STUDIONET_CHAIN, account: fundingAccount });
const readClient = createClient({ chain: STUDIONET_CHAIN });

async function openMarket() {
  try {
    const now = Math.floor(Date.now() / 1000);
    // Align candle start to future UTC hour at least 30 minutes in advance
    const candleStart = Math.ceil((now + 1800) / 3600) * 3600;

    console.log(`Attempting to open BTC market for candleStart: ${candleStart}...`);
    const txHash = await writeClient.writeContract({
      address: CONTRACT_ADDRESS,
      functionName: "open_vortex_market",
      args: ["BTC", BigInt(candleStart)],
    });
    console.log(`[SUCCESS] Market Created TxHash: ${txHash}`);

    const telemetry = await readClient.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "get_protocol_telemetry",
      args: [],
    });
    console.log("Telemetry after creation:", telemetry);
  } catch (err) {
    console.error("Open Market result:", err.message || err);
  }
}

openMarket();
