export type LedgerEntryType = "CAPITAL_DEPOSIT" | "MILESTONE_FUNDED" | "MILESTONE_CLAIMED" | "SETTLEMENT" | "CAPITAL_RELEASED";

export interface LedgerEntry {
  id: string;
  projectId: string;
  type: LedgerEntryType;
  amount: bigint;
  timestamp: number;
  payeeId?: string;
  milestoneId?: string;
  metadata?: Record<string, unknown>;
}

export function createLedgerEntry(params: Omit<LedgerEntry, "id" | "timestamp">): LedgerEntry {
  return { ...params, id: crypto.randomUUID(), timestamp: Date.now() };
}

export function filterByProject(entries: LedgerEntry[], projectId: string): LedgerEntry[] {
  return entries.filter(e => e.projectId === projectId);
}

export function filterByPayee(entries: LedgerEntry[], payeeId: string): LedgerEntry[] {
  return entries.filter(e => e.payeeId === payeeId);
}
