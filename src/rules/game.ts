//i8n

import { match } from 'ts-pattern';
import { createChessBoardFromFen } from './board.ts';
import { BOTH_CAN_CASTLE, INIT_POSITION } from './constant.ts';
import {
  Board,
  CastlingLetter,
  DrawTypes,
  EnPassentColumn,
  Fen,
  GameResult,
  GameState,
  Move,
  MoveConfirmation,
  Piece,
  Position,
  PromotionFigure,
  Square,
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
import { columnToIndex } from './transform.ts';
import { isStaleMate } from './check.ts';
import { moveToSan } from './pgn.ts';

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
  currentBoard: Board = createChessBoardFromFen(INIT_POSITION);
  turn: StrictColor = 'white';
  castlingRights: CastlingLetter[] = BOTH_CAN_CASTLE;

  //clocks
  halfmoveClock: number = 0;
  fullmoveNumber: number = 1;

  //en passent target column
  enPassantTarget: EnPassentColumn = '-';

  //history
  shortMoveHistory: Move[] = [];
  history: Fen[] = [];

  gameState: GameState = 'ONGOING';
  drawType: DrawTypes = 'NO_DRAW';

  pgn: string[] = [];

  private isThreeFoldRepetition: boolean = false;

  constructor() {
    this.newGame();
  }

  evaluate(writeToPgn?: boolean): GameResult {
    if (this.gameState === 'DRAWN') {
      if (writeToPgn) {
        this.pgn.push('1/2-1/2');
      }
      return 'DRAW';
    }
    if (this.gameState === 'CHECKMATE') {
      if (this.turn === 'white') {
        if (writeToPgn) {
          this.pgn.push('0-1');
        }
        return 'BLACK_WINS';
      } else {
        if (writeToPgn) {
          this.pgn.push('1-0');
        }
        return 'WHITE_WINS';
      }
    }
    return '-';
  }

  newGame() {
    this.currentBoard = createChessBoardFromFen(INIT_POSITION);
    this.turn = 'white';
    this.castlingRights = BOTH_CAN_CASTLE;
    this.enPassantTarget = '-';
    this.halfmoveClock = 0;
    this.fullmoveNumber = 1;
    this.history = [];
    this.gameState = 'ONGOING';
    this.drawType = 'NO_DRAW';
    this.shortMoveHistory = [];
    this.isThreeFoldRepetition = false;
    this.pgn = [];
  }

  fromFen(fen: Fen) {
    const g = gameFromFen(fen);
    this.currentBoard = g.currentBoard;
    this.turn = g.turn;
    this.castlingRights = g.castlingRights;
    this.enPassantTarget = g.enPassantTarget;
    this.halfmoveClock = g.halfmoveClock;
    this.fullmoveNumber = g.fullmoveNumber;
    this.drawType = 'NO_DRAW';
    this.gameState = 'ONGOING';
    this.pgn = [];
    this.history = [];
    this.shortMoveHistory = [];
    this.isThreeFoldRepetition = false;
  }

  setPositionToFen(fen: Fen) {
    this.currentBoard = createChessBoardFromFen(fen);
  }

  move(from: Position, to: Position, promoteTo?: PromotionFigure): MoveConfirmation {
    this.checkForDraw();
    if (this.gameState === 'DRAWN') {
      return 'GAME_DRAWN';
    }
    if (this.gameState === 'CHECKMATE') {
      return 'GAME_OVER';
    }

    //is turn valid
    const piece = this.currentBoard.find((sq) => sq.row === from.row && sq.column === from.column);
    if (!piece || piece.color !== this.turn) {
      return 'MOVE_INVALID';
    }

    //is to in move list
    const possibleMoves = calculateMoveListForPiece(from, this.currentBoard, this.enPassantTarget, this.castlingRights);
    const validMove = possibleMoves.find((mv) => mv.row === to.row && mv.column === to.column) ?? null;

    //make move
    if (validMove === null) {
      return 'MOVE_INVALID';
    } else {
      if (promoteTo !== undefined && piece.figure !== 'PAWN' && !validMove.isPromotion) {
        return 'MOVE_INVALID';
      }
      const fullValidMove: Move = { ...validMove, color: piece.color, figure: piece.figure };

      // add game to history
      this.history.push(this.currentGameToFen());
      this.addToShortHistory(fullValidMove);

      // make move on board
      this.currentBoard = makeMoveOnBoard(from, fullValidMove, this.currentBoard, promoteTo);
      this.changeTurn();
      this.setCastlingRightsAfterMove(piece, from);

      //increment clocks
      this.incrementHalfmoveClock(piece.figure === 'PAWN', validMove.isTaken ?? false);
      this.incrementFullmoveNumber();

      //check for threefold repetition
      this.checkThreeFoldRepetition();

      if (!promoteTo && this.isThreeFoldRepetition) {
        return 'OFFER_DRAW';
      }
      //add move to PGN
      this.pgn.push(moveToSan(from, fullValidMove, this.currentBoard));
      //yes, there are multiple calls of isKingChecked in this procedure

      return { from, to, promotionTo: promoteTo };
    }
  }

  setCastlingRightsAfterMove(piece: Piece, from: Position) {
    const strictColor = piece.color as StrictColor;
    if (piece.figure === 'KING') {
      this.castlingRights = castlingRightsActions.KING[strictColor](this.castlingRights);
    } else if (piece.figure === 'ROOK') {
      this.castlingRights = castlingRightsActions.ROOK[strictColor](this.castlingRights)(from);
    }
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

  checkForDraw() {
    if (this.gameState !== 'ONGOING') return;
    if (this.checkInsufficientMaterial()) return;
    if (this.checkStalemate()) return;
    if (this.checkFiftyMoveRule()) return;
  }
  agreeToDraw() {
    this.gameState = 'DRAWN';
    this.drawType = 'DRAW_BY_AGREEMENT';
  }
  setDrawAfterThreefoldRepetition() {
    if (!this.isThreeFoldRepetition) throw new Error('Threefold repetition condition not met');
    this.gameState = 'DRAWN';
    this.drawType = 'DRAW_BY_THREEFOLD_REPETITION';
  }

  //private methods
  private changeTurn() {
    this.turn = this.turn === 'white' ? 'black' : 'white';
  }
  private currentGameToFen(): Fen {
    return gameToFen(this);
  }
  private addToShortHistory(move: Move) {
    this.shortMoveHistory.push(move);
    //keep only last 6 moves
    if (this.shortMoveHistory.length > 6) {
      this.shortMoveHistory = this.shortMoveHistory.slice(-6);
    }
  }

  private incrementHalfmoveClock(isPawnMove: boolean, isCapture: boolean) {
    if (isPawnMove || isCapture) {
      this.halfmoveClock = 0;
    } else {
      ++this.halfmoveClock;
    }
  }

  private incrementFullmoveNumber() {
    if (this.turn === 'black' && this.history.length % 2 === 0) {
      ++this.fullmoveNumber;
    }
  }

  private checkStalemate() {
    if (isStaleMate(this.currentBoard, this.turn)) {
      this.gameState = 'DRAWN';
      this.drawType = 'DRAW_BY_STALEMATE';
      return true;
    }
    return false;
  }
  private checkFiftyMoveRule() {
    if (this.halfmoveClock >= 50) {
      this.gameState = 'DRAWN';
      this.drawType = 'DRAW_BY_FIFTY_MOVE_RULE';
      return true;
    }
    return false;
  }
  private checkInsufficientMaterial() {
    const figuresOnBoard = this.currentBoard.map((sq) => sq.figure);
    const uniqueFigures = removeDuplicatesFromArray(figuresOnBoard);

    //only kings
    if (uniqueFigures.length === 1 && uniqueFigures[0] === 'KING') {
      this.gameState = 'DRAWN';
      this.drawType = 'DRAW_BY_INSUFFICIENT_MATERIAL';
      return true;
    }

    //king vs king and bishop/knight
    if (
      uniqueFigures.length === 2 &&
      uniqueFigures.includes('KING') &&
      (uniqueFigures.includes('BISHOP') || uniqueFigures.includes('KNIGHT')) &&
      this.currentBoard.length === 3
    ) {
      this.gameState = 'DRAWN';
      this.drawType = 'DRAW_BY_INSUFFICIENT_MATERIAL';
      return true;
    }

    //king and bishop vs king and bishop (same color bishops)
    if (uniqueFigures.length === 2 && uniqueFigures.includes('KING') && this.currentBoard.length === 4) {
      const otherPieces = this.currentBoard.filter((sq) => !(sq.figure === 'KING'));
      const onlyBishops = otherPieces.every((sq) => sq.figure === 'BISHOP');

      const sameColorBishops = (bp1?: Square, bp2?: Square): boolean => {
        if (bp1 === undefined || bp2 === undefined) return false;
        const bishop1SquareColor =
          (bp1.color === 'white'
            ? (bp1.row + columnToIndex(bp1.column)) % 2
            : (bp1.row + columnToIndex(bp1.column) + 1) % 2) === 0
            ? 'light'
            : 'dark';
        const bishop2SquareColor =
          (bp2.color === 'white'
            ? (bp2.row + columnToIndex(bp2.column)) % 2
            : (bp2.row + columnToIndex(bp2.column) + 1) % 2) === 0
            ? 'light'
            : 'dark';
        return bishop1SquareColor === bishop2SquareColor;
      };

      if (
        onlyBishops &&
        otherPieces.length === 2 &&
        otherPieces[0]?.figure === otherPieces[1]?.figure &&
        //are they of different color
        otherPieces[0]?.color !== otherPieces[1]?.color &&
        sameColorBishops(otherPieces[0], otherPieces[1])
      ) {
        this.gameState = 'DRAWN';
        this.drawType = 'DRAW_BY_INSUFFICIENT_MATERIAL';
        return true;
      }
    }
    return false;
  }
  private checkThreeFoldRepetition() {
    if (this.shortMoveHistory.length < 6) {
      this.isThreeFoldRepetition = false;
      return;
    }

    const lastThreeMoves = this.shortMoveHistory.slice(-6);
    const lastMove = lastThreeMoves[lastThreeMoves.length - 1];

    if (!lastMove) return;

    const occurrencesOpponentMove = this.shortMoveHistory.filter(
      (mv) =>
        mv.column === lastMove.column &&
        mv.row === lastMove.row &&
        mv.figure === lastMove.figure &&
        mv.color === lastMove.color,
    ).length;
    const occurrencesPlayerMove = this.shortMoveHistory.filter(
      (mv) =>
        mv.column === lastMove.column &&
        mv.row === lastMove.row &&
        mv.figure === lastMove.figure &&
        mv.color !== lastMove.color,
    ).length;

    if (occurrencesOpponentMove >= 3 && occurrencesPlayerMove >= 3) {
      this.isThreeFoldRepetition = true;
    } else {
      this.isThreeFoldRepetition = false;
    }
  }
}
