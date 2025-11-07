import { calculateMoveListForPiece } from './move.ts';
import { Board, CastlingLetter, EnPassentColumn, Move, Piece, DestMove } from './types.ts';

//move list calculation is expensive, so if mirror piece does not exist, we skip move list calculation
const doesMirrorPieceExist = (piece: Piece, board: Board): boolean =>
  piece.figure != 'KING' && board.some((sq) => sq.figure === piece.figure && sq.color === piece.color);

const doesMoveListOverlap = (moveOfPiece: DestMove[], moveOfMirrorPiece: DestMove[]): boolean =>
  moveOfPiece.some((m) => moveOfMirrorPiece.some((l) => m.row === l.row && m.column === l.column));




//move list of other piece shouldn't overlap
const moveToPgn = (
  move: Move,
  board: Board,
  enPassentColumn: EnPassentColumn,
  castlingRights: CastlingLetter[],
  takeSymbol: string = 'x',
): string => {
  const mirrorPieces = board.filter(
    // there could be actually multiple mirror pieces (pieces of same type and color)
    (sq) =>
      !(sq.figure === move.figure && sq.color === move.color && !(sq.row === move.row && sq.column === move.column)),
  ); //add self to list to simplify logic
  const moveListsOverlap = mirrorPieces
    .map((mp) => calculateMoveListForPiece(mp, board, enPassentColumn, castlingRights))
    .reduce(
      (acc, curr) =>
        acc || doesMoveListOverlap(calculateMoveListForPiece(move, board, enPassentColumn, castlingRights), curr),
      false,
    );
  const pieceChar = move.isTaken ? takeSymbol : '-';
  if (pieceChar === '-' && !moveListsOverlap) {
    return `${move.row}${move.column}`;
  }

  const dest = `${move.row}${move.column}`;
  /*
   * ROOK or QUEEN on same row only the column is needed
   * ROOK or QUEEN on same column only row the is needed
   * KNIGHT needs both row and column (if moveList does not overlap)
   * BISHOP and Queen on same diagonal need both row and column (if unambiguous)
   * */
  return '';
};
