import { INIT_POSITION } from '../../geometry/constant.ts';
import { calculateMoveListForPawn } from '../../geometry/move.ts';
import { Fen } from '../../geometry/types.ts';
import { validFenFrom } from '../../geometry/fen.ts';
import { createChessBoardFromFen } from '../../geometry/board.ts';

describe('Move generation for pawn', () => {
  it('generates all the moves for an e2, a2, h2 pawn in init position', () => {
    const initPos: Fen = INIT_POSITION;
    const board = createChessBoardFromFen(initPos);
    const movesE2 = calculateMoveListForPawn({ column: 'e', row: 2 }, board);
    const movesA2 = calculateMoveListForPawn({ column: 'a', row: 2 }, board);
    const movesH2 = calculateMoveListForPawn({ column: 'h', row: 2 }, board);

    expect(movesE2).toEqual([
      { row: 3, column: 'e', isTaken: false },
      { row: 4, column: 'e', isTaken: false },
    ]);
    expect(movesA2).toEqual([
      { row: 3, column: 'a', isTaken: false },
      { row: 4, column: 'a', isTaken: false },
    ]);
    expect(movesH2).toEqual([
      { row: 3, column: 'h', isTaken: false },
      { row: 4, column: 'h', isTaken: false },
    ]);
  });
  it('generates an empty list for a blocked white pawn on e4 and h4', () => {
    const initPosE4: Fen = validFenFrom('rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2');
    const initPosH4: Fen = validFenFrom('rnbqkbnr/ppppppp1/8/7p/7P/8/PPPPPPP1/RNBQKBNR w KQkq h6 0 2');

    const boardE4 = createChessBoardFromFen(initPosE4);
    const boardH4 = createChessBoardFromFen(initPosH4);

    const movesE4 = calculateMoveListForPawn({ column: 'e', row: 4 }, boardE4);
    const movesH4 = calculateMoveListForPawn({ column: 'h', row: 4 }, boardH4);

    expect(movesE4).toEqual([]);
    expect(movesH4).toEqual([]);
  });
  it('generates an empty list for a blocked black pawn on f7', () => {
    const initPosL: Fen = validFenFrom('rnbqkb1r/1p1p1ppp/p1p2P2/8/3P4/8/PP3PPP/RNBQKBNR b KQkq - 0 6');
    const boardL = createChessBoardFromFen(initPosL);
    const movesL = calculateMoveListForPawn({ column: 'f', row: 7 }, boardL);
    expect(movesL).toEqual([]);
  });
});
