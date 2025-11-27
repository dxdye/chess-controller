import { match } from 'ts-pattern';
import { calculateMoveListForPiece } from './move.ts';
import { Board, CastlingLetter, EnPassentColumn, Move, Piece, DestMove, Position } from './types.ts';

const buildFinalPgnString = (values: string[]) => values.filter((v) => v.length > 0).join('');

//move list calculation is expensive, so if mirror piece does not exist, we skip move list calculation
const doesMirrorPieceExist = (piece: Piece, board: Board): boolean =>
  piece.figure != 'KING' && board.some((sq) => sq.figure === piece.figure && sq.color === piece.color);

const doesMoveListOverlap = (moveOfPiece: DestMove[], moveOfMirrorPiece: DestMove[]): boolean =>
  moveOfPiece.some((m) => moveOfMirrorPiece.some((l) => m.row === l.row && m.column === l.column));

const buildRookMovePgn = (curr: Position, move: Move, board: Board, takeSymbol: string = 'x') => {
  const pgnMove: string[] = ['R'];
  // there could be actually multiple pieces of same kind (pieces of same type and color)
  const otherRooks = board.filter(
    (sq) => sq.figure === move.figure && sq.color === move.color && !(sq.row === curr.row && sq.column === curr.column),
  );

  // same move in move list from other rook
  const rooksWithSameMove = otherRooks.filter((rook) => {
    const rookMoveList = calculateMoveListForPiece(rook, board);
    return rookMoveList.some((some) => some.column === move.column && some.row === move.row);
  });

  const rooksWithSameMoveExist = rooksWithSameMove.length > 0;
  if (rooksWithSameMoveExist) {
    // no other rook can move to the same square
    const hasSameColumn = rooksWithSameMove.some((rook) => rook.column === curr.column); // some move has same column

    if (hasSameColumn) {
      // has same row to some other rook
      // has same column to some other rook
      pgnMove.push(`${curr.row}`);
    } else {
      pgnMove.push(`${curr.column}`); // column is nearly sufficient
    }

    //shouldn't be possible that both row and column are same as other rook's move
  }
  if (move.isTaken) {
    pgnMove.push(takeSymbol);
  }
  pgnMove.push(`${move.column}${move.row}`);
  return buildFinalPgnString(pgnMove);
};

//move list of other piece shouldn't overlap
export const moveToPgn = (
  current: Position,
  move: Move,
  board: Board,
  enPassentColumn: EnPassentColumn,
  castlingRights: CastlingLetter[],
  takeSymbol: string = 'x',
): string =>
  match(move.figure)
    .with('ROOK', () => buildRookMovePgn(current, move, board, takeSymbol))
    .otherwise(() => {
      throw new Error(`moveToPgn not implemented for figure ${move.figure}`);
    });

  /*
   * ROOK or QUEEN on same row only the column is needed
   * ROOK or QUEEN on same column only row the is needed
   * KNIGHT needs both row and column (if moveList does not overlap)
   * BISHOP and Queen on same diagonal need both row and column (if unambiguous)
   * */
