import { INIT_POSITION } from '../../geometry/fen.ts';
import { calculateMoveListForPawn } from '../../geometry/move.ts';
import { Fen } from '../../geometry/types.ts';
import { createChessBoardFromFen } from '../../geometry/board.ts';
describe('Move generation for pawn', () => {
  it('generates all the moves for an e2 pawn in init position', () => {
    const initPos: Fen = INIT_POSITION;
    const board = createChessBoardFromFen(initPos);
    const moves = calculateMoveListForPawn({ row: 2, column: 'e' }, board);
    expect(moves).toEqual([
      { row: 3, column: 'e' },
      { row: 4, column: 'e' },
    ]);
  });
});
