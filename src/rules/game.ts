//castling stuff to be implemented
//promotion to be implemented
//is draw  by insufficient material to be implemented
//is draw by 50 move rule to be implemented
//is draw by threefold repetition to be implemented
//is draw by dead position to be implemented
//i8n 
//pgn generation

import { createChessBoardFromFen } from "./board.ts";
import { BOTH_CAN_CASTLE, INIT_POSITION } from "./constant.ts";
import {
  Board,
  CastlingLetter,
  EnPassentColumn,
  Fen,
  MoveConfirmation,
  Piece,
  Position,
  StrictColor,
} from './types.ts';
import { calculateMoveListForPiece } from './move.ts';

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

export class Game {
  turn: StrictColor;
  castlingRights: CastlingLetter[];
  enPassantTarget: string | null;
  halfmoveClock: number;
  fullmoveNumber: number;
  history: Fen[] = [];
  board: Board;
  enPassentMoveColumn: EnPassentColumn = '-';

  constructor() {
    this.board = createChessBoardFromFen(INIT_POSITION);
    this.turn = 'white';
    this.castlingRights = BOTH_CAN_CASTLE;
    this.enPassantTarget = null;
    this.halfmoveClock = 0;
    this.fullmoveNumber = 1;
  }
  setPositionToFen(fen: Fen) {
    this.board = createChessBoardFromFen(fen);
  }

  //to Fen
  //to Pgn
  //delete Peace from board & set piece to position
  //rewind position

  move(from: Position, to: Position): MoveConfirmation {
    //is turn valid
    const piece = this.board.find((sq) => sq.row === from.row && sq.column === from.column);
    if (!piece || piece.color !== this.turn) {
      return 'MOVE_INVALID';
    }

    //is to in move list
    const possibleMoves = calculateMoveListForPiece(from, this.board, this.enPassentMoveColumn, this.castlingRights);
    const validMove = possibleMoves.find((mv) => mv.row === to.row && mv.column === to.column);

    //make move

    //add move to history

    return 'MOVE_INVALID';
  }

  setCastlingRightsAfterMove(piece: Piece, from: Position) {
    const strictColor = piece.color as StrictColor;
    if (piece.figure === 'KING') {
      this.castlingRights = castlingRightsActions.KING[strictColor](this.castlingRights);
    } else if (piece.figure === 'ROOK') {
      this.castlingRights = castlingRightsActions.ROOK[strictColor](this.castlingRights)(from);
    }
  }

  currentGameToFen(): Fen {
    //not implemented yet
    return INIT_POSITION;
  }

  //rollback x halfmoves
  rollback(halfmoves: number) {
    for (let i = 0; i < halfmoves; i++) {
      if (this.history.length === 0) break;
      const lastFen = this.history.pop()!;
      this.setPositionToFen(lastFen);
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