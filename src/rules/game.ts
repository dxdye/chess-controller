import { match } from 'ts-pattern';
import { createChessBoardFromFen } from './board.ts';
import { BOTH_CAN_CASTLE, INIT_POSITION } from './constant.ts';
import {
  Board,
  CastlingLetter,
  Column,
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
  Row,
  Square,
  StrictColor,
} from './types.ts';
import { calculateMoveListForPiece } from './move.ts';
import {
  createFenPositionFromChessBoard,
  extractActiveColorFromFen,
  extractCastlingRightsFromFen,
  extractEnPassentTargetFromFen,
  extractHalfmoveClockFromFen,
  extractMoveCountFromFen,
  validFenFrom,
} from './fen.ts';
import { removeDuplicatesFromArray } from './helper.ts';
import { columnToIndex } from './transform.ts';
import { isCheckMate, isStaleMate } from './check.ts';
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
  game.history.push(fen);
  if (game.halfmoveClock < 0) {
    throw new Error('Invalid FEN string: halfmove clock cannot be negative');
  }
  if (game.fullmoveNumber <= 0) {
    throw new Error('Invalid FEN string: fullmove number must be positive');
  }
  //check for draw
  game.checkForDraw();
  //check for checkmate
  game.checkForCheckmate();

  return game;
};

