import { Board, Move, Position } from '../../rules/types.ts';
import { moveToPgn } from '../../rules/pgn.ts';
import { createChessBoardFromFen } from '../../rules/board.ts';

describe('test SAN for rook', () => {
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
  it.skip('builds correct SAN for rook checking king ', () => {
    //tbd
  });
});

describe('test SAN for bishop', () => {
  it('builds correct SAN for bishop moves - 4 bishops - one ambiguous move from c7 where both row and column are needed', () => {
    const board = createChessBoardFromFen('4k3/2B3B1/6K1/8/8/2B5/7B/8 w - - 0 1');
    const board2 = createChessBoardFromFen('4k3/2B3B1/6K1/8/8/6B1/8/B7 w - - 1 1');
    const move: Move = {
      row: 5,
      column: 'e',
      color: 'white',
      figure: 'BISHOP',
    };
    const bishop0: Position = { row: 7, column: 'c' };
    const bishop1: Position = { row: 3, column: 'c' };
    const bishop2: Position = { row: 7, column: 'g' };
    const bishop3: Position = { row: 2, column: 'h' };

    const bishop4: Position = { row: 1, column: 'a' };
    const bishop5: Position = { row: 3, column: 'g' };

    // board 1
    const san = moveToPgn(bishop0, move, board, '-', []);
    const san2 = moveToPgn(bishop1, move, board, '-', []);
    const san3 = moveToPgn(bishop2, move, board, '-', []);
    const san4 = moveToPgn(bishop3, move, board, '-', []);

    // board 2
    const san5 = moveToPgn(bishop4, move, board2, '-', []);
    const san6 = moveToPgn(bishop5, move, board2, '-', []);
    const san8 = moveToPgn(bishop0, move, board2, '-', []);
    const san7 = moveToPgn(bishop2, move, board2, '-', []);

    expect(san2).toBe('B3e5');
    expect(san3).toBe('Bge5');
    expect(san4).toBe('Bhe5');
    expect(san).toBe('Bc7e5');

    expect(san5).toBe('Bae5');
    expect(san6).toBe('B3e5');
    expect(san7).toBe('Bg7e5');
    expect(san8).toBe('Bce5');
  });
  it('builds correct SAN for bishop moves - all four bishops disambiguated', () => {
    const board = createChessBoardFromFen('4k3/2B3B1/6K1/8/8/2B3B1/8/8 w - - 1 1');
    const move: Move = {
      row: 5,
      column: 'e',
      color: 'white',
      figure: 'BISHOP',
    };
    const bishop0: Position = { row: 7, column: 'c' };
    const bishop1: Position = { row: 3, column: 'c' };
    const bishop2: Position = { row: 7, column: 'g' };
    const bishop3: Position = { row: 3, column: 'g' };

    const san = moveToPgn(bishop0, move, board, '-', []);
    const san2 = moveToPgn(bishop1, move, board, '-', []);
    const san3 = moveToPgn(bishop2, move, board, '-', []);
    const san4 = moveToPgn(bishop3, move, board, '-', []);
    expect(san).toBe('Bc7e5');
    expect(san2).toBe('Bc3e5');
    expect(san3).toBe('Bg7e5');
    expect(san4).toBe('Bg3e5');
  });
}); 