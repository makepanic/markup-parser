import TokenMatcher from "./token/TokenMatcher";
import Token from "./token/Token";
import TokenKind from "./token/TokenKind";

declare type MatchRange = [number, number, TokenMatcher];
type TokenRange = [number, number, number, TokenKind];

function fillArray(array: Array<boolean>, from: number, until: number) {
  for (let i = from; i < until; i++) {
    array[i] = true;
  }
}

function hasHole(array: Array<boolean>, from: number, until: number) {
  for (let i = from; i < until; i++) {
    if (array[i] === true) {
      return false;
    }
  }
  return true;
}

/**
 * Class that has the job to turn a given string into a list of tokens.
 * @class
 */
class Tokenizer<T extends number> {
  private matcher: Array<TokenMatcher>;
  private filler: T;
  private escaper: string = "\\";
  private terminator: T;

  constructor(filler: T, terminator: T, escaper: string = "\\") {
    this.matcher = [];
    this.filler = filler;
    this.terminator = terminator;
    this.escaper = escaper;
  }

  add(tokenMatcher: TokenMatcher) {
    this.matcher.push(tokenMatcher);
    return this;
  }

  /**
   * Method to extract a list of tokens from a given string.
   * This happens by matching each tokenizer matching against the string.
   * @param {string} string
   * @return {Array<Token<T extends number>>}
   */
  tokenize(string: string): Array<Token> {
    let tokens: Array<MatchRange> = [];
    const tokensWithText: Array<TokenRange> = [];

    let matchedRangesBuffer: boolean[] = [];

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
          let token: TokenRange = [start, end, matcher.id, mergedKinds];
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
      .map(([start, end, format, kind]) => new Token(start, end, format, kind));

    allTokens.push(new Token(string.length, string.length, this.terminator));

    matchedRangesBuffer = null;

    return allTokens;
  }
}

export default Tokenizer;
