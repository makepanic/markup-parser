import TokenKind from "./TokenKind";
import { TokenMeta } from "./TokenMeta";

class Token {
  consumed: boolean = false;

  constructor(
    readonly start: number,
    readonly end: number,
    readonly id: number,
    readonly kind: TokenKind = TokenKind.Default,
    readonly meta?: TokenMeta
  ) {}
}

export default Token;
