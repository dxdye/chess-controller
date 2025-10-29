import { isKingChecked, wouldPositionBeChecked } from './check.ts';
import { Board, Position, Move, BoardColorMap, Color, Direction, EnPassentColumn, CastlingLetter } from './types.ts';
import { positionToCoordinate, boardToColorMap, boardToPieceMap, boardPieceMapToColorMap } from './board.ts';
import { isIndexInBound, isNil } from './helper.ts';
import { coordinateToPosition, enPassentColumnToIndex } from './transform.ts';
import { match } from 'ts-pattern';
import { BLACK_EN_PASSENT_ROW, SECOND_ROW, SEVENTH_ROW, WHITE_EN_PASSENT_ROW } from './constant.ts';

const includesCastlingRight = (castlingRights: CastlingLetter[], targetRight: CastlingLetter): boolean => {
  return castlingRights.includes(targetRight);
};

const isPieceRook = (board: Board, position: Position, color: Color): boolean => {
  const piece = board.find((square) => square.row === position.row && square.column === position.column);
  return piece?.figure === 'ROOK' && piece?.color === color;
};

const extractColorFromMap = (boardColorMap: BoardColorMap, target: Position): Color => {
  const targetCoord = positionToCoordinate(target);
  const row = boardColorMap[targetCoord[0] - 1] ?? [];
  return row[targetCoord[1] - 1] ?? 'none';
};

const isPieceCaptured = (boardColorMap: BoardColorMap, target: Position, ownColor: Color): boolean => {
  //a piece gets taken when the target position is occupied by an opponent piece
  const targetColor = extractColorFromMap(boardColorMap, target);

  return targetColor !== 'none' && targetColor !== ownColor;
};
const isPathBlocked = (boardColorMap: BoardColorMap, target: Position, ownColor: Color): boolean => {
  //a piece gets taken when the target position is occupied by an opponent piece
  const targetColor = extractColorFromMap(boardColorMap, target);
  return targetColor === ownColor;
};
const isPawnCaptureBlocked = (boardToColorMap: BoardColorMap, target: Position, ownColor: Color) => {
  const targetColor = extractColorFromMap(boardToColorMap, target); //warning: back and forth conversion of position to coordinate
  return targetColor === 'none' || targetColor === ownColor;
};

const isPathEmpty = (boardToColorMap: BoardColorMap, target: Position) =>
  isPathBlocked(boardToColorMap, target, 'none');

