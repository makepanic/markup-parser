import TokenKind from "./TokenKind";

class Token {
  readonly start: number;
  readonly end: number;
  readonly kind: TokenKind;

  id: number;
  consumed: boolean = false;

  constructor(
    start: number,
    end: number,
    id: number,
    kind: TokenKind = TokenKind.Default
  ) {
    this.start = start;
    this.end = end;
    this.id = id;
    this.kind = kind;
  }
}

export default Token;
