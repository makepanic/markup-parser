import test from 'ava';
import Tokenizer from "../../lib/Tokenizer";
import TokenMatcher from "../../lib/TokenMatcher";

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
  t.deepEqual(tokens.map(token => token.format.id), [Type.Text, Type.A, Type.Text, Type.Newline, Type.Text, Type.EOL]);
});

test('tokenize empty string', function (t) {
  const tokenizer = new Tokenizer<Type>()
    .add(new TokenMatcher(/(\n)/g, Type.Newline))
    .add(new TokenMatcher(/A/g, Type.A))
    .terminateWith(Type.EOL)
    .fillWith(Type.Text);

  const tokens = tokenizer.tokenize('');
  t.deepEqual(tokens.map(token => token.format.id), [Type.EOL]);
});

test('uses constraint function', function (t) {
  const tokenizerA = new Tokenizer<Type>()
    .add(new TokenMatcher(/A/g, Type.A, (string, match) => string.substring(match.index, match.index + 1) === 'A'))
    .fillWith(Type.Text)
    .terminateWith(Type.EOL);

  const tokenizerB = new Tokenizer<Type>()
    .add(new TokenMatcher(/A/g, Type.A, (string, match) => string.substring(match.index, match.index + 1) === 'B'))
    .fillWith(Type.Text)
    .terminateWith(Type.EOL);

  t.deepEqual(tokenizerA.tokenize('A').map(token => token.format.id), [Type.A, Type.EOL]);
  t.deepEqual(tokenizerB.tokenize('A').map(token => token.format.id), [Type.Text, Type.EOL])
});

test('throws when trying to add two filler, terminators', function (t) {
  t.throws(() => {
    new Tokenizer<Type>()
      .terminateWith(Type.EOL)
      .terminateWith(Type.A)
  });
  t.throws(() => {
    new Tokenizer<Type>()
      .fillWith(Type.EOL)
      .fillWith(Type.A)
  });
});

test('throws when trying to tokenize without filler', function (t) {
  t.throws(() => {
    new Tokenizer<Type>()
      .add(new TokenMatcher(/A/g, Type.A))
      .tokenize('A')
  });
});

