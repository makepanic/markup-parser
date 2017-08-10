import Token from "../lib/token/Token";
import Node from "../lib/Node";

interface IMarkup<T extends number> {
  tokenize(input: string): Array<Token<T>>;
  parse(tokens: Array<Token<T>>): Node<T>;
}

export default IMarkup;
