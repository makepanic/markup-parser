import RuleProperty from "./RuleProperty";
import Rule from "./Rule";

/**
 * Rule that returns a constant value
 */
class ConstantRule extends Rule {
  constructor(open: number, display: string) {
    super(open, undefined, RuleProperty.None, () => display);
  }
}

export default ConstantRule;
