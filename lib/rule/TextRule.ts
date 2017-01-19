import Rule from "./Rule";
import RuleProperty from "../RuleProperty";
import TokenKind from "../TokenKind";

class TextRule<T extends number> extends Rule<T> {
  constructor(open: T, display: (text: string) => string) {
    super(open, undefined, RuleProperty.None, (text) => display(text));
  }
}

export default TextRule;
