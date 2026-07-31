import { createClient, chains } from "genlayer-js";
import { privateKeyToAccount } from "viem/accounts";

const STUDIONET_CHAIN = chains.studionet;
const CONTRACT_ADDRESS = "0x9E0Fa9AE695F98Cb66F2e7c758C24e9AAdeC8DA9";
const FUNDING_PRIVATE_KEY = "0x865c6773bcd46f894a56092ca318c2d4931d49ed8e60ddc4c8a709b67683e699";

const fundingAccount = privateKeyToAccount(FUNDING_PRIVATE_KEY);
const writeClient = createClient({ chain: STUDIONET_CHAIN, account: fundingAccount });
const readClient = createClient({ chain: STUDIONET_CHAIN });

async function openAllMarkets() {
  const assets = ["BTC", "ETH", "SOL", "BNB", "AVAX"];
  const now = Math.floor(Date.now() / 1000);
  const candleStart = Math.ceil((now + 1800) / 3600) * 3600;

  console.log("=================================================");
  console.log("OPENING MARKETS ON FRESH CONTRACT (0x9E0F...8DA9)");
  console.log("=================================================");
  console.log(`Candle Start (UTC): ${new Date(candleStart * 1000).toISOString()}`);
  console.log(`Caller (Admin/Operator): ${fundingAccount.address}\n`);

  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    try {
      console.log(`[Market #${i}] Opening ${asset} market for candleStart ${candleStart}...`);
      const txHash = await writeClient.writeContract({
        address: CONTRACT_ADDRESS,
        functionName: "open_vortex_market",
        args: [asset, BigInt(candleStart)],
      });
      console.log(`   [SUCCESS] TxHash: ${txHash}`);
    } catch (err) {
      console.log(`   Notice (${asset}):`, err.message || err);
    }
  }

  console.log("\nQuerying updated protocol telemetry from contract...");
  const telemetry = await readClient.readContract({
    address: CONTRACT_ADDRESS,
    functionName: "get_protocol_telemetry",
    args: [],
  });
  console.log("Updated Contract Telemetry:\n", telemetry);
}

openAllMarkets();
