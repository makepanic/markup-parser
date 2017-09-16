import Node from "../Node";

function nest<T extends number>(
  string: string,
  node: Node<T>,
  parentNode: HTMLElement
) {
  const wrapper = document.createElement("div");
  const content = document.createElement("div");

  if (!node.parentNode) {
    wrapper.classList.add("node--root");
  }

  wrapper.classList.add("node");
  content.className = "node__content";
  wrapper.appendChild(content);

  if (node.rule) {
    const opens = document.createElement("div");
    opens.className = `node__rule node__rule--open node__rule--${node.rule
      .open}`;
    opens.innerText = `${node.rule.open}`;
    content.appendChild(opens);
  }

  if (node.children.length) {
    const children = document.createElement("div");
    children.className = "node__children";
    node.children.forEach(childNode => {
      nest(string, childNode, children);
    });
    content.appendChild(children);
  } else {
    // create text
    const text = document.createElement("div");
    text.className = "node__text";
    text.innerText = string.substring(node.start, node.end);
    content.appendChild(text);
  }

  if (node.rule && node.rule.close >= 0) {
    const closes = document.createElement("div");
    closes.className = `node__rule node__rule--open node__rule--${node.rule
      .close}`;
    closes.innerText = `${node.rule.close}`;
    content.appendChild(closes);
  }

  parentNode.appendChild(wrapper);
}

class NodeDebugger {
  static toHTMLElement<T extends number>(
    string: string,
    node: Node<T>,
    width: number,
    height: number
  ): HTMLElement | undefined {
    if (typeof document === "undefined") {
      console.warn("toHTMLElement requires document");
      return;
    }

    const root = document.createElement("div");

    nest(string, node, root);

    return root;
  }
}

export default NodeDebugger;
