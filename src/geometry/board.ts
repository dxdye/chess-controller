import { isValidFen } from './fen.ts';
import { isNil, isNotNil } from './helper.ts';
import { Fen, Board, Position, BoardColorMap, Color, Piece, CX, CY } from './types.ts';
import { rowToIndex, columnToIndex, coordinateToPosition, letterToFigure } from './transform.ts';

export const positionToCoordinate = (position: Position): [CY, CX] => [
  rowToIndex(position.row),
  columnToIndex(position.column),
];

export const createChessBoardFromFen = (fen: Fen): Board => {
  if (!isValidFen(fen)) throw new Error('Invalid Fen string');

  const [piecePlacement] = fen.split(' ');
  if (isNil(piecePlacement)) throw new Error('Invalid Fen string. No piece placement');

  const rows = piecePlacement?.split('/');
  if (rows?.length !== 8) throw new Error('Invalid Fen string. Not 8 rows');

  const board: Board = [];

  rows?.forEach((row, rowIndex) => {
    let colIndex = 0;
    for (const figureLetter of row) {
      if (/\d/.test(figureLetter)) {
        const temp = parseInt(figureLetter, 10);
        if (isNaN(temp) || temp < 1 || temp > 8) throw new Error('Invalid Fen string. Invalid number in row');
        colIndex += temp;
      } else {
        const piece: Piece = letterToFigure(figureLetter);
        const position = coordinateToPosition(colIndex + 1, 8 - rowIndex);
        board.push({ ...position, ...piece });
        colIndex++;
      }
    }
  });

  return board;
};

export const setBoardMapColor = (color: Color, boardMap: BoardColorMap, position: Position): BoardColorMap => {
  const row = rowToIndex(position.row) - 1;
  const col = columnToIndex(position.column) - 1;
  if (isNotNil(boardMap[row]) && isNotNil(boardMap[row][col])) {
    boardMap[row][col] = color;
  }
  return boardMap;
};

export const boardToPieceMap = (board: Board): (Piece | null)[][] => {
  const boardMap: (Piece | null)[][] = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => null));

  board.forEach((square) => {
    const row = rowToIndex(square.row) - 1;
    const col = columnToIndex(square.column) - 1;
    if (isNotNil(boardMap[row]) && isNotNil(boardMap[row][col])) {
      boardMap[row][col] = { figure: square.figure, color: square.color };
    }
  });
  return boardMap;
};

export const boardToColorMap = (board: Board): BoardColorMap =>
  boardToPieceMap(board).map((row) => row.map((piece) => (isNil(piece) ? 'none' : piece.color)));

export const getPieceFromPieceMap = (boardMap: (Piece | null)[][], position: Position): Piece | null => {
  const row = rowToIndex(position.row) - 1;
  const col = columnToIndex(position.column) - 1;
  if (isNotNil(boardMap[row]) && isNotNil(boardMap[row][col])) {
    return boardMap[row][col];
  }
  return null;
};


