import TokenKind from "../token/TokenKind";
import { Constraint } from "../token/TokenKindConstraint";

const WHITESPACE_DELIMITER = /[\n :.,+&?!/()]/;
const SPACE_OR_NEWLINE_BEFORE = /^[ \n]+$/;

type Merge<T> = (...f: T[]) => T;
type Identity<T> = (f: T) => T;

export const and: Merge<Constraint> = (...fns) => (...args) =>
  fns.every(fn => fn(...args));
export const or: Merge<Constraint> = (...fns) => (...args) =>
  fns.some(fn => fn(...args));
export const not: Identity<Constraint> = fn => (...args) => !fn(...args);

export const startOfString: Constraint = (_, start) => start === 0;
export const endOfString: Constraint = (str, _, end) => end === str.length;
export const whitespaceBefore: Constraint = (str, start) =>
  WHITESPACE_DELIMITER.test(str[start - 1]);
export const whitespaceAfter: Constraint = (str, _, end) =>
  WHITESPACE_DELIMITER.test(str[end]);
export const whitespaceBeforeOrAfter: Constraint = or(
  whitespaceBefore,
  whitespaceAfter,
  startOfString,
  endOfString
);

export const opens = or(whitespaceBefore, startOfString);
export const closes = or(whitespaceAfter, endOfString);

export const spaceOrNewlineBeforeWith = (newlineId: number): Constraint => (
  string,
  _start,
  _end,
  index,
  tokens
) => {
  const [tStart] = tokens[index];
  let stringBefore;

  if (index - 1 >= 0) {
    // has previous token
    const [, pTEnd, matcher] = tokens[index - 1];

    // previous token is newline
    if (matcher.id === newlineId) {
      // either newline end = current start
      return (
        pTEnd === tStart ||
        // or string between newline end and current start is whitespace
        SPACE_OR_NEWLINE_BEFORE.test(string.substring(pTEnd, tStart))
      );
    }

    stringBefore = string.substring(pTEnd, tStart);
  } else {
    stringBefore = string.substring(0, tStart);
  }

  return SPACE_OR_NEWLINE_BEFORE.test(stringBefore);
};

export const newlineBeforeWith = (newlineId: number): Constraint => (
  string,
  _start,
  _end,
  index,
  tokens
) => {
  const [tStart] = tokens[index];

  if (index - 1 >= 0) {
    // has previous token
    const [, pTEnd, matcher] = tokens[index - 1];

    // previous token is newline
    if (matcher.id === newlineId) {
      // either newline end = current start
      return (
        pTEnd === tStart ||
        // or string between newline end and current start is whitespace
        SPACE_OR_NEWLINE_BEFORE.test(string.substring(pTEnd, tStart))
      );
    }
  }
  return false;
};

export const otherTokenBefore: Constraint = (
  _string,
  start,
  _end,
  index,
  tokens
) => {
  if (index - 1 >= 0) {
    const [, tEnd, prevMatcher] = tokens[index - 1];
    const [, , currentMatcher] = tokens[index];
    if (prevMatcher.id !== currentMatcher.id) {
      return start === tEnd;
    }
  }
  return false;
};

export const otherTokenAfter: Constraint = (
  _string,
  _start,
  end,
  index,
  tokens
) => {
  if (index + 1 < tokens.length) {
    const [tStart, , nextMatcher] = tokens[index + 1];
    const [, , currentMatcher] = tokens[index];
    if (nextMatcher.id !== currentMatcher.id) {
      return end === tStart;
    }
  }
  return false;
};

export const sameOpeningBefore: Constraint = (
  _string,
  start,
  _end,
  index,
  tokens,
  previousTokens
) => {
  const previousToken = previousTokens[index - 1];
  if (index - 1 >= 0 && previousToken) {
    const [, tEnd, prevMatcher] = tokens[index - 1];
    const [, , currentMatcher] = tokens[index];
    if (
      // previous is of same type
      prevMatcher.id === currentMatcher.id &&
      // previous is opening
      previousToken.kind & TokenKind.Opens
    ) {
      // return true if previous end = this start
      return tEnd === start;
    }
  }
  return false;
};
