import test from "ava";
import Tokenizer from "../../lib/Tokenizer";
import TokenMatcher from "../../lib/token/TokenMatcher";
import TokenKind from "../../lib/token/TokenKind";

const Type = {
  EOL: 0,
  Text: 1,
  Newline: 2,
  A: 3
};

test("tokenize", function(t) {
  const tokenizer = new Tokenizer(Type.Text, Type.EOL)
    .add(new TokenMatcher(/(\n)/g, Type.Newline))
    .add(new TokenMatcher(/A/g, Type.A));

  const tokens = tokenizer.tokenize("hello A world\naa");
  t.deepEqual(tokens.map(token => token.id), [
    Type.Text,
    Type.A,
    Type.Text,
    Type.Newline,
    Type.Text,
    Type.EOL
  ]);
});

test("tokenize empty string", function(t) {
  const tokenizer = new Tokenizer(Type.Text, Type.EOL)
    .add(new TokenMatcher(/(\n)/g, Type.Newline))
    .add(new TokenMatcher(/A/g, Type.A));

  const tokens = tokenizer.tokenize("");
  t.deepEqual(tokens.map(token => token.id), [Type.Text, Type.EOL]);
});

test("uses constraint function", function(t) {
  const tokenizerA = new Tokenizer(Type.Text, Type.EOL).add(
    new TokenMatcher(/A/g, Type.A, [
      [
        (string, start) => string.substring(start, start + 1) === "A",
        TokenKind.Default
      ]
    ])
  );

  const tokenizerB = new Tokenizer(Type.Text, Type.EOL).add(
    new TokenMatcher(/A/g, Type.A, [
      [
        (string, start) => string.substring(start, start + 1) === "B",
        TokenKind.Default
      ]
    ])
  );

  t.deepEqual(tokenizerA.tokenize("A").map(token => token.id), [
    Type.Text,
    Type.A,
    Type.Text,
    Type.EOL
  ]);
  t.deepEqual(tokenizerB.tokenize("A").map(token => token.id), [
    Type.Text,
    Type.EOL
  ]);
});
