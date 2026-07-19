import fs from 'fs';
import path from 'path';

export interface CircleWalletRecord {
  walletId: string;
  walletSetId: string;
  address: string;
  blockchain: string;
  name: string;
  refId: string;
}

export interface CircleWalletRegistry {
  [refId: string]: CircleWalletRecord;
}

const DEFAULT_PATH = process.env.CIRCLE_WALLETS_FILE || 'data/circle-wallets.json';

export function loadCircleWallets(filePath: string = DEFAULT_PATH): CircleWalletRegistry {
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export function saveCircleWallet(record: CircleWalletRecord, filePath: string = DEFAULT_PATH): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const registry = loadCircleWallets(filePath);
  registry[record.refId] = record;

  const tempPath = `${filePath}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(registry, null, 2));
  fs.renameSync(tempPath, filePath);
}
