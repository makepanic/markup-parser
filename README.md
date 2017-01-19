# markup-parser

[![Build Status](https://travis-ci.org/makepanic/markup-parser.svg?branch=master)](https://travis-ci.org/makepanic/markup-parser)

A set of primitives for building string markup parsers.
See `example.ts` for a simple render function that takes a string and applies slack like rules to 
transform it into an html string.

TODO: 
- docs
- allow Rules to guard child rules from being parsed (i.e. code block shouldn't parse its content)
