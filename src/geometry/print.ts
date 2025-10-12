import { Board, Square } from './types.ts';
import { figureToLetter } from './board.ts';
export const printBoard = (board: Board): void => {
  const rows: string[] = Array(8).fill('');
  board.forEach((square) => {
    const rowIndex = 8 - square.column;
    const colIndex = square.row.charCodeAt(0) - 'a'.charCodeAt(0);
    rows[rowIndex] += figureToLetter({
      figure: square.figure,
      color: square.color,
    });
  });
  console.log('  a b c d e f g h');
  console.log(' +-----------------+');
  rows.forEach((row, index) => {
    let displayRow = '';
    for (const char of row) {
      if (/[rnbqkpRNBQKP]/.test(char)) {
        displayRow += char + ' ';
      } else {
        displayRow += '. ';
      }
    }
    console.log(`${8 - index}| ${displayRow}|`);
  });
  console.log(' +-----------------+');
};
