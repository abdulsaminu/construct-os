import { CircleSettlementAdapter } from '../src/settlement-circle.js';

const DESTINATION_ADDRESS = '0x51B5784151295F375C67fe5829378a7f146D81DA';
const TEST_AMOUNT = 1n; // 1 USDC, whole-dollar unit — matches engine.ts convention

async function main() {
  const adapter = new CircleSettlementAdapter();
  console.log(`Submitting settlement of ${TEST_AMOUNT} USDC to ${DESTINATION_ADDRESS}...`);

  const receipt = await adapter.submitSettlement(DESTINATION_ADDRESS, TEST_AMOUNT);

  console.log('Receipt:', receipt);

  if (receipt.status === 'confirmed') {
    console.log(`✅ CONFIRMED — txHash: ${receipt.txHash}`);
  } else {
    console.log(`❌ NOT CONFIRMED — status: ${receipt.status}, reason: ${receipt.reason}`);
  }
}

main().catch((err) => {
  console.error('Error:', err.message || err);
  process.exit(1);
});
