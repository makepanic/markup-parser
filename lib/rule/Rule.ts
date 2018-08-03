import RuleProperty from "./RuleProperty";
import TokenKind from "../token/TokenKind";
import { TokenMeta } from "../token/TokenMeta";

export interface DisplayFunction {
  (string: string, occluded?: boolean, meta?: TokenMeta): string;
}

class Rule {
  readonly open: number;
  readonly openKind: TokenKind;
  readonly close: number;
  readonly closesKind: TokenKind;
  readonly display: DisplayFunction;
  readonly properties: RuleProperty;
  readonly occludes: boolean = false;

  constructor(
    open: number,
    close: number,
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
