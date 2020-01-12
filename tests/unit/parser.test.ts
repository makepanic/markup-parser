import test from "ava";
import Parser from "../../lib/Parser";
import Grammar from "../../lib/Grammar";
import TextRule from "../../lib/rule/TextRule";
import Tokenizer from "../../lib/Tokenizer";
import BlockRule from "../../lib/rule/BlockRule";
import TokenMatcher from "../../lib/token/TokenMatcher";
import Token from "../../lib/token/Token";
import TokenKind from "../../lib/token/TokenKind";

const Type = {
  Nul: 0,
  Text: 1,
  Block: 2,
  A: 3,
  B: 4,
  C: 5,
  Newline: 6,
  Escape: 7
};

const tokenizer = new Tokenizer(Type.Text, Type.Nul, Type.Escape).add(
  new TokenMatcher(/B/g, Type.Block)
);

const grammar = new Grammar(Type.Newline)
  .add(new TextRule(Type.Text, t => `${t}`))
  .add(new BlockRule(Type.Block, Type.Block, children => `[B]${children}[/B]`));

test("it works", t => {
  const text = "foo Ba";
  const parser = new Parser(grammar, new TextRule(Type.Text, t => `${t}`));

  const tokens = tokenizer.tokenize(text);
  const tree = parser.parse(tokens);

  const expanded = tree.expand(text);

  t.is(expanded, "foo Ba");
});

test("peek is bitmask aware", t => {
  const parser = new Parser(grammar, new TextRule(Type.Text, t => `${t}`));

  const tokens: Token[] = [
    new Token(0, 1, Type.A, TokenKind.Default | TokenKind.Closes),
    new Token(
      3,
      4,
      Type.B,
      TokenKind.Default | TokenKind.Closes | TokenKind.Opens
    )
  ];

  t.deepEqual(parser.peek(Type.B, TokenKind.Closes, tokens, 0, tokens.length), {
    idx: 1,
    token: tokens[1]
  });
  t.deepEqual(parser.peek(Type.B, TokenKind.Opens, tokens, 0, tokens.length), {
    idx: 1,
    token: tokens[1]
  });
  t.is(
    parser.peek(Type.A, TokenKind.Opens, tokens, 0, tokens.length),
    undefined
  );
});
