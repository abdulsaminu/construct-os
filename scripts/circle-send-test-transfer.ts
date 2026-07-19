import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";
import { loadCircleWallets } from "../src/circle-wallet-store.js";

const DESTINATION_ADDRESS = "0x51B5784151295F375C67fe5829378a7f146D81DA";
const ARC_TESTNET_USDC_TOKEN_ID = "ef87c8c3-85de-598a-af50-c5135eecfa74";
const TRANSFER_AMOUNT_USDC = "1";

const client = initiateDeveloperControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY!,
  entitySecret: process.env.CIRCLE_ENTITY_SECRET!,
});

async function main() {
  const registry = loadCircleWallets();
  const treasury = registry["constructos-treasury-main"];
  if (!treasury) throw new Error("No treasury wallet found in data/circle-wallets.json");

  console.log(`Sending ${TRANSFER_AMOUNT_USDC} USDC from ${treasury.address} to ${DESTINATION_ADDRESS}...`);

  const transferResponse = await client.createTransaction({
    walletId: treasury.walletId,
    tokenId: ARC_TESTNET_USDC_TOKEN_ID,
    destinationAddress: DESTINATION_ADDRESS,
    amounts: [TRANSFER_AMOUNT_USDC],
    fee: {
      type: "level",
      config: { feeLevel: "MEDIUM" },
    },
  });

  const transactionId = transferResponse.data?.id;
  let currentState = transferResponse.data?.state ?? "";
  if (!transactionId) throw new Error("Transaction creation failed: no ID returned");

  console.log("Transfer initiated:", transferResponse.data);

  const terminalStates = new Set(["COMPLETE", "FAILED", "CANCELLED", "DENIED"]);
  while (!terminalStates.has(currentState)) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const pollResponse = await client.getTransaction({ id: transactionId });
    currentState = pollResponse.data?.transaction?.state ?? "";
    console.log(`Polling... state: ${currentState}`);
  }

  if (currentState !== "COMPLETE") throw new Error(`Transaction ended in state: ${currentState}`);
  console.log("Transfer COMPLETE.");
}

main().catch((err) => {
  console.error("Error:", err.message || err);
  process.exit(1);
});
