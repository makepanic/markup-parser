import Rule from "./Rule";
import RuleProperty from "../RuleProperty";

class TextRule<T extends number> extends Rule<T> {
  constructor(open: T, display) {
    super(open, undefined, RuleProperty.None, (text) => display(text));
  }
}

export default TextRule;
