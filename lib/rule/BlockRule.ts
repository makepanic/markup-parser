import RuleProperty from "../RuleProperty";
import Rule from "./Rule";
import TokenKind from "../TokenKind";

class BlockRule<T extends number> extends Rule<T> {
  constructor(open: T, close: T, display: (text: string) => string, kindOpen = TokenKind.Opens, kindClosed = TokenKind.Closes) {
    super(open, close, RuleProperty.Block, (text) => display(text), kindOpen, kindClosed);
  }
}
export default BlockRule;
