import Tokenizer from "../lib/Tokenizer";
import TokenMatcher from "../lib/token/TokenMatcher";
import Grammar from "../lib/Grammar";
import TextRule from "../lib/rule/TextRule";
import BlockRule from "../lib/rule/BlockRule";
import ConstantRule from "../lib/rule/ConstantRule";
import Parser from "../lib/Parser";
import Node from "../lib/Node";
import TokenKind from "../lib/token/TokenKind";
import {
  and,
  closes,
  opens,
  or,
  otherTokenAfter,
  otherTokenBefore,
  whitespaceBeforeOrAfter
} from "../lib/utils/Conditions";
import IMarkup from "./IMarkup";
import Token from "../lib/token/Token";

export enum Type {
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

const tokenizer = new Tokenizer<Type>(Type.Text, Type.Nul)
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
  ]));

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

const parser = new Parser(grammar, new TextRule(Type.Text, (text) => text));

class SlackLike implements IMarkup<Type> {
  types = Type;
  tokenize(input: string): Token<Type>[] {
    return tokenizer.tokenize(input);
  }

  parse(tokens: Token<Type>[]): Node<Type> {
    return parser.parse(tokens);
  }

  format(input: string) {
    return this.parse(this.tokenize(input)).expand(input);
  }
}

export default SlackLike;
