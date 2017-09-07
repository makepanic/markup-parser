import RuleProperty from "./RuleProperty";
import Rule from "./Rule";
import TokenKind from "../token/TokenKind";

/**
 * Rule that wraps its children
 */
class BlockRule<T extends number> extends Rule<T> {
  constructor(
    open: T,
    close: T,
    display: (text: string) => string,
    kindOpen = TokenKind.Default,
    kindClosed = TokenKind.Default,
    occludes = false
  ) {
    super(
      open,
      close,
      RuleProperty.Block,
      text => display(text),
      kindOpen,
      kindClosed,
      occludes
    );
  }
}
export default BlockRule;
