import Rule, {DisplayFunction} from "./Rule";
import RuleProperty from "./RuleProperty";

/**
 * Rule that runs its content through a transforming function
 */
class TextRule extends Rule {
  constructor(open: number, display: DisplayFunction) {
    super(open, undefined, RuleProperty.None, display);
  }
}

export default TextRule;
