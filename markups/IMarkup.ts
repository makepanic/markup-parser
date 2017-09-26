import Token from "../lib/token/Token";
import Node from "../lib/Node";

interface IMarkup {
  types: any;
  tokenize(input: string): Array<Token>;
  parse(tokens: Array<Token>): Node;
}

export default IMarkup;
