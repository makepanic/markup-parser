import Rule from "./rule/Rule";

/**
 * Class that represents a formatted node.
 * @class
 */
class Node {
  readonly rule: Rule;
  readonly start: number;
  readonly occluded: boolean = false;
  end: number;
  readonly children: Node[] = [];
  parentNode: Node = undefined;

  constructor(rule?: Rule, start?: number, end?: number, occluded?: boolean) {
    this.rule = rule;
    this.start = start;
    this.end = end;
    this.occluded = occluded;
  }

  /**
   * Appends a node to this nodes children.
   * @param {Node<T extends number>} node
   * @return {number}
   */
  appendChild(node: Node) {
    node.parentNode = this;
    return this.children.push(node);
  }

  /**
   * Recursively expands a given string with all of the nodes rules display function.
   * @param {string} string
   * @return {string}
   */
  expand(string: string): string {
    const tree = this;

    if (!tree.children.length) {
      if (tree.rule) {
        return tree.rule.display(string.substring(tree.start, tree.end), tree.occluded);
      } else {
        return "";
      }
    } else {
      let childString = tree.children
        .map(child => child.expand(string))
        .join("");

      if (tree.rule) {
        return tree.rule.display(childString, tree.occluded);
      } else {
        return childString;
      }
    }
  }
}

export default Node;
