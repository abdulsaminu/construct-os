export interface Economy {
  totalCapital: bigint;
  lockedCapital: bigint;
  settledCapital: bigint;
}

export function createInitialEconomy(initialCapital: bigint): Economy {
  return { totalCapital: initialCapital, lockedCapital: 0n, settledCapital: 0n };
}

export function getAvailableCapital(economy: Economy): bigint {
  return economy.totalCapital - economy.lockedCapital - economy.settledCapital;
}

export function assertConservation(economy: Economy): void {
  const sum = getAvailableCapital(economy) + economy.lockedCapital + economy.settledCapital;
  if (sum !== economy.totalCapital) {
    throw new Error(`Capital conservation violated: ${sum} !== ${economy.totalCapital}`);
  }
}
