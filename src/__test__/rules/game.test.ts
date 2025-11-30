import { gameFromFen } from '../../rules/game.ts';
import { HistMove } from '../../rules/types.ts';

describe('test game from fen', () => {
  it('should create game from fen string', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const game = gameFromFen(fen);
    expect(game.turn).toBe('white');
    expect(game.currentBoard.length).toBe(32);
    expect(game.castlingRights).toEqual(['K', 'Q', 'k', 'q']);
    expect(game.enPassantTarget).toBe('-');
    expect(game.halfmoveClock).toBe(0);
    expect(game.fullmoveNumber).toBe(1);
  });
  it('should create game from fen string with en passent move', () => {
    const fen = 'r1bqkb1r/2pp4/p1n2n1p/Pp3pp1/3Pp3/1PN1P2P/1BP1QPP1/R3KBNR w KQkq b6 0 10';
    const game = gameFromFen(fen);
    expect(game.turn).toBe('white');
    expect(game.currentBoard.length).toBe(32);
    expect(game.castlingRights).toEqual(['K', 'Q', 'k', 'q']);
    expect(game.enPassantTarget).toBe('b');
    expect(game.halfmoveClock).toBe(0);
    expect(game.fullmoveNumber).toBe(10);
  });
  it('should create game from fen string with no castling rights', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b - - 0 1';
    const game = gameFromFen(fen);
    expect(game.turn).toBe('black');
    expect(game.currentBoard.length).toBe(32);
    expect(game.castlingRights).toEqual([]);
    expect(game.enPassantTarget).toBe('-');
    expect(game.halfmoveClock).toBe(0);
    expect(game.fullmoveNumber).toBe(1);
  });
  it('should create game with black to move', () => {
    const fen = 'r1bqkb1r/2pp4/p1n2n1p/Pp1P1pp1/4p3/1PN1P2P/1BP1QPP1/R3KBNR b KQ - 0 10';
    const game = gameFromFen(fen);
    expect(game.turn).toBe('black');
    expect(game.currentBoard.length).toBe(32);
    expect(game.castlingRights).toEqual(['K', 'Q']);
    expect(game.enPassantTarget).toBe('-');
    expect(game.halfmoveClock).toBe(0);
    expect(game.fullmoveNumber).toBe(10);
  });
  it('should create game with less pieces on board', () => {
    const fen = '2bqkb1r/8/p4n1p/Pp1Pnpp1/4p3/1PN1P2P/1BP1QPP1/4KBNR b K - 0 10';
    const game = gameFromFen(fen);
    expect(game.turn).toBe('black');
    expect(game.currentBoard.length).toBe(28);
    expect(game.castlingRights).toEqual(['K']);
    expect(game.enPassantTarget).toBe('-');
    expect(game.halfmoveClock).toBe(0);
    expect(game.fullmoveNumber).toBe(10);
  });
});

