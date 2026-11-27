/**
 * Z-order for backends that store one record per shape (Firestore, SQL rows...).
 *
 * Instead of saving the whole `shapeOrder` array in one hot record (which every client
 * would rewrite on every new shape), each shape stores a number `z`; sorting by `z`
 * gives the order. When the order changes, `planZOrder` returns new `z` values for the
 * FEWEST shapes possible: it keeps the longest run of shapes that are already in
 * increasing `z` and only renumbers the others (new shapes, or ones that were moved).
 */
export function planZOrder(
  order: string[],
  z: Readonly<Record<string, number | undefined>>
): Record<string, number> {
  const n = order.length;
  const values = order.map((id) => z[id]);

  // Longest strictly increasing subsequence over the known z values (patience sorting)
  const tailIdx: number[] = [];
  const prev = new Array<number>(n).fill(-1);
  for (let i = 0; i < n; i++) {
    const v = values[i];
    if (v === undefined || !Number.isFinite(v)) continue;
    let lo = 0;
    let hi = tailIdx.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if ((values[tailIdx[mid]] as number) < v) lo = mid + 1;
      else hi = mid;
    }
    if (lo > 0) prev[i] = tailIdx[lo - 1];
    tailIdx[lo] = i;
  }
  const keep = new Set<number>();
  for (let i = tailIdx.length ? tailIdx[tailIdx.length - 1] : -1; i >= 0; i = prev[i]) keep.add(i);

  // Renumber everything between two kept neighbours, evenly spaced in the gap
  const updates: Record<string, number> = {};
  let i = 0;
  while (i < n) {
    if (keep.has(i)) {
      i++;
      continue;
    }
    let j = i;
    while (j < n && !keep.has(j)) j++;
    const lower = i > 0 ? (values[i - 1] as number) : undefined;
    const upper = j < n ? (values[j] as number) : undefined;
    const count = j - i;
    for (let k = 0; k < count; k++) {
      let value: number;
      if (lower === undefined && upper === undefined) value = k + 1;
      else if (lower === undefined) value = (upper as number) - (count - k);
      else if (upper === undefined) value = lower + (k + 1);
      else value = lower + ((upper - lower) * (k + 1)) / (count + 1);
      updates[order[i + k]] = value;
      values[i + k] = value;
    }
    i = j;
  }
  return updates;
}

/** Ids sorted by z (ties / missing z keep their relative input order). */
export function orderByZ(ids: string[], z: Readonly<Record<string, number | undefined>>): string[] {
  return ids
    .map((id, index) => ({ id, index, z: z[id] ?? Number.POSITIVE_INFINITY }))
    .sort((a, b) => a.z - b.z || a.index - b.index)
    .map((e) => e.id);
}
