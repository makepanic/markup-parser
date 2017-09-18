import TokenMatcher from "./token/TokenMatcher";
import Token from "./token/Token";
import TokenKind from "./token/TokenKind";

declare type MatchRange<T extends number> = [number, number, TokenMatcher<T>];
type TokenRange<T> = [number, number, T, TokenKind];

function fillArray(array: Array<boolean>, from: number, until: number) {
  for(let i = from; i < until; i++) {
    array[i] = true;
  }
}

function hasHole(array: Array<boolean>, from: number, until: number) {
  for(let i = from; i < until; i++) {
    if (array[i] === true){
      return false;
    }
  }
  return true;
}

class Tokenizer<T extends number> {
  private matcher: Array<TokenMatcher<T>>;
  private filler: T;
  private escaper: string = "\\";
  private terminator: T;

  constructor(filler: T, terminator: T, escaper: string = "\\") {
    this.matcher = [];
    this.filler = filler;
    this.terminator = terminator;
    this.escaper = escaper;
  }

  add(tokenMatcher: TokenMatcher<T>) {
    this.matcher.push(tokenMatcher);
    return this;
  }

  tokenize(string: string): Array<Token<T>> {
    let tokens: Array<MatchRange<T>> = [];
    const tokensWithText: Array<TokenRange<T>> = [];

    const matchedRangesBuffer: boolean[] = [];

    //create list of tokens
    this.matcher.forEach(matcher => {
      let match;

      // go through all matchers and try to regex match
      while ((match = matcher.regex.exec(string)) !== null) {
        const start = match.index;
        const end = start + match[0].length;

        if (string[start - 1] !== this.escaper) {
          if (hasHole(matchedRangesBuffer, start, end)) {
            fillArray(matchedRangesBuffer, start, end);
            tokens.push([start, end, matcher]);
          }
        }
      }
    });

    let lastEnd = 0;

    tokens
      .sort(([startA], [startB]) => startA - startB)
      .forEach(([start, end, matcher], index, tokens) => {
        // find matching constraint
        const matchingConstraints = matcher.constraints.filter(([constraint]) =>
          constraint(string, start, end, index, tokens)
        );

        if (matchingConstraints.length) {
          let mergedKinds = matchingConstraints.reduce(
            (all, [, kind]) => all | kind,
            TokenKind.Default
          );
          // [n, m, Bold, Closes]
          let token: TokenRange<T> = [start, end, matcher.id, mergedKinds];
          tokensWithText.push([lastEnd, start, this.filler, TokenKind.Default]);
          tokensWithText.push(token);
          lastEnd = end;
        }
      });

    tokensWithText.push([
      lastEnd,
      string.length,
      this.filler,
      TokenKind.Default
    ]);

    const allTokens = tokensWithText
      .filter(([start, end]) => start < end)
      .map(
        ([start, end, format, kind]) => new Token<T>(start, end, format, kind)
      );

    allTokens.push(new Token<T>(string.length, string.length, this.terminator));

    return allTokens;
  }
}

export default Tokenizer;
