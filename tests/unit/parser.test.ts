import test from 'ava';
import Parser from "../../lib/Parser";
import Grammar from "../../lib/Grammar";
import TextRule from "../../lib/rule/TextRule";
import Tokenizer from "../../lib/Tokenizer";
import BlockRule from "../../lib/rule/BlockRule";
import TokenMatcher from "../../lib/token/TokenMatcher";

enum Type {
  Nul,
  Text,
  Block,
}

const tokenizer = new Tokenizer<Type>(Type.Text, Type.Nul)
  .add(new TokenMatcher(/B/g, Type.Block));

const grammar = new Grammar<Type>()
  .add(new TextRule(Type.Text, t => `${t}`))
  .add(new BlockRule(Type.Block, Type.Block, children => `[B]${children}[/B]`));

test('it works', t => {
  const text = 'foo Ba';
  const parser = new Parser(grammar, new TextRule(Type.Text, t => `${t}`));

  const tokens = tokenizer.tokenize(text);
  const tree = parser.parse(tokens);

  const expanded = tree.expand(text);

  t.is(expanded, 'foo Ba');
});
