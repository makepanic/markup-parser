import TokenKind from "./TokenKind";
import TokenMatcher from "./TokenMatcher";

export interface ConstraintFunction {
  (
    string: string,
    start: number,
    end: number,
    prevToken?: [number, number, TokenMatcher] | undefined,
    token?: [number, number, TokenMatcher],
    nextToken?: [number, number, TokenMatcher] | undefined,
  ): boolean;
}

export type KindConstraint = [ConstraintFunction, TokenKind];
