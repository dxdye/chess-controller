//castling stuff to be implemented
//promotion to be implemented
//is draw  by insufficient material to be implemented
//is draw by 50 move rule to be implemented
//is draw by threefold repetition to be implemented
//is draw by dead position to be implemented
//i8n 
//pgn generation

import { match } from 'ts-pattern';
import { createChessBoardFromFen } from './board.ts';
import { BOTH_CAN_CASTLE, INIT_POSITION } from './constant.ts';
import {
  Board,
  CastlingLetter,
  DrawTypes,
  EnPassentColumn,
  Fen,
  GameState,
  Move,
  MoveConfirmation,
  Piece,
  Position,
  PromotionFigure,
  StrictColor,
} from './types.ts';
import { calculateMoveListForPiece } from './move.ts';
import {
  createFenFromChessBoard,
  extractActiveColorFromFen,
  extractCastlingRightsFromFen,
  extractEnPassentTargetFromFen,
  extractHalfmoveClockFromFen,
  extractMoveCountFromFen,
  validFenFrom,
} from './fen.ts';
import { removeDuplicatesFromArray } from './helper.ts';

const castlingRightsActions = {
  //remove castling rights after king or rook move
  KING: {
    white: (castlingRights: CastlingLetter[]) => castlingRights.filter((cr) => cr !== 'K' && cr !== 'Q'),
    black: (castlingRights: CastlingLetter[]) => castlingRights.filter((cr) => cr !== 'k' && cr !== 'q'),
  },
  ROOK: {
    white: (castlingRights: CastlingLetter[]) => {
      return (from: Position) => {
        if (from.column === 'a' && from.row === 1) {
          return castlingRights.filter((cr) => cr !== 'Q');
        } else if (from.column === 'h' && from.row === 1) {
          return castlingRights.filter((cr) => cr !== 'K');
        }
        return castlingRights;
      };
    },
    black: (castlingRights: CastlingLetter[]) => {
      return (from: Position) => {
        if (from.column === 'a' && from.row === 8) {
          return castlingRights.filter((cr) => cr !== 'q');
        } else if (from.column === 'h' && from.row === 8) {
          return castlingRights.filter((cr) => cr !== 'k');
        }
        return castlingRights;
      };
    },
  },
} as const;

export const makeMoveOnBoard = (curr: Position, move: Move, board: Board, promoteTo?: PromotionFigure): Board => {
  let newBoard;
  if (promoteTo !== undefined && move.figure === 'PAWN') {
    if (move.row === (move.color === 'white' ? 8 : 1)) {
      newBoard = board.filter(
        (sq) =>
          !(sq.row === curr.row && sq.column === curr.column) && !(sq.row === move.row && sq.column === move.column),
      );
      newBoard.push({
        column: move.column,
        row: move.row,
        figure: promoteTo,
        color: move.color,
      });
      return newBoard;
    } else {
      throw new Error(
        `Invalid promotion: Pawn not on backrank. Can not promote. Row: ${curr.row} Column: ${curr.column} Color: ${move.color}`,
      );
    }
  }

  if (move.isTakenEnPassent) {
    newBoard = board.filter(
      (sq) =>
        !(sq.row === curr.row && sq.column === curr.column) && !(sq.row === curr.row && sq.column === move.column),
    );
  } else {
    newBoard = board.filter(
      (sq) =>
        !(sq.row === curr.row && sq.column === curr.column) && !(sq.row === move.row && sq.column === move.column),
    );
  }

  match(move.isCastle)
    .with('K', () => {
      newBoard.filter((sq) => !(sq.row === 1 && sq.column === 'h'));
      newBoard.push({ row: 1, column: 'g', figure: 'KING', color: 'white' });
      newBoard.push({ row: 1, column: 'f', figure: 'ROOK', color: 'white' });
    })
    .with('Q', () => {
      newBoard.filter((sq) => !(sq.row === 1 && sq.column === 'a'));
      newBoard.push({ row: 1, column: 'c', figure: 'KING', color: 'white' });
      newBoard.push({ row: 1, column: 'd', figure: 'ROOK', color: 'white' });
    })
    .with('k', () => {
      newBoard.filter((sq) => !(sq.row === 8 && sq.column === 'h'));
      newBoard.push({ row: 8, column: 'g', figure: 'KING', color: 'black' });
      newBoard.push({ row: 8, column: 'f', figure: 'ROOK', color: 'black' });
    })
    .with('q', () => {
      newBoard.filter((sq) => !(sq.row === 8 && sq.column === 'a'));
      newBoard.push({ row: 8, column: 'c', figure: 'KING', color: 'black' });
      newBoard.push({ row: 8, column: 'd', figure: 'ROOK', color: 'black' });
    })
    .otherwise(() => {
      newBoard.push({
        column: move.column,
        row: move.row,
        figure: move.figure,
        color: move.color,
      });
    });
  return newBoard;
};

