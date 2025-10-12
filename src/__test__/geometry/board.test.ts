import { Board, BoardPieceMap, Fen } from '../../geometry/types.ts';
import { boardToColorMap, boardToPieceMap, createChessBoardFromFen } from '../../geometry/board.ts';
import { INIT_POSITION } from '../../geometry/constant.ts';

describe('Chess board creation from FEN', () => {
  it('creates the correct board from the initial position FEN', () => {
    const initPos: Fen = INIT_POSITION;
    const board = createChessBoardFromFen(initPos);
    expect(board.length).toBe(32); // 32 pieces in total
    const whitePieces = board.filter((piece) => piece.color === 'white');
    const blackPieces = board.filter((piece) => piece.color === 'black');
    expect(whitePieces.length).toBe(16);
    expect(blackPieces.length).toBe(16);
    expect(board).toEqual(
      expect.arrayContaining([
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
      ]),
    );
  });
  it('creates a board from Fen with two moved pawns', () => {
    const initPos: Fen = 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2';
    const board = createChessBoardFromFen(initPos);

    expect(board.length).toBe(32); // 32 pieces in total
    const whitePieces = board.filter((piece) => piece.color === 'white');
    const blackPieces = board.filter((piece) => piece.color === 'black');
    expect(whitePieces.length).toBe(16);
    expect(blackPieces.length).toBe(16);
    expect(board).toEqual(
      expect.arrayContaining([
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
        // e2 pawn moved
        { row: 4, column: 'e', figure: 'PAWN', color: 'white' },
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
        // e7 pawn moved
        { row: 5, column: 'e', figure: 'PAWN', color: 'black' },
        { row: 7, column: 'f', figure: 'PAWN', color: 'black' },
        { row: 7, column: 'g', figure: 'PAWN', color: 'black' },
        { row: 7, column: 'h', figure: 'PAWN', color: 'black' },
      ]),
    );
  });
});

describe('board to board piece map and color map conversion', () => {
  const board: Board = [
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
    // e2 pawn moved
    { row: 4, column: 'e', figure: 'PAWN', color: 'white' },
    { row: 2, column: 'f', figure: 'PAWN', color: 'white' },
    { row: 2, column: 'g', figure: 'PAWN', color: 'white' },
    { row: 2, column: 'h', figure: 'PAWN', color: 'white' },

    { row: 7, column: 'a', figure: 'PAWN', color: 'black' },
    { row: 7, column: 'b', figure: 'PAWN', color: 'black' },
    { row: 7, column: 'c', figure: 'PAWN', color: 'black' },
    { row: 7, column: 'd', figure: 'PAWN', color: 'black' },
    // e7 pawn moved
    { row: 5, column: 'e', figure: 'PAWN', color: 'black' },
    { row: 7, column: 'f', figure: 'PAWN', color: 'black' },
    { row: 7, column: 'g', figure: 'PAWN', color: 'black' },
    { row: 7, column: 'h', figure: 'PAWN', color: 'black' },

    { row: 8, column: 'a', figure: 'ROOK', color: 'black' },
    { row: 8, column: 'b', figure: 'KNIGHT', color: 'black' },
    { row: 8, column: 'c', figure: 'BISHOP', color: 'black' },
    { row: 8, column: 'd', figure: 'QUEEN', color: 'black' },
    { row: 8, column: 'e', figure: 'KING', color: 'black' },
    { row: 8, column: 'f', figure: 'BISHOP', color: 'black' },
    { row: 8, column: 'g', figure: 'KNIGHT', color: 'black' },
    { row: 8, column: 'h', figure: 'ROOK', color: 'black' },
  ];

  it('creates correct piece map from given position', () => {
    const boardPieceMap: BoardPieceMap = [
      [
        { figure: 'ROOK', color: 'white' },
        { figure: 'KNIGHT', color: 'white' },
        { figure: 'BISHOP', color: 'white' },
        { figure: 'QUEEN', color: 'white' },
        { figure: 'KING', color: 'white' },
        { figure: 'BISHOP', color: 'white' },
        { figure: 'KNIGHT', color: 'white' },
        { figure: 'ROOK', color: 'white' },
      ],
      [
        { figure: 'PAWN', color: 'white' },
        { figure: 'PAWN', color: 'white' },
        { figure: 'PAWN', color: 'white' },
        { figure: 'PAWN', color: 'white' },
        null,
        { figure: 'PAWN', color: 'white' },
        { figure: 'PAWN', color: 'white' },
        { figure: 'PAWN', color: 'white' },
      ],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, { figure: 'PAWN', color: 'white' }, null, null, null],
      [null, null, null, null, { figure: 'PAWN', color: 'black' }, null, null, null],
      [null, null, null, null, null, null, null, null],
      [
        { figure: 'PAWN', color: 'black' },
        { figure: 'PAWN', color: 'black' },
        { figure: 'PAWN', color: 'black' },
        { figure: 'PAWN', color: 'black' },
        null,
        { figure: 'PAWN', color: 'black' },
        { figure: 'PAWN', color: 'black' },
        { figure: 'PAWN', color: 'black' },
      ],
      [
        { figure: 'ROOK', color: 'black' },
        { figure: 'KNIGHT', color: 'black' },
        { figure: 'BISHOP', color: 'black' },
        { figure: 'QUEEN', color: 'black' },
        { figure: 'KING', color: 'black' },
        { figure: 'BISHOP', color: 'black' },
        { figure: 'KNIGHT', color: 'black' },
        { figure: 'ROOK', color: 'black' },
      ],
    ];
    expect(boardToPieceMap(board)).toEqual(boardPieceMap);
  });
  it('creates correct color map from given position', () => {
    const boardColorMap = [
      ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white'],
      ['white', 'white', 'white', 'white', 'none', 'white', 'white', 'white'],
      ['none', 'none', 'none', 'none', 'none', 'none', 'none', 'none'],
      ['none', 'none', 'none', 'none', 'white', 'none', 'none', 'none'],
      ['none', 'none', 'none', 'none', 'black', 'none', 'none', 'none'],
      ['none', 'none', 'none', 'none', 'none', 'none', 'none', 'none'],
      ['black', 'black', 'black', 'black', 'none', 'black', 'black', 'black'],
      ['black', 'black', 'black', 'black', 'black', 'black', 'black', 'black'],
    ];
    expect(boardToColorMap(board)).toEqual(boardColorMap);
  });
});
