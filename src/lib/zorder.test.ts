import { describe, expect, it } from 'vitest';
import { orderByZ, planZOrder } from './zorder';

/** Applies a plan and returns the resulting order by z. */
const apply = (order: string[], z: Record<string, number>) => {
  const next = { ...z, ...planZOrder(order, z) };
  return { next, sorted: orderByZ([...order].reverse(), next) };
};

describe('planZOrder', () => {
  it('numbers a fresh board', () => {
    expect(planZOrder(['a', 'b', 'c'], {})).toEqual({ a: 1, b: 2, c: 3 });
  });

  it('adding a shape on top writes only that shape', () => {
    const plan = planZOrder(['a', 'b', 'c', 'new'], { a: 1, b: 2, c: 3 });
    expect(plan).toEqual({ new: 4 });
  });

  it('bring to front / send to back move one shape only', () => {
    const z = { a: 1, b: 2, c: 3, d: 4 };
    expect(planZOrder(['b', 'c', 'd', 'a'], z)).toEqual({ a: 5 });
    expect(planZOrder(['d', 'a', 'b', 'c'], z)).toEqual({ d: 0 });
  });

  it('inserting in the middle uses a fractional z between neighbours', () => {
    const plan = planZOrder(['a', 'x', 'b'], { a: 1, b: 2 });
    expect(plan.x).toBeGreaterThan(1);
    expect(plan.x).toBeLessThan(2);
  });

  it('nothing to write when the order already matches', () => {
    expect(planZOrder(['a', 'b'], { a: 1, b: 7 })).toEqual({});
  });

  it('always yields the requested order', () => {
    const z = { a: 1, b: 2, c: 3, d: 4, e: 5 };
    const target = ['e', 'b', 'new', 'a', 'd', 'c'];
    const { sorted } = apply(target, z);
    expect(sorted).toEqual(target);
  });

  it('orderByZ sorts and keeps unknown ids last', () => {
    expect(orderByZ(['c', 'x', 'a', 'b'], { a: 1, b: 2, c: 3 })).toEqual(['a', 'b', 'c', 'x']);
  });
});