export const gameFromFen = (fen: Fen): Game => {
  const game = new Game();
  game.setPositionToFen(fen);
  game.turn = extractActiveColorFromFen(fen);
  game.castlingRights = extractCastlingRightsFromFen(fen);
  game.enPassantTarget = extractEnPassentTargetFromFen(fen);
  game.halfmoveClock = extractHalfmoveClockFromFen(fen);
  game.fullmoveNumber = extractMoveCountFromFen(fen);
  if (game.halfmoveClock < 0) {
    throw new Error('Invalid FEN string: halfmove clock cannot be negative');
  }
  if (game.fullmoveNumber <= 0) {
    throw new Error('Invalid FEN string: fullmove number must be positive');
  }

  return game;
};

export const gameToFen = (game: Game): Fen => {
  const piecePlacement: string = createFenFromChessBoard(game.currentBoard);
  const activeColor: string = game.turn === 'white' ? 'w' : 'b';
  const castlingRights: string =
    game.castlingRights.length === 0 ? '-' : removeDuplicatesFromArray(game.castlingRights).sort().join('');
  const enPassentTarget: string =
    (game.enPassantTarget ?? '-') +
    (game.enPassantTarget !== null && game.enPassantTarget !== '-' ? (game.turn === 'white' ? '6' : '3') : '');
  const halfmoveClock: string = game.halfmoveClock.toString();
  const fullmoveNumber: string = game.fullmoveNumber.toString();

  const result = `${piecePlacement} ${activeColor} ${castlingRights} ${enPassentTarget} ${halfmoveClock} ${fullmoveNumber}`;
  return validFenFrom(result);
};

export class Game {
  turn: StrictColor;
  castlingRights: CastlingLetter[];
  enPassantTarget: string | null;
  halfmoveClock: number;
  fullmoveNumber: number;
  history: Board[] = [];
  currentBoard: Board;
  enPassentMoveColumn: EnPassentColumn = '-';
  private isThreeFoldRepetition: boolean = false;

  gameState: GameState = 'ONGOING';
  drawType: DrawTypes = 'NO_DRAW';

  pgn: string[] = [];

  constructor() {
    this.currentBoard = createChessBoardFromFen(INIT_POSITION);
    this.turn = 'white';
    this.castlingRights = BOTH_CAN_CASTLE;
    this.enPassantTarget = null;
    this.halfmoveClock = 0;
    this.fullmoveNumber = 1;
  }
  setPositionToFen(fen: Fen) {
    this.currentBoard = createChessBoardFromFen(fen);
  }

  //to Fen
  //to Pgn
  //delete Peace from currentBoard & set piece to position
  //rewind position

  agreeToDraw() {
    this.gameState = 'DRAWN';
    this.drawType = 'DRAW_BY_AGREEMENT';
  }

  move(from: Position, to: Position, promoteTo?: PromotionFigure): MoveConfirmation {
    //is turn valid
    const piece = this.currentBoard.find((sq) => sq.row === from.row && sq.column === from.column);
    if (!piece || piece.color !== this.turn) {
      return 'MOVE_INVALID';
    }

    //is to in move list
    const possibleMoves = calculateMoveListForPiece(
      from,
      this.currentBoard,
      this.enPassentMoveColumn,
      this.castlingRights,
    );
    const validMove = possibleMoves.find((mv) => mv.row === to.row && mv.column === to.column) ?? null;

    //make move
    if (validMove === null) {
      return 'MOVE_INVALID';
    } else {
      if (promoteTo !== undefined && piece.figure !== 'PAWN' && !validMove.isPromotion) {
        return 'MOVE_INVALID';
      }
      this.currentBoard = makeMoveOnBoard(
        from,
        { ...validMove, color: piece.color, figure: piece.figure },
        this.currentBoard,
        promoteTo,
      );
      this.changeTurn();
      this.setCastlingRightsAfterMove(piece, from);
      //check for draw

      this.history.push(this.currentBoard);
      return {
        from,
        to,
        promotionTo: promoteTo,
      };
    }
  }
  changeTurn() {
    this.turn = this.turn === 'white' ? 'black' : 'white';
  }

  setCastlingRightsAfterMove(piece: Piece, from: Position) {
    const strictColor = piece.color as StrictColor;
    if (piece.figure === 'KING') {
      this.castlingRights = castlingRightsActions.KING[strictColor](this.castlingRights);
    } else if (piece.figure === 'ROOK') {
      this.castlingRights = castlingRightsActions.ROOK[strictColor](this.castlingRights)(from);
    }
  }

  private currentGameToFen(): Fen {
    return gameToFen(this);
  }

  //rollback x halfmoves
  rollback(halfmoves: number) {
    for (let i = 0; i < halfmoves; i++) {
      if (this.history.length === 0) break;
      //update turn, castling rights, en passant target, clocks based on fen parsing
      //not implemented yet
    }
  }

  addCastlingRight(casltingRight: CastlingLetter) {
    if (!this.castlingRights.includes(casltingRight)) {
      this.castlingRights.push(casltingRight);
    }
  }
};