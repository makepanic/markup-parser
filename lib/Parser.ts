import RuleProperty from "./rule/RuleProperty";
import Grammar from "./Grammar";
import Node from "./Node";
import Rule from "./rule/Rule";
import Token from "./token/Token";
import TokenKind from "./token/TokenKind";

export interface PeekResult<T extends number> {
  idx: number;
  token: Token<T>;
}

class Parser<T extends number> {
  private grammar: Grammar<T>;
  private fallbackRule: Rule<T>;

  constructor(grammar: Grammar<T>, fallbackRule: Rule<T>) {
    this.grammar = grammar;
    this.fallbackRule = fallbackRule;
  }

  peek(
    type: T,
    tokenKind: TokenKind,
    tokens: Array<Token<T>>
  ): PeekResult<T> | undefined {
    let idx = -1;
    let token;

    for (let i = 0; i < tokens.length; i++) {
      const { id, kind } = tokens[i];
      if (type === id && (kind === tokenKind || kind & tokenKind)) {
        idx = i;
        token = tokens[i];
        break;
      }
    }

    return idx !== -1 ? { idx, token } : undefined;
  }

  openRules(token: Token<T>): Array<Rule<T>> {
    return (this.grammar.ruleOpenLookup[+token.id] || [])
      .filter(rule => rule.openKind & token.kind);
  }

  fallbackNode(token: Token<T>) {
    return new Node<T>(this.fallbackRule, token.start, token.end);
  }

  parse(tokens: Array<Token<T>>, parent = new Node<T>()): Node<T> {
    for (let index = 0; index < tokens.length; index++) {
      let token = tokens[index];
      if (token.consumed) {
        continue;
      }

      const rules = this.openRules(token);

      for (let ruleIndex = 0; ruleIndex < rules.length; ruleIndex++) {
        const rule = rules[ruleIndex];

        if (token.consumed) {
          continue;
        }

        if (rule.properties === RuleProperty.Block) {
          // block rule
          const closing = this.peek(
            rule.close,
            rule.closesKind,
            tokens.slice(index + 1)
          );

          if (closing === undefined) {
            if (ruleIndex - 1 === rules.length) {
              // TODO: check if this can be reached with terminator
              // no closing rule, create text node
              token.consumed = true;
              parent.appendChild(this.fallbackNode(token));
            }
          } else {
            // create node from token start to closing end
            token.consumed = true;
            closing.token.consumed = true;
            const node = new Node<T>(rule, token.start, closing.token.end);

            if (rule.occludes) {
              // occluded tokens create a fallback rule in range
              tokens
                .slice(index + 1, index + 1 + closing.idx)
                .forEach(token => (token.consumed = true));

              node.appendChild(
                new Node<T>(this.fallbackRule, token.end, closing.token.start)
              );
            } else {
              this.parse(
                tokens.slice(index + 1, index + 1 + closing.idx),
                node
              );
            }

            parent.appendChild(node);
          }
        } else {
          // is tagRule
          token.consumed = true;
          const node = new Node<T>(rule, token.start, token.end);
          parent.appendChild(node);
        }
      }

      if (!token.consumed) {
        token.consumed = true;
        const previousChild = parent.children[parent.children.length - 1];

        if (previousChild && previousChild.rule === this.fallbackRule) {
          // if previous node is fallbackRule, simply extend end to current token end to avoid additional node
          previousChild.end = token.end;
        } else {
          parent.appendChild(this.fallbackNode(token));
        }
      }
    }

    return parent;
  }
}

export default Parser;
