import RuleProperty from "../RuleProperty";

interface DisplayFunction {
  (string): string;
}

class Rule<T extends number> {
  readonly open: T;
  readonly close: T;
  readonly display: DisplayFunction;
  readonly properties: RuleProperty;

  constructor(open: T, close: T, properties: RuleProperty, display: DisplayFunction) {
    this.properties = properties;
    this.display = display;
    this.open = open;
    this.close = close;
  }

  toString() {
    return `${(this.properties & RuleProperty.Block) ? 'Block' : 'Tag'}: ${this.open} ${this.close}`;
  }
}

export default Rule;
