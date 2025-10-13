import { Board, Color, Position, Direction, BoardPieceMap, Figure } from './types.ts';
import { boardToPieceMap, positionToCoordinate, getPieceFromPieceMap } from './board.ts';
import { coordinateToPosition } from './transform.ts';
import { isNil, isNotNil } from './helper.ts';
import { calculateMoveListForKing } from './move.ts';

const isPawnDirectionCorrect = (direction: Direction, color: Color) =>
  (color === 'white' && direction.row === 1) || (color === 'black' && direction.row === -1);

const checkDirectionForCheck = (
  pieceMap: BoardPieceMap,
  kingPosition: Position | undefined,
  directions: readonly Direction[],
  color: Color,
  targetFigures: Figure[],
  siftBoard: boolean = true,
) => {
  directions.map((direction) => {
    let step = siftBoard ? 1 : 7;
    while (step < 8 && isNotNil(kingPosition)) {
      //maybe a better way instead of using typeguard
      const stepTemp = siftBoard ? step : 1;

      const updatedRow = positionToCoordinate(kingPosition)[0] + direction.row * stepTemp;
      const updatedCol = positionToCoordinate(kingPosition)[1] + direction.col * stepTemp;
      const piece = getPieceFromPieceMap(pieceMap, coordinateToPosition(updatedCol, updatedRow));
      if (piece !== null) {
        if (
          //check for pawn attack
          step === 1 &&
          piece.figure === 'PAWN' &&
          targetFigures.includes('BISHOP') &&
          piece.color !== color &&
          isPawnDirectionCorrect(direction, piece.color)
        ) {
          return true;
        }

        if (piece.color !== color && targetFigures.includes(piece.figure)) {
          return true;
        }
        break; //blocked by own piece or opponent piece
      }
      //found piece in this direction
      ++step;
    }
  });
  return false;
};

const isPositionChecked = (position: Position, board: Board) => {};

const findKingPosition = (board: Board, color: Color): Position | undefined => {
  const kingSquare = board.find((square) => square.figure === 'KING' && square.color === color);
  return kingSquare ? { row: kingSquare.row, column: kingSquare.column } : undefined;
};

export const isKingChecked = (board: Board, color: Color): boolean => {
  const pieceMap = boardToPieceMap(board);
  const kingPosition = findKingPosition(board, color);
  if (isNil(kingPosition)) {
    throw new Error('King not found on the board');
  } else {
    const bishopDirection = [
      { row: 1, col: 1 },
      { row: 1, col: -1 },
      { row: -1, col: 1 },
      { row: -1, col: -1 },
    ] as const;
    const rookDirection = [
      { row: 1, col: 0 },
      { row: -1, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: -1 },
    ] as const;

    //check by knight
    const knightMoves = [
      { row: 2, col: 1 },
      { row: 2, col: -1 },
      { row: -2, col: 1 },
      { row: -2, col: -1 },
      { row: 1, col: 2 },
      { row: 1, col: -2 },
      { row: -1, col: 2 },
      { row: -1, col: -2 },
    ] as const;

    //check by bishop or queen
    if (checkDirectionForCheck(pieceMap, kingPosition, bishopDirection, color, ['BISHOP', 'QUEEN'])) return true;
    //check by rook or queen
    if (checkDirectionForCheck(pieceMap, kingPosition, rookDirection, color, ['ROOK', 'QUEEN'])) return true;
    if (checkDirectionForCheck(pieceMap, kingPosition, knightMoves, color, ['KNIGHT'], false)) return true;
    return false;
  }
};

export const isCheckMate = (board: Board, color: Color): boolean => {
  //king has no moves.. and is checked
  const position = findKingPosition(board, color);
  if (position === undefined) {
    throw new Error('King not found on the board');
  } else {
    return calculateMoveListForKing(position, board).length === 0 && isKingChecked(board, color);
  }
};

export const isStaleMate = (board: Board, color: Color): boolean => {
  //king has no moves.. and is not checked
  //king has no moves.. and is checked
  const position = findKingPosition(board, color);
  if (position === undefined) {
    throw new Error('King not found on the board');
  } else {
    return calculateMoveListForKing(position, board).length === 0 && !isKingChecked(board, color);
  }
};
