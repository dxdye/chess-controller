import { Board, Color, Position, Direction, BoardPieceMap, Figure, Piece } from './types.ts';
import { boardToPieceMap, positionToCoordinate, getPieceFromPieceMap } from './board.ts';
import { coordinateToPosition } from './transform.ts';
import { isIndexInBound, isNil, isNotNil } from './helper.ts';
import { calculateMoveListForKing } from './move.ts';

const isOpponentKing = (color: Color, piece: Piece | null): boolean =>
  isNotNil(piece) && piece.figure === 'KING' && color !== piece.color;

const isPawnDirectionCorrect = (direction: Direction, color: Color) =>
  (color === 'black' && direction.row === 1) || (color === 'white' && direction.row === -1);

const checkDirectionForCheck = (
  pieceMap: BoardPieceMap,
  kingPosition: Position | undefined,
  directions: readonly Direction[],
  color: Color,
  targetFigures: readonly Figure[],
  siftBoard: boolean = true,
) => {
  if (kingPosition === undefined) {
    return false;
  } else {
    const current = positionToCoordinate(kingPosition);
    const upperBound = siftBoard ? 8 : 2; //2 for knight
    for (const direction of directions) {
      let step = 1;

      while (step < upperBound) {
        //maybe a better way instead of using typeguard
        const stepTemp = siftBoard ? step : 1;

        const updatedRow = current[0] + direction.row * stepTemp;
        const updatedCol = current[1] + direction.col * stepTemp;
        const isInBound = isIndexInBound(updatedRow) && isIndexInBound(updatedCol);
        if (isInBound) {
          const piece = getPieceFromPieceMap(pieceMap, coordinateToPosition(updatedCol, updatedRow));
          if (piece !== null) {
            if (
              //check for pawn attack
              piece.color !== color &&
              step === 1 //only 1 step away
            ) {
              if (
                piece.figure === 'PAWN' &&
                targetFigures.includes('BISHOP') &&
                isPawnDirectionCorrect(direction, piece.color)
              ) {
                return true;
              }
            }

            const isTargetPiece = piece.color !== color && targetFigures.includes(piece.figure);
            if (isTargetPiece) {
              //f.ex. bishop or queen in diagonal direction
              return true;
            }

            if (isOpponentKing(color, piece) && step === 1 && !targetFigures.includes('KNIGHT')) {
              return true; //king is next to king
              //hypothetical king check
            }

            if (piece.color === color) {
              return false;
            }
            break; //blocked by own piece or opponent piece
          }
        }
        //found piece in this direction
        ++step;
      }
    }
  }
  return false;
};

export const isPositionChecked = (kingPosition: Position, board: Board, color: Color) => {
  const pieceMap = boardToPieceMap(board);
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
    //check by knight
    if (checkDirectionForCheck(pieceMap, kingPosition, knightMoves, color, ['KNIGHT'], false)) return true;
    return false;
  }
};

const findKingPosition = (board: Board, color: Color): Position | undefined => {
  const kingSquare = board.find((square) => square.figure === 'KING' && square.color === color);
  return kingSquare ? { row: kingSquare.row, column: kingSquare.column } : undefined;
};

export const isKingChecked = (board: Board, kingColor: Color): boolean => {
  const kingPosition = findKingPosition(board, kingColor);
  if (kingPosition === undefined) {
    throw new Error('King not found on the board');
  } else {
    return isPositionChecked(kingPosition, board, kingColor);
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
