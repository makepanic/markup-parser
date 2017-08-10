import RuleProperty from "./RuleProperty";
import Rule from "./Rule";

/**
 * Rule that returns a constant value
 */
class ConstantRule<T extends number> extends Rule<T> {
  constructor(open: T, display: string) {
    super(open, undefined, RuleProperty.None, () => display);
  }
}

export default ConstantRule;