export const gameToFen = (game: Game): Fen => {
  const piecePlacement: string = createFenPositionFromChessBoard(game.currentBoard);
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
  //tasks for later:
  //i8n and custom move notation support
  //note: that optimization could use hashmaps for the moveLists and pass it
  //to the checkmate, stalemate etc. functions to reuse..
  //to avoid multiple calculations of same move lists
  //also caching whether king is checked or not should be useful
  //also for some code beauty - why not reduce the boilerplate code

  currentBoard: Board = createChessBoardFromFen(INIT_POSITION);
  turn: StrictColor = 'white';
  castlingRights: CastlingLetter[] = BOTH_CAN_CASTLE;

  //clocks
  halfmoveClock: number = 0;
  fullmoveNumber: number = 1;

  //en passent target column
  enPassantTarget: EnPassentColumn = '-';

  history: Fen[] = [];

  gameState: GameState = 'ONGOING';
  drawType: DrawTypes = 'NO_DRAW';

  pgn: string[] = [];

  private threeFoldRepetitionByBlack: boolean = false;
  private threeFoldRepetitionByWhite: boolean = false;

  constructor() {
    this.newGame();
  }

  writeEvaluationToPgn() {
    if (this.gameState === 'DRAWN') {
      this.pgn.push('1/2-1/2');
      return 'DRAW';
    }
    if (this.gameState === 'CHECKMATE') {
      if (this.turn === 'white') {
        this.pgn.push('0-1');
        return 'BLACK_WINS';
      } else {
        this.pgn.push('1-0');
        return 'WHITE_WINS';
      }
    }
    return '-';
  }

  evaluate(): GameResult {
    //evaluate without making move
    this.checkForDraw();
    if (this.gameState === 'DRAWN') {
      return 'DRAW';
    }

    if (isCheckMate(this.currentBoard, this.turn)) {
      this.gameState = 'CHECKMATE';
      return this.turn === 'white' ? 'BLACK_WINS' : 'WHITE_WINS';
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
    this.threeFoldRepetitionByWhite = false;
    this.threeFoldRepetitionByBlack = false;
    this.pgn = [];
  }

  fromFen(fen: Fen, history: Fen[] = []) {
    const g = gameFromFen(fen);
    this.currentBoard = g.currentBoard;
    this.turn = g.turn;
    this.castlingRights = g.castlingRights;
    this.enPassantTarget = g.enPassantTarget;
    this.halfmoveClock = g.halfmoveClock;
    this.fullmoveNumber = g.fullmoveNumber;
    this.drawType = 'NO_DRAW';
    this.gameState = 'ONGOING';
    this.history = history;
    this.threeFoldRepetitionByBlack = false;
    this.threeFoldRepetitionByWhite = false;
    this.pgn = [];
  }

  setPositionToFen(fen: Fen) {
    this.currentBoard = createChessBoardFromFen(fen);
  }

  move(from: Position, to: Position, promoteTo?: PromotionFigure): MoveConfirmation {
    this.checkForDraw();

    if (this.gameState !== 'DRAWN') {
      // save performance by not checking for checkmate if already drawn
      this.checkForCheckmate();
    }

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

      // make move on board
      this.currentBoard = makeMoveOnBoard(from, fullValidMove, this.currentBoard, promoteTo);
      this.changeTurn();
      this.setCastlingRightsAfterMove(piece, from);

      //increment clocks
      this.incrementHalfmoveClock(piece.figure === 'PAWN', validMove.isTaken ?? false);
      this.incrementFullMoveNumber();

      // add game to history
      this.history.push(this.currentGameToFen());
      this.checkThreeFoldRepetition();
      //add move to PGN
      this.pgn.push(moveToSan(from, fullValidMove, this.currentBoard));
      //check for threefold repetition
      //yes, there are multiple calls of isKingChecked in this procedure
      //this should be optimized later

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
      if (this.history.length === 0 || this.fullmoveNumber === 1) break;
      //update turn, castling rights, en passant target, clocks based on fen parsing
      //not implemented yet
    }
  }
  takeBackLastMove() {
    //can not take back if no history or if it's the first move
    if (this.history.length === 0 || this.fullmoveNumber === 1) return;
    const lastFen = this.history.pop();
    if (lastFen) {
      this.fromFen(lastFen, this.history);
    }

    this.evaluate();
  }

  addCastlingRight(casltingRight: CastlingLetter) {
    if (!this.castlingRights.includes(casltingRight)) {
      this.castlingRights.push(casltingRight);
    }
  }

  checkForCheckmate(): GameResult {
    const whiteInCheckmate = isCheckMate(this.currentBoard, 'white');
    const blackInCheckmate = isCheckMate(this.currentBoard, 'black');
    if (whiteInCheckmate && blackInCheckmate) throw new Error('Invalid game state: both players in checkmate');
    if (whiteInCheckmate) {
      if (this.turn === 'black') {
        throw new Error('Invalid game state: white in checkmate but black to move');
      }
      this.gameState = 'CHECKMATE';
      return 'BLACK_WINS';
    }
    if (blackInCheckmate) {
      if (this.turn === 'white') {
        throw new Error('Invalid game state: black in checkmate but white to move');
      }

      this.gameState = 'CHECKMATE';
      return 'WHITE_WINS';
    }

    return '-';
  }
  checkForDraw(): DrawTypes {
    if (this.gameState !== 'ONGOING') return this.drawType;
    if (this.checkFiftyMoveRule()) return this.drawType;
    if (this.checkInsufficientMaterial()) return this.drawType;
    if (this.checkStalemate()) return this.drawType;
    return this.drawType;
  }
  agreeToDraw() {
    this.gameState = 'DRAWN';
    this.drawType = 'DRAW_BY_AGREEMENT';
  }

  claimThreeFoldRepetition(byPlayer: StrictColor): boolean {
    //check happens after move is made
    const opponent: StrictColor = byPlayer === 'white' ? 'black' : 'white';

    //only the player to move can claim the draw
    if (this.turn !== opponent) return false;

    if (this.threeFoldRepetitionByWhite) {
      this.gameState = 'DRAWN';
      this.drawType = 'DRAW_BY_THREEFOLD_REPETITION_BY_WHITE';
      return true;
    }
    if (this.threeFoldRepetitionByBlack) {
      this.gameState = 'DRAWN';
      this.drawType = 'DRAW_BY_THREEFOLD_REPETITION_BY_BLACK';
      return true;
    }
    return false;
  }

  //private methods
  private changeTurn() {
    this.turn = this.turn === 'white' ? 'black' : 'white';
  }
  private currentGameToFen(): Fen {
    return gameToFen(this);
  }

  private incrementHalfmoveClock(isPawnMove: boolean, isCapture: boolean) {
    if (isPawnMove || isCapture) {
      this.halfmoveClock = 0;
    } else {
      ++this.halfmoveClock;
    }
  }

  private incrementFullMoveNumber() {
    if (this.turn === 'white' && this.history.length % 2 === 0) {
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
        if (!bp1 || !bp2) return false;
        const isLightSquare = (row: Row, column: Column): boolean => {
          return (row + columnToIndex(column)) % 2 === 0;
        };

        return isLightSquare(bp1.row, bp1.column) === isLightSquare(bp2.row, bp2.column);
      };
      const bishopsSameColor = sameColorBishops(otherPieces[0], otherPieces[1]);

      if (
        onlyBishops &&
        otherPieces.length === 2 &&
        otherPieces[0]?.figure === otherPieces[1]?.figure &&
        //are they of different color
        otherPieces[0]?.color !== otherPieces[1]?.color &&
        bishopsSameColor
      ) {
        this.gameState = 'DRAWN';
        this.drawType = 'DRAW_BY_INSUFFICIENT_MATERIAL';
        return true;
      }
    }
    return false;
  }
  //same position occurred three times in the game history
  private checkThreeFoldRepetition() {
    //count the occurences of current position in history
    const currentFen = this.currentGameToFen();
    const position = currentFen.split(' ')[0];
    const toMove = currentFen.split(' ')[1];
    const occurrences = this.history.filter((fen) => {
      const fenPosition = fen.split(' ')[0];
      const fenTurn = fen.split(' ')[1];
      if (fenTurn !== toMove) return false;
      return fenPosition === position;
    }).length;

    if (occurrences > 2) {
      if (this.turn === 'white') {
        //use opposite color because turn has already changed
        this.threeFoldRepetitionByWhite = true;
      } else {
        this.threeFoldRepetitionByBlack = true;
      }
    } else {
      this.threeFoldRepetitionByWhite = false;
      this.threeFoldRepetitionByBlack = false;
    }
  }

  printGame(onlyBoard: boolean = false) {
    let finalBoard: string = 'Current Board:\n\n';
    for (let r = 8; r >= 1; r--) {
      let rowStr = '';
      for (const c of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as Column[]) {
        const piece = this.currentBoard.find((sq) => sq.row === r && sq.column === c);
        if (piece) {
          const symbol = match(piece.figure)
            .with('KING', () => (piece.color !== 'white' ? '♔' : '♚'))
            .with('QUEEN', () => (piece.color !== 'white' ? '♕' : '♛'))
            .with('ROOK', () => (piece.color !== 'white' ? '♖' : '♜'))
            .with('BISHOP', () => (piece.color !== 'white' ? '♗' : '♝'))
            .with('KNIGHT', () => (piece.color !== 'white' ? '♘' : '♞'))
            .with('PAWN', () => (piece.color !== 'white' ? '♙' : '♟'))
            .exhaustive();
          rowStr += ` ${symbol} `;
        } else {
          rowStr += ' . ';
        }
      }
      finalBoard += `${r} |${rowStr}|\n`;
    }

    finalBoard += '    a  b  c  d  e  f  g  h\n';
    if (onlyBoard) {
      console.log(finalBoard);
      return;
    }
    let finalGameStr = finalBoard;
    finalGameStr += `\nFEN: ${this.currentGameToFen()}\n`;
    finalGameStr += `Turn: ${this.turn}\n`;
    finalGameStr += `Castling Rights: ${this.castlingRights.join('') || 'None'}\n`;
    finalGameStr += `En Passant Target: ${this.enPassantTarget}\n`;
    finalGameStr += `Halfmove Clock: ${this.halfmoveClock}\n`;
    finalGameStr += `Fullmove Number: ${this.fullmoveNumber}\n`;
    finalGameStr += `Game State: ${this.gameState}\n`;
    finalGameStr += `Draw Type: ${this.drawType}\n`;

    console.log(finalGameStr);
  }
}
