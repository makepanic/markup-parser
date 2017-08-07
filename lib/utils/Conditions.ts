import TokenMatcher from "../TokenMatcher";

const WHITEPSPACE_DELIMITER = /[\n .,+&?!/-]/;

export type condition = (str: string, start: number, end?: number) => boolean;

export const and = (...fns: any[]) => (...args: any[]) => fns.every(fn => fn(...args));
export const or = (...fns: any[]) => (...args: any[]) => fns.some(fn => fn(...args));

export const startOfString: condition = (str: string, start: number) => str.substring(start - 1, start) === '';
export const endOfString: condition = (str: string, start: number, end: number) => str.substring(end, end + 1) === '';
export const whitespaceBefore: condition = (str: string, start: number) => WHITEPSPACE_DELIMITER.test(str.substring(start - 1, start));
export const whitespaceAfter: condition = (str: string, start: number, end: number) => WHITEPSPACE_DELIMITER.test(str.substring(end, end + 1));
export const whitespaceBeforeOrAfter: condition = or(whitespaceBefore, whitespaceAfter, startOfString, endOfString);

export const opens = or(whitespaceBefore, startOfString);
export const closes = or(whitespaceAfter, endOfString);

export const otherTokenBefore = (string: string, start: number, end: number, index: number, tokens: Array<[number, number, TokenMatcher<number>]>) => {
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

export const otherTokenAfter = (string: string, start: number, end: number, index: number, tokens: Array<[number, number, TokenMatcher<number>]>) => {
  if ((index + 1) < tokens.length) {
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
