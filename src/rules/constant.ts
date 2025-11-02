import type { Fen } from './types.ts';
import { CastlingLetter } from './types.ts';

export const WHITE_EN_PASSENT_ROW = 5;
export const BLACK_EN_PASSENT_ROW = 4;
export const SECOND_ROW = 2;
export const SEVENTH_ROW = 7;
export const INIT_POSITION: Fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const BOTH_CAN_CASTLE: CastlingLetter[] = ['K', 'Q', 'k', 'q'];
export const WHITE_CAN_CASTLE: CastlingLetter[] = ['K', 'Q'];
export const BLACK_CAN_CASTLE: CastlingLetter[] = ['k', 'q'];
export const NO_CASTLING: CastlingLetter[] = [];