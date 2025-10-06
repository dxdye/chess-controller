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
