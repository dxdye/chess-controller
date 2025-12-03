import { createFenFromChessBoard } from '../../rules/fen.ts';
import { INIT_POSITION } from '../../rules/constant.ts';
import { isValidFen, isValidFenSyntax } from '../../rules/fen.ts';
import { Board, Fen } from '../../rules/types.ts';

describe('regex match for Fen module', () => {
  //true take
  it('checks an init FEN returning true', () => {
    expect(isValidFenSyntax(INIT_POSITION)).toBe(true);
  });
  it('checks some edited valid FEN returning true. 2 pawns less', () => {
    const someFEN: Fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPP/RNBQKBNR w KQkq - 0 1';
    expect(isValidFenSyntax(someFEN)).toBe(true);
  });
  it('checks some edited valid FEN returning true. edited half moves', () => {
    const someFEN: Fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 2 1';
    expect(isValidFenSyntax(someFEN)).toBe(true);
  });
  it('checks correct FEN with enpassent move to be true', () => {
    const someFEN: Fen = 'rnbq1rk1/p1p1bppp/5n2/1pPpp3/4P3/3P1N2/PP2BPPP/RNBQ1RK1 w - d6 0 8';
    const someFEN2: Fen = 'rnbqkbnr/p2ppppp/1p6/2pP4/8/8/PPP1PPPP/RNBQKBNR w KQkq c6 0 3';
    expect(isValidFenSyntax(someFEN)).toBe(true);
    expect(isValidFenSyntax(someFEN2)).toBe(true);
  });
  it('should pass on vanished or manipulated castling rights. ', () => {
    const someFEN: Fen = 'rnbq1rk1/pppp1ppp/3b1n2/4p3/4P3/3P1N2/PPP1BPPP/RNBQ1RK1 b - - 4 5';
    const someFEN2: Fen = 'rnbqkbnr/p2ppppp/1p6/2pP4/8/8/PPP1PPPP/RNBQKBNR w - c6 0 3';
    const someFEN3: Fen = 'rnbq1rk1/p2p1ppp/1p1bpn2/2p5/4P3/2P2N2/PP3PPP/RNBQKB1R w KQ - 1 7';

    const someFEN4: Fen = 'r1b1kbnr/ppp2ppp/2nqp3/3p4/3P4/2NQB3/PPP1PPPP/2KR1BNR b kq - 1 5';
    const someFEN5: Fen = 'r3kr2/pppbb1pp/2nqpn2/1Q1p1p2/1P1P4/P1N1BN2/2P1PPPP/2KR1B1R w q - 3 1';

    expect(isValidFenSyntax(someFEN)).toBe(true);
    expect(isValidFenSyntax(someFEN2)).toBe(true);
    expect(isValidFenSyntax(someFEN3)).toBe(true);
    expect(isValidFenSyntax(someFEN4)).toBe(true);
    expect(isValidFenSyntax(someFEN5)).toBe(true);
  });
  it('makes a valid FEN return true. wrong color to start with. less P filled up', () => {
    const someFEN: Fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPP1P/RNBK2R1 w KQkq - 0 1';
    expect(isValidFenSyntax(someFEN)).toBe(true);
  });

  //false take
  it('checks corrupted FEN returning true. one dash to much.', () => {
    const someFEN: Fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPP/RNBQKBNR w KQkq - -2 1';
    expect(isValidFenSyntax(someFEN)).toBe(false);
  });
  it('makes a empty FEN return false.', () => {
    expect(isValidFenSyntax('')).toBe(false);
  });
  it("makes a corrupted FEN return false. it's one /8 to much.", () => {
    const someFEN: Fen = 'rnbqkbnr/pppppppp/8/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    expect(isValidFenSyntax(someFEN)).toBe(false);
  });
  it.skip("makes a corrupted FEN return false. it's one figure to much in row 'b'.", () => {
    const someFEN: Fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPPP/RNBQKBNR b KQkq - 0 1';
    expect(isValidFenSyntax(someFEN)).toBe(false);
  });
  it('one P to much', () => {
    const someFEN: Fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const someFEN2: Fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNRRR w KQkq - 0 1';
    expect(isValidFenSyntax(someFEN)).toBe(false);
    expect(isValidFenSyntax(someFEN2)).toBe(false);
  });
  //no king should return false
  it('has no kings at all', () => {
    const someFEN: Fen = 'rnbq1bnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQ1BNR w KQkq - 0 1';
    expect(isValidFenSyntax(someFEN)).toBe(false);
  });
  it('has two white kings', () => {
    const someFEN: Fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPK/RNBQKBNR w KQkq - 0 1';
    expect(isValidFenSyntax(someFEN)).toBe(false);
  });
  it('has two black kings', () => {
    const someFEN: Fen = 'rnbqkbnr/pppppppk/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    expect(isValidFenSyntax(someFEN)).toBe(false);
  });
  it('has three kings', () => {
    const someFEN: Fen = 'rnbqkbnr/pppppppk/8/8/8/8/PPPPPPPK/RNBQKBNR w KQkq - 0 1';
    expect(isValidFenSyntax(someFEN)).toBe(false);
  });

  it('checks this position 8/8/3NN3/8/8/4k3/8/3K4 w - - 0 20', () => {
    const someFEN: Fen = '8/8/3NN3/8/8/4k3/8/3K4 w - - 0 20';
    expect(isValidFenSyntax(someFEN)).toBe(true);
    expect(isValidFen(someFEN)).toBe(true);
  });
});

