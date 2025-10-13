import { FigureLetter, Piece, Row, Column, Position, CY, CX } from './types.ts';
import { match } from 'ts-pattern';

export const letterToFigure = (letter: string): Piece =>
  match<string, Piece>(letter)
    .with('P', () => ({ figure: 'PAWN', color: 'white' }))
    .with('N', () => ({ figure: 'KNIGHT', color: 'white' }))
    .with('B', () => ({ figure: 'BISHOP', color: 'white' }))
    .with('R', () => ({ figure: 'ROOK', color: 'white' }))
    .with('K', () => ({ figure: 'KING', color: 'white' }))
    .with('Q', () => ({ figure: 'QUEEN', color: 'white' }))

    .with('p', () => ({ figure: 'PAWN', color: 'black' }))
    .with('n', () => ({ figure: 'KNIGHT', color: 'black' }))
    .with('b', () => ({ figure: 'BISHOP', color: 'black' }))
    .with('r', () => ({ figure: 'ROOK', color: 'black' }))
    .with('k', () => ({ figure: 'KING', color: 'black' }))
    .with('q', () => ({ figure: 'QUEEN', color: 'black' }))
    .otherwise(() => {
      throw new Error(`Invalid figure letter: ${letter}`);
    });

export const figureToLetter = (piece: Piece): FigureLetter =>
  match<Piece, FigureLetter>(piece)
    .with({ figure: 'PAWN', color: 'white' }, () => 'P')
    .with({ figure: 'KNIGHT', color: 'white' }, () => 'N')
    .with({ figure: 'BISHOP', color: 'white' }, () => 'B')
    .with({ figure: 'ROOK', color: 'white' }, () => 'R')
    .with({ figure: 'KING', color: 'white' }, () => 'K')
    .with({ figure: 'QUEEN', color: 'white' }, () => 'Q')

    .with({ figure: 'PAWN', color: 'black' }, () => 'p')
    .with({ figure: 'KNIGHT', color: 'black' }, () => 'n')
    .with({ figure: 'BISHOP', color: 'black' }, () => 'b')
    .with({ figure: 'ROOK', color: 'black' }, () => 'r')
    .with({ figure: 'KING', color: 'black' }, () => 'k')
    .with({ figure: 'QUEEN', color: 'black' }, () => 'q')
    .otherwise(() => {
      throw new Error('Invalid piece');
    });

export const coordinateToPosition = (col_x: number, row_y: number): Position => ({
  column: match<number, Column>(col_x)
    .with(1, () => 'a')
    .with(2, () => 'b')
    .with(3, () => 'c')
    .with(4, () => 'd')
    .with(5, () => 'e')
    .with(6, () => 'f')
    .with(7, () => 'g')
    .with(8, () => 'h')
    .otherwise(() => {
      throw new Error(`Invalid column number ${col_x}`);
    }),
  row: match<number, Row>(row_y)
    .with(1, () => 1)
    .with(2, () => 2)
    .with(3, () => 3)
    .with(4, () => 4)
    .with(5, () => 5)
    .with(6, () => 6)
    .with(7, () => 7)
    .with(8, () => 8)
    .otherwise(() => {
      throw new Error(`Invalid row number ${row_y}`);
    }),
});
export const columnToIndex = (col: Column): CX =>
  match<Column, number>(col)
    .with('a', () => 1)
    .with('b', () => 2)
    .with('c', () => 3)
    .with('d', () => 4)
    .with('e', () => 5)
    .with('f', () => 6)
    .with('g', () => 7)
    .with('h', () => 8)
    .exhaustive();
export const rowToIndex = (row: Row): CY => row;

export const enPassentColumnToIndex = (col: Column | '-'): CX =>
  match<Column | '-', CX>(col)
    .with('-', () => -Infinity)
    .otherwise(() => columnToIndex(col as Column));