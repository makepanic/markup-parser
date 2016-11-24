import TokenMatcher from "./TokenMatcher";

class Token<T extends number> {
  readonly start: number;
  readonly end: number;
  readonly format: TokenMatcher<T>;
  consumed: boolean = false;

  constructor(start: number, end: number, format: TokenMatcher<T>) {
    this.start = start;
    this.end = end;
    this.format = format;
    this.consumed = false;
  }
}

export default Token;
