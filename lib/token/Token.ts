import TokenKind from "./TokenKind";

interface Token {
  start: number;
  end: number;
  kind: TokenKind;

  id: number;
  consumed?: boolean;

  // constructor(
  //   start: number,
  //   end: number,
  //   id: number,
  //   kind: TokenKind = TokenKind.Default
  // ) {
  //   this.start = start;
  //   this.end = end;
  //   this.id = id;
  //   this.kind = kind;
  // }
}

export default Token;
