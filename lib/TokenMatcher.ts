import TokenKind from "./TokenKind";
const returnTrue = () => true;

interface ConstraintFunction {
  (string: string, start: number, end: number, index?: number, tokens?: Array<any>): boolean;
}
type KindConstraint = [ConstraintFunction, TokenKind];

class TokenMatcher<T extends number> {
  readonly regex: RegExp;
  readonly id: T;
  readonly constraints: Array<KindConstraint>;

  constructor(regex: RegExp, id: T, constraints: Array<KindConstraint> = [[returnTrue, TokenKind.Default]]) {
    this.regex = regex;

    this.id = id;
    this.constraints = constraints;
  }
}

export default TokenMatcher;
