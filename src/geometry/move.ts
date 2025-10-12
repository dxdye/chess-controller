import { Figure, Board, Position, Move, BoardColorMap, Color, BoardPieceMap } from './types.ts';
import { positionToCoordinate, boardToColorMap, getPieceFromPieceMap, boardToPieceMap } from './board.ts';
import { isIndexInBound, isNil } from './helper.ts';
import { coordinateToPosition } from './transform.ts';
import { isNotNil } from './helper.ts';
import { match } from 'ts-pattern';

const extractPositionFromMap = (boardColorMap: BoardColorMap, target: Position): Color => {
  const targetCoord = positionToCoordinate(target);
  const row = boardColorMap[targetCoord[1]] ?? [];
  return row[targetCoord[0]] ?? 'none';
};

const isPieceTaken = (boardColorMap: BoardColorMap, target: Position, ownColor: Color): boolean => {
  //a piece gets taken when the target position is occupied by an opponent piece
  const targetColor = extractPositionFromMap(boardColorMap, target);

  return targetColor !== 'none' && targetColor !== ownColor;
};
const isPathBlocked = (boardColorMap: BoardColorMap, target: Position, ownColor: Color): boolean => {
  //a piece gets taken when the target position is occupied by an opponent piece
  const targetColor = extractPositionFromMap(boardColorMap, target);

  return targetColor === ownColor;
};
const isPathEmpty = (boardToColorMap: BoardColorMap, target: Position) =>
  isPathBlocked(boardToColorMap, target, 'none');

export const calculateMoveListForBishop = (from: Position, board: Board): Move[] => {
  const moves: Move[] = [];
  const current = positionToCoordinate(from);
  const boardColorMap = boardToColorMap(board);
  const directions = [
    { row: 1, col: 1 },
    { row: 1, col: -1 },
    { row: -1, col: 1 },
    { row: -1, col: -1 },
  ] as const;
  directions.map((direction) => {
    let step = 1;
    while (step < 8) {
      //maybe use range here?..how to break then.. return..
      const updatedRow = current[0] + direction.row * step;
      const updatedCol = current[1] + direction.col * step;
      const pathBlocked = isPathBlocked(
        boardColorMap,
        coordinateToPosition(updatedCol, updatedRow),
        extractPositionFromMap(boardColorMap, from),
      );
      if (isIndexInBound(updatedRow) && isIndexInBound(updatedCol) && !pathBlocked) {
        moves.push({
          ...coordinateToPosition(updatedCol, updatedRow),
          isTaken: isPieceTaken(
            boardColorMap,
            coordinateToPosition(updatedCol, updatedRow),
            extractPositionFromMap(boardColorMap, from),
          ),
        });
      } else {
        break;
      }
      if (pathBlocked) {
        break;
      }

      ++step;
    }
  });
  return moves;
};

export const calculateMoveListForKnight = (from: Position, board: Board): Move[] => {
  const moves: Move[] = [];
  const current = positionToCoordinate(from);
  const boardColorMap = boardToColorMap(board);
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

  knightMoves.map((move) => {
    const updatedRow = current[0] + move.row;
    const updatedCol = current[1] + move.col;
    if (
      isIndexInBound(updatedRow) &&
      isIndexInBound(updatedCol) &&
      !isPathBlocked(
        boardColorMap,
        coordinateToPosition(updatedCol, updatedRow),
        extractPositionFromMap(boardColorMap, from),
      )
    ) {
      moves.push({
        ...coordinateToPosition(updatedCol, updatedRow),
        isTaken: isPieceTaken(
          boardColorMap,
          coordinateToPosition(updatedCol, updatedRow),
          extractPositionFromMap(boardColorMap, from),
        ),
      });
    }
  });

  return moves;
};

