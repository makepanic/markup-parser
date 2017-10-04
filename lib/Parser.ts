import RuleProperty from "./rule/RuleProperty";
import Grammar from "./Grammar";
import Node from "./Node";
import Rule from "./rule/Rule";
import Token from "./token/Token";
import TokenKind from "./token/TokenKind";

export interface PeekResult {
  idx: number;
  token: Token;
}

class Parser {
  private grammar: Grammar;
  private fallbackRule: Rule;

  constructor(grammar: Grammar, fallbackRule: Rule) {
    this.grammar = grammar;
    this.fallbackRule = fallbackRule;
  }

  /**
   * Find a token that matches type and kind in a given list of tokens
   * @param {T} type
   * @param {TokenKind} tokenKind
   * @param {Array<Token<T extends number>>} tokens
   * @return {PeekResult<T extends number>}
   */
  peek(
    type: number,
    tokenKind: TokenKind,
    tokens: Array<Token>,
    from: number,
    until: number
  ): PeekResult | undefined {
    let idx = -1;
    let token;

    for (let i = from; i < until; i++) {
      const { id, kind } = tokens[i];
      if (type === id && (kind === tokenKind || kind & tokenKind)) {
        idx = i - from;
        token = tokens[i];
        break;
      }
    }

    return idx !== -1 ? { idx, token } : undefined;
  }

  /**
   * Method that returns all opening rules for a given token.
   * @param {Token<T extends number>} token
   * @return {Array<Rule<T extends number>>}
   */
  openRules(token: Token): Array<Rule> {
    return (this.grammar.ruleOpenLookup[+token.id] || [])
      .filter(rule => rule.openKind & token.kind);
  }

  /**
   * Method that creates a node, using the fallbackRule, based on a given token.
   * @param {Token<T extends number>} token
   * @return {Node<T extends number>}
   */
  fallbackNode(token: Token) {
    return new Node(this.fallbackRule, token.start, token.end);
  }

  /**
   * Method that builds a tree out of a list of tokens.
   * @param {Array<Token<T extends number>>} tokens
   * @param {Node<T extends number>} parent
   * @return {Node<T extends number>}
   */
  parse(tokens: Array<Token>, from: number = 0, until: number = tokens.length, parent = new Node()): Node {
    for (let index = from; index < until; index++) {
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
            tokens,
            index + 1,
            until
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
            const node = new Node(rule, token.start, closing.token.end);

            if (rule.occludes) {
              // occluded tokens create a fallback rule in range
              tokens
                .slice(index + 1, index + 1 + closing.idx)
                .forEach(token => (token.consumed = true));

              node.appendChild(
                new Node(this.fallbackRule, token.end, closing.token.start)
              );
            } else {
              this.parse(
                tokens,
                index + 1,
                index + 1 + closing.idx,
                node
              );
            }

            parent.appendChild(node);
          }
        } else {
          // is tagRule
          token.consumed = true;
          const node = new Node(rule, token.start, token.end);
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
