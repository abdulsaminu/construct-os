import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";

const client = initiateDeveloperControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY!,
  entitySecret: process.env.CIRCLE_ENTITY_SECRET!,
});

async function main() {
  const updated = await client.updateWallet({
    id: "deb8bc03-9fe7-563f-b0c5-87668725c834",
    name: "ConstructOS Main Treasury",
    refId: "constructos-treasury-main",
  });
  console.log("Updated wallet:", updated.data?.wallet);
}

main().catch((err) => {
  console.error("Error:", err.message || err);
  process.exit(1);
});
