import {Rule} from "./rule";

class Node<T extends number> {
  readonly rule: Rule<T>;
  readonly start: number;
  readonly end: number;
  children: Array<Node<T>>;
  parentNode: Node<T>;

  constructor(rule?, start?, end?) {
    this.rule = rule;
    this.start = start;
    this.end = end;
    this.children = [];
    this.parentNode = undefined;
  }

  appendChild(node: Node<T>) {
    node.parentNode = this;
    return this.children.push(node);
  }

  expand(string: string): string {
    const tree = this;
    if (!tree.children.length) {
      if (tree.rule) {
        return tree.rule.display(string.substring(tree.start, tree.end));
      } else {
        return '';
      }
    } else {
      let childString = tree.children.map(child => child.expand(string)).join('');

      if (tree.rule) {
        return tree.rule.display(childString);
      } else {
        return childString;
      }
    }
  }
}

export default Node;
