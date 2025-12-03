import { INIT_POSITION } from './constant.ts';
import { isNil, removeDuplicatesFromArray } from './helper.ts';
import {
  Fen,
  Board,
  CastlingLetter,
  CastlingLetters,
  EnPassentColumn,
  StrictColor,
  Row,
  Column,
  Piece,
  Rows,
} from './types.ts';
import { columnToIndex, figureToLetter, incrementColumn } from './transform.ts';

const validFen =
  /\s*^(((?:[rnbqkpRNBQKP1-8]+\/){7})[rnbqkpRNBQKP1-8]+)\s([b|w])\s([K|Q|k|q]{1,4}|-)\s(-|[a-h][1-8])\s(\d+\s\d+)/;

const hasOneKingPerSide = (position: Fen) => {
  const rows = position.split(' ').at(0)?.split('/') ?? [];
  const flatPosition = rows.join('');
  const whiteKingCount = (flatPosition.match(/K/g) || []).length;
  const blackKingCount = (flatPosition.match(/k/g) || []).length;
  return whiteKingCount === 1 && blackKingCount === 1;
};

export const validFenFrom = (fen: Fen): Fen => {
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

export const extractActiveColorFromFen = (position: Fen): StrictColor => {
  const parts = position.split(' ');
  if (parts.length < 2) throw new Error('Invalid Fen string: no denoted active color');
  const activeColorPart = parts[1];
  return activeColorPart === 'w' ? 'white' : 'black';
};
export const extractCastlingRightsFromFen = (position: Fen): CastlingLetter[] => {
  const parts = position.split(' ');
  if (parts.length < 3) throw new Error('Invalid Fen string: no denoted castling rights');
  const castlingPart = parts[2] ?? '-';
  if (castlingPart === '-') return [];
  return removeDuplicatesFromArray(
    castlingPart.split('').filter((c): c is CastlingLetter => (CastlingLetters as readonly string[]).includes(c)),
  );
};
export const extractEnPassentTargetFromFen = (position: Fen): EnPassentColumn => {
  const parts = position.split(' ');
  if (parts.length < 4) throw new Error('Invalid Fen string: no denoted en passent target');
  const enPassentPart = parts[3];
  return (enPassentPart?.charAt(0) as EnPassentColumn) ?? '-';
};
export const extractHalfmoveClockFromFen = (position: Fen): number => {
  const parts = position.split(' ');
  if (parts.length < 5) throw new Error('Invalid Fen string: no denoted halfmove clock');
  const halfmovePart = parts[4];
  return parseInt(halfmovePart ?? '0', 10);
};
export const extractMoveCountFromFen = (position: Fen): number => {
  const parts = position.split(' ');
  if (parts.length < 6) throw new Error('Invalid Fen string: no denoted move count');
  const moveCountPart = parts[5];
  return parseInt(moveCountPart ?? '1', 10);
};

export const isNewGameFEN = (position: Fen) => position === INIT_POSITION;

export const createFenPositionFromChessBoard = (board: Board): string => {
  const boardMap: Map<Row, (Piece & { column: Column })[]> = new Map();
  board.forEach((square) => {
    if ((square.row === 1 && square.figure === 'PAWN') || (square.row === 8 && square.figure === 'PAWN')) {
      throw new Error('Invalid board on first rank or back rank');
    }
  });

  board.forEach((square) => {
    if (!boardMap.has(square.row)) {
      boardMap.set(square.row, []);
    }
    //check for duplicate squares
    if (boardMap.get(square.row)?.some((sq) => sq.column === square.column)) {
      throw new Error(`Duplicate square found at row ${square.row} and column ${square.column}`);
    }

    boardMap.get(square.row)?.push({
      figure: square.figure,
      color: square.color,
      column: square.column,
    });
  });
  Rows.forEach((row) => {
    if (!boardMap.has(row)) {
      boardMap.set(row, []);
    }
  });

  boardMap.forEach((row) => {
    //sort by column
    row.sort((a, b) => columnToIndex(a.column) - columnToIndex(b.column));
  });

  const rows: string[] = Array<string>(8).fill('');
  boardMap.forEach((squares, row) => {
    let distance = 0;
    for (let c: Column = 'a'; c < 'h'; c = incrementColumn(c)) {
      const existingSquare = squares.find((sq) => sq.column === c);
      if (!existingSquare) {
        ++distance;
      } else {
        if (distance > 0) {
          rows[8 - row] += distance.toString();
          distance = 0;
        }
        rows[8 - row] += figureToLetter({
          figure: existingSquare.figure,
          color: existingSquare.color,
        });
      }
    }
    const hSquare = squares.find((sq) => sq.column === 'h');

    if (hSquare) {
      rows[8 - row] += figureToLetter({
        figure: hSquare.figure,
        color: hSquare.color,
      });
      return;
    } else {
      ++distance;
      rows[8 - row] += distance.toString();
    }
  });

  const fenRows = rows.map((row) => {
    let fenRow = '';
    let emptyCount = 0;

    for (const char of row) {
      if (/[rnbqkpRNBQKP12345678]/.test(char)) {
        if (emptyCount > 0) {
          fenRow += emptyCount.toString();
          emptyCount = 0;
        }
        fenRow += char;
      } else {
        ++emptyCount;
      }
    }

    if (emptyCount > 0) {
      fenRow += emptyCount.toString();
    }

    return fenRow;
  });

  const piecePlacement = fenRows.join('/');
  return piecePlacement;
};

export const createFenFromChessBoard = (board: Board): Fen => {
  const piecePlacement = createFenPositionFromChessBoard(board);
  const activeColor = 'w';
  const castlingAvailability = 'KQkq';
  const enPassantTarget = '-';
  const halfmoveClock = '0';
  const fullmoveNumber = '1';

  return `${piecePlacement} ${activeColor} ${castlingAvailability} ${enPassantTarget} ${halfmoveClock} ${fullmoveNumber}`;
};
