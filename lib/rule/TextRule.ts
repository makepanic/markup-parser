import Rule from "./Rule";
import RuleProperty from "./RuleProperty";

/**
 * Rule that runs its content through a transforming function
 */
class TextRule extends Rule {
  constructor(open: number, display: (text: string) => string) {
    super(open, undefined, RuleProperty.None, text => display(text));
  }
}

export default TextRule;
