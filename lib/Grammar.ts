import Rule from "./rule/Rule";

class Grammar<T extends number> {
  readonly rules: Array<Rule<T>> = [];
  readonly ruleOpenLookup: { [key: number]: Array<Rule<T>> } = {};

  add(rule: Rule<T>) {
    this.rules.push(rule);
    this.ruleOpenLookup[+rule.open] = this.ruleOpenLookup[+rule.open] || [];
    this.ruleOpenLookup[+rule.open].push(rule);
    return this;
  }
}

export default Grammar;
