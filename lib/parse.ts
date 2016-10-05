import Node from './node';
import Grammar from "./grammar";
import {Rule} from "./rule";
import {Token} from "./tokenizer";

interface PeekResult<T extends number> {
  idx: number,
  token: Token<T>
}

class Parser<T extends number> {
  private grammar: Grammar<T>;
  private fallbackRule: Rule<T>;

  constructor(grammar: Grammar<T>) {
    this.grammar = grammar;
    this.fallbackRule = undefined;
  }

  withFallbackRule(rule: Rule<T>) {
    this.fallbackRule = rule;
    return this;
  }

  peek(type: T, tokens: Array<Token<T>>): PeekResult<T> | undefined {
    let idx = -1;
    let token;

    for (let i = 0; i < tokens.length; i++) {
      const {format} = tokens[i];
      if (type === format.id) {
        idx = i;
        token = tokens[i];
        break;
      }
    }

    return idx !== -1 ? {idx, token} : undefined;
  }

  openRules(token: Token<T>): Array<Rule<T>> {
    return this.grammar.ruleOpenLookup[+token.format.id] || [];
  }

  fallbackNodeForToken(token: Token<T>) {
    return new Node<T>(this.fallbackRule, token.start, token.end);
  }

  parse(tokens: Array<Token<T>>, parent = new Node<T>(), level = 0): Node<T> {
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
        if (rule.blockForm) {
          const closing = this.peek(rule.close, tokens.slice(index + 1));

          if (closing === undefined) {
            if ((ruleIndex - 1 ) === rules.length) {
              // no closing rule, create text node
              token.consumed = true;
              parent.appendChild(this.fallbackNodeForToken(token));
            }
          } else {
            // create node from token start to closing end
            token.consumed = true;
            closing.token.consumed = true;
            const node = new Node<T>(rule, token.start, closing.token.end);
            this.parse(tokens.slice(index + 1, index + 1 + closing.idx), node, level + 1);
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
        parent.appendChild(this.fallbackNodeForToken(token));
      }
    }

    return parent;
  }

}

export default Parser;
