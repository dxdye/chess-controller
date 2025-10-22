import { createChessBoardFromFen } from '../../geometry/board.ts';
import { isKingChecked, isPositionChecked, wouldPositionBeChecked } from '../../geometry/check.ts';
import { INIT_POSITION } from '../../geometry/constant.ts';
describe('King is checked', () => {
  it('proves that black king on h8 is checked in bishop direction (by queen and bishop)', () => {
    const boardBishop = createChessBoardFromFen('7k/8/8/8/3B4/8/5K2/8 w - - 0 1');
    const boardQueen = createChessBoardFromFen('7k/p7/8/8/8/8/1Q6/2K5 w - - 0 1');
    const boardNotChecked = createChessBoardFromFen('8/p7/5k2/8/8/4B2B/3K4/8 w - - 0 1');
    const resB = isKingChecked(boardBishop, 'black');
    const resQ = isKingChecked(boardQueen, 'black');
    const resNotChecked = isKingChecked(boardNotChecked, 'black');
    expect(resB).toBe(true);
    expect(resQ).toBe(true);
    expect(resNotChecked).not.toBe(true);
  });
  it('proves that black king on g8 is checked in rook direction', () => {
    const boardRook = createChessBoardFromFen('6k1/p7/8/8/8/8/6R1/2K5 w - - 0 1'); //vertical rook
    const boardRook2 = createChessBoardFromFen('8/8/8/3R3k/3K4/8/8/8 w - - 0 1'); //horizontal rook
    const boardRook3 = createChessBoardFromFen('8/8/8/3R2k1/3K4/8/8/8 w - - 0 1'); //horizontal rook
    const boardQueen = createChessBoardFromFen('6k1/p7/8/8/8/8/6Q1/2K5 w - - 0 1');
    const boardNotChecked = createChessBoardFromFen('3RQ3/p6R/5k2/7R/8/6R1/3K4/8 w - - 0 1');
    const resR = isKingChecked(boardRook, 'black');
    const resR2 = isKingChecked(boardRook2, 'black');
    const resR3 = isKingChecked(boardRook3, 'black');
    const resQ = isKingChecked(boardQueen, 'black');
    const resNotChecked = isKingChecked(boardNotChecked, 'black');
    const resR3PositionChecked = isKingChecked(boardRook3, 'black');
    expect(resR).toBe(true);
    expect(resR2).toBe(true);
    expect(resR3).toBe(true);
    expect(resR3PositionChecked).toBe(true);
    expect(resQ).toBe(true);
    expect(resNotChecked).not.toBe(true);
  });
  it('proves that king gets checked by knight', () => {
    const boardKnight = createChessBoardFromFen('8/p7/5k2/8/6N1/8/3K4/8 w - - 0 1');
    const boardKnight2 = createChessBoardFromFen('8/p7/5k2/3N4/8/3K4/8/8 w - - 0 1');
    const boardNotChecked = createChessBoardFromFen('8/p7/5k2/8/8/6N1/3K4/8 w - - 0 1');
    const resN = isKingChecked(boardKnight, 'black');
    const resN2 = isKingChecked(boardKnight2, 'black');
    expect(resN).toBe(true);
    expect(resN2).toBe(true);
    expect(boardNotChecked).not.toBe(true);
  });

  it('proves that king gets checked by pawn from the left and right (both direction)', () => {
    const boardPawnLeft = createChessBoardFromFen('7k/p5P1/8/8/8/6R1/Q7/2K5 w - - 0 1');
    const boardPawnRight = createChessBoardFromFen('8/p7/5k2/3P2P1/8/3p4/3K4/8 w - - 0 1');
    const boardPawnLeftW = createChessBoardFromFen('8/p7/5k2/3P4/8/4p3/3K4/8 w - - 0 1');
    const boardPawnRightW = createChessBoardFromFen('8/p7/5k2/3P4/8/2p5/3K4/8 w - - 0 1');
    const resPL = isKingChecked(boardPawnLeft, 'black');
    const resPR = isKingChecked(boardPawnRight, 'black');
    const resPLW = isKingChecked(boardPawnLeftW, 'white');
    const resPRW = isKingChecked(boardPawnRightW, 'white');
    expect(resPL).toBe(true);
    expect(resPR).toBe(true);
    expect(resPRW).toBe(true);
    expect(resPLW).toBe(true);
  });
  it('proves that king not checked by pawn when pawn is in front of next to king (both directions)', () => {
    const boardPawnFront = createChessBoardFromFen('8/p6R/5k2/3P1P2/8/6R1/3K4/8 w - - 0 1');
    const boardPawnFrontW = createChessBoardFromFen('8/p6R/5k2/3P1P2/8/3p2R1/3K4/8 w - - 0 1');
    const boardPawnNextToWhiteKing = createChessBoardFromFen('8/p7/5k2/3P4/8/8/3Kp3/8 w - - 0 1');
    const boardPawnNextToBlackKing = createChessBoardFromFen('8/p7/5kP1/8/3p4/8/3K4/8 w - - 0 1');
    const resP = isKingChecked(boardPawnFront, 'black');
    const resPW = isKingChecked(boardPawnFrontW, 'white');
    const resNP = isKingChecked(boardPawnNextToBlackKing, 'black');
    const resNPW = isKingChecked(boardPawnNextToWhiteKing, 'white');
    expect(resP).toBe(false);
    expect(resPW).toBe(false);
    expect(resNP).toBe(false);
    expect(resNPW).toBe(false);
  });
  it('proves that king gets not checked from behind by pawn (both directions)', () => {
    const boardPawnBehind = createChessBoardFromFen('8/p5P1/5k2/8/8/8/3K4/5p2 w - - 0 1');
    const boardPawnBehindW = createChessBoardFromFen('8/p7/5k2/8/8/3K4/4p3/8 w - - 0 1');
    const resPB = isKingChecked(boardPawnBehind, 'black');
    const resPBW = isKingChecked(boardPawnBehindW, 'white');
    expect(resPB).toBe(false);
    expect(resPBW).toBe(false);
  });

  it('proves hypothetical check by opponent king', () => {
    const board = createChessBoardFromFen('7k/p5K1/8/8/8/8/8/8 w - - 0 1');
    const board2 = createChessBoardFromFen('8/p5K1/5k2/8/8/8/8/8 w - - 0 1');
    const boardKingDontHitEachOther = createChessBoardFromFen('8/8/5k2/8/8/3K4/8/8 w - - 0 1');
    const res = isKingChecked(board, 'black');
    const res2 = isKingChecked(board2, 'black');
    const res3 = isKingChecked(board, 'white');
    const res4 = isKingChecked(board2, 'white');
    const res5 = isKingChecked(boardKingDontHitEachOther, 'white');
    expect(res).toBe(true);
    expect(res2).toBe(true);
    expect(res3).toBe(true);
    expect(res4).toBe(true);
    expect(res5).toBe(false);
  });

  it('proves that king is not checked when no pieces are attacking it', () => {
    const board = createChessBoardFromFen(INIT_POSITION);
    const res = isKingChecked(board, 'black');
    expect(res).toBe(false);
  });

  it('proves that king gets checked by one of two pieces', () => {
    const boardRookAndQueen = createChessBoardFromFen('7k/p7/8/8/8/7R/1Q6/2K5 w - - 0 1');
    const boardPawnAndQueen = createChessBoardFromFen('7k/p5P1/8/8/8/7R/1Q6/2K5 w - - 0 1');
    const resRQ = isKingChecked(boardRookAndQueen, 'black');
    const resRP = isKingChecked(boardPawnAndQueen, 'black');
    expect(resRQ).toBe(true);
    expect(resRP).toBe(true);
  });
  it('checks position for move.test.ts', () => {
    //const board = createChessBoardFromFen('rn1qk2r/pppppppp/6n1/2N5/1R6/2Q5/PPbPPP2/4KB1R w kq - 0 1');
    const board = createChessBoardFromFen('rn1qk2r/pppppppp/6n1/8/8/N1Q5/PPbPPP2/R3KB1R w kq - 0 1');
    const res = wouldPositionBeChecked(board, { row: 1, column: 'd' }, 'white');
    const res2 = isPositionChecked({ row: 1, column: 'b' }, board, 'white');
    expect(res).toBe(true);
    expect(res2).toBe(true);
  });
});
