export const STAGE_ORDER: Record<string, number> = {
  'foundation': 1,
  'superstructure': 2,
  'roofing': 3,
  'finishing': 4,
  'completion': 5,
};

export function getStageOrder(milestoneName: string): number {
  const normalizedName = milestoneName.toLowerCase();
  for (const [key, order] of Object.entries(STAGE_ORDER)) {
    if (normalizedName.includes(key)) return order;
  }
  return 99;
}
