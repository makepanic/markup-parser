# markup-parser

[![Build Status](https://travis-ci.org/makepanic/markup-parser.svg?branch=master)](https://travis-ci.org/makepanic/markup-parser)
[![Dependency Status](https://david-dm.org/makepanic/markup-parser.svg)](https://david-dm.org/makepanic/markup-parser)
[![Code Climate](https://codeclimate.com/github/makepanic/markup-parser.png)](https://codeclimate.com/github/makepanic/markup-parser)
[![npm version](https://badge.fury.io/js/markup-parser.svg)](https://www.npmjs.com/package/markup-parser)

[Live preview](https://makepanic.github.io/markup-parser/) of slack like markup.

A set of primitives for building string markup parsers.
See `markups/*.ts` for a setup that exports a tokenizer and parser to handle string formatting like slack does.
Check out `example.ts` to see how to use the tokenizer + parser with any given string input.

TODO: 
- docs

## Architecture

- String is processed in three steps:

1. Tokenizer(text) -> Token[]
2. Parser(Token[]) -> NodeTree
3. NodeTree(text) -> processed text
