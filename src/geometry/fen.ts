import { isNil } from './helper.ts';
import { Fen } from './types.ts';

export const INIT_POSITION: Fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const validFEN =
  /\s*^(((?:[rnbqkpRNBQKP1-8]+\/){7})[rnbqkpRNBQKP1-8]+)\s([b|w])\s([K|Q|k|q]{1,4}|-)\s(-|[a-h][1-8])\s(\d+\s\d+)/;

const hasOneKingPerSide = (position: Fen) => {
  const rows = position.split(' ').at(0)?.split('/') ?? [];
  const flatPosition = rows.join('');
  const whiteKingCount = (flatPosition.match(/K/g) || []).length;
  const blackKingCount = (flatPosition.match(/k/g) || []).length;
  return whiteKingCount === 1 && blackKingCount === 1;
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

export const isValidFENSyntax = (position: Fen): boolean =>
  validFEN.test(position) && checkForMaxPiecesPerRow(position) && hasOneKingPerSide(position);

export const additionalFENTests = (fen: Fen): boolean => {
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
export const isValidFEN = (position: Fen): boolean => isValidFENSyntax(position) && additionalFENTests(position);

export const extractPiecePlacementFromFEN = (position: Fen) => {
  return position.split(' ').at(0) ?? '';
};

export const isNewGameFEN = (position: Fen) => position === INIT_POSITION;
