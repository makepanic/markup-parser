import Rule from "./Rule";
import RuleProperty from "./RuleProperty";

/**
 * Rule that runs its content through a transforming function
 */
class TextRule<T extends number> extends Rule<T> {
  constructor(open: T, display: (text: string) => string) {
    super(open, undefined, RuleProperty.None, text => display(text));
  }
}

export default TextRule;
