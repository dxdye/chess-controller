import { INIT_POSITION } from './constant.ts';
import { isNil } from './helper.ts';
import { Fen, Board } from './types.ts';
import { figureToLetter } from './transform.ts';

const validFen =
  /\s*^(((?:[rnbqkpRNBQKP1-8]+\/){7})[rnbqkpRNBQKP1-8]+)\s([b|w])\s([K|Q|k|q]{1,4}|-)\s(-|[a-h][1-8])\s(\d+\s\d+)/;

const hasOneKingPerSide = (position: Fen) => {
  const rows = position.split(' ').at(0)?.split('/') ?? [];
  const flatPosition = rows.join('');
  const whiteKingCount = (flatPosition.match(/K/g) || []).length;
  const blackKingCount = (flatPosition.match(/k/g) || []).length;
  return whiteKingCount === 1 && blackKingCount === 1;
};

export const validFenFrom = (fen: Fen) => {
  if (isValidFen(fen)) {
    return fen;
  } else throw new Error('Invalid FEN string');
};

const checkForMaxPiecesPerRow = (position: Fen) =>
  /*should have at max 8 squares (alphabetical letters) per row */
  position
    .split(' ')
    .at(0)
    ?.split('/')
    .every((row) => {
      const piecesInRow = Array.from(row)
        .map((char) => (isNaN(parseInt(char)) ? 1 : parseInt(char)))
        .reduce((a, b) => a + b, 0);
      return piecesInRow <= 8;
    }) ?? false;

export const isValidFenSyntax = (position: Fen): boolean =>
  validFen.test(position) && checkForMaxPiecesPerRow(position) && hasOneKingPerSide(position);

export const additionalFenTests = (fen: Fen): boolean => {
  const parts = fen.split(' ');
  if (parts.length !== 6) {
    return false;
  }
  const [piecePlacement] = parts;
  if (isNil(piecePlacement)) return false;

  const rows = piecePlacement?.split('/');
  if (rows?.length !== 8) return false;
  return true;
};
export const isValidFen = (position: Fen): boolean => isValidFenSyntax(position) && additionalFenTests(position);

export const extractPiecePlacementFromFen = (position: Fen) => {
  return position.split(' ').at(0) ?? '';
};

export const isNewGameFEN = (position: Fen) => position === INIT_POSITION;

// export const extractCastlingRightsFromFen = (fen: Fen) => {
//   const parts = fen.split(' ');
//   if (parts.length < 3) throw new Error('Invalid Fen string');
//   const castlingPart = parts[2];
//   return {
//     whiteKingSideCastle: castlingPart.includes('K'),
//     whiteQueenSideCastle: castlingPart.includes('Q'),
//     blackKingSideCastle: castlingPart.includes('k'),
//     blackQueenSideCastle: castlingPart.includes('q'),
//   };
// };

export const createFenFromChessBoard = (board: Board): Fen => {
  const rows: string[] = Array(8).fill('');
  board.forEach((square) => {
    const rowIndex = 8 - square.row;
    const colIndex = square.column.charCodeAt(0) - 'a'.charCodeAt(0);
    rows[rowIndex] += figureToLetter({
      figure: square.figure,
      color: square.color,
    });
  });

  const fenRows = rows.map((row) => {
    let fenRow = '';
    let emptyCount = 0;

    for (const char of row) {
      if (/[rnbqkpRNBQKP]/.test(char)) {
        if (emptyCount > 0) {
          fenRow += emptyCount.toString();
          emptyCount = 0;
        }
        fenRow += char;
      } else {
        emptyCount++;
      }
    }

    if (emptyCount > 0) {
      fenRow += emptyCount.toString();
    }

    return fenRow;
  });

  const piecePlacement = fenRows.join('/');
  // Default values for other Fen fields
  const activeColor = 'w';
  const castlingAvailability = 'KQkq';
  const enPassantTarget = '-';
  const halfmoveClock = '0';
  const fullmoveNumber = '1';

  return `${piecePlacement} ${activeColor} ${castlingAvailability} ${enPassantTarget} ${halfmoveClock} ${fullmoveNumber}`;
};
