import TokenMatcher from "../token/TokenMatcher";

const WHITEPSPACE_DELIMITER = /[\n :.,+&?!/()]/;
const SPACE_OR_NEWLINE_BEFORE = /^[ \n]+$/;

export type condition = (
  str: string,
  start: number,
  end?: number,
  prevToken?: [number, number, TokenMatcher] | undefined,
  token?: [number, number, TokenMatcher],
  nextToken?: [number, number, TokenMatcher] | undefined,
) => boolean;

export const and = (...fns: any[]) => (...args: any[]) =>
  fns.every(fn => fn(...args));
export const or = (...fns: any[]) => (...args: any[]) =>
  fns.some(fn => fn(...args));

export const not = (fn: any) => (...args: any[]) => !fn(...args);

export const startOfString: condition = (str, start) =>
  start === 0;
export const endOfString: condition = (str, start, end) =>
  end === str.length;
export const whitespaceBefore: condition = (str, start) =>
  WHITEPSPACE_DELIMITER.test(str[start - 1]);
export const whitespaceAfter: condition = (str, start, end) =>
  WHITEPSPACE_DELIMITER.test(str[end]);
export const whitespaceBeforeOrAfter: condition = or(
  whitespaceBefore,
  whitespaceAfter,
  startOfString,
  endOfString
);

export const opens = or(whitespaceBefore, startOfString);
export const closes = or(whitespaceAfter, endOfString);

export const newlineBefore: condition = (
  string,
  start,
  end,
  prevToken,
  token,
) => {
  const [tStart] = token;
  let stringBefore;

  if (prevToken) {
    // has previous token
    const [, pTEnd, matcher] = prevToken;

    // previous token is newline
    if (matcher.id === 1) {
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
export const otherTokenBefore: condition = (
  string,
  start,
  end,
  prevToken,
  token,
) => {
  if (prevToken) {
    const [, tEnd, prevMatcher] = prevToken;
    const [, , currentMatcher] = token;
    if (prevMatcher.id !== currentMatcher.id) {
      return start === tEnd;
    }
    return false;
  } else {
    return false;
  }
};
export const otherTokenAfter: condition = (
  string,
  start,
  end,
  prevToken,
  token,
  nextToken,
) => {
  if (nextToken) {
    const [tStart, , nextMatcher] = nextToken;
    const [, , currentMatcher] = token;
    if (nextMatcher.id !== currentMatcher.id) {
      return end === tStart;
    } else {
      return false;
    }
  } else {
    return false;
  }
};
