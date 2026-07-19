import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";

const client = initiateDeveloperControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY!,
  entitySecret: process.env.CIRCLE_ENTITY_SECRET!,
});

async function main() {
  const id = process.argv[2];
  const response = await client.getTransaction({ id });
  console.log(JSON.stringify(response.data, null, 2));
}

main().catch((err) => console.error(err.message || err));
