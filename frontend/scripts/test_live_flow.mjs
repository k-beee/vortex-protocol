import { createClient, chains } from "genlayer-js";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { parseEther, formatEther } from "viem";

const STUDIONET_CHAIN = chains.studionet;
const CONTRACT_ADDRESS = "0x9E0Fa9AE695F98Cb66F2e7c758C24e9AAdeC8DA9";
const FUNDING_PRIVATE_KEY = "0x865c6773bcd46f894a56092ca318c2d4931d49ed8e60ddc4c8a709b67683e699";

const fundingAccount = privateKeyToAccount(FUNDING_PRIVATE_KEY);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

console.log("==========================================================");
console.log("VORTEX PROTOCOL — STUDIONET MULTI-WALLET TRANSACTION TEST");
console.log("==========================================================");
console.log(`Funding Address (Admin): ${fundingAccount.address}`);
console.log(`Target Contract: ${CONTRACT_ADDRESS}`);
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

  // 3. Fund Test Wallets (10 GEN each) with 2.5s pacing for RPC rate limit
  console.log("\n3. Funding Test Wallets (10 GEN each)...");
  const fundingClient = createClient({
    chain: STUDIONET_CHAIN,
    account: fundingAccount,
  });

  const transferAmount = parseEther("10");

  for (const w of wallets.slice(0, 4)) { // Fund 4 wallets for prediction test
    try {
      console.log(`   Transferring 10 GEN -> Wallet #${w.id} (${w.account.address})...`);
      const txHash = await fundingClient.sendTransaction({
        to: w.account.address,
        value: transferAmount,
      });
      console.log(`   [SUCCESS] Transfer TxHash: ${txHash}`);
      await sleep(2500);
    } catch (err) {
      console.log(`   Notice (Transfer): ${err.message || err}`);
    }
  }

  // 4. Read Contract Telemetry BEFORE predictions
  console.log(`\n4. Reading Telemetry BEFORE Prediction Stakes on ${CONTRACT_ADDRESS}...`);
  let telemetryBefore = await readClient.readContract({
    address: CONTRACT_ADDRESS,
    functionName: "get_protocol_telemetry",
    args: [],
  });
  console.log("   Telemetry BEFORE:\n  ", telemetryBefore);
  await sleep(2500);

  // 5. Submit Predictions on Market #0 (BTC) from Test Wallets
  console.log("\n5. Submitting Prediction Transactions to Contract...");
  
  const wallet1Client = createClient({
    chain: STUDIONET_CHAIN,
    account: wallets[0].account,
  });

  const wallet2Client = createClient({
    chain: STUDIONET_CHAIN,
    account: wallets[1].account,
  });

  try {
    console.log(`   Wallet #1 (${wallets[0].account.address}) staking 2.5 GEN on BULL (Market #0)...`);
    const tx1 = await wallet1Client.writeContract({
      address: CONTRACT_ADDRESS,
      functionName: "enter_prediction",
      args: [0n, "BULL"],
      value: parseEther("2.5"),
    });
    console.log(`   [SUCCESS] BULL Prediction Tx Hash: ${tx1}`);
    await sleep(2500);
  } catch (err) {
    console.log(`   Contract enter_prediction Notice 1: ${err.message || err}`);
  }

  try {
    console.log(`   Wallet #2 (${wallets[1].account.address}) staking 3.5 GEN on BEAR (Market #0)...`);
    const tx2 = await wallet2Client.writeContract({
      address: CONTRACT_ADDRESS,
      functionName: "enter_prediction",
      args: [0n, "BEAR"],
      value: parseEther("3.5"),
    });
    console.log(`   [SUCCESS] BEAR Prediction Tx Hash: ${tx2}`);
    await sleep(2500);
  } catch (err) {
    console.log(`   Contract enter_prediction Notice 2: ${err.message || err}`);
  }

  // 6. Read Telemetry AFTER predictions
  console.log("\n6. Reading Telemetry AFTER Prediction Stakes...");
  let telemetryAfter = await readClient.readContract({
    address: CONTRACT_ADDRESS,
    functionName: "get_protocol_telemetry",
    args: [],
  });
  console.log("   Telemetry AFTER:\n  ", telemetryAfter);
  await sleep(2500);

  // 7. Query Market #0 Record Details AFTER Stakes
  console.log("\n7. Querying Market #0 Record Details AFTER Stakes...");
  const market0 = await readClient.readContract({
    address: CONTRACT_ADDRESS,
    functionName: "get_vortex_market",
    args: [0n],
  });
  console.log("   Market #0 Record Output:\n  ", market0);

  console.log("\n==========================================================");
  console.log("VORTEX PROTOCOL MULTI-WALLET TEST EXECUTION COMPLETE");
  console.log("==========================================================");
}

runTestFlow();
