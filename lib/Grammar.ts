import Rule from "./rule/Rule";

class Grammar {
  readonly rules: Rule[] = [];
  readonly ruleOpenLookup: { [key: number]: Rule[] } = {};

  constructor(public readonly newline: number) {}

  add(rule: Rule) {
    this.rules.push(rule);
    this.ruleOpenLookup[rule.open] = this.ruleOpenLookup[rule.open] || [];
    this.ruleOpenLookup[rule.open].push(rule);
    return this;
  }
}

export default Grammar;
