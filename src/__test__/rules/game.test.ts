import { gameFromFen } from '../../rules/game.ts';

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


//test draw by stalemate
//test draw by insufficient material
//test draw by fifty move rule
//test draw by threefold repetition
//test checkmate detection
//test check detection
//test normal ongoing game detection
//test game result evaluation for all possible results

//test game from FEN