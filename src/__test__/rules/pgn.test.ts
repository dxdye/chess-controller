import { Board, Move, Position } from '../../rules/types.ts';
import { moveToPgn } from '../../rules/pgn.ts';
import { createChessBoardFromFen } from '../../rules/board.ts';

describe('regex match for Pgn module', () => {
  it('builds correct PGN for rook move without take and same row', () => {
    const board = createChessBoardFromFen('2r1k1r1/8/8/2R5/8/5K2/8/R6R w - - 0 1');

    const move: Move = {
      row: 1,
      column: 'd',
      color: 'white',
      figure: 'ROOK',
    };
    const current: Position = { row: 1, column: 'a' };
    const pgn = moveToPgn(current, move, board, '-', []);
    expect(pgn).toBe('Rad1');
  });
  it('builds correct SAN for rook move without take and same column', () => {
    const board = createChessBoardFromFen('2r1k1r1/8/8/8/3R4/5K2/R4b2/8 w - - 0 1');
    const board2 = createChessBoardFromFen('2r1k1r1/8/3R4/8/8/5K2/1R3b2/R2R4 w - - 2 1');

    const move: Move = {
      row: 2,
      column: 'd',
      color: 'white',
      figure: 'ROOK',
    };

    const current: Position = { row: 2, column: 'a' };
    const current2: Position = { row: 6, column: 'd' };
    const san = moveToPgn(current, move, board, '-', []);
    const san2 = moveToPgn(current2, move, board2, '-', []);
    expect(san).toBe('Rad2');
    expect(san2).toBe('R6d2');
  });
  it('builds correct PGN for rook captures pawn without take and same column', () => {
    const board = createChessBoardFromFen('2k1r3/pp3ppp/3R4/3pB3/8/8/3R4/4K3 w - - 0 1');

    const move: Move = {
      row: 5,
      column: 'd',
      color: 'white',
      figure: 'ROOK',
      isTaken: true,
    };

    const current: Position = { row: 6, column: 'd' };
    const current2: Position = { row: 2, column: 'd' };
    const san = moveToPgn(current, move, board, '-', []);
    const san2 = moveToPgn(current2, move, board, '-', []);

    expect(san).toBe('R6xd5');
    expect(san2).toBe('R2xd5');
  });
  it('builds correct SAN for rook move without take and no overlap', () => {
    const board: Board = createChessBoardFromFen('2r1k1r1/8/8/8/2R5/5K2/8/R3b2R w - - 0 1');
    const move: Move = {
      row: 1,
      column: 'd',
      color: 'white',
      figure: 'ROOK',
    };
    const current: Position = { row: 1, column: 'a' };
    const pgn = moveToPgn(current, move, board, '-', []);
    expect(pgn).toBe('Rd1');
  });
});
