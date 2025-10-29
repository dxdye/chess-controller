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
import { Board, CastlingLetter, EnPassentColumn, Fen, MoveConfirmation, Position, StrictColor } from "./types.ts";
import { calculateMoveListForPiece } from "./move.ts";

export class Game {
  turn: StrictColor;
  castlingRights: CastlingLetter[]; 
  enPassantTarget: string | null;
  halfmoveClock: number;
  fullmoveNumber: number;
  history: Fen[] = [];
  board: Board; 
  enPassentMoveColumn:EnPassentColumn = '-';

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

  move(from: Position, to: Position): MoveConfirmation{
    //is turn valid 
    const piece = this.board.find(
      (sq) => sq.row === from.row && sq.column === from.column
    );
    if (!piece || piece.color !== this.turn) {
      return 'MOVE_INVALID'; 
    }

    //is to in move list 
    const possibleMoves = calculateMoveListForPiece(from, this.board, this.enPassentMoveColumn, this.castlingRights);
    const validMove = possibleMoves.find(
      (mv) => mv.row === to.row && mv.column === to.column
    );


    //make move

    return 'MOVE_INVALID'; 
  }
};