export const calculateMoveListForRook = (from: Position, board: Board): Move[] => {
  const moves: Move[] = [];
  const current = positionToCoordinate(from);
  const boardColorMap = boardToColorMap(board);
  const directions = [
    { row: 1, col: 0 },
    { row: -1, col: 0 },
    { row: 0, col: 1 },
    { row: 0, col: -1 },
  ] as const;
  directions.map((direction) => {
    let step = 1;
    while (step < 8) {
      //maybe use range here?..how to break then.. return..
      const updatedRow = current[0] + direction.row * step;
      const updatedCol = current[1] + direction.col * step;
      const pathBlocked = isPathBlocked(
        boardColorMap,
        coordinateToPosition(updatedCol, updatedRow),
        extractPositionFromMap(boardColorMap, from),
      );
      if (isIndexInBound(updatedRow) && isIndexInBound(updatedCol) && !pathBlocked) {
        moves.push({
          ...coordinateToPosition(updatedCol, updatedRow),
          isTaken: isPieceTaken(
            boardColorMap,
            coordinateToPosition(updatedCol, updatedRow),
            extractPositionFromMap(boardColorMap, from),
          ),
        });
      } else {
        break;
      }
      if (pathBlocked) {
        break;
      }

      ++step;
    }
  });
  return moves;
};

export const calculateMoveListForQueen = (from: Position, board: Board): Move[] => {
  const moves: Move[] = [];
  const current = positionToCoordinate(from);
  const boardColorMap = boardToColorMap(board);
  const directions = [
    { row: 1, col: 0 },
    { row: -1, col: 0 },
    { row: 0, col: 1 },
    { row: 0, col: -1 },
    { row: 1, col: 1 },
    { row: 1, col: -1 },
    { row: -1, col: 1 },
    { row: -1, col: -1 },
  ] as const;
  directions.map((direction) => {
    let step = 1;
    while (step < 8) {
      //this could be optimized by extracting common logic with rook and bishop
      //it's repeated code
      //maybe extract this later to a helper function
      const updatedRow = current[0] + direction.row * step;
      const updatedCol = current[1] + direction.col * step;
      const pathBlocked = isPathBlocked(
        boardColorMap,
        coordinateToPosition(updatedCol, updatedRow),
        extractPositionFromMap(boardColorMap, from),
      );
      if (isIndexInBound(updatedRow) && isIndexInBound(updatedCol) && !pathBlocked) {
        moves.push({
          ...coordinateToPosition(updatedCol, updatedRow),
          isTaken: isPieceTaken(
            boardColorMap,
            coordinateToPosition(updatedCol, updatedRow),
            extractPositionFromMap(boardColorMap, from),
          ),
        });
      } else {
        break;
      }
      if (pathBlocked) {
        break;
      }

      ++step;
    }
  });
  return moves;
};

export const calculateMoveListForKing = (from: Position, board: Board): Move[] => {
  const moves: Move[] = [];
  const current = positionToCoordinate(from);
  const boardColorMap = boardToColorMap(board);
  const kingMoves = [
    { row: 1, col: 0 },
    { row: -1, col: 0 },
    { row: 0, col: 1 },
    { row: 0, col: -1 },
    { row: 1, col: 1 },
    { row: 1, col: -1 },
    { row: -1, col: 1 },
    { row: -1, col: -1 },
  ] as const;

  kingMoves.map((move) => {
    const updatedRow = current[0] + move.row;
    const updatedCol = current[1] + move.col;
    if (
      isIndexInBound(updatedRow) &&
      isIndexInBound(updatedCol) &&
      !isPathBlocked(
        boardColorMap,
        coordinateToPosition(updatedCol, updatedRow),
        extractPositionFromMap(boardColorMap, from),
      )
    ) {
      moves.push({
        ...coordinateToPosition(updatedCol, updatedRow),
        isTaken: isPieceTaken(
          boardColorMap,
          coordinateToPosition(updatedCol, updatedRow),
          extractPositionFromMap(boardColorMap, from),
        ),
      });
    }
  });

  return moves;
};

