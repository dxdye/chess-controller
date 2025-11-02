import { Move } from './types.ts';

const moveToPgnString = (move: Move): string => {
  const pieceChar = move.isTaken ? 'x' : '-';
  return `${move.row}${pieceChar}${move.column}`;
};


class Pgn {
  moves: Move[] = [];

  addMove(move: Move) {
    this.moves.push(move);
  }

  toString(): string {
    return this.moves.map(moveToPgnString).join(' ');
  }
}