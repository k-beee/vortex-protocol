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

async function deployFreshContract() {
  try {
    const contractPath = path.resolve("../contract/VortexEngine.py");
    const code = fs.readFileSync(contractPath, "utf-8");

    console.log("=================================================");
    console.log("DEPLOYING FRESH VORTEX ENGINE TO STUDIONET");
    console.log("=================================================");
    console.log(`Deployer Admin Address: ${fundingAccount.address}`);
    console.log(`RPC Endpoint: ${STUDIONET_CHAIN.rpcUrls.default.http[0]}\n`);

    console.log("Deploying contract code to GenLayer Studionet...");
    const txHash = await client.deployContract({
      code: code,
      args: [],
    });

    console.log(`[SUCCESS] Contract Deployment TxHash: ${txHash}`);

    // Wait and fetch deployed contract address from transaction receipt or client
    const receipt = await client.waitForTransactionReceipt({ hash: txHash });
    console.log("Receipt details:", receipt);

  } catch (err) {
    console.error("Deployment result:", err.message || err);
  }
}

deployFreshContract();
