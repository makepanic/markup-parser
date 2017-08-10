import TokenKind from "./TokenKind";

class Token<T extends number> {
  readonly start: number;
  readonly end: number;
  readonly kind: TokenKind;

  id: T;
  consumed: boolean = false;

  constructor(start: number, end: number, id: T, kind: TokenKind = TokenKind.Default) {
    this.start = start;
    this.end = end;
    this.id = id;
    this.kind = kind;
  }
}

export default Token;
