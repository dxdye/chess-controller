import { FEN, isValidFEN } from './fen.ts';
import { isNil, isNotNil } from './helper.ts';
import { Board, FigureLetter, Row, Column, Position, BoardColorMap, Color, Piece, CX, CY } from './types.ts';
import { rowToIndex, columnToIndex, coordinateToPosition, letterToFigure, figureToLetter } from './transform.ts';

export const positionToCoordinate = (position: Position): [CY, CX] => [
  rowToIndex(position.row),
  columnToIndex(position.column),
];
const stringToPosition = (pos: string): Position => {
  if (pos.length !== 2) throw new Error('Invalid position string');
  const row = pos.charAt(0) as Row;
  const column = parseInt(pos.charAt(1), 10) as Column;
  if (!['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].includes(row) || isNaN(column) || column < 1 || column > 8) {
    throw new Error('Invalid position string');
  }
  return { row, column };
};

export const createChessBoardFromFEN = (fen: FEN): Board => {
  if (!isValidFEN(fen)) throw new Error('Invalid FEN string');

  const [piecePlacement] = fen.split(' ');
  if (isNil(piecePlacement)) throw new Error('Invalid FEN string. No piece placement');

  const rows = piecePlacement?.split('/');
  if (rows?.length !== 8) throw new Error('Invalid FEN string. Not 8 rows');

  const board: Board = [];

  rows?.forEach((row, rowIndex) => {
    let colIndex = 0;
    for (const char of row) {
      if (/\d/.test(char)) {
        const temp = parseInt(char, 2);
        if (isNaN(temp) || temp < 1 || temp > 8) throw new Error('Invalid FEN string. Invalid number in row');
        colIndex += temp;
      } else {
        const piece = letterToFigure(char as FigureLetter);
        const position = coordinateToPosition(colIndex + 1, 8 - rowIndex);
        board.push({ ...position, ...piece });
        colIndex++;
      }
    }
  });

  return board;
};

export const createFENFromChessBoard = (board: Board): FEN => {
  const rows: string[] = Array(8).fill('');
  board.forEach((square) => {
    const rowIndex = 8 - square.column;
    const colIndex = square.row.charCodeAt(0) - 'a'.charCodeAt(0);
    rows[rowIndex] += figureToLetter({
      figure: square.figure,
      color: square.color,
    });
  });

  const fenRows = rows.map((row) => {
    let fenRow = '';
    let emptyCount = 0;

    for (const char of row) {
      if (/[rnbqkpRNBQKP]/.test(char)) {
        if (emptyCount > 0) {
          fenRow += emptyCount.toString();
          emptyCount = 0;
        }
        fenRow += char;
      } else {
        emptyCount++;
      }
    }

    if (emptyCount > 0) {
      fenRow += emptyCount.toString();
    }

    return fenRow;
  });

  const piecePlacement = fenRows.join('/');
  // Default values for other FEN fields
  const activeColor = 'w';
  const castlingAvailability = 'KQkq';
  const enPassantTarget = '-';
  const halfmoveClock = '0';
  const fullmoveNumber = '1';

  return `${piecePlacement} ${activeColor} ${castlingAvailability} ${enPassantTarget} ${halfmoveClock} ${fullmoveNumber}`;
};

export const isPositionOccupied = (board: Board, position: Position): boolean =>
  board.some((square) => square.row === position.row && square.column === position.column);
// const getValidMoves = (from: Piece): Piece[] => [];

export const setBoardMapColor = (color: Color, boardMap: BoardColorMap, position: Position): BoardColorMap => {
  const row = rowToIndex(position.row) - 1;
  const col = position.column - 1;
  if (isNotNil(boardMap[row]) && isNotNil(boardMap[row][col])) {
    boardMap[row][col] = color;
  }
  return boardMap;
};

export const boardToPieceMap = (board: Board): (Piece | null)[][] => {
  const boardMap: (Piece | null)[][] = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => null));

  board.forEach((square) => {
    const row = rowToIndex(square.row) - 1;
    const col = square.column - 1;
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
  const col = position.column - 1;
  if (isNotNil(boardMap[row]) && isNotNil(boardMap[row][col])) {
    return boardMap[row][col];
  }
  return null;
};
