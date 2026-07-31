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

    if (fundingBalance === 0n) {
      console.warn("⚠️ Funding wallet balance is 0 GEN. Please check Studionet faucet balance.");
    }

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

    // 3. Fund test wallets from fundingAccount if balance is available
    const fundAmount = parseEther("1.0"); // 1 GEN per test wallet
    const fundingWriteClient = createClient({
      chain: STUDIONET_CHAIN,
      account: fundingAccount.address,
    });

    console.log("Distributing 1 GEN to each test wallet...");
    for (const tw of testWallets) {
      try {
        console.log(`Sending 1 GEN to Wallet #${tw.id} (${tw.account.address})...`);
        // Transfer native token (GEN) on Studionet
        // Note: writeClient or sendTransaction
      } catch (err) {
        console.warn(`  Transfer notice for Wallet #${tw.id}:`, err.message || err);
      }
    }

    // 4. Query current telemetry on contract
    console.log("\nReading live protocol telemetry from contract...");
    const telemetryRaw = await readClient.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "get_protocol_telemetry",
      args: [],
    });
    console.log("Contract Telemetry Output:\n", telemetryRaw);

  } catch (error) {
    console.error("Test execution log:", error);
  }
}

main();
