import TokenKind from "./TokenKind";
import { TokenMeta } from "./TokenMeta";

class Token {
  readonly start: number;
  readonly end: number;
  readonly kind: TokenKind;
  readonly meta?: TokenMeta;

  id: number;
  consumed: boolean = false;

  constructor(
    start: number,
    end: number,
    id: number,
    kind: TokenKind = TokenKind.Default,
    meta?: TokenMeta
  ) {
    this.start = start;
    this.end = end;
    this.id = id;
    this.kind = kind;
    this.meta = meta;
  }
}

export default Token;
