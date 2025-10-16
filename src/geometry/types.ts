export const Rows = [1, 2, 3, 4, 5, 6, 7, 8] as const;
export const Columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
export const FigureLetters = ['k', 'q', 'r', 'b', 'n', 'p', 'K', 'Q', 'R', 'B', 'N', 'P'] as const;
export const CastlingLetters = ['K', 'Q', 'k', 'q'] as const;

export type Row = (typeof Rows)[number];
export type Column = (typeof Columns)[number];
export type FigureLetter = (typeof FigureLetters)[number];
export type EnPassentColumn = Column | '-';
export type CastlingLetter = (typeof CastlingLetters)[number] | '-';

export type Color = 'white' | 'black' | 'none';
export type Figure = 'PAWN' | 'KNIGHT' | 'BISHOP' | 'ROOK' | 'KING' | 'QUEEN';

export type Position = {
  row: Row;
  column: Column;
};
export type MoveProperties = {
  isTaken?: boolean;
  isTakenEnPassent?: boolean;
  isPromotion?: boolean;
  isCastle?: CastlingLetter;
};
export type Move = Position & MoveProperties; //extra info for move
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

export type Direction = { row: CX; col: CY };

export type Pgn = string[]; //e4 e5 Nf3 Nc6 Bb5 a6 ...
export type Fen = string; //rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1 // should be called Fen

export type Game = {
  id: string;
  history: Fen[];
  turn: Color;

  lastMoveTwoPawnStep: boolean; //will be used for en passant at pawn move

  //might not be needed
  whiteKingSideCastle: boolean;
  whiteQueenSideCastle: boolean;
  blackKingSideCastle: boolean;
  blackQueenSideCastle: boolean;

  createdAt: Date;
  updatedAt: Date;
};
