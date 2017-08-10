# markup-parser

[![Build Status](https://travis-ci.org/makepanic/markup-parser.svg?branch=master)](https://travis-ci.org/makepanic/markup-parser)

A set of primitives for building string markup parsers.
See `examples/*.ts` for a setup that exports a tokenizer and parser to handle string formatting like slack does.
Check out `example.ts` to see how to use the tokenizer + parser with any given string input.

TODO: 
- docs
- allow Rules to guard child rules from being parsed (i.e. code block shouldn't parse its content)

## Architecture

- String is processed in three steps:

1. Tokenizer(text) -> Array<Token>
2. Parser(Array<Token>) -> NodeTree
3. NodeTree(text) -> processed text

## Examples

- run `npm start`