describe('additional FEN tests', () => {
  it('should return false for missing parts', () => {
    const someFEN: Fen = '8/8/3NN3/8/8/4k3/8/3K4 w - - 0'; //missing fullmove number
    expect(isValidFen(someFEN)).toBe(false);
  });
  it('should return false for missing rows', () => {
    const someFEN: Fen = '8/8/3NN3/8/8/4k3/3K4 w - - 0 20'; //only 7 rows
    expect(isValidFen(someFEN)).toBe(false);
  });
  it('should return false for too many rows', () => {
    const someFEN: Fen = '8/8/3NN3/8/8/4k3/8/8/3K4 w - - 0 20'; //9 rows
    expect(isValidFen(someFEN)).toBe(false);
  });
  it('should return false for missing piece placement part', () => {
    const someFEN: Fen = ' w KQkq - 0 1'; //missing piece placement
    expect(isValidFen(someFEN)).toBe(false);
  });
});

describe('board to FEN conversion', () => {
  it('should convert initial position correctly', () => {
    const board: Board = [
      { column: 'a', row: 1, figure: 'ROOK', color: 'white' },
      { column: 'b', row: 1, figure: 'KNIGHT', color: 'white' },
      { column: 'c', row: 1, figure: 'BISHOP', color: 'white' },
      { column: 'd', row: 1, figure: 'QUEEN', color: 'white' },
      { column: 'e', row: 1, figure: 'KING', color: 'white' },
      { column: 'f', row: 1, figure: 'BISHOP', color: 'white' },
      { column: 'g', row: 1, figure: 'KNIGHT', color: 'white' },
      { column: 'h', row: 1, figure: 'ROOK', color: 'white' },
      { column: 'a', row: 2, figure: 'PAWN', color: 'white' },
      { column: 'b', row: 2, figure: 'PAWN', color: 'white' },
      { column: 'c', row: 2, figure: 'PAWN', color: 'white' },
      { column: 'd', row: 2, figure: 'PAWN', color: 'white' },
      { column: 'e', row: 2, figure: 'PAWN', color: 'white' },
      { column: 'f', row: 2, figure: 'PAWN', color: 'white' },
      { column: 'g', row: 2, figure: 'PAWN', color: 'white' },
      { column: 'h', row: 2, figure: 'PAWN', color: 'white' },
      { column: 'a', row: 7, figure: 'PAWN', color: 'black' },
      { column: 'b', row: 7, figure: 'PAWN', color: 'black' },
      { column: 'c', row: 7, figure: 'PAWN', color: 'black' },
      { column: 'd', row: 7, figure: 'PAWN', color: 'black' },
      { column: 'e', row: 7, figure: 'PAWN', color: 'black' },
      { column: 'f', row: 7, figure: 'PAWN', color: 'black' },
      { column: 'g', row: 7, figure: 'PAWN', color: 'black' },
      { column: 'h', row: 7, figure: 'PAWN', color: 'black' },
      { column: 'a', row: 8, figure: 'ROOK', color: 'black' },
      { column: 'b', row: 8, figure: 'KNIGHT', color: 'black' },
      { column: 'c', row: 8, figure: 'BISHOP', color: 'black' },
      { column: 'd', row: 8, figure: 'QUEEN', color: 'black' },
      { column: 'e', row: 8, figure: 'KING', color: 'black' },
      { column: 'f', row: 8, figure: 'BISHOP', color: 'black' },
      { column: 'g', row: 8, figure: 'KNIGHT', color: 'black' },
      { column: 'h', row: 8, figure: 'ROOK', color: 'black' },
    ];
    const fen = createFenFromChessBoard(board);
    expect(fen).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  });
  it('should convert empty board correctly', () => {
    const emptyBoard: Board = [];
    const fen = createFenFromChessBoard(emptyBoard);
    expect(fen).toBe('8/8/8/8/8/8/8/8 w KQkq - 0 1');
  });
  it('should throw error for invalid board with pawns on backrank', () => {
    const boardWithInvalidBlackPawnOn1stRank: Board = [
      { column: 'a', row: 1, figure: 'PAWN', color: 'black' },
      { column: 'd', row: 6, figure: 'KING', color: 'white' },
      { column: 'e', row: 6, figure: 'KNIGHT', color: 'white' },
      { column: 'd', row: 8, figure: 'KING', color: 'black' },
    ];
    expect(() => createFenFromChessBoard(boardWithInvalidBlackPawnOn1stRank)).toThrow(
      'Invalid board on first rank or back rank',
    );
  });
  it('should convert board with few pieces correctly', () => {
    const board: Board = [
      { column: 'd', row: 4, figure: 'KING', color: 'white' },
      { column: 'e', row: 4, figure: 'KNIGHT', color: 'white' },
      { column: 'd', row: 5, figure: 'KING', color: 'black' },
    ];
    const fen = createFenFromChessBoard(board);
    expect(fen).toBe('8/8/8/3k4/3KN3/8/8/8 w KQkq - 0 1');
  });
  it('should convert a more complex position correctly', () => {
    const board: Board = [
      { column: 'a', row: 8, figure: 'ROOK', color: 'black' },
      { column: 'b', row: 8, figure: 'KNIGHT', color: 'black' },
      { column: 'c', row: 8, figure: 'BISHOP', color: 'black' },
      { column: 'd', row: 8, figure: 'QUEEN', color: 'black' },
      { column: 'e', row: 8, figure: 'KING', color: 'black' },
      { column: 'f', row: 8, figure: 'BISHOP', color: 'black' },
      { column: 'g', row: 8, figure: 'KNIGHT', color: 'black' },
      { column: 'h', row: 8, figure: 'ROOK', color: 'black' },
      { column: 'a', row: 7, figure: 'PAWN', color: 'black' },
      { column: 'b', row: 7, figure: 'PAWN', color: 'black' },
      { column: 'c', row: 7, figure: 'PAWN', color: 'black' },
      { column: 'd', row: 6, figure: 'PAWN', color: 'black' },
      { column: 'e', row: 5, figure: 'PAWN', color: 'black' },
      { column: 'f', row: 7, figure: 'PAWN', color: 'black' },
      { column: 'g', row: 7, figure: 'PAWN', color: 'black' },
      { column: 'h', row: 7, figure: 'PAWN', color: 'black' },
      { column: 'e', row: 4, figure: 'PAWN', color: 'white' },
      { column: 'd', row: 3, figure: 'PAWN', color: 'white' },
      { column: 'a', row: 2, figure: 'PAWN', color: 'white' },
      { column: 'b', row: 2, figure: 'PAWN', color: 'white' },
      { column: 'c', row: 2, figure: 'PAWN', color: 'white' },
      { column: 'f', row: 2, figure: 'PAWN', color: 'white' },
      { column: 'g', row: 2, figure: 'PAWN', color: 'white' },
      { column: 'h', row: 2, figure: 'PAWN', color: 'white' },
      { column: 'a', row: 1, figure: 'ROOK', color: 'white' },
      { column: 'b', row: 1, figure: 'KNIGHT', color: 'white' },
      { column: 'c', row: 1, figure: 'BISHOP', color: 'white' },
      { column: 'd', row: 1, figure: 'QUEEN', color: 'white' },
      { column: 'e', row: 1, figure: 'KING', color: 'white' },
      { column: 'f', row: 1, figure: 'BISHOP', color: 'white' },
      { column: 'g', row: 1, figure: 'KNIGHT', color: 'white' },
      { column: 'h', row: 1, figure: 'ROOK', color: 'white' },
    ];
    const fen = createFenFromChessBoard(board);
    expect(fen).toBe('rnbqkbnr/ppp2ppp/3p4/4p3/4P3/3P4/PPP2PPP/RNBQKBNR w KQkq - 0 1');
  });
});