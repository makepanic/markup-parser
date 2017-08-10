import TokenMatcher from "./token/TokenMatcher";
import Token from "./token/Token";
import TokenKind from "./token/TokenKind";

declare type MatchRange<T extends number> = [number, number, TokenMatcher<T>];
type TokenRange<T> = [number, number, T, TokenKind];

class Tokenizer<T extends number> {
  private matcher: Array<TokenMatcher<T>>;
  private filler: T;
  private escaper: string = '\\';
  private terminator: T;

  constructor(filler: T, terminator: T, escaper: string = '\\') {
    this.matcher = [];
    this.filler = filler;
    this.terminator = terminator;
    this.escaper = escaper;
  }

  add(tokenMatcher: TokenMatcher<T>) {
    this.matcher.push(tokenMatcher);
    return this;
  }

  tokenize(str: string): Array<Token<T>> {
    let tokens: Array<MatchRange<T>> = [];
    let splitString = str;
    let matchedRanges: Array<[number, number]> = [];

    //create list of tokens
    this.matcher.forEach((matcher) => {
      let match;

      // go through all matchers and try to regex match
      while ((match = matcher.regex.exec(splitString)) != null) {
        const start = match.index;
        const end = start + match[0].length;

        if (str.substring(start - 1, start) !== this.escaper) {
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
    const tokensWithText: Array<[number, number, T, TokenKind]> = [];

    let lastEnd = 0;

    tokens
      .sort(([startA], [startB]) => startA - startB)
      .map(([start, end, matcher], index, tokens) => {
        // find matching constraint
        const matchingConstraints = matcher.constraints
          .filter(([constraint]) => constraint(str, start, end, index, tokens));

        if (matchingConstraints.length) {
          let mergedKinds = matchingConstraints.reduce((all, [, kind]) => {
            return all | kind;
          }, TokenKind.Default);
          // [n, m, Bold, Closes]
          return [start, end, matcher.id, mergedKinds];
        }
      })
      .filter(t => t !== undefined)
      .forEach((token: TokenRange<T>) => {
        const [start, end] = token;
        tokensWithText.push([lastEnd, start, this.filler, TokenKind.Default]);
        tokensWithText.push(token);
        lastEnd = end;
      });

    tokensWithText.push([lastEnd, str.length, this.filler, TokenKind.Default]);

    const allTokens = tokensWithText
      .filter(([start, end]) => start < end)
      .map(([start, end, format, kind]) => new Token<T>(start, end, format, kind));

    allTokens.push(new Token<T>(lastEnd + str.length, lastEnd + str.length, this.terminator));

    return allTokens;
  }
}

export default Tokenizer;
