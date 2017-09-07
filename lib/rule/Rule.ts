import RuleProperty from "./RuleProperty";
import TokenKind from "../token/TokenKind";

export interface DisplayFunction {
  (string: string): string;
}

class Rule<T extends number> {
  readonly open: T;
  readonly openKind: TokenKind;
  readonly close: T;
  readonly closesKind: TokenKind;
  readonly display: DisplayFunction;
  readonly properties: RuleProperty;
  readonly occludes: boolean = false;

  constructor(
    open: T,
    close: T,
    properties: RuleProperty,
    display: DisplayFunction,
    openKind = TokenKind.Default,
    closesKind = TokenKind.Default,
    occludes = false
  ) {
    this.properties = properties;
    this.display = display;
    this.open = open;
    this.close = close;
    this.openKind = openKind;
    this.closesKind = closesKind;
    this.occludes = occludes;
  }
}

export default Rule;
