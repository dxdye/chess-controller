import { INIT_POSITION, BOTH_CAN_CASTLE, NO_CASTLING } from '../../geometry/constant.ts';
import {
  calculateMoveListForPawn,
  calculateMoveListForKnight,
  calculateMoveListForBishop,
  calculateMoveListForRook,
  calculateMoveListForQueen,
  calculateMoveListForPiece,
  calculateMoveListForKing,
} from '../../geometry/move.ts';
import { Fen } from '../../geometry/types.ts';
import { validFenFrom } from '../../geometry/fen.ts';
import { createChessBoardFromFen } from '../../geometry/board.ts';
import { isKingChecked } from '../../geometry/check.ts';

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
  it('generates capture moves for white pawn on c2', () => {
    const initPos = validFenFrom('rnbqkbnr/pppp1ppp/8/8/8/1P1pP3/P1P2PPP/RNBQKBNR w KQkq - 0 4');
    const board = createChessBoardFromFen(initPos);
    const movesC2 = calculateMoveListForPawn({ column: 'c', row: 2 }, board);
    expect(movesC2).toEqual([
      { row: 3, column: 'c', isTaken: false },
      { row: 3, column: 'd', isTaken: true },
      { row: 4, column: 'c', isTaken: false },
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
  it('generates en passent move for black pawn on d4 with capture', () => {
    const initPos = validFenFrom('rnbqkbnr/ppp1pppp/8/8/2Pp4/4PN2/PP1P1PPP/RNBQKB1R b KQkq c3 0 3');
    const board = createChessBoardFromFen(initPos);
    const movesD4 = calculateMoveListForPawn({ column: 'd', row: 4 }, board, 'c');
    expect(movesD4).toEqual([
      { row: 3, column: 'd', isTaken: false },
      { row: 3, column: 'e', isTaken: true },
      { row: 3, column: 'c', isTaken: true },
    ]);
  });
});

describe('Move generation for knight', () => {
  it('generates all the moves and captures for white knight on f3.', () => {
    const initPos: Fen = 'rnbqkbnr/ppp2ppp/4p3/8/2Pp4/4PN2/PP1P1PPP/RNBQKB1R w KQkq - 0 4';
    const board = createChessBoardFromFen(initPos);
    const movesF3 = calculateMoveListForKnight({ column: 'f', row: 3 }, board);
    expect(movesF3).toEqual([
      { row: 5, column: 'g', isTaken: false },
      { row: 5, column: 'e', isTaken: false },
      { row: 1, column: 'g', isTaken: false },
      { row: 4, column: 'h', isTaken: false },
      { row: 4, column: 'd', isTaken: true },
    ]);
  });
  it('generate all the moves and captures for a black knight on f6', () => {
    const initPos = 'rnbqkb1r/ppp2ppp/4pn2/6NQ/2P1P3/3p4/PP1P1PPP/RNB1KB1R b KQkq - 1 6';
    const board = createChessBoardFromFen(initPos);
    const movesF3 = calculateMoveListForKnight({ column: 'f', row: 6 }, board);
    expect(movesF3).toEqual(
      expect.arrayContaining([
        { row: 5, column: 'h', isTaken: true },
        { row: 8, column: 'g', isTaken: false },
        { row: 7, column: 'd', isTaken: false },
        { row: 5, column: 'd', isTaken: false },
        { row: 4, column: 'g', isTaken: false },
        { row: 4, column: 'e', isTaken: true },
      ]),
    );
  });
  it('generates all the moves for a knight on a3 (on the rim)', () => {
    const initPos = 'rnbqkb1r/1pp2ppp/p3pn2/6NQ/2P1P3/N2p4/PP1P1PPP/R1B1KB1R b KQkq - 1 7';
    const board = createChessBoardFromFen(initPos);
    const movesA3 = calculateMoveListForKnight({ column: 'a', row: 3 }, board);
    expect(movesA3).toEqual(
      expect.arrayContaining([
        { row: 5, column: 'b', isTaken: false },
        { row: 2, column: 'c', isTaken: false },
      ]),
    );
  });
});

describe('Move generation for bishop', () => {
  //to be implemented
  it('generates all the moves and captures for a bishop on f1', () => {
    const initPos = validFenFrom('rnbqkb1r/1pp2ppp/p3pn2/6NQ/2P1P3/N2p4/PP1P1PPP/R1B1KB1R b KQkq - 1 7');
    const board = createChessBoardFromFen(initPos);
    const moves = calculateMoveListForBishop({ column: 'f', row: 1 }, board);
    expect(moves).toEqual([
      { row: 2, column: 'e', isTaken: false },
      { row: 3, column: 'd', isTaken: true },
    ]);
  });
  it('generates all the moves for white bishop on g2, which targets the diagonal a8-h1', () => {
    const initPos = validFenFrom('rnbqk2r/4bppp/pp2pn2/2p1P1NQ/2P5/N2p2P1/PP1P1PBP/R1B1K2R b KQkq - 2 10');
    const board = createChessBoardFromFen(initPos);
    const moves = calculateMoveListForBishop({ column: 'g', row: 2 }, board);
    expect(moves).toEqual(
      expect.arrayContaining([
        { row: 3, column: 'f', isTaken: false },
        { row: 4, column: 'e', isTaken: false },
        { row: 5, column: 'd', isTaken: false },
        { row: 6, column: 'c', isTaken: false },
        { row: 7, column: 'b', isTaken: false },
        { row: 8, column: 'a', isTaken: true },

        { row: 3, column: 'h', isTaken: false },
        { row: 1, column: 'f', isTaken: false },
      ]),
    );
    expect(moves).not.toEqual(
      expect.arrayContaining([
        { row: 3, column: 'f', isTaken: false },
        { row: 4, column: 'e', isTaken: false },
        { row: 5, column: 'd', isTaken: false },
        { row: 6, column: 'c', isTaken: false },
        { row: 7, column: 'b', isTaken: false },
        { row: 8, column: 'a', isTaken: false },

        { row: 3, column: 'h', isTaken: false },
        { row: 1, column: 'f', isTaken: false },
      ]),
    );
  });
  it('generates all the moves for black bishop on b7, which targets the diagonal a8-h1', () => {
    const initPos = validFenFrom('rn2k2r/1b2bppp/pp2pn2/2p1P1NQ/2Pq1P2/NP1p2P1/P2P2BP/R1B1K2R b KQkq f3 0 12');
    const board = createChessBoardFromFen(initPos);
    const moves = calculateMoveListForBishop({ column: 'b', row: 7 }, board);
    expect(moves).toEqual(
      expect.arrayContaining([
        { row: 8, column: 'c', isTaken: false },
        { row: 6, column: 'c', isTaken: false },
        { row: 5, column: 'd', isTaken: false },
        { row: 4, column: 'e', isTaken: false },
        { row: 3, column: 'f', isTaken: false },
        { row: 2, column: 'g', isTaken: true },
      ]),
    );
  });
  it('generates empty move lists for bishop in init position on c1 and f1', () => {
    const initPos: Fen = INIT_POSITION;
    const board = createChessBoardFromFen(initPos);
    const movesC1 = calculateMoveListForBishop({ column: 'c', row: 1 }, board);
    const movesF1 = calculateMoveListForBishop({ column: 'f', row: 1 }, board);
    //assert
    expect(movesC1).toEqual([]);
    expect(movesF1).toEqual([]);
  });
});

describe('Move generation for rook', () => {
  it('generates all the moves and captures for a rook on h1 (capture queen on g1)', () => {
    const board = createChessBoardFromFen('rn2k2r/1b2bppp/pp2pn2/2p1P1NQ/2P2P2/NP1p2P1/P2P2BP/R1B1K1qR w KQkq - 1 13');
    const moves = calculateMoveListForRook({ column: 'h', row: 1 }, board);
    expect(moves).toEqual([{ row: 1, column: 'g', isTaken: true }]);
  });
  it('generates all the moves for a rook on a3 (swiss-cross on the rim)', () => {
    const board = createChessBoardFromFen('8/8/8/8/8/R7/8/5K1k w - - 0 1');
    const moves = calculateMoveListForRook({ column: 'a', row: 3 }, board);
    expect(moves).toEqual(
      expect.arrayContaining([
        { row: 3, column: 'b', isTaken: false },
        { row: 3, column: 'c', isTaken: false },
        { row: 3, column: 'd', isTaken: false },
        { row: 3, column: 'e', isTaken: false },
        { row: 3, column: 'f', isTaken: false },
        { row: 3, column: 'g', isTaken: false },
        { row: 3, column: 'h', isTaken: false },

        { row: 4, column: 'a', isTaken: false },
        { row: 5, column: 'a', isTaken: false },
        { row: 6, column: 'a', isTaken: false },
        { row: 7, column: 'a', isTaken: false },
        { row: 8, column: 'a', isTaken: false },

        { row: 2, column: 'a', isTaken: false },
        { row: 1, column: 'a', isTaken: false },
      ]),
    );
  });
  it('generates all the moves for a rook on d5', () => {
    const board = createChessBoardFromFen('8/8/8/3R4/8/8/5K1k/8 w - - 0 1');
    const moves = calculateMoveListForRook({ column: 'd', row: 5 }, board);
    expect(moves).toEqual(
      expect.arrayContaining([
        //on row 5
        { row: 5, column: 'a', isTaken: false },
        { row: 5, column: 'b', isTaken: false },
        { row: 5, column: 'c', isTaken: false },

        { row: 5, column: 'e', isTaken: false },
        { row: 5, column: 'f', isTaken: false },
        { row: 5, column: 'g', isTaken: false },
        { row: 5, column: 'h', isTaken: false },
        //on column d
        { row: 6, column: 'd', isTaken: false },
        { row: 7, column: 'd', isTaken: false },
        { row: 8, column: 'd', isTaken: false },

        { row: 4, column: 'd', isTaken: false },
        { row: 3, column: 'd', isTaken: false },
        { row: 2, column: 'd', isTaken: false },
        { row: 1, column: 'd', isTaken: false },
      ]),
    );
  });
});

describe('Move generation for queen', () => {
  it('generates all the moves and captures for a queen on d5 (star)', () => {
    const board = createChessBoardFromFen('8/8/8/3Q4/8/8/5K1k/8 w - - 0 1');
    const moves = calculateMoveListForQueen({ column: 'd', row: 5 }, board);

    expect(moves).toEqual(
      expect.arrayContaining([
        //on row 5
        { row: 5, column: 'a', isTaken: false },
        { row: 5, column: 'b', isTaken: false },
        { row: 5, column: 'c', isTaken: false },

        { row: 5, column: 'e', isTaken: false },
        { row: 5, column: 'f', isTaken: false },
        { row: 5, column: 'g', isTaken: false },
        { row: 5, column: 'h', isTaken: false },
        //on column d
        { row: 6, column: 'd', isTaken: false },
        { row: 7, column: 'd', isTaken: false },
        { row: 8, column: 'd', isTaken: false },

        { row: 4, column: 'd', isTaken: false },
        { row: 3, column: 'd', isTaken: false },
        { row: 2, column: 'd', isTaken: false },
        { row: 1, column: 'd', isTaken: false },

        //on diagonal
        { row: 6, column: 'e', isTaken: false },
        { row: 7, column: 'f', isTaken: false },
        { row: 8, column: 'g', isTaken: false },

        { row: 4, column: 'c', isTaken: false },
        { row: 3, column: 'b', isTaken: false },
        { row: 2, column: 'a', isTaken: false },

        { row: 6, column: 'c', isTaken: false },
        { row: 7, column: 'b', isTaken: false },
        { row: 8, column: 'a', isTaken: false },

        { row: 4, column: 'e', isTaken: false },
        { row: 3, column: 'f', isTaken: false },
        { row: 2, column: 'g', isTaken: false },
        { row: 1, column: 'h', isTaken: false },
      ]),
    );
  });
  //all other queen tests are covered by rook and bishop tests
});

describe('Move generation for king', () => {
  it('generates all the moves for a king on d4', () => {
    const board = createChessBoardFromFen('8/8/8/7k/3K4/8/8/8 w - - 0 1');
    const moves = calculateMoveListForKing({ column: 'd', row: 4 }, board, false, NO_CASTLING);
    expect(moves).toStrictEqual(
      expect.arrayContaining([
        { row: 5, column: 'c', isTaken: false },
        { row: 5, column: 'd', isTaken: false },
        { row: 5, column: 'e', isTaken: false },
        { row: 4, column: 'e', isTaken: false },
        { row: 4, column: 'c', isTaken: false },
        { row: 3, column: 'e', isTaken: false },
        { row: 3, column: 'd', isTaken: false },
        { row: 3, column: 'c', isTaken: false },
      ]),
    );
  });
  it('generates moves for checked king in bishop direction', () => {
    const board = createChessBoardFromFen('8/6b1/8/7k/3K4/8/8/8 w - - 0 1');
    const kingIsChecked = isKingChecked(board, 'white');
    const moves = calculateMoveListForKing({ column: 'd', row: 4 }, board, kingIsChecked, NO_CASTLING);
    expect(moves).toStrictEqual([
      { row: 5, column: 'd', isTaken: false },
      { row: 3, column: 'd', isTaken: false },
      { row: 4, column: 'e', isTaken: false },
      { row: 4, column: 'c', isTaken: false },
      { row: 5, column: 'c', isTaken: false },
      { row: 3, column: 'e', isTaken: false },

      //not allowed: e5, c3 (checked by bishop)
    ]);
  });
  it('generates moves for checked king in rook direction', () => {
    const board = createChessBoardFromFen('8/8/8/3R3k/3K4/8/8/8 w - - 0 1');
    const kingIsChecked = isKingChecked(board, 'black');
    const moves = calculateMoveListForKing({ column: 'h', row: 5 }, board, kingIsChecked, NO_CASTLING);
    expect(moves).toStrictEqual(
      expect.arrayContaining([
        { row: 4, column: 'h', isTaken: false },
        { row: 6, column: 'h', isTaken: false },
        { row: 4, column: 'g', isTaken: false },
        { row: 6, column: 'g', isTaken: false },
        //not allowed: e5, c3 (checked by bishop)
      ]),
    );
  });
  it('generates moves for checked king by knight', () => {
    const board = createChessBoardFromFen('8/8/4n3/6K1/3k4/8/8/8 w - - 0 1');
    const kingIsChecked = isKingChecked(board, 'black');
    const moves = calculateMoveListForKing({ column: 'g', row: 5 }, board, kingIsChecked, NO_CASTLING);
    expect(moves).toStrictEqual(
      expect.arrayContaining([
        { row: 4, column: 'h', isTaken: false },
        { row: 5, column: 'h', isTaken: false },
        { row: 6, column: 'h', isTaken: false },
        { row: 6, column: 'h', isTaken: false },
        { row: 4, column: 'g', isTaken: false },
        { row: 6, column: 'g', isTaken: false },
        { row: 5, column: 'f', isTaken: false },
        { row: 6, column: 'f', isTaken: false },
      ]),
    );
    expect(moves).not.toBe(
      expect.arrayContaining([
        { row: 6, column: 'h', isTaken: false },
        { row: 4, column: 'h', isTaken: false },
        { row: 4, column: 'f', isTaken: false }, //f4 would be checked
        { row: 5, column: 'h', isTaken: false },
        { row: 6, column: 'h', isTaken: false },
        { row: 4, column: 'g', isTaken: false },
        { row: 6, column: 'g', isTaken: false },
        { row: 5, column: 'f', isTaken: false },
        { row: 6, column: 'f', isTaken: false },
      ]),
    );
  });
  it('generates moves for king on f5 surrounded by pawns', () => {
    const board = createChessBoardFromFen('8/5pp1/7p/5K2/3k4/8/8/8 w - - 0 1');
    const moves = calculateMoveListForKing({ column: 'f', row: 5 }, board, false, NO_CASTLING);
    expect(moves).toEqual([
      { row: 4, column: 'f', isTaken: false },
      { row: 4, column: 'g', isTaken: false },
    ]);
  });
  it('generates moves for white and black king castle', () => {
    const board = createChessBoardFromFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQK2R w KQkq - 0 1');
    const boardB = createChessBoardFromFen('rnbqk2r/pppppppp/6n1/8/5b2/8/PPPPPPPP/RNBQK2R w KQkq - 0 1');
    const movesE1 = calculateMoveListForKing({ column: 'e', row: 1 }, board, false, BOTH_CAN_CASTLE);
    const movesE8 = calculateMoveListForKing({ column: 'e', row: 8 }, boardB, false, BOTH_CAN_CASTLE);
    expect(movesE1).toEqual([
      { row: 1, column: 'f', isTaken: false },
      { row: 1, column: 'g', isTaken: false, isCastle: 'K' }, //castle short
    ]);
    expect(movesE8).toEqual([
      { row: 8, column: 'f', isTaken: false },
      { row: 8, column: 'g', isTaken: false, isCastle: 'k' }, //castle long
    ]);
  });
  it('generates limited or no moves for king castle failure', () => {
    const board = createChessBoardFromFen('rnbqk2r/pppppppp/6n1/8/8/6Pb/PPPPPP1P/RNBQK2R w KQkq - 0 1');
    const board2 = createChessBoardFromFen('rnbqk2r/pppppppp/6n1/8/8/6P1/PPPPPP1b/RNBQK2R w KQkq - 0 1');
    const boardCastleShouldWork = createChessBoardFromFen('rnbqk2r/pppppppp/6n1/8/8/6PB/PPPPPP2/RN1QK2R w KQkq - 0 1'); //white bishop on h3 does not block castling
    const movesE1 = calculateMoveListForKing({ column: 'e', row: 1 }, board, false, BOTH_CAN_CASTLE);
    const movesE2 = calculateMoveListForKing({ column: 'e', row: 1 }, board2, false, BOTH_CAN_CASTLE);
    const movesCastleShouldWork = calculateMoveListForKing(
      { column: 'e', row: 1 },
      boardCastleShouldWork,
      false,
      BOTH_CAN_CASTLE,
    );
    expect(movesE1).toEqual([]);
    expect(movesE2).toEqual([{ row: 1, column: 'f', isTaken: false }]);
    expect(movesCastleShouldWork).toEqual([
      { row: 1, column: 'f', isTaken: false },
      { row: 1, column: 'g', isTaken: false, isCastle: 'K' },
    ]);
  });
  it('generates moves for queen side castle', () => {
    const board = createChessBoardFromFen('rnbqk2r/pppppppp/6n1/8/8/N1Q3P1/PPPPPP2/R3KB1R w KQkq - 0 1');
    const boardQueenSideCastleFailure = createChessBoardFromFen(
      'rn1qk2r/pppppppp/6n1/8/8/N1Q5/PPbPPP2/R3KB1R w KQkq - 0 1',
      //'rn1qk2r/pppppppp/6n1/8/b7/N1Q5/PP1PPP2/R3KB1R w KQkq - 0 1',
    ); //path blocked by potential bishop catch
    const boardQueenSideCastleFailure2 = createChessBoardFromFen(
      'rn1qk2r/pppppppp/6n1/8/8/N1Q3P1/PP1PPb2/R3KB1R w KQkq - 0 1',
    );
    //king is checked
    const movesE1 = calculateMoveListForKing({ column: 'e', row: 1 }, board, false, BOTH_CAN_CASTLE);
    const movesE2 = calculateMoveListForKing(
      { column: 'e', row: 1 },
      boardQueenSideCastleFailure,
      false,
      BOTH_CAN_CASTLE,
    );
    const movesE3 = calculateMoveListForKing(
      { column: 'e', row: 1 },
      boardQueenSideCastleFailure2,
      true,
      BOTH_CAN_CASTLE,
    );
    expect(movesE1).toEqual([
      { row: 1, column: 'd', isTaken: false },
      { row: 1, column: 'c', isTaken: false, isCastle: 'Q' }, //castle long
    ]);
    expect(movesE2).toStrictEqual([]); //shouldn't be able to do anything
    expect(movesE3).toEqual([
      { row: 1, column: 'd', isTaken: false },
      { row: 2, column: 'f', isTaken: true },
    ]);
  });
  it('validate white queen-side castle move not possible in position', () => {
    const board = createChessBoardFromFen('rn1qk2r/pppppppp/6n1/8/8/N1Q1P3/PP2PPb1/R3Kr1R w kq - 0 1');
    const movesE1 = calculateMoveListForKing({ column: 'e', row: 1 }, board, false);
    expect(movesE1).toEqual([{ row: 2, column: 'd', isTaken: false }]); // only move is d2
  });
  it('validate black king-side castle move not possible in position', () => {
    const board = createChessBoardFromFen('rn1Rk2r/ppB1p1pp/2p1p1n1/8/8/N1Q1P1r1/PP2PPb1/R3K2R w kq - 0 1');
    const board2 = createChessBoardFromFen('rn1Rk2r/ppB1pPpp/2p1p1n1/8/8/N1Q1P1r1/PP3Pb1/R3K2R w kq - 0 1');
    const movesE8 = calculateMoveListForKing({ column: 'e', row: 8 }, board, false, BOTH_CAN_CASTLE);
    const movesE82 = calculateMoveListForKing({ column: 'e', row: 8 }, board2, false, BOTH_CAN_CASTLE);

    expect(movesE8).toEqual([{ row: 7, column: 'f', isTaken: false }]); //castle not possible
    expect(movesE82).toEqual([{ row: 7, column: 'f', isTaken: true }]); //castle not possible
  });
  it('validate white side castle move not possible in position', () => {
    const board = createChessBoardFromFen('rn2k2r/ppB1p1pp/2pRpPn1/8/8/N1Q1P1r1/PP3P2/R2K3R w kq - 0 1');
    const movesE8 = calculateMoveListForKing({ column: 'd', row: 1 }, board, false, BOTH_CAN_CASTLE);
    expect(movesE8).toEqual(
      expect.arrayContaining([
        { row: 1, column: 'c', isTaken: false },
        { row: 2, column: 'c', isTaken: false },
        { row: 2, column: 'd', isTaken: false },
        { row: 1, column: 'e', isTaken: false },
        { row: 2, column: 'e', isTaken: false },
      ]),
    ); // only move is d7
  });
});

describe('calculates moves for arbitrary peace', () => {
  it('returns an empty move list if king is checked by pawn', () => {
    const initPos = validFenFrom('8/8/8/4pP2/3K4/8/6k1/8 w - - 0 1');
    const board = createChessBoardFromFen(initPos);
    const movesE1 = calculateMoveListForPiece({ column: 'f', row: 5 }, board);
    //movelist checked king
    expect(movesE1).toEqual([]);
  });
  it('returns an empty move list if king is checked by knight', () => {
    const initPos = validFenFrom('8/8/2n1p3/5P2/3K4/8/6k1/8 w - - 0 1');
    const board = createChessBoardFromFen(initPos);
    const movesE1 = calculateMoveListForPiece({ column: 'f', row: 5 }, board);
    expect(movesE1).toEqual([]);
  });
  //other tests not necessarily needed, as they are covered by check.test.ts
});
