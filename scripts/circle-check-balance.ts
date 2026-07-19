import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";
import { loadCircleWallets } from "../src/circle-wallet-store.js";

const client = initiateDeveloperControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY!,
  entitySecret: process.env.CIRCLE_ENTITY_SECRET!,
});

async function main() {
  const registry = loadCircleWallets();
  const treasury = registry["constructos-treasury-main"];

  if (!treasury) {
    throw new Error("No treasury wallet found in data/circle-wallets.json");
  }

  const response = await client.getWalletTokenBalance({ id: treasury.walletId });
  console.log(`Balance for ${treasury.name} (${treasury.address}):`);
  console.log(response.data?.tokenBalances);
}

main().catch((err) => {
  console.error("Error:", err.message || err);
  process.exit(1);
});
