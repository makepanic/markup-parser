import test from 'ava';
import Tokenizer from "../../lib/Tokenizer";
import TokenMatcher from "../../lib/TokenMatcher";
import TokenKind from "../../lib/TokenKind";

enum Type {
  EOL,
  Text,
  Newline,
  A
}

test('tokenize', function (t) {
  const tokenizer = new Tokenizer<Type>()
    .add(new TokenMatcher(/(\n)/g, Type.Newline))
    .add(new TokenMatcher(/A/g, Type.A))
    .terminateWith(Type.EOL)
    .fillWith(Type.Text);

  const tokens = tokenizer.tokenize('hello A world\naa');
  t.deepEqual(tokens.map(token => token.id), [Type.Text, Type.A, Type.Text, Type.Newline, Type.Text, Type.EOL]);
});

test('tokenize empty string', function (t) {
  const tokenizer = new Tokenizer<Type>()
    .add(new TokenMatcher(/(\n)/g, Type.Newline))
    .add(new TokenMatcher(/A/g, Type.A))
    .terminateWith(Type.EOL)
    .fillWith(Type.Text);

  const tokens = tokenizer.tokenize('');
  t.deepEqual(tokens.map(token => token.id), [Type.EOL]);
});

test('uses constraint function', function (t) {
  const tokenizerA = new Tokenizer<Type>()
    .add(new TokenMatcher(/A/g, Type.A, [
      [(string, start) => string.substring(start, start + 1) === 'A', TokenKind.Default]
    ]))
    .fillWith(Type.Text)
    .terminateWith(Type.EOL);

  const tokenizerB = new Tokenizer<Type>()
    .add(new TokenMatcher(/A/g, Type.A, [
      [(string, start) => string.substring(start, start + 1) === 'B', TokenKind.Default]
    ]))
    .fillWith(Type.Text)
    .terminateWith(Type.EOL);

  t.deepEqual(tokenizerA.tokenize('A').map(token => token.id), [Type.A, Type.EOL]);
  t.deepEqual(tokenizerB.tokenize('A').map(token => token.id), [Type.Text, Type.EOL])
});

test('throws when trying to tokenize without required options set', function (t) {
  t.throws(() => {
    new Tokenizer<Type>()
      .terminateWith(undefined)
      .tokenize('o hai')
  });
  t.throws(() => {
    new Tokenizer<Type>()
      .fillWith(undefined)
      .tokenize('o hai');
  });
});

test('throws when trying to tokenize without filler', function (t) {
  t.throws(() => {
    new Tokenizer<Type>()
      .add(new TokenMatcher(/A/g, Type.A))
      .tokenize('A')
  });
});

