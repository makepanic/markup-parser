import TokenMatcher from "../token/TokenMatcher";

const WHITEPSPACE_DELIMITER = /[\n :.,+&?!/()]/;
const SPACE_OR_NEWLINE_BEFORE = /^[ \n]+$/;

export type condition = (str: string, start: number, end?: number) => boolean;

export const and = (...fns: any[]) => (...args: any[]) =>
  fns.every(fn => fn(...args));
export const or = (...fns: any[]) => (...args: any[]) =>
  fns.some(fn => fn(...args));

export const not = (fn: any) => (...args: any[]) => !fn(...args);

export const startOfString: condition = (_str: string, start: number) =>
  start === 0;
export const endOfString: condition = (
  str: string,
  _start: number,
  end: number
) => end === str.length;
export const whitespaceBefore: condition = (str: string, start: number) =>
  WHITEPSPACE_DELIMITER.test(str[start - 1]);
export const whitespaceAfter: condition = (
  str: string,
  _start: number,
  end: number
) => WHITEPSPACE_DELIMITER.test(str[end]);
export const whitespaceBeforeOrAfter: condition = or(
  whitespaceBefore,
  whitespaceAfter,
  startOfString,
  endOfString
);

export const opens = or(whitespaceBefore, startOfString);
export const closes = or(whitespaceAfter, endOfString);

export const newlineBefore = (
  string: string,
  _start: number,
  _end: number,
  index: number,
  tokens: Array<[number, number, TokenMatcher]>
) => {
  const [tStart] = tokens[index];
  let stringBefore;

  if (index - 1 >= 0) {
    // has previous token
    const [, pTEnd, matcher] = tokens[index - 1];

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
export const otherTokenBefore = (
  _string: string,
  start: number,
  _end: number,
  index: number,
  tokens: Array<[number, number, TokenMatcher]>
) => {
  if (index - 1 >= 0) {
    const [, tEnd, prevMatcher] = tokens[index - 1];
    const [, , currentMatcher] = tokens[index];
    if (prevMatcher.id !== currentMatcher.id) {
      return start === tEnd;
    }
    return false;
  } else {
    return false;
  }
};
export const otherTokenAfter = (
  _string: string,
  _start: number,
  end: number,
  index: number,
  tokens: Array<[number, number, TokenMatcher]>
) => {
  if (index + 1 < tokens.length) {
    const [tStart, , nextMatcher] = tokens[index + 1];
    const [, , currentMatcher] = tokens[index];
    if (nextMatcher.id !== currentMatcher.id) {
      return end === tStart;
    } else {
      return false;
    }
  } else {
    return false;
  }
};
