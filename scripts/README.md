# Scripts

Standalone Node scripts for interacting with Arc Testnet directly — independent of
ConstructOS's own API or UI. Useful for verifying that anything the app reports
(a deposit, a settlement) genuinely happened on-chain, without trusting the app itself.

## For judges / independent verification

### `check-balance.mjs`

Reads any address's real USDC balance directly from Arc Testnet.

```bash
node scripts/check-balance.mjs 0xAnyAddress
```

No private key required — this is a read-only RPC call.

### `check-tx.mjs`

Confirms a specific transaction hash actually exists and succeeded on-chain — pulls the
real receipt (status, sender, recipient, block number, gas used) straight from Arc Testnet.

```bash
node scripts/check-tx.mjs 0xTransactionHash
```

Use this to independently verify any `txHash` shown in ConstructOS's ledger — e.g. after
a settlement or an on-chain deposit, paste the hash here (or check it on
`https://testnet.arcscan.app`) to confirm it's real rather than trusting the app's own report.

## Developer / debugging tools

These require project setup (`.env` with `TREASURY_PRIVATE_KEY`/`ARC_MODE=real`) and
aren't intended for a judge without that access — included for transparency into how
the app was tested during development, not as user-facing tools.

### `test-settlement.mjs`

Sends a raw native USDC transfer directly from the treasury wallet to a given address,
bypassing the app entirely. Useful for confirming the treasury key and RPC connection
work correctly, isolated from any application logic.

```bash
node scripts/test-settlement.mjs 0xRecipientAddress 1
```

### `check-history.mjs` / `check-range.mjs`

Pull an address's full incoming/outgoing USDC transfer history over a block range,
working around Arc's RPC result-count and block-range limits by chunking requests.
Built while debugging a balance discrepancy during development — `check-tx.mjs` is
usually a better fit if you already know which specific transaction you're checking.

### `reset-demo.ts`

Resets the running app's state back to the seeded demo workspace. Equivalent to calling
`POST /system/reset-demo` on the backend directly.