describe('test game result evaluations', () => {
  it('should detect checkmate from fen', () => {
    const fen = '8/8/4R3/5k2/6Q1/4K3/8/6R1 b - - 0 1';
    const game = gameFromFen(fen);
    const result = game.checkForCheckmate();
    expect(result).toBe('WHITE_WINS');
    expect(game.gameState).toBe('CHECKMATE');
  });
  it('should detect stalemate from fen', () => {
    const fen = '8/6K1/8/7k/7p/7R/6Q1/8 b - - 0 1';
    const game = gameFromFen(fen);
    const result = game.checkForDraw();
    expect(result).toBe('DRAW_BY_STALEMATE');
    expect(game.gameState).toBe('DRAWN');
  });
  it('should detect insufficient material from fen', () => {
    const fen = '8/8/8/8/8/4k3/8/3K4 b - - 0 1';
    const game = gameFromFen(fen);
    const result = game.checkForDraw();
    expect(result).toBe('DRAW_BY_INSUFFICIENT_MATERIAL');
    expect(game.gameState).toBe('DRAWN');
  });
  it('should detect insufficient material from fen, two same colored bishops', () => {
    const fen = '8/8/8/8/8/B3k3/3b4/3K4 b - - 0 1';
    const game = gameFromFen(fen);
    const result = game.checkForDraw();
    expect(result).toBe('DRAW_BY_INSUFFICIENT_MATERIAL');
    expect(game.gameState).toBe('DRAWN');
  });
  it('should detect insufficient material from fen, one knight', () => {
    const fen = '8/8/8/8/8/4k3/1N6/3K4 b - - 0 1';
    const game = gameFromFen(fen);
    const result = game.checkForDraw();
    expect(result).toBe('DRAW_BY_INSUFFICIENT_MATERIAL');
    expect(game.gameState).toBe('DRAWN');
  });
  it('should detect insufficient material from fen, one bishop', () => {
    const fen = '8/8/8/8/8/4k3/5b2/3K4 b - - 0 1';
    const game = gameFromFen(fen);
    const result = game.checkForDraw();
    expect(result).toBe('DRAW_BY_INSUFFICIENT_MATERIAL');
    expect(game.gameState).toBe('DRAWN');
  });
  it('is not a draw, because of two bishops of opposite color', () => {
    const fen = 'k7/b7/8/8/2K1B3/8/8/8 b - - 0 1';
    const game = gameFromFen(fen);
    const result = game.checkForDraw();
    expect(result).toBe('NO_DRAW');
    expect(game.gameState).toBe('ONGOING');
  });
  it('is not a draw, because of knight and bishop combo', () => {
    const fen = 'k7/8/8/8/2K1B3/8/8/3N4 b - - 0 1';
    const game = gameFromFen(fen);
    const result = game.checkForDraw();
    expect(result).toBe('NO_DRAW');
    expect(game.gameState).toBe('ONGOING');
  });

  it('is a draw by fifty move rule', () => {
    const fen = '8/8/8/8/8/4k3/8/3K4 b - - 50 20';
    const game = gameFromFen(fen);
    const result = game.checkForDraw();
    expect(result).toBe('DRAW_BY_FIFTY_MOVE_RULE');
    expect(game.gameState).toBe('DRAWN');
  });

  it('is not a draw by fifty move rule yet', () => {
    const fen = '8/8/4N3/5N2/8/4k3/8/3K4 b - - 49 20';
    const game = gameFromFen(fen);
    const result = game.checkForDraw();
    expect(result).toBe('NO_DRAW');
    expect(game.gameState).toBe('ONGOING');
  });
  it('is not a draw by fifty move rule with reset halfmove clock', () => {
    const fen = '8/8/4N3/5N2/8/4k3/8/3K4 b - - 0 20';
    const game = gameFromFen(fen);
    const result = game.checkForDraw();
    expect(result).toBe('NO_DRAW');
    expect(game.gameState).toBe('ONGOING');
  });

  it.only('is a draw by threefold repetition', () => {
    const game = gameFromFen('8/8/3NN3/8/8/4k3/8/3K4 w - - 0 20');
    //simulate threefold repetition
    const lastSixMoves: HistMove[] = [
      //1st repetition
      { row: 7, column: 'c', figure: 'KNIGHT', color: 'white', fromRow: 6, fromColumn: 'e' },
      { row: 4, column: 'f', figure: 'KING', color: 'black', fromRow: 3, fromColumn: 'e' },
      { row: 6, column: 'e', figure: 'KNIGHT', color: 'white', fromRow: 7, fromColumn: 'c' },
      { row: 3, column: 'e', figure: 'KING', color: 'black', fromRow: 4, fromColumn: 'f' },

      //2nd repetition
      { row: 7, column: 'c', figure: 'KNIGHT', color: 'white', fromRow: 6, fromColumn: 'e' },
      { row: 4, column: 'f', figure: 'KING', color: 'black', fromRow: 3, fromColumn: 'e' },
      { row: 6, column: 'e', figure: 'KNIGHT', color: 'white', fromRow: 7, fromColumn: 'c' },
      { row: 3, column: 'e', figure: 'KING', color: 'black', fromRow: 4, fromColumn: 'f' },

      //3th repetition
      { row: 7, column: 'c', figure: 'KNIGHT', color: 'white', fromRow: 6, fromColumn: 'e' },
      { row: 4, column: 'f', figure: 'KING', color: 'black', fromRow: 3, fromColumn: 'e' },
      { row: 6, column: 'e', figure: 'KNIGHT', color: 'white', fromRow: 7, fromColumn: 'c' },
      { row: 3, column: 'e', figure: 'KING', color: 'black', fromRow: 4, fromColumn: 'f' },

      //4th repetition
      { row: 7, column: 'c', figure: 'KNIGHT', color: 'white', fromRow: 6, fromColumn: 'e' },
      { row: 4, column: 'f', figure: 'KING', color: 'black', fromRow: 3, fromColumn: 'e' },
      { row: 6, column: 'e', figure: 'KNIGHT', color: 'white', fromRow: 7, fromColumn: 'c' },
      { row: 3, column: 'e', figure: 'KING', color: 'black', fromRow: 4, fromColumn: 'f' },
    ];

    //make moves
    lastSixMoves.forEach((move) => {
      console.log(game.move({ row: move.fromRow, column: move.fromColumn }, move));
      console.log(game.drawType);
      console.log(game.gameState);
    });

    // const result = game.claimThreeFoldRepetition();

    // expect(result).toBe('DRAW_BY_THREEFOLD_REPETITION');
    // expect(game.gameState).toBe('DRAWN');
  });
});


//test draw by threefold repetition
//test checkmate detection
//test check detection
//test normal ongoing game detection
//test game result evaluation for all possible results

//test game from FEN