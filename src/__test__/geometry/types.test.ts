import { checkValidFEN, initPosition } from '../../geometry/types.ts';

describe('tests for FEN module', () => {
  it('shows checks a valid FEN returning true', () => {
    expect(checkValidFEN(initPosition)).toBe(true);
  });
});
