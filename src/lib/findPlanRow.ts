/**
 * Match a unit number (e.g. "G-04") against a payment plan row's shopNo
 * which may contain grouped units like "G-02,3,4,5" or suffixed entries
 * like "G-01 FC".
 *
 * Returns the first matching row, or undefined if no match.
 */
export function findPlanRow<T extends { shopNo: string }>(
  rows: T[],
  unitNumber: string
): T | undefined {
  if (!unitNumber) return undefined;

  const exact = rows.find((r) => r.shopNo === unitNumber);
  if (exact) return exact;

  // Parse unitNumber: "G-04" → prefix "G-", num 4
  const unitMatch = unitNumber.match(/^(.+?-)(\d+)$/);
  if (!unitMatch) return undefined;

  const unitPrefix = unitMatch[1];
  const unitNum = parseInt(unitMatch[2], 10);

  for (const row of rows) {
    // Parse shopNo: "G-02,3,4,5 FC" → prefix "G-", numPart "02,3,4,5"
    const shopMatch = row.shopNo.match(/^(.+?-)(\d[\d,]*)(.*)$/);
    if (!shopMatch) continue;

    const shopPrefix = shopMatch[1];
    if (shopPrefix !== unitPrefix) continue;

    const nums = shopMatch[2].split(",").map((n) => parseInt(n.trim(), 10));
    if (nums.includes(unitNum)) return row;
  }

  return undefined;
}

/**
 * Count how many individual units a shopNo represents.
 * "G-01 FC" → 1, "G-02,3,4,5" → 4, "LGF-10,11,12,13,14" → 5, "2F-6,7 C" → 2
 */
export function countUnitsInShopNo(shopNo: string): number {
  const match = shopNo.match(/^.+?-(\d[\d,]*)(.*)$/);
  if (!match) return 1;
  return match[1].split(",").length;
}
