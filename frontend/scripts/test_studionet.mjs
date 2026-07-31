import { createClient, chains } from "genlayer-js";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { parseEther, formatEther } from "viem";

// Contract and Network configuration
const STUDIONET_CHAIN = chains.studionet;
const CONTRACT_ADDRESS = "0x439A57ae7163a9100fCA2a04dfB827475Db3513e";
const FUNDING_PRIVATE_KEY = "0x865c6773bcd46f894a56092ca318c2d4931d49ed8e60ddc4c8a709b67683e699";

const fundingAccount = privateKeyToAccount(FUNDING_PRIVATE_KEY);

console.log("=================================================");
console.log("VORTEX PROTOCOL — STUDIONET LIVE TEST SUITE");
console.log("=================================================");
console.log(`Funding Wallet Address: ${fundingAccount.address}`);
console.log(`Target Contract: ${CONTRACT_ADDRESS}`);
console.log(`Network: ${STUDIONET_CHAIN.name}`);
console.log(`RPC Endpoint: ${STUDIONET_CHAIN.rpcUrls.default.http[0]}`);
console.log("=================================================\n");

// Read client
const readClient = createClient({
  chain: STUDIONET_CHAIN,
});

async function main() {
  try {
    // 1. Check funding wallet balance
    const fundingBalance = await readClient.getBalance({ address: fundingAccount.address });
    console.log(`Funding Wallet Balance: ${formatEther(fundingBalance)} GEN\n`);

    // 2. Generate 12 test wallets
    const numWallets = 12;
    const testWallets = [];
    console.log(`Generating ${numWallets} test wallet accounts...`);

    for (let i = 0; i < numWallets; i++) {
      const pKey = generatePrivateKey();
      const account = privateKeyToAccount(pKey);
      testWallets.push({ id: i + 1, account, privateKey: pKey });
      console.log(`  Wallet #${i + 1}: ${account.address}`);
    }
    console.log("");

    // 3. Query current telemetry on contract
    console.log("Reading live protocol telemetry from contract...");
    const telemetryRaw = await readClient.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "get_protocol_telemetry",
      args: [],
    });
    console.log("Contract Telemetry Output:\n", telemetryRaw);

    // 4. Query vortex markets
    const telemetry = JSON.parse(telemetryRaw);
    const counter = parseInt(telemetry.vortex_counter, 10);
    console.log(`\nContract vortex_counter: ${counter}`);

    if (counter > 0) {
      for (let i = 0; i < counter; i++) {
        const marketRaw = await readClient.readContract({
          address: CONTRACT_ADDRESS,
          functionName: "get_vortex_market",
          args: [BigInt(i)],
        });
        console.log(`Market #${i}:`, marketRaw);
      }
    } else {
      console.log("No markets initialized on contract yet.");
    }

  } catch (error) {
    console.error("Test execution error:", error);
  }
}

main();
