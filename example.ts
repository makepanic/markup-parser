import Tokenizer from "./lib/Tokenizer";
import TokenMatcher from "./lib/TokenMatcher";
import Grammar from "./lib/Grammar";
import TextRule from "./lib/rule/TextRule";
import BlockRule from "./lib/rule/BlockRule";
import ConstantRule from "./lib/rule/ConstantRule";
import Parser from "./lib/Parser";
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
  .add(new TokenMatcher(/(\n)/g, Type.Newline, notEscaped))
  .add(new TokenMatcher(/(>)/g, Type.Quote, notEscaped))
  .add(new TokenMatcher(/(\\)/g, Type.Escape, notEscaped))
  .add(new TokenMatcher(/\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gi, Type.Url))
  .add(new TokenMatcher(/\bwww\.[\S]+\b/g, Type.PseudoUrl))
  .add(new TokenMatcher(/\b(([a-zA-Z0-9_+\-.]+)@[0-9a-zA-Z_]+?(?:\.[a-zA-Z]{2,6}))+\b/gi, Type.Email))
  .add(new TokenMatcher(/(\*)/g, Type.BoldOpen, and(notEscaped, opens)))
  .add(new TokenMatcher(/(\*)/g, Type.BoldClose, and(notEscaped, closes)))
  .add(new TokenMatcher(/(_)/g, Type.ItalicsOpen, and(notEscaped, opens)))
  .add(new TokenMatcher(/(_)/g, Type.ItalicsClose, and(notEscaped, closes)))
  .add(new TokenMatcher(/(~)/g, Type.StrikeOpen, and(notEscaped, opens)))
  .add(new TokenMatcher(/(~)/g, Type.StrikeClose, and(notEscaped, closes)))
  .add(new TokenMatcher(/(```)/g, Type.Preformatted, and(notEscaped, whitespaceBeforeOrAfter)))
  .add(new TokenMatcher(/(`)/g, Type.CodeOpen, and(notEscaped, opens)))
  .add(new TokenMatcher(/(`)/g, Type.CodeClose, and(notEscaped, closes)))
  .terminateWith(Type.Nul)
  .fillWith(Type.Text);

const grammar = new Grammar<Type>()
  .add(new ConstantRule(Type.Newline, '<br>'))
  .add(new ConstantRule(Type.Escape, ''))
  .add(new TextRule(Type.Text, (text) => text))
  .add(new TextRule(Type.Url, (text) => `<a href="${text}" target="_blank">${text}</a>`))
  .add(new TextRule(Type.PseudoUrl, (text) => `<a href="http://${text}" target="_blank">${text}</a>`))
  .add(new TextRule(Type.Email, (text) => `<a href="mailto:${text}" target="_blank">${text}</a>`))
  .add(new BlockRule(Type.Quote, Type.Newline, (children)=>`<blockquote>${children}</blockquote>`))
  .add(new BlockRule(Type.Quote, Type.Nul, (children)=>`<blockquote>${children}</blockquote>`))
  .add(new BlockRule(Type.BoldOpen, Type.BoldClose, (children)=>`<strong>${children}</strong>`))
  .add(new BlockRule(Type.ItalicsOpen, Type.ItalicsClose, (children)=>`<i>${children}</i>`))
  .add(new BlockRule(Type.StrikeOpen, Type.StrikeClose, (children)=>`<strike>${children}</strike>`))
  .add(new BlockRule(Type.Preformatted, Type.Preformatted, (children)=>`<pre>${children}</pre>`))
  .add(new BlockRule(Type.CodeOpen, Type.CodeClose, (children)=>`<code>${children}</code>`));

const parser = new Parser(grammar)
  .withFallbackRule(new TextRule(Type.Text, (text) => text));

function render(text: string) {
  console.log('rendering', text);
  const tokens = tokenizer.tokenize(text);
  const tree = parser.parse(tokens);

  // NOTE: the expanded text isn't escaped
  return tree.expand(text);
}

export default render;
