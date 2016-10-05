import {Rule} from './rule';

class Grammar<T extends number> {
  rules: Array<Rule<T>>;
  ruleOpenLookup: {[key: number]: Array<Rule<T>>} = {};

  constructor() {
    this.rules = [];
    this.ruleOpenLookup = {};
  }

  add(rule: Rule<T>) {
    this.rules.push(rule);
    this.ruleOpenLookup[+rule.open] = this.ruleOpenLookup[+rule.open] || [];
    this.ruleOpenLookup[+rule.open].push(rule);
    return this;
  }
}

export default Grammar;
