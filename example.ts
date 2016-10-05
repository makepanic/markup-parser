import Parser from './lib/parse';
import Grammar from './lib/grammar'
import {Block, Constant, Text} from './lib/rule';

import {Tokenizer} from './lib/tokenizer';
import Matcher from './lib/token-matcher';

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

  BoldOpen,
  BoldClose,
  ItalicsOpen,
  ItalicsClose,
  StrikeOpen,
  StrikeClose,
  CodeOpen,
  CodeClose
}

let and = (...fns) => (...args) => fns.every(fn => fn(...args));
let or = (...fns) => (...args) => fns.some(fn => fn(...args));

let startOfString = (str, match) => str.substring(match.index - 1, match.index) === '';
let endOfString = (str, match) => str.substring(match.index + match[0].length, match.index + match[0].length + 1) === '';
let whitespaceBefore = (str, match) => WHITEPSPACE_DELIMITER.test(str.substring(match.index - 1, match.index));
let whitespaceAfter = (str, match) => WHITEPSPACE_DELIMITER.test(str.substring(match.index + match[0].length, match.index + match[0].length + 1));
let notEscaped = (str, match) => str.substring(match.index - 1, match.index) !== ESCAPE_CHAR;
let whitespaceBeforeOrAfter = or(whitespaceBefore, whitespaceAfter, startOfString, endOfString);

let opens = or(whitespaceBefore, startOfString);
let closes = or(whitespaceAfter, endOfString);

const tokenizer = new Tokenizer<Type>()
  .add(new Matcher(/(\n)/g, Type.Newline, notEscaped))
  .add(new Matcher(/(>)/g, Type.Quote, notEscaped))
  .add(new Matcher(/(\\)/g, Type.Escape, notEscaped))
  .add(new Matcher(/\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/g, Type.Url))
  .add(new Matcher(/\bwww\.[\S]+\b/g, Type.PseudoUrl))
  .add(new Matcher(/\b(([a-zA-Z0-9_+\-.]+)@[0-9a-zA-Z_]+?(?:\.[a-zA-Z]{2,6}))+\b/g, Type.Email))
  .add(new Matcher(/(\*)/g, Type.BoldOpen, and(notEscaped, opens)))
  .add(new Matcher(/(\*)/g, Type.BoldClose, and(notEscaped, closes)))
  .add(new Matcher(/(_)/g, Type.ItalicsOpen, and(notEscaped, opens)))
  .add(new Matcher(/(_)/g, Type.ItalicsClose, and(notEscaped, closes)))
  .add(new Matcher(/(~)/g, Type.StrikeOpen, and(notEscaped, opens)))
  .add(new Matcher(/(~)/g, Type.StrikeClose, and(notEscaped, closes)))
  .add(new Matcher(/(```)/g, Type.Preformatted, and(notEscaped, whitespaceBeforeOrAfter)))
  .add(new Matcher(/(`)/g, Type.CodeOpen, and(notEscaped, opens)))
  .add(new Matcher(/(`)/g, Type.CodeClose, and(notEscaped, closes)))
  .terminateWith(Type.Nul)
  .fillWith(Type.Text);

const grammar = new Grammar<Type>()
  .add(new Constant(Type.Newline, '<br>'))
  .add(new Constant(Type.Escape, ''))
  .add(new Text(Type.Text, (text) => text))
  .add(new Text(Type.Url, (text) => `<a href="${text}" target="_blank">${text}</a>`))
  .add(new Text(Type.PseudoUrl, (text) => `<a href="http://${text}" target="_blank">${text}</a>`))
  .add(new Text(Type.Email, (text) => `<a href="mailto:${text}" target="_blank">${text}</a>`))
  .add(new Block(Type.Quote, Type.Newline, (children)=>`<blockquote>${children}</blockquote>`))
  .add(new Block(Type.Quote, Type.Nul, (children)=>`<blockquote>${children}</blockquote>`))
  .add(new Block(Type.BoldOpen, Type.BoldClose, (children)=>`<strong>${children}</strong>`))
  .add(new Block(Type.ItalicsOpen, Type.ItalicsClose, (children)=>`<i>${children}</i>`))
  .add(new Block(Type.StrikeOpen, Type.StrikeClose, (children)=>`<strike>${children}</strike>`))
  .add(new Block(Type.Preformatted, Type.Preformatted, (children)=>`<pre>${children}</pre>`))
  .add(new Block(Type.CodeOpen, Type.CodeClose, (children)=>`<code>${children}</code>`));

const parser = new Parser(grammar)
  .withFallbackRule(new Text(Type.Text, (text) => text));

function render(text: string) {
  const tokens = tokenizer.tokenize(text);
  const tree = parser.parse(tokens);

  // NOTE: the expanded text isn't escaped
  return tree.expand(text);
}

export default render;
