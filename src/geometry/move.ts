import {
  Figure,
  Board,
  Position,
  Move,
  BoardColorMap,
  Color,
  BoardPieceMap,
  Direction,
  EnPassentColumn,
} from './types.ts';
import { positionToCoordinate, boardToColorMap, getPieceFromPieceMap, boardToPieceMap } from './board.ts';
import { isIndexInBound, isNil } from './helper.ts';
import { coordinateToPosition, enPassentColumnToIndex } from './transform.ts';
import { isNotNil } from './helper.ts';
import { match } from 'ts-pattern';
import { BLACK_EN_PASSENT_ROW, SECOND_ROW, SEVENTH_ROW, WHITE_EN_PASSENT_ROW } from './constant.ts';

const extractPositionFromMap = (boardColorMap: BoardColorMap, target: Position): Color => {
  const targetCoord = positionToCoordinate(target);
  const row = boardColorMap[targetCoord[0] - 1] ?? [];
  return row[targetCoord[1] - 1] ?? 'none';
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
const isPawnCaptureBlocked = (boardToColorMap: BoardColorMap, target: Position, ownColor: Color) => {
  const targetColor = extractPositionFromMap(boardToColorMap, target);
  return targetColor === 'none' || targetColor === ownColor;
};

const isPathEmpty = (boardToColorMap: BoardColorMap, target: Position) =>
  isPathBlocked(boardToColorMap, target, 'none');

const moveDirection = (directions: readonly Direction[], from: Position, moves: Move[], board: Board): Move[] => {
  const current = positionToCoordinate(from);
  const boardColorMap = boardToColorMap(board);
  directions.map((direction) => {
    //repeated code!!
    let step = 1;
    while (step < 8) {
      //maybe use range here?..how to break then.. return..
      const updatedRow = current[0] + direction.row * step;
      const updatedCol = current[1] + direction.col * step;

      const isInBound = isIndexInBound(updatedRow) && isIndexInBound(updatedCol);
      let pathBlocked = false;
      let isTaken = false;

      if (isInBound) {
        const updatedPos = coordinateToPosition(updatedCol, updatedRow);
        const fromColor = extractPositionFromMap(boardColorMap, from);
        pathBlocked = isPathBlocked(boardColorMap, updatedPos, fromColor);
        isTaken = isPieceTaken(boardColorMap, updatedPos, fromColor);
        if (!pathBlocked) {
          moves.push({ ...updatedPos, isTaken: isTaken });
        }
      } else {
        //if coordinates are out of bounds, break the loop
        break;
      }
      if (pathBlocked || isTaken) {
        //if path is blocked, there is no reason to continue in this direction
        break;
      }

      ++step;
    }
  });
  return moves;
}; //will be used for rook, bishop, queen

export const calculateMoveListForBishop = (from: Position, board: Board): Move[] => {
  const moves: Move[] = [];
  const directions: Direction[] = [
    { row: 1, col: 1 },
    { row: 1, col: -1 },
    { row: -1, col: 1 },
    { row: -1, col: -1 },
  ] as const;
  return moveDirection(directions, from, moves, board);
};

export const calculateMoveListForKnight = (from: Position, board: Board): Move[] => {
  const moves: Move[] = [];
  const current = positionToCoordinate(from);
  const boardColorMap = boardToColorMap(board);
  const knightMoves: Direction[] = [
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
  const directions: Direction[] = [
    { row: 1, col: 0 },
    { row: -1, col: 0 },
    { row: 0, col: 1 },
    { row: 0, col: -1 },
  ] as const;
  return moveDirection(directions, from, moves, board);
};

export const calculateMoveListForQueen = (from: Position, board: Board): Move[] => {
  const moves: Move[] = [];
  const directions: Direction[] = [
    { row: 1, col: 1 },
    { row: 1, col: -1 },
    { row: -1, col: 1 },
    { row: -1, col: -1 },
    { row: 1, col: 0 },
    { row: -1, col: 0 },
    { row: 0, col: 1 },
    { row: 0, col: -1 },
  ] as const;
  return moveDirection(directions, from, moves, board);
};

export const calculateMoveListForKing = (
  from: Position,
  board: Board,
  isCastlingPossible: boolean = false, //king or rook hasn't moved yet
): Move[] => {
  const moves: Move[] = [];
  const current = positionToCoordinate(from);
  const pieceMap = boardToPieceMap(board);
  const boardColorMap = pieceMap.map((row) => row.map((piece) => (isNil(piece) ? 'none' : piece.color)));
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
  //castling logic
  if (isCastlingPossible && !isKingChecked(board, extractPositionFromMap(boardColorMap, from))) {
    //
  }

  return moves;
};

export const calculateMoveListForPawn = (
  from: Position,
  board: Board,
  hasPreviousTwoStepPawnMove: EnPassentColumn = '-', // allows en passent
): Move[] => {
  const color = board.find((square) => square.row === from.row && square.column === from.column)?.color ?? 'none';
  if (color === 'none') {
    throw new Error('No piece found at the given position or invalid color');
  }
  const whitePawnDirections: Direction[] = [
    { row: 1, col: 0 }, //forward
    { row: 1, col: 1 }, //capture right
    { row: 1, col: -1 }, //capture left
  ];

  const blackPawnDirections: Direction[] = [
    { row: -1, col: 0 }, //forward
    { row: -1, col: 1 }, //capture right
    { row: -1, col: -1 }, //capture left
  ];
  const moves: Move[] = [];

  const current = positionToCoordinate(from);
  const directions = color === 'white' ? whitePawnDirections : blackPawnDirections;
  const boardColorMap = boardToColorMap(board);

  directions.map((direction) => {
    //evaluate all 3 directions
    let addToMoves: boolean = false;
    let takesOtherPiece: boolean = false;

    const updatedRow = current[0] + direction.row;
    const updatedColumn = current[1] + direction.col;

    const inBound = isIndexInBound(updatedRow) && isIndexInBound(updatedColumn);

    if (!inBound)
      addToMoves = false; //don't add to move if out of bounds
    else {
      //if in bounds calculate additional cases
      const updatedPosition = coordinateToPosition(updatedColumn, updatedRow);

      //forward move, no capture
      const forwardMoveNotBlocked = direction.col === 0 && isPathEmpty(boardColorMap, updatedPosition);

      //own color isn't other piece color
      const pawnTakesOtherPiece = direction.col !== 0 && !isPawnCaptureBlocked(boardColorMap, updatedPosition, color);

      //check for en passent move
      const enpassentCapture =
        direction.col !== 0 &&
        isPathEmpty(boardColorMap, updatedPosition) &&
        updatedColumn === enPassentColumnToIndex(hasPreviousTwoStepPawnMove) && //must be on the correct column
        hasPreviousTwoStepPawnMove &&
        ((color === 'white' && from.row === WHITE_EN_PASSENT_ROW) ||
          (color === 'black' && from.row === BLACK_EN_PASSENT_ROW)); //pawn must be on 5th (white) or 4th (black) row

      addToMoves = pawnTakesOtherPiece || forwardMoveNotBlocked || enpassentCapture;
      takesOtherPiece = pawnTakesOtherPiece || enpassentCapture;
    }
    if (addToMoves) {
      moves.push({ ...coordinateToPosition(updatedColumn, updatedRow), isTaken: takesOtherPiece });
    }
  });

  //2 steps forward
  if ((color === 'white' && from.row === SECOND_ROW) || (color === 'black' && from.row === SEVENTH_ROW)) {
    const current = positionToCoordinate(from);
    const updatedRow = current[0] + (color === 'white' ? 2 : -2);
    const updatedColumn = current[1];
    if (
      isIndexInBound(updatedRow) &&
      isIndexInBound(updatedColumn) &&
      isPathEmpty(boardToColorMap(board), coordinateToPosition(updatedColumn, updatedRow)) &&
      isPathEmpty(
        boardToColorMap(board),
        coordinateToPosition(updatedColumn, current[0] + (color === 'white' ? 1 : -1)),
      )
    ) {
      moves.push({
        ...coordinateToPosition(updatedColumn, updatedRow),
        isTaken: false,
      });
    }
  }

  return moves;
};

export const calculateMoveListForPiece = (
  from: Position,
  board: Board,
  hasPreviousTwoStepPawnMove: EnPassentColumn = '-', // is true if pawn was moved two squares in the last move
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
    .with('PAWN', () => calculateMoveListForPawn(from, board, hasPreviousTwoStepPawnMove))
    .otherwise(() => {
      throw new Error('Invalid piece type');
    });
};

const findKingPosition = (board: Board, color: Color): Position | undefined => {
  const kingSquare = board.find((square) => square.figure === 'KING' && square.color === color);
  return kingSquare ? { row: kingSquare.row, column: kingSquare.column } : undefined;
};

const isPawnDirectionCorrect = (direction: Direction, color: Color) =>
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

