import TokenMatcher from "./token/TokenMatcher";
import Token from "./token/Token";
import TokenKind from "./token/TokenKind";
import { TokenMeta } from "./token/TokenMeta";

export type MatchRange = [number, number, TokenMatcher, TokenMeta?];

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
  private matcher: TokenMatcher[] = [];

  constructor(private filler: T, private terminator: T, private escaper: T) {}

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

        if (hasHole(matchedRangesBuffer, start, end)) {
          fillArray(matchedRangesBuffer, start, end);
          ranges.push([start, end, matcher]);
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
    const tokens: Token[] = [];
    let lastEnd = 0;

    ranges
      .sort(([startA], [startB]) => startA - startB)
      .forEach(([start, end, matcher, meta], index, ranges) => {
        // find matching constraint
        const matchingConstraints = matcher.constraints.filter(([constraint]) =>
          constraint(string, start, end, index, ranges, tokens)
        );

        if (!matchingConstraints.length) return;

        let mergedKinds = matchingConstraints.reduce(
          (all, [, kind]) => all | kind,
          TokenKind.Default
        );

        // only add filler if there's something to fill
        if (lastEnd < start) {
          tokens.push(new Token(lastEnd, start, this.filler));
        }

        let token: Token;

        // if previous token is escaper, handle this one as filler
        if (tokens[tokens.length - 1]?.id === this.escaper) {
          token = new Token(start, end, this.filler);
        } else {
          token = new Token(start, end, matcher.id, mergedKinds, meta);
        }

        tokens.push(token);
        lastEnd = end;
      });

    if (lastEnd < string.length) {
      // avoid empty filler if there's nothing left
      tokens.push(new Token(lastEnd, string.length, this.filler));
    }

    tokens.push(new Token(string.length, string.length, this.terminator));

    return tokens;
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
