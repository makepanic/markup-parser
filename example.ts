import Tokenizer from "./lib/Tokenizer";
import TokenMatcher from "./lib/TokenMatcher";
import Grammar from "./lib/Grammar";
import TextRule from "./lib/rule/TextRule";
import BlockRule from "./lib/rule/BlockRule";
import ConstantRule from "./lib/rule/ConstantRule";
import Parser from "./lib/Parser";
import TokenKind from "./lib/TokenKind";

const ESCAPE_CHAR = '\\';
const WHITEPSPACE_DELIMITER = /[\n .,+&?!/-]/;

enum Type {
  Nul,
  Newline,
  Quote,
  Escape,
  Url,
  PseudoUrl,
  Email,
  Preformatted,
  Text,

  Bold,
  Italics,
  Strike,
  Code,
}

type condition = (str: string, start: number, end?: number) => boolean;

let and = (...fns: any[]) => (...args: any[]) => fns.every(fn => fn(...args));
let or = (...fns: any[]) => (...args: any[]) => fns.some(fn => fn(...args));

let startOfString: condition = (str: string, start: number) => str.substring(start - 1, start) === '';
let endOfString: condition = (str: string, start: number, end: number) => str.substring(end, end + 1) === '';
let whitespaceBefore: condition = (str: string, start: number) => WHITEPSPACE_DELIMITER.test(str.substring(start - 1, start));
let whitespaceAfter: condition = (str: string, start: number, end: number) => WHITEPSPACE_DELIMITER.test(str.substring(end, end + 1));
let whitespaceBeforeOrAfter: condition = or(whitespaceBefore, whitespaceAfter, startOfString, endOfString);

let opens = or(whitespaceBefore, startOfString);
let closes = or(whitespaceAfter, endOfString);

let otherTokenBefore = (string: string, start: number, end: number, index: number, tokens: Array<[number, number, TokenMatcher<number>]>) => {
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

let otherTokenAfter = (string: string, start: number, end: number, index: number, tokens: Array<[number, number, TokenMatcher<number>]>) => {
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

const tokenizer = new Tokenizer<Type>()
  .add(new TokenMatcher(/(\n)/g, Type.Newline))
  .add(new TokenMatcher(/(>)/g, Type.Quote))
  .add(new TokenMatcher(/(\\)/g, Type.Escape))
  .add(new TokenMatcher(/\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gi, Type.Url))
  .add(new TokenMatcher(/\bwww\.\S+\b/gi, Type.PseudoUrl))
  .add(new TokenMatcher(/\b(([\w+\-.]+)@\w+?(?:\.[a-zA-Z]{2,6}))+\b/gi, Type.Email))
  .add(new TokenMatcher(/\b\S+\.(com|org|de|fr|fi|uk|es|it|nl|br|net|cz|no|pl|ca|se|ru|eu|gov|jp|shop|at|ch|online|biz|io|berlin|info)\S*\b/gi, Type.PseudoUrl))
  .add(new TokenMatcher(/(\*)/g, Type.Bold, [
    [or(opens, otherTokenBefore), TokenKind.Opens],
    [or(closes, otherTokenAfter), TokenKind.Closes]
  ]))
  .add(new TokenMatcher(/(_)/g, Type.Italics, [
    [or(opens, otherTokenBefore), TokenKind.Opens],
    [or(closes, otherTokenAfter), TokenKind.Closes]
  ]))
  .add(new TokenMatcher(/(~)/g, Type.Strike, [
    [or(opens, otherTokenBefore), TokenKind.Opens],
    [or(closes, otherTokenAfter), TokenKind.Closes]
  ]))
  .add(new TokenMatcher(/(```)/g, Type.Preformatted, [
    [and(whitespaceBeforeOrAfter), TokenKind.Default]
  ]))
  .add(new TokenMatcher(/(`)/g, Type.Code, [
    [or(opens, otherTokenBefore), TokenKind.Opens],
    [or(closes, otherTokenAfter), TokenKind.Closes]
  ]))
  .escapeWith(ESCAPE_CHAR)
  .terminateWith(Type.Nul)
  .fillWith(Type.Text);

const grammar = new Grammar<Type>()
  .add(new ConstantRule(Type.Newline, '<br>'))
  .add(new ConstantRule(Type.Escape, ''))
  .add(new TextRule(Type.Text, (text) => text))
  .add(new TextRule(Type.Url, (text) => `<a href="${text}" target="_blank">${text}</a>`))
  .add(new TextRule(Type.PseudoUrl, (text) => `<a href="http://${text}" target="_blank">${text}</a>`))
  .add(new TextRule(Type.Email, (text) => `<a href="mailto:${text}" target="_blank">${text}</a>`))
  .add(new BlockRule(Type.Quote, Type.Newline, (children) => `<blockquote>${children}</blockquote>`))
  .add(new BlockRule(Type.Quote, Type.Nul, (children) => `<blockquote>${children}</blockquote>`))
  .add(new BlockRule(Type.Bold, Type.Bold, (children) => `<strong>${children}</strong>`, TokenKind.Opens, TokenKind.Closes))
  .add(new BlockRule(Type.Italics, Type.Italics, (children) => `<i>${children}</i>`, TokenKind.Opens, TokenKind.Closes))
  .add(new BlockRule(Type.Strike, Type.Strike, (children) => {
    return `<strike>${children}</strike>`;
  }, TokenKind.Opens, TokenKind.Closes))
  .add(new BlockRule(Type.Preformatted, Type.Preformatted, (children) => {
    return `<pre>${children}</pre>`
  }))
  .add(new BlockRule(Type.Code, Type.Code, (children) => `<code>${children}</code>`, TokenKind.Opens, TokenKind.Closes));

const parser = new Parser(grammar)
  .withFallbackRule(new TextRule(Type.Text, (text) => text));

function render(text: string) {
  const tokens = tokenizer.tokenize(text);
  const tree = parser.parse(tokens);

  // NOTE: the expanded text isn't escaped
  return tree.expand(text);
}

export default render;
