import { createClient, chains } from "genlayer-js";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { parseEther, formatEther } from "viem";

const STUDIONET_CHAIN = chains.studionet;
const CONTRACT_ADDRESS = "0x9c939da7CC0B508c7Ae3BCC39980a0462e16c452";
const FUNDING_PRIVATE_KEY = "0x865c6773bcd46f894a56092ca318c2d4931d49ed8e60ddc4c8a709b67683e699";

const fundingAccount = privateKeyToAccount(FUNDING_PRIVATE_KEY);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function generateSubstantialVolume() {
  const readClient = createClient({ chain: STUDIONET_CHAIN });
  const fundingClient = createClient({ chain: STUDIONET_CHAIN, account: fundingAccount });

  console.log("==========================================================");
  console.log("GENERATING SUBSTANTIAL STAKED VOLUME ON STUDIONET");
  console.log("==========================================================");
  console.log(`Funding Address (Admin): ${fundingAccount.address}`);
  console.log(`Target Contract: ${CONTRACT_ADDRESS}`);
  console.log(`RPC Endpoint: ${STUDIONET_CHAIN.rpcUrls.default.http[0]}\n`);

  // 1. Generate 10 active trader wallets
  console.log("1. Generating 10 active trader test wallets...");
  const traders = [];
  for (let i = 1; i <= 10; i++) {
    const pKey = generatePrivateKey();
    const account = privateKeyToAccount(pKey);
    traders.push({ id: i, account, privateKey: pKey });
    console.log(`   Trader #${i}: ${account.address}`);
  }

  // 2. Fund Traders (50 GEN each) with RPC pacing
  console.log("\n2. Funding Trader Wallets (50 GEN each)...");
  const fundAmount = parseEther("50");

  for (const t of traders) {
    try {
      console.log(`   Transferring 50 GEN -> Trader #${t.id} (${t.account.address})...`);
      const txHash = await fundingClient.sendTransaction({
        to: t.account.address,
        value: fundAmount,
      });
      console.log(`   [SUCCESS] Transfer TxHash: ${txHash}`);
      await sleep(3000);
    } catch (err) {
      console.log(`   Notice (Fund Trader #${t.id}): ${err.message || err}`);
    }
  }

  // 3. Bet allocations across Markets 0-4 (BTC, ETH, SOL, BNB, AVAX)
  const betPlan = [
    // Market 0: BTC
    { traderIndex: 0, vortexId: 0n, side: "BULL", amountGen: 8.5 },
    { traderIndex: 1, vortexId: 0n, side: "BEAR", amountGen: 6.0 },
    { traderIndex: 2, vortexId: 0n, side: "BULL", amountGen: 9.5 },
    
    // Market 1: ETH
    { traderIndex: 3, vortexId: 1n, side: "BULL", amountGen: 7.0 },
    { traderIndex: 4, vortexId: 1n, side: "BEAR", amountGen: 8.0 },
    { traderIndex: 5, vortexId: 1n, side: "BEAR", amountGen: 5.5 },

    // Market 2: SOL
    { traderIndex: 6, vortexId: 2n, side: "BULL", amountGen: 9.0 },
    { traderIndex: 7, vortexId: 2n, side: "BEAR", amountGen: 7.5 },

    // Market 3: BNB
    { traderIndex: 8, vortexId: 3n, side: "BULL", amountGen: 6.5 },
    { traderIndex: 9, vortexId: 3n, side: "BEAR", amountGen: 8.0 },

    // Market 4: AVAX
    { traderIndex: 0, vortexId: 4n, side: "BEAR", amountGen: 7.0 },
    { traderIndex: 1, vortexId: 4n, side: "BULL", amountGen: 9.0 },
  ];

  console.log(`\n3. Executing ${betPlan.length} Prediction Stake Transactions across All 5 Markets...`);

  for (let i = 0; i < betPlan.length; i++) {
    const bet = betPlan[i];
    const trader = traders[bet.traderIndex];
    const traderClient = createClient({ chain: STUDIONET_CHAIN, account: trader.account });

    try {
      console.log(`   [Bet #${i + 1}] Trader #${trader.id} (${trader.account.address.slice(0, 8)}...) staking ${bet.amountGen} GEN on ${bet.side} (Market #${bet.vortexId})...`);
      const txHash = await traderClient.writeContract({
        address: CONTRACT_ADDRESS,
        functionName: "enter_prediction",
        args: [bet.vortexId, bet.side],
        value: parseEther(String(bet.amountGen)),
      });
      console.log(`   [SUCCESS] TxHash: ${txHash}`);
      await sleep(3500);
    } catch (err) {
      console.log(`   Notice (Bet #${i + 1}):`, err.message || err);
    }
  }

  // 4. Query Final Telemetry & Balances from Contract
  console.log("\n4. Querying Updated Telemetry from Contract...");
  const finalTelemetry = await readClient.readContract({
    address: CONTRACT_ADDRESS,
    functionName: "get_protocol_telemetry",
    args: [],
  });
  console.log("   Final Protocol Telemetry:\n  ", finalTelemetry);

  const contractBalance = await readClient.getBalance({ address: CONTRACT_ADDRESS });
  console.log(`\n💰 Final Contract Escrow Balance: ${formatEther(contractBalance)} GEN`);

  console.log("\n==========================================================");
  console.log("SUBSTANTIAL VOLUME GENERATION COMPLETE");
  console.log("==========================================================");
}

generateSubstantialVolume();
