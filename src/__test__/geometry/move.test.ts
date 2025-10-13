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
  it('generates an empty list for a blocked black pawn on f7 and b4', () => {
    const initPosL: Fen = validFenFrom('rnbqkb1r/1p1p1ppp/p1p2P2/8/3P4/8/PP3PPP/RNBQKBNR b KQkq - 0 6');
    const initPosB4: Fen = validFenFrom('rnbqkbnr/p1p2pp1/8/3pp2p/1p1P1B1P/1P2P3/P1P2PP1/RN1QKBNR w KQkq - 0 6');

    const boardL = createChessBoardFromFen(initPosL);
    const boardB4 = createChessBoardFromFen(initPosB4);

    const movesL = calculateMoveListForPawn({ column: 'f', row: 7 }, boardL);
    const movesB4 = calculateMoveListForPawn({ column: 'b', row: 4 }, boardB4);

    expect(movesL).toEqual([]);
    expect(movesB4).toEqual([]);
  });

  it('generates capture moves for white pawn on f4 and black pawn on e5', () => {
    const initPos = validFenFrom('rnbqkbnr/pp1p1ppp/8/2p1p3/3P1P2/8/PPP1P1PP/RNBQKBNR w KQkq c6 0 3');
    const board = createChessBoardFromFen(initPos);
    const movesWhitePawn = calculateMoveListForPawn({ column: 'f', row: 4 }, board);
    const movesBlackPawn = calculateMoveListForPawn({ column: 'e', row: 5 }, board);
    expect(movesWhitePawn).toEqual([
      { row: 5, column: 'f', isTaken: false },
      { row: 5, column: 'e', isTaken: true },
    ]);
    expect(movesBlackPawn).toEqual([
      { row: 4, column: 'e', isTaken: false },
      { row: 4, column: 'f', isTaken: true },
      { row: 4, column: 'd', isTaken: true },
    ]);
  });

  it('generates en passant move for white pawn on e5', () => {
    const initPos = validFenFrom('rnbqkbnr/p1p1pppp/8/1p1pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3');
    const board = createChessBoardFromFen(initPos);
    const movesE5 = calculateMoveListForPawn({ column: 'e', row: 5 }, board, 'd');
    expect(movesE5).toEqual([
      { row: 6, column: 'e', isTaken: false },
      { row: 6, column: 'd', isTaken: true },
    ]);
  });
  it('generates en passant move for black pawn on e4', () => {
    const initPos = validFenFrom('rnbqkbnr/pppp1ppp/8/8/4pP2/1P6/PBPPP1PP/RN1QKBNR b KQkq f3 0 3');
    const board = createChessBoardFromFen(initPos);
    const movesE5 = calculateMoveListForPawn({ column: 'e', row: 4 }, board, 'f');

    expect(movesE5).toEqual([
      { row: 3, column: 'e', isTaken: false },
      { row: 3, column: 'f', isTaken: true },
    ]);
  });
  it('generates en passent move for black blocked pawn on e4', () => {
    const initPos = validFenFrom('rnbqkbnr/pppp1ppp/8/8/3Pp3/1P2P3/P1P2PPP/RNBQKBNR b KQkq d3 0 3');
    const board = createChessBoardFromFen(initPos);
    const movesE5 = calculateMoveListForPawn({ column: 'e', row: 4 }, board, 'd');

    expect(movesE5).toEqual([{ row: 3, column: 'd', isTaken: true }]);
  });

});

describe.skip('Move generation for knight', () => {
  //to do
});
