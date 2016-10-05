interface DisplayFunction {
  (string): string;
}

class Rule<T extends number> {
  readonly open: T;
  readonly close: T;
  readonly blockForm: boolean = false;
  readonly display: DisplayFunction;

  constructor(open: T, close: T, blockForm: boolean, display: DisplayFunction) {
    this.blockForm = blockForm;
    this.display = display;
    this.open = open;
    this.close = close;
  }

  toString() {
    return `${this.blockForm ? 'Block' : 'Tag'}: ${this.open} ${this.close}`;
  }
}

class Block<T extends number> extends Rule<T> {
  constructor(open: T, close, display) {
    super(open, close, true, (text) => display(text));

  }
}
class Constant<T extends number> extends Rule<T> {
  constructor(open: T, display) {
    super(open, undefined, false, () => display);
  }
}

class Text<T extends number> extends Rule<T> {
  constructor(open: T, display) {
    super(open, undefined, false, (text) => display(text));
  }
}

export {Rule, Block, Constant, Text};
