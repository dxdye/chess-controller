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
