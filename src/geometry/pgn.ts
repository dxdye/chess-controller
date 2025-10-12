import { Move } from './types.ts';

const moveToPgnString = (move: Move): string => {
  const pieceChar = move.isTaken ? 'x' : '-';
  return `${move.row}${pieceChar}${move.column}`;
};
