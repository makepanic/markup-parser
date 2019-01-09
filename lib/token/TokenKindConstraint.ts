import TokenKind from "./TokenKind";
import { MatchRange } from "../Tokenizer";
import Token from "./Token";

export interface Constraint {
  (
    string: string,
    start: number,
    end: number,
    index?: number,
    tokens?: MatchRange[],
    previousTokens?: Token[]
  ): boolean;
}

export type KindConstraint = [Constraint, TokenKind];
