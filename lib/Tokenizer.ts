import TokenMatcher from "./token/TokenMatcher";
import Token from "./token/Token";
import TokenKind from "./token/TokenKind";
import { TokenMeta } from "./token/TokenMeta";

export declare type MatchRange = [number, number, TokenMatcher, TokenMeta?];
type TokenRange = [number, number, number, TokenKind, TokenMeta?];

function fillArray(array: boolean[], from: number, until: number) {
  for (let i = from; i < until; i++) {
    array[i] = true;
  }
}

function hasHole(array: boolean[], from: number, until: number) {
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
  private matcher: TokenMatcher[];
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
   * Find all match ranges for a given string
   * @param {string} string
   * @param {MatchRange[]} ranges list of already matched ranges
   * @return {MatchRange[]} list of all matched match ranges
   */
  findMatchRanges(string: string, ranges: MatchRange[] = []): MatchRange[] {
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
            ranges.push([start, end, matcher]);
          }
        }
      }
    });

    matchedRangesBuffer = null;

    return ranges;
  }

  /**
   * Converts a string and a list of match ranges to tokens
   * @param {string} string
   * @param {MatchRange[]} ranges
   * @return {Token[]}
   */
  matchTokens(string: string, ranges: MatchRange[]): Token[] {
    const tokensWithText: TokenRange[] = [];
    let lastEnd = 0;

    ranges
      .sort(([startA], [startB]) => startA - startB)
      .forEach(([start, end, matcher, meta], index, tokens) => {
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
          let token: TokenRange = [start, end, matcher.id, mergedKinds, meta];
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

    const allTokens: Token[] = tokensWithText
      .filter(([start, end]) => start <= end)
      .map(
        ([start, end, format, kind, meta]) =>
          new Token(start, end, format, kind, meta)
      );

    allTokens.push(new Token(string.length, string.length, this.terminator));

    return allTokens;
  }

  /**
   * Method to extract a list of tokens from a given string.
   * This happens by matching each tokenizer matching against the string.
   * @param {string} string
   * @return {Array<Token<T extends number>>}
   */
  tokenize(string: string): Token[] {
    return this.matchTokens(string, this.findMatchRanges(string));
  }
}

export default Tokenizer;
