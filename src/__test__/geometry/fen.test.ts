import { checkValidFEN, INIT_POSITION, FEN } from '../../geometry/fen.ts';

describe('regex match for FEN module', () => {
  //true take
  it('checks an init FEN returning true', () => {
    expect(checkValidFEN(INIT_POSITION)).toBe(true);
  });
  it('checks some edited valid FEN returning true. 2 pawns less', () => {
    const someFEN: FEN =
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPP/RNBQKBNR w KQkq - 0 1';
    expect(checkValidFEN(someFEN)).toBe(true);
  });
  it('checks some edited valid FEN returning true. edited half moves', () => {
    const someFEN: FEN =
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 2 1';
    expect(checkValidFEN(someFEN)).toBe(true);
  });
  it('checks correct FEN with enpassent move to be true', () => {
    const someFEN: FEN =
      'rnbq1rk1/p1p1bppp/5n2/1pPpp3/4P3/3P1N2/PP2BPPP/RNBQ1RK1 w - d6 0 8';
    const someFEN2: FEN =
      'rnbqkbnr/p2ppppp/1p6/2pP4/8/8/PPP1PPPP/RNBQKBNR w KQkq c6 0 3';
    expect(checkValidFEN(someFEN)).toBe(true);
    expect(checkValidFEN(someFEN2)).toBe(true);
  });
  it('should pass on vanished or manipulated castling rights. ', () => {
    const someFEN: FEN =
      'rnbq1rk1/pppp1ppp/3b1n2/4p3/4P3/3P1N2/PPP1BPPP/RNBQ1RK1 b - - 4 5';
    const someFEN2: FEN =
      'rnbqkbnr/p2ppppp/1p6/2pP4/8/8/PPP1PPPP/RNBQKBNR w - c6 0 3';
    const someFEN3: FEN =
      'rnbq1rk1/p2p1ppp/1p1bpn2/2p5/4P3/2P2N2/PP3PPP/RNBQKB1R w KQ - 1 7';
 
    const someFEN4: FEN =
      'r1b1kbnr/ppp2ppp/2nqp3/3p4/3P4/2NQB3/PPP1PPPP/2KR1BNR b kq - 1 5'; 
    const someFEN5: FEN =
      'r3kr2/pppbb1pp/2nqpn2/1Q1p1p2/1P1P4/P1N1BN2/2P1PPPP/2KR1B1R w q - 3 1';

    expect(checkValidFEN(someFEN)).toBe(true);
    expect(checkValidFEN(someFEN2)).toBe(true);
    expect(checkValidFEN(someFEN3)).toBe(true);
    expect(checkValidFEN(someFEN4)).toBe(true);
    expect(checkValidFEN(someFEN5)).toBe(true);
  });
  it('makes a valid FEN return true. wrong color to start with. less P filled up', () => {
    const someFEN: FEN =
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPP1P/RNBK2R1 w KQkq - 0 1';
    expect(checkValidFEN(someFEN)).toBe(true);
  });

  //false take
  it('checks corrupted FEN returning true. one dash to much.', () => {
    const someFEN: FEN =
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPP/RNBQKBNR w KQkq - -2 1';
    expect(checkValidFEN(someFEN)).toBe(false);
  });
  it('makes a empty FEN return false.', () => {
    expect(checkValidFEN('')).toBe(false);
  });
  it("makes a corrupted FEN return false. it's one /8 to much.", () => {
    const someFEN: FEN =
      'rnbqkbnr/pppppppp/8/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    expect(checkValidFEN(someFEN)).toBe(false);
  });
  it.skip("makes a corrupted FEN return false. it's one figure to much in row 'b'.", () => {
    const someFEN: FEN =
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPPP/RNBQKBNR b KQkq - 0 1';
    expect(checkValidFEN(someFEN)).toBe(false);
  });
  it('one P to much', () => {
    const someFEN: FEN =
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const someFEN2: FEN =
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNRRR w KQkq - 0 1';
    expect(checkValidFEN(someFEN)).toBe(false);
    expect(checkValidFEN(someFEN2)).toBe(false);
  });
  //no king should return false
  it('has no kings at all', () => {
    const someFEN: FEN =
      'rnbq1bnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQ1BNR w KQkq - 0 1';
    expect(checkValidFEN(someFEN)).toBe(false);
  }); 
  it('has two white kings', () => {
    const someFEN: FEN =
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPK/RNBQKBNR w KQkq - 0 1';
    expect(checkValidFEN(someFEN)).toBe(false);
  });
  it('has two black kings', () => {
    const someFEN: FEN =
      'rnbqkbnr/pppppppk/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    expect(checkValidFEN(someFEN)).toBe(false);
  }); 
  it('has three kings', () => {
    const someFEN: FEN =
      'rnbqkbnr/pppppppk/8/8/8/8/PPPPPPPK/RNBQKBNR w KQkq - 0 1';
    expect(checkValidFEN(someFEN)).toBe(true);
  }); 

});
