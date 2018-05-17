import Token from "../lib/token/Token";
import Node from "../lib/Node";
import { MatchRange } from "../lib/Tokenizer";

interface IMarkup {
  types: any;
  findMatchRanges(string: string, ranges?: MatchRange[]): MatchRange[];
  matchTokens(string: string, ranges: MatchRange[]): Token[];
  tokenize(input: string): Token[];
  parse(tokens: Token[]): Node;
}

export default IMarkup;
