import RuleProperty from "../RuleProperty";
import Rule from "./Rule";

class BlockRule<T extends number> extends Rule<T> {
  constructor(open: T, close, display) {
    super(open, close, RuleProperty.Block, (text) => display(text));

  }
}
export default BlockRule;
