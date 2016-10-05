import assert from './assert';
import TokenMatcher from "./token-matcher";

type MatchRange<T extends number> = [number, number, TokenMatcher<T>];

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

class Tokenizer<T extends number> {
  private matcher: Array<TokenMatcher<T>>;
  private filler: TokenMatcher<T>;
  private terminator: TokenMatcher<T>;

  constructor() {
    this.matcher = [];
    this.filler = undefined;
    this.terminator = undefined;
  }

  add(tokenMatcher: TokenMatcher<T>) {
    this.matcher.push(tokenMatcher);
    return this;
  }

  fillWith(type: T) {
    assert('tokenizer can only have one filler', this.filler === undefined);
    this.filler = new TokenMatcher<T>(undefined, type);
    return this;
  }

  terminateWith(type: T) {
    assert('tokenizer can only have one EOL', this.terminator === undefined);
    this.terminator = new TokenMatcher<T>(undefined, type);
    return this;
  }

  tokenize(str: string): Array<Token<T>> {
    assert('tokenizer needs a filler before tokenizing a string', this.filler !== undefined);

    const tokens: Array<MatchRange<T>> = [];
    let splitString = str;
    let matchedRanges = [];

    //create list of tokens
    this.matcher.forEach((matcher) => {
      let match;

      while ((match = matcher.regex.exec(splitString)) != null) {
        if (matcher.constraint(str, match)) {
          const start = match.index;
          const end = start + match[0].length;

          const rangeAlreadyTokenized = matchedRanges.some(([rangeStart, rangeEnd]) => {
            return !(end <= rangeStart || start >= rangeEnd);
          });

          if (!rangeAlreadyTokenized) {
            matchedRanges.push([start, end]);
            tokens.push([start, end, matcher]);
          }
        }
      }
    });

    // insert text infos between tokens
    const tokensWithText = [];
    let lastEnd = 0;
    tokens.sort((a, b) => a[0] - b[0]).forEach((token) => {
      const [position, positionEnd] = token;
      tokensWithText.push([lastEnd, position, this.filler]);
      tokensWithText.push(token);
      lastEnd = positionEnd;
    });
    tokensWithText.push([lastEnd, str.length, this.filler]);

    const allTokens = tokensWithText
      .filter(([position, positionEnd]) => position < positionEnd)
      .map(([start, end, format]) => new Token<T>(start, end, format));

    allTokens.push(new Token<T>(lastEnd + str.length, lastEnd + str.length, this.terminator));

    return allTokens;
  }
}

export {Token, Tokenizer};

