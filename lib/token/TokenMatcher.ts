import TokenKind from "./TokenKind";
import { KindConstraint } from "./TokenKindConstraint";
const returnTrue = () => true;

class TokenMatcher {
  readonly regex: RegExp;
  readonly id: number;
  readonly constraints: KindConstraint[];

  constructor(
    regex: RegExp,
    id: number,
    constraints: KindConstraint[] = [[returnTrue, TokenKind.Default]]
  ) {
    this.regex = regex;

    this.id = id;
    this.constraints = constraints;
  }
}

export default TokenMatcher;