export const calculateMoveListForPawn = (
  from: Position,
  board: Board,
  isEnPassentPossible: boolean = false, // is true if pawn was moved two squares in the last move
): Move[] => {
  const color = board.find((square) => square.row === from.row && square.column === from.column)?.color;
  if (isNil(color) || color === 'none') {
    throw new Error('No piece found at the given position or invalid color');
  }
  const whitePawnDirections: {
    row: number;
    col: number;
  }[] = [
    { row: 1, col: 0 }, //forward
    { row: 1, col: 1 }, //capture right
    { row: 1, col: -1 }, //capture left
  ];
  const blackPawnDirections: {
    row: number;
    col: number;
  }[] = [
    { row: -1, col: 0 }, //forward
    { row: -1, col: 1 }, //capture right
    { row: -1, col: -1 }, //capture left
  ];
  const directions = color === 'white' ? whitePawnDirections : blackPawnDirections;
  const moves: Move[] = [];

  directions.map((direction) => {
    const current = positionToCoordinate(from);

    const updatedRow = current[0] * direction.row; //y
    const updatedColumn = current[1] * direction.col; //x
    if (
      (isIndexInBound(updatedRow) &&
        isIndexInBound(updatedColumn) &&
        color !== undefined &&
        ((!isPathBlocked(
          //own color isn't other piece color
          boardToColorMap(board),
          coordinateToPosition(updatedColumn, updatedRow),
          color,
        ) &&
          direction.col !== 0) ||
          (direction.col === 0 &&
            isPathEmpty(boardToColorMap(board), coordinateToPosition(updatedColumn, updatedRow))))) || //forward move, no capture
      (direction.col !== 0 &&
        isPathEmpty(boardToColorMap(board), coordinateToPosition(updatedColumn, updatedRow)) &&
        isEnPassentPossible) //check for en passent move
    ) {
      moves.push({
        ...coordinateToPosition(updatedColumn, updatedRow),
        isTaken: isPieceTaken(boardToColorMap(board), coordinateToPosition(updatedColumn, updatedRow), color ?? 'none'),
      });
    }
  });
  return moves;
};

export const calculateMoveListForPiece = (
  from: Position,
  board: Board,
  isEnPassentPossible: boolean = false, // is true if pawn was moved two squares in the last move
): Move[] => {
  const piece = board.find((square) => square.row === from.row && square.column === from.column);
  if (isNil(piece)) {
    throw new Error('No piece found at the given position');
  }

  return match(piece?.figure)
    .with('BISHOP', () => calculateMoveListForBishop(from, board))
    .with('KNIGHT', () => calculateMoveListForKnight(from, board))
    .with('ROOK', () => calculateMoveListForRook(from, board))
    .with('QUEEN', () => calculateMoveListForQueen(from, board))
    .with('KING', () => calculateMoveListForKing(from, board))
    .with('PAWN', () => calculateMoveListForPawn(from, board, isEnPassentPossible))
    .otherwise(() => {
      throw new Error('Invalid piece type');
    });
};

const findKingPosition = (board: Board, color: Color): Position | undefined => {
  const kingSquare = board.find((square) => square.figure === 'KING' && square.color === color);
  return kingSquare ? { row: kingSquare.row, column: kingSquare.column } : undefined;
};

const isPawnDirectionCorrect = (direction: { row: number; col: number }, color: Color) =>
  (color === 'white' && direction.row === 1) || (color === 'black' && direction.row === -1);

const checkDirectionForCheck = (
  pieceMap: BoardPieceMap,
  kingPosition: Position | undefined,
  directions: readonly { row: number; col: number }[],
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

const isKingChecked = (board: Board, color: Color): boolean => {
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

    if (checkDirectionForCheck(pieceMap, kingPosition, bishopDirection, color, ['BISHOP', 'QUEEN'])) return true;
    //check by bishop or queen
    //check by rook or queen
    if (checkDirectionForCheck(pieceMap, kingPosition, rookDirection, color, ['ROOK', 'QUEEN'])) return true;
    if (checkDirectionForCheck(pieceMap, kingPosition, knightMoves, color, ['KNIGHT'], false)) return true;
    return false;
  }
};

export const isCheckMate = (
  board: Board,
  color: Color,
): boolean => //king has no moves.. and is checked
  calculateMoveListForKing(findKingPosition(board, color)!, board).length === 0 && isKingChecked(board, color);
