# markup-parser

[![Build Status](https://travis-ci.org/makepanic/markup-parser.svg?branch=master)](https://travis-ci.org/makepanic/markup-parser)

[Live preview](https://makepanic.github.io/markup-parser/) of slack like markup.

A set of primitives for building string markup parsers.
See `markups/*.ts` for a setup that exports a tokenizer and parser to handle string formatting like slack does.
Check out `example.ts` to see how to use the tokenizer + parser with any given string input.

TODO: 
- docs

## Architecture

- String is processed in three steps:

1. Tokenizer(text) -> Array<Token>
2. Parser(Array<Token>) -> NodeTree
3. NodeTree(text) -> processed text
