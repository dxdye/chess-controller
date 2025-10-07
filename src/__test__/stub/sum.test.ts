import { sum } from './sum.ts';

describe('sum function is working', () => {
  it('shows that sum(2,2) is 4.', () => {
    expect(sum(2, 2)).toBe(4);
  });
});
