export type row = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h';
export type column = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type piece =
  | 'PAWN'
  | 'KNIGHT'
  | 'BISHOP'
  | 'ROOK'
  | 'KING'
  | 'QUEEN'
  | 'NONE';

export type square = {
  piece: piece;
  row: row;
  column: column;
};

export type FEN = string;
export const initPosition: FEN =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const validFEN = /^(?:(?:[PNBRQK]+|[1-8])\/){7}(?:[PNBRQK]+|[1-8])$/gim;
export const checkValidFEN = (position: FEN) => validFEN.test(position);
