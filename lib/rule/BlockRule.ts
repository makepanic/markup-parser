import RuleProperty from "./RuleProperty";
import Rule, { DisplayFunction } from "./Rule";
import TokenKind from "../token/TokenKind";

/**
 * Rule that wraps its children
 */
class BlockRule extends Rule {
  constructor(
    open: number,
    close: number,
    display: DisplayFunction,
    kindOpen = TokenKind.Default,
    kindClosed = TokenKind.Default,
    occludes = false
  ) {
    super(
      open,
      close,
      RuleProperty.Block,
      display,
      kindOpen,
      kindClosed,
      occludes
    );
  }
}
export default BlockRule;
