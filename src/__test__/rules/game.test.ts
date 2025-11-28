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
});
