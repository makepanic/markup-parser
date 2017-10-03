import TokenKind from "./TokenKind";

export interface ConstraintFunction {
  (
    string: string,
    start: number,
    end: number,
    index?: number,
    tokens?: Array<any>
  ): boolean;
}

export type KindConstraint = [ConstraintFunction, TokenKind];