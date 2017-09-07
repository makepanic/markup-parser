import TokenKind from "./TokenKind";
import { KindConstraint } from "./TokenKindConstraint";
const returnTrue = () => true;

class TokenMatcher<T extends number> {
  readonly regex: RegExp;
  readonly id: T;
  readonly constraints: Array<KindConstraint>;

  constructor(
    regex: RegExp,
    id: T,
    constraints: Array<KindConstraint> = [[returnTrue, TokenKind.Default]]
  ) {
    this.regex = regex;

    this.id = id;
    this.constraints = constraints;
  }
}

export default TokenMatcher;
