import { createClient, chains } from "genlayer-js";
import { privateKeyToAccount } from "viem/accounts";
import fs from "fs";
import path from "path";

const STUDIONET_CHAIN = chains.studionet;
const FUNDING_PRIVATE_KEY = "0x865c6773bcd46f894a56092ca318c2d4931d49ed8e60ddc4c8a709b67683e699";

const fundingAccount = privateKeyToAccount(FUNDING_PRIVATE_KEY);
const client = createClient({
  chain: STUDIONET_CHAIN,
  account: fundingAccount,
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  console.log("=================================================");
  console.log("REDEPLOYING CONTRACT & OPENING EXTENDED MARKETS");
  console.log("=================================================");
  console.log(`Admin Address: ${fundingAccount.address}`);
  console.log(`RPC Endpoint: ${STUDIONET_CHAIN.rpcUrls.default.http[0]}\n`);

  // 1. Deploy fresh contract
  const contractPath = path.resolve("../contract/VortexEngine.py");
  const code = fs.readFileSync(contractPath, "utf-8");

  console.log("1. Deploying fresh VortexEngine to Studionet...");
  const deployTxHash = await client.deployContract({
    code: code,
    args: [],
  });
  console.log(`   [SUCCESS] Deployment TxHash: ${deployTxHash}`);

  console.log("   Waiting for transaction receipt...");
  const receipt = await client.waitForTransactionReceipt({ hash: deployTxHash });
  const contractAddress = receipt.recipient;
  console.log(`\n🎉 NEW CONTRACT DEPLOYED AT: ${contractAddress}\n`);

  await sleep(3000);

  // 2. Open 5 Extended Markets on-chain
  // Market #0: BTC -> Aug 25, 2026 00:00:00 UTC (1787616000)
  // Market #1-4: ETH, SOL, BNB, AVAX -> Sep 01, 2026 00:00:00 UTC (1788220800)
  const marketSpecs = [
    { asset: "BTC", timestamp: 1787616000n, label: "August 25, 2026" },
    { asset: "ETH", timestamp: 1788220800n, label: "September 1, 2026" },
    { asset: "SOL", timestamp: 1788220800n, label: "September 1, 2026" },
    { asset: "BNB", timestamp: 1788220800n, label: "September 1, 2026" },
    { asset: "AVAX", timestamp: 1788220800n, label: "September 1, 2026" },
  ];

  console.log("2. Initializing 5 Extended Markets on-chain...");

  for (let i = 0; i < marketSpecs.length; i++) {
    const spec = marketSpecs[i];
    try {
      console.log(`   [Market #${i}] Opening ${spec.asset} (Deadline: ${spec.label}, Timestamp: ${spec.timestamp})...`);
      const txHash = await client.writeContract({
        address: contractAddress,
        functionName: "open_vortex_market",
        args: [spec.asset, spec.timestamp],
      });
      console.log(`   [SUCCESS] TxHash: ${txHash}`);
      await sleep(3500);
    } catch (err) {
      console.log(`   Notice (${spec.asset}):`, err.message || err);
    }
  }

  // 3. Verify Telemetry from new contract
  console.log("\n3. Querying Protocol Telemetry from new contract...");
  const telemetry = await client.readContract({
    address: contractAddress,
    functionName: "get_protocol_telemetry",
    args: [],
  });
  console.log("   New Contract Telemetry Output:\n  ", telemetry);

  // 4. Verify Market #0 Record
  console.log("\n4. Querying Market #0 Record Details from new contract...");
  const market0 = await client.readContract({
    address: contractAddress,
    functionName: "get_vortex_market",
    args: [0n],
  });
  console.log("   Market #0 Output:\n  ", market0);

  console.log("\n=================================================");
  console.log(`REDEPLOYMENT COMPLETE: ${contractAddress}`);
  console.log("=================================================");
}

main();
