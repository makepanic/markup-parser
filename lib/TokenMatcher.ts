const returnTrue = () => true;

interface ConstraintFunction {
  (string: string, match): boolean;
}

class TokenMatcher<T extends number> {
  readonly regex: RegExp;
  readonly id: T;
  readonly constraint: ConstraintFunction;

  constructor(regex: RegExp, id: T, constraint: ConstraintFunction = returnTrue) {
    this.regex = regex;
    this.id = id;
    this.constraint = constraint;
    return this;
  }
}

export default TokenMatcher;
