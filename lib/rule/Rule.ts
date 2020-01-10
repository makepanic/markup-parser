import RuleProperty from "./RuleProperty";
import TokenKind from "../token/TokenKind";
import { TokenMeta } from "../token/TokenMeta";

export interface DisplayFunction {
  (string: string, occluded?: boolean, meta?: TokenMeta): string;
}

class Rule {
  constructor(
    readonly open: number,
    readonly close: number,
    readonly properties: RuleProperty,
    readonly display: DisplayFunction,
    readonly openKind = TokenKind.Default,
    readonly closesKind = TokenKind.Default,
    readonly occludes = false,
    readonly multiline = true
  ) {}
}

export default Rule;
