import { createChessBoardFromFen } from '../../geometry/board.ts';
import { Fen } from '../../geometry/types.ts';
import { INIT_POSITION } from '../../geometry/fen.ts';

describe('Chess board creation from FEN', () => {
  it('creates the correct board from the initial position FEN', () => {
    const initPos: Fen = INIT_POSITION;
    const board = createChessBoardFromFen(initPos);
    expect(board.length).toBe(32); // 32 pieces in total
    const whitePieces = board.filter((piece) => piece.color === 'white');
    const blackPieces = board.filter((piece) => piece.color === 'black');
    expect(whitePieces.length).toBe(16);
    expect(blackPieces.length).toBe(16);
    expect(board.sort().reverse()).toEqual(
      expect.arrayContaining(
        [
          { row: 1, column: 'a', figure: 'ROOK', color: 'white' },
          { row: 1, column: 'b', figure: 'KNIGHT', color: 'white' },
          { row: 1, column: 'c', figure: 'BISHOP', color: 'white' },
          { row: 1, column: 'd', figure: 'QUEEN', color: 'white' },
          { row: 1, column: 'e', figure: 'KING', color: 'white' },
          { row: 1, column: 'f', figure: 'BISHOP', color: 'white' },
          { row: 1, column: 'g', figure: 'KNIGHT', color: 'white' },
          { row: 1, column: 'h', figure: 'ROOK', color: 'white' },

          { row: 2, column: 'a', figure: 'PAWN', color: 'white' },
          { row: 2, column: 'b', figure: 'PAWN', color: 'white' },
          { row: 2, column: 'c', figure: 'PAWN', color: 'white' },
          { row: 2, column: 'd', figure: 'PAWN', color: 'white' },
          { row: 2, column: 'e', figure: 'PAWN', color: 'white' },
          { row: 2, column: 'f', figure: 'PAWN', color: 'white' },
          { row: 2, column: 'g', figure: 'PAWN', color: 'white' },
          { row: 2, column: 'h', figure: 'PAWN', color: 'white' },

          { row: 8, column: 'a', figure: 'ROOK', color: 'black' },
          { row: 8, column: 'b', figure: 'KNIGHT', color: 'black' },
          { row: 8, column: 'c', figure: 'BISHOP', color: 'black' },
          { row: 8, column: 'd', figure: 'QUEEN', color: 'black' },
          { row: 8, column: 'e', figure: 'KING', color: 'black' },
          { row: 8, column: 'f', figure: 'BISHOP', color: 'black' },
          { row: 8, column: 'g', figure: 'KNIGHT', color: 'black' },
          { row: 8, column: 'h', figure: 'ROOK', color: 'black' },

          { row: 7, column: 'a', figure: 'PAWN', color: 'black' },
          { row: 7, column: 'b', figure: 'PAWN', color: 'black' },
          { row: 7, column: 'c', figure: 'PAWN', color: 'black' },
          { row: 7, column: 'd', figure: 'PAWN', color: 'black' },
          { row: 7, column: 'e', figure: 'PAWN', color: 'black' },
          { row: 7, column: 'f', figure: 'PAWN', color: 'black' },
          { row: 7, column: 'g', figure: 'PAWN', color: 'black' },
          { row: 7, column: 'h', figure: 'PAWN', color: 'black' },
        ]
          .sort()
          .reverse(),
      ),
    );
  });
});
