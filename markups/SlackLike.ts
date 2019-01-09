import Tokenizer, { MatchRange } from "../lib/Tokenizer";
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
  newlineBefore,
  not,
  sameOpeningBefore,
  opens,
  or,
  otherTokenAfter,
  otherTokenBefore,
  startOfString,
  whitespaceAfter,
  whitespaceBeforeOrAfter
} from "../lib/utils/Conditions";
import IMarkup from "./IMarkup";
import Token from "../lib/token/Token";

export const Type = {
  Nul: 0,
  Newline: 1,
  Quote: 2,
  Escape: 3,
  Url: 4,
  PseudoUrl: 5,
  Email: 6,
  Preformatted: 7,
  Text: 8,
  Bold: 9,
  Italics: 10,
  Strike: 11,
  Code: 12,
  Highlight: 13,
  User: 14
};

const tokenizer = new Tokenizer(Type.Text, Type.Nul)
  .add(new TokenMatcher(/(\n)/g, Type.Newline))
  .add(
    new TokenMatcher(/(>)/g, Type.Quote, [
      [
        and(or(startOfString, newlineBefore), whitespaceAfter),
        TokenKind.Default
      ]
    ])
  )
  .add(new TokenMatcher(/(\\)/g, Type.Escape))
  .add(
    new TokenMatcher(
      /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gi,
      Type.Url
    )
  )
  .add(new TokenMatcher(/\bwww\.\S+\b/gi, Type.PseudoUrl))
  .add(
    new TokenMatcher(/\b(([\w+\-.]+)@\w+?(?:\.[a-zA-Z]{2,6}))+\b/gi, Type.Email)
  )
  .add(
    new TokenMatcher(
      /\b\S+\.(com|org|de|fr|fi|uk|es|it|nl|br|net|cz|no|pl|ca|se|ru|eu|gov|jp|shop|at|ch|online|biz|io|berlin|info)(\/[a-z0-9-+&@#\/%=~_|]*)*\b/gi,
      Type.PseudoUrl
    )
  )
  .add(
    new TokenMatcher(/(\*)/g, Type.Bold, [
      [or(opens, otherTokenBefore), TokenKind.Opens],
      [
        and(
          or(closes, otherTokenAfter),
          not(sameOpeningBefore),
          not(newlineBefore)
        ),
        TokenKind.Closes
      ]
    ])
  )
  .add(
    new TokenMatcher(/(_)/g, Type.Italics, [
      [or(opens, otherTokenBefore), TokenKind.Opens],
      [
        and(
          or(closes, otherTokenAfter),
          not(sameOpeningBefore),
          not(newlineBefore)
        ),
        TokenKind.Closes
      ]
    ])
  )
  .add(
    new TokenMatcher(/(~)/g, Type.Strike, [
      [or(opens, otherTokenBefore), TokenKind.Opens],
      [
        and(
          or(closes, otherTokenAfter),
          not(sameOpeningBefore),
          not(newlineBefore)
        ),
        TokenKind.Closes
      ]
    ])
  )
  .add(
    new TokenMatcher(/(```)/g, Type.Preformatted, [
      [and(whitespaceBeforeOrAfter), TokenKind.Default]
    ])
  )
  .add(
    new TokenMatcher(/(`)/g, Type.Code, [
      [or(opens, otherTokenBefore), TokenKind.Opens],
      [
        and(
          or(closes, otherTokenAfter),
          not(sameOpeningBefore),
          not(newlineBefore)
        ),
        TokenKind.Closes
      ]
    ])
  );

const grammar = new Grammar()
  .add(new ConstantRule(Type.Newline, "<br>"))
  .add(new ConstantRule(Type.Escape, ""))
  .add(
    new TextRule(
      Type.Url,
      text =>
        `<a href="${text}" target="_blank" rel="noopener noreferrer">${text}</a>`
    )
  )
  .add(
    new TextRule(
      Type.PseudoUrl,
      text =>
        `<a href="http://${text}" target="_blank" rel="noopener noreferrer">${text}</a>`
    )
  )
  .add(
    new TextRule(
      Type.Email,
      text =>
        `<a href="mailto:${text}" target="_blank" rel="noopener noreferrer">${text}</a>`
    )
  )
  .add(
    new BlockRule(
      Type.Quote,
      Type.Newline,
      children => `<blockquote>${children}</blockquote>`
    )
  )
  .add(
    new BlockRule(
      Type.Highlight,
      Type.Highlight,
      children => `<em>${children}</em>`,
      TokenKind.Opens,
      TokenKind.Closes
    )
  )
  .add(
    new BlockRule(
      Type.User,
      Type.User,
      (children, _occluded, meta) =>
        meta && meta.user
          ? `<span data-user="${meta.user}">${children}</span>`
          : children,
      TokenKind.Opens,
      TokenKind.Closes
    )
  )
  .add(
    new BlockRule(
      Type.Quote,
      Type.Nul,
      children => `<blockquote>${children}</blockquote>`
    )
  )
  .add(
    new BlockRule(
      Type.Bold,
      Type.Bold,
      children => `<strong>${children}</strong>`,
      TokenKind.Opens,
      TokenKind.Closes
    )
  )
  .add(
    new BlockRule(
      Type.Italics,
      Type.Italics,
      children => `<i>${children}</i>`,
      TokenKind.Opens,
      TokenKind.Closes
    )
  )
  .add(
    new BlockRule(
      Type.Strike,
      Type.Strike,
      children => {
        return `<strike>${children}</strike>`;
      },
      TokenKind.Opens,
      TokenKind.Closes
    )
  )
  .add(
    new BlockRule(
      Type.Preformatted,
      Type.Preformatted,
      children => {
        return `<pre>${children}</pre>`;
      },
      TokenKind.Default,
      TokenKind.Default,
      true
    )
  )
  .add(
    new BlockRule(
      Type.Code,
      Type.Code,
      children => {
        return `<code>${children}</code>`;
      },
      TokenKind.Opens,
      TokenKind.Closes,
      true
    )
  );

const parser = new Parser(grammar, new TextRule(Type.Text, text => text));

class SlackLike implements IMarkup {
  findMatchRanges(string: string, ranges: MatchRange[] = []): MatchRange[] {
    return tokenizer.findMatchRanges(string, ranges);
  }

  matchTokens(string: string, ranges: MatchRange[]): Token[] {
    return tokenizer.matchTokens(string, ranges);
  }

  tokenize(input: string): Token[] {
    return tokenizer.tokenize(input);
  }

  parse(tokens: Token[]): Node {
    return parser.parse(tokens);
  }

  format(input: string) {
    return this.parse(this.tokenize(input)).expand(input);
  }
}

export default SlackLike;
