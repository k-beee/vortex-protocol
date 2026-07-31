import { createClient, chains } from "genlayer-js";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { parseEther, formatEther } from "viem";

const STUDIONET_CHAIN = chains.studionet;
const CONTRACT_ADDRESS = "0x439A57ae7163a9100fCA2a04dfB827475Db3513e";
const FUNDING_PRIVATE_KEY = "0x865c6773bcd46f894a56092ca318c2d4931d49ed8e60ddc4c8a709b67683e699";

const fundingAccount = privateKeyToAccount(FUNDING_PRIVATE_KEY);

console.log("==========================================================");
console.log("VORTEX PROTOCOL — LIVE STUDIONET TRANSACTION & PAYOUT TEST");
console.log("==========================================================");
console.log(`Funding Address: ${fundingAccount.address}`);
console.log(`Contract Target: ${CONTRACT_ADDRESS}`);
console.log(`RPC Endpoint: ${STUDIONET_CHAIN.rpcUrls.default.http[0]}`);
console.log("==========================================================\n");

async function runTestFlow() {
  const readClient = createClient({ chain: STUDIONET_CHAIN });

  // 1. Check Initial Funding Wallet Balance
  const initBalance = await readClient.getBalance({ address: fundingAccount.address });
  console.log(`1. Funding Wallet Balance: ${formatEther(initBalance)} GEN`);

  // 2. Generate 12 Test Wallets
  console.log("\n2. Generating 12 Test Wallets...");
  const wallets = [];
  for (let i = 1; i <= 12; i++) {
    const pKey = generatePrivateKey();
    const account = privateKeyToAccount(pKey);
    wallets.push({ id: i, account, privateKey: pKey });
    console.log(`   Wallet #${i}: ${account.address}`);
  }

  // 3. Fund Each Test Wallet with 10 GEN
  console.log("\n3. Funding Test Wallets (10 GEN each)...");
  const fundingClient = createClient({
    chain: STUDIONET_CHAIN,
    account: fundingAccount,
  });

  const transferAmount = parseEther("10");

  for (const w of wallets) {
    try {
      console.log(`   Transferring 10 GEN -> Wallet #${w.id} (${w.account.address})...`);
      // Broadcast transfer on Studionet
      if (typeof fundingClient.sendTransaction === "function") {
        const txHash = await fundingClient.sendTransaction({
          to: w.account.address,
          value: transferAmount,
        });
        console.log(`   [SUCCESS] TxHash: ${txHash}`);
      }
    } catch (err) {
      console.log(`   Notice (Transfer): ${err.message || err}`);
    }
  }

  // 4. Test Write Transaction on Deployed Contract
  console.log("\n4. Testing Direct Interaction with Deployed Contract (0x439A...513e)...");

  // Check telemetry before interaction
  let telemetryBefore = await readClient.readContract({
    address: CONTRACT_ADDRESS,
    functionName: "get_protocol_telemetry",
    args: [],
  });
  console.log("   Telemetry BEFORE Test Transactions:\n  ", telemetryBefore);

  // 5. Test Entering Predictions on Contract
  console.log("\n5. Testing Prediction Submission Flow (BULL & BEAR Stakes)...");
  
  // Wallet #1 submitting 2.5 GEN stake on BULL
  const wallet1Client = createClient({
    chain: STUDIONET_CHAIN,
    account: wallets[0].account,
  });

  // Wallet #2 submitting 3.5 GEN stake on BEAR
  const wallet2Client = createClient({
    chain: STUDIONET_CHAIN,
    account: wallets[1].account,
  });

  try {
    console.log(`   Wallet #1 (${wallets[0].account.address}) staking 2.5 GEN on BULL...`);
    const tx1 = await wallet1Client.writeContract({
      address: CONTRACT_ADDRESS,
      functionName: "enter_prediction",
      args: [0n, "BULL"],
      value: parseEther("2.5"),
    });
    console.log(`   [SUCCESS] Bet Tx 1 Hash: ${tx1}`);
  } catch (err) {
    console.log(`   Contract enter_prediction Notice 1: ${err.message || err}`);
  }

  try {
    console.log(`   Wallet #2 (${wallets[1].account.address}) staking 3.5 GEN on BEAR...`);
    const tx2 = await wallet2Client.writeContract({
      address: CONTRACT_ADDRESS,
      functionName: "enter_prediction",
      args: [0n, "BEAR"],
      value: parseEther("3.5"),
    });
    console.log(`   [SUCCESS] Bet Tx 2 Hash: ${tx2}`);
  } catch (err) {
    console.log(`   Contract enter_prediction Notice 2: ${err.message || err}`);
  }

  // 6. Read Telemetry AFTER Test
  console.log("\n6. Reading Telemetry AFTER Interactions...");
  let telemetryAfter = await readClient.readContract({
    address: CONTRACT_ADDRESS,
    functionName: "get_protocol_telemetry",
    args: [],
  });
  console.log("   Telemetry AFTER Test Transactions:\n  ", telemetryAfter);

  console.log("\n==========================================================");
  console.log("VORTEX PROTOCOL TEST EXECUTION COMPLETE");
  console.log("==========================================================");
}

runTestFlow();
