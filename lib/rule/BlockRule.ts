import RuleProperty from "./RuleProperty";
import Rule from "./Rule";
import TokenKind from "../token/TokenKind";

/**
 * Rule that wraps its children
 */
class BlockRule<T extends number> extends Rule<T> {
  constructor(open: T, close: T, display: (text: string) => string, kindOpen = TokenKind.Default, kindClosed = TokenKind.Default) {
    super(open, close, RuleProperty.Block, (text) => display(text), kindOpen, kindClosed);
  }
}
export default BlockRule;
