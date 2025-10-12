export const Rows = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
export const Columns = [1, 2, 3, 4, 5, 6, 7, 8] as const;
export const FigureLetters = [
  'k',
  'q',
  'r',
  'b',
  'n',
  'p',
  'K',
  'Q',
  'R',
  'B',
  'N',
  'P',
] as const;

export type Row = (typeof Rows)[number];
export type Column = (typeof Columns)[number];
export type FigureLetter = (typeof FigureLetters)[number];

export type Color = 'white' | 'black' | 'none';
export type Figure = 'PAWN' | 'KNIGHT' | 'BISHOP' | 'ROOK' | 'KING' | 'QUEEN';

export type Position = {
  row: Row;
  column: Column;
};
export type Move = Position & { isTaken?: boolean };
export type Piece = {
  color: Color;
  figure: Figure;
};

export type Square = Position & Piece;
export type Board = Square[];
export type BoardColorMap = Color[][];
export type BoardPieceMap = (Piece | null)[][];

export type CX = number; //Coord X
export type CY = number; //Coord Y