const moveDirection = (directions: readonly Direction[], from: Position, moves: Move[], board: Board): Move[] => {
  //crawl in given directions until path is blocked or out of bounds
  const current = positionToCoordinate(from);
  const boardPieceMap = boardToPieceMap(board);
  const boardColorMap = boardPieceMapToColorMap(boardPieceMap);
  directions.map((direction) => {
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
        const fromColor = extractColorFromMap(boardColorMap, from);
        pathBlocked = isPathBlocked(boardColorMap, updatedPos, fromColor);
        isTaken = isPieceCaptured(boardColorMap, updatedPos, fromColor);

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
        extractColorFromMap(boardColorMap, from),
      )
    ) {
      moves.push({
        ...coordinateToPosition(updatedCol, updatedRow),
        isTaken: isPieceCaptured(
          boardColorMap,
          coordinateToPosition(updatedCol, updatedRow),
          extractColorFromMap(boardColorMap, from),
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
  isKingChecked: boolean,
  castlingRights: CastlingLetter[] = [], //castling rights are evaluated by game
): Move[] => {
  const moves: Move[] = [];
  const current = positionToCoordinate(from);
  const pieceMap = boardToPieceMap(board);
  const boardColorMap = pieceMap.map((row) => row.map((piece) => (isNil(piece) ? 'none' : piece.color)));
  const color = extractColorFromMap(boardColorMap, from);
  const boardWithoutKing = board.filter((square) => !(square.figure === 'KING' && square.color === color)); //remove own king from board to avoid blocking the algorithm

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
    const isInBound = isIndexInBound(updatedRow) && isIndexInBound(updatedCol);
    if (isInBound) {
      //only add move if king will not be in check!
      // <=> king is not touching other king
      const updatedPos = coordinateToPosition(updatedCol, updatedRow);
      //remove king from board to avoid blocking the algorithm
      const updatedPosIsThreatened = wouldPositionBeChecked(boardWithoutKing, updatedPos, color);

      //only add move if path isn't blocked by own piece
      //and if new position is not threatened by opponent piece
      if (!isPathBlocked(boardColorMap, updatedPos, color) && !updatedPosIsThreatened) {
        moves.push({ ...updatedPos, isTaken: isPieceCaptured(boardColorMap, updatedPos, color) });
      }
    }
  });

  //castling logic
  //evaluated externally:
  //king has moved, prevents color castling
  //white left rook moved, prevents white queen side castle
  //white right rook moved, prevents white king side castle
  //black right rook moved, prevents black king side castle
  //black left rook moved, prevents black queen side castle

  //evaluate following conditions:
  //path between rook and king is empty
  //king isn't in check before or while castling
  //king wouldn't be in check after castling (also the square the king passes over)

  //check whether rook exists on is checked

  const fromColor = extractColorFromMap(boardColorMap, from);
  if (!isKingChecked) {
    if (fromColor === 'white') {
      const isCorrectPosition = from.row === 1 && from.column === 'e';
      //white king side castling
      if (
        includesCastlingRight(castlingRights, 'K') &&
        isCorrectPosition &&
        isPathEmpty(boardColorMap, { row: 1, column: 'f' }) &&
        isPathEmpty(boardColorMap, { row: 1, column: 'g' }) &&
        !wouldPositionBeChecked(boardWithoutKing, { row: 1, column: 'f' }, fromColor) &&
        !wouldPositionBeChecked(boardWithoutKing, { row: 1, column: 'g' }, fromColor) &&
        isPieceRook(board, { row: 1, column: 'h' }, fromColor)
      ) {
        moves.push({ row: from.row, column: 'g', isTaken: false, isCastle: 'K' });
      }
      //white queen side castling
      if (
        includesCastlingRight(castlingRights, 'Q') &&
        isCorrectPosition &&
        fromColor === 'white' &&
        isPathEmpty(boardColorMap, { row: 1, column: 'd' }) &&
        isPathEmpty(boardColorMap, { row: 1, column: 'c' }) &&
        isPathEmpty(boardColorMap, { row: 1, column: 'b' }) &&
        !wouldPositionBeChecked(board, { row: 1, column: 'd' }, fromColor) && //not checked on d1
        !wouldPositionBeChecked(board, { row: 1, column: 'c' }, fromColor) && // not checked on c1
        isPieceRook(board, { row: 1, column: 'a' }, fromColor)
      ) {
        moves.push({ row: from.row, column: 'c', isTaken: false, isCastle: 'Q' });
      }
    }

    if (fromColor === 'black') {
      const isCorrectPosition = from.row === 8 && from.column === 'e';
      //black king side castling
      if (
        includesCastlingRight(castlingRights, 'k') &&
        isCorrectPosition &&
        isPathEmpty(boardColorMap, { row: 8, column: 'f' }) &&
        isPathEmpty(boardColorMap, { row: 8, column: 'g' }) &&
        !wouldPositionBeChecked(boardWithoutKing, { row: 8, column: 'f' }, fromColor) &&
        !wouldPositionBeChecked(boardWithoutKing, { row: 8, column: 'g' }, fromColor) &&
        isPieceRook(board, { row: 8, column: 'h' }, fromColor)
      ) {
        moves.push({ row: from.row, column: 'g', isTaken: false, isCastle: 'k' });
      }
      //black queen side castling
      if (
        includesCastlingRight(castlingRights, 'q') &&
        isCorrectPosition &&
        isPathEmpty(boardColorMap, { row: 8, column: 'd' }) &&
        isPathEmpty(boardColorMap, { row: 8, column: 'c' }) &&
        isPathEmpty(boardColorMap, { row: 8, column: 'b' }) &&
        !wouldPositionBeChecked(board, { row: 8, column: 'd' }, fromColor) && // would not checked on d8
        !wouldPositionBeChecked(board, { row: 8, column: 'c' }, fromColor) && // would not checked on c8
        isPieceRook(board, { row: 8, column: 'a' }, fromColor)
      ) {
        moves.push({ row: from.row, column: 'c', isTaken: false, isCastle: 'q' });
      }
    }
    //don't act if fromColor is none
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
  castlingRights: CastlingLetter[] = [],
): Move[] => {
  const piece = board.find((square) => square.row === from.row && square.column === from.column);
  if (isNil(piece)) {
    throw new Error('No piece found at the given position');
  }
  const kingIsChecked = isKingChecked(board, piece?.color ?? 'none');
  if (kingIsChecked && piece?.figure !== 'KING') {
    return []; //return empty list
    //only king shall move
  }

  return match(piece?.figure)
    .with('KING', () => calculateMoveListForKing(from, board, kingIsChecked, castlingRights))
    .with('BISHOP', () => calculateMoveListForBishop(from, board))
    .with('KNIGHT', () => calculateMoveListForKnight(from, board))
    .with('ROOK', () => calculateMoveListForRook(from, board))
    .with('QUEEN', () => calculateMoveListForQueen(from, board))
    .with('PAWN', () => calculateMoveListForPawn(from, board, hasPreviousTwoStepPawnMove))
    .otherwise(() => {
      throw new Error('Invalid piece type');
    });
};

//export const pruneMoveListForCheck = (board: Board, from: Position, moveList: Move[]): Move[] => {

//tbd
//en passent
//castling
//move game
//check for check before and after move /*prune movelist */
