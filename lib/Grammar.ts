import Rule from "./rule/Rule";

class Grammar {
  readonly rules: Array<Rule> = [];
  readonly ruleOpenLookup: { [key: number]: Array<Rule> } = {};

  add(rule: Rule) {
    this.rules.push(rule);
    this.ruleOpenLookup[+rule.open] = this.ruleOpenLookup[+rule.open] || [];
    this.ruleOpenLookup[+rule.open].push(rule);
    return this;
  }
}

export default Grammar;
