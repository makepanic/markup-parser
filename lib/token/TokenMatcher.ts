import TokenKind from "./TokenKind";
import { KindConstraint } from "./TokenKindConstraint";
const returnTrue = () => true;

class TokenMatcher {
  constructor(
    readonly regex: RegExp,
    readonly id: number,
    readonly constraints: KindConstraint[] = [[returnTrue, TokenKind.Default]]
  ) {}
}

export default TokenMatcher;
