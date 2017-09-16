import SlackLike from "./markups/SlackLike";
import TokenizerDebugger from "./lib/debug/TokenizerDebugger";
import NodeDebugger from "./lib/debug/NodeDebugger";
import IMarkup from "./markups/IMarkup";

const input = <HTMLInputElement>document.querySelector("#example-input");
const type = <HTMLSelectElement>document.querySelector("#example-type");
const output = <HTMLDivElement>document.querySelector("#output");
const outputHTML = <HTMLDivElement>document.querySelector("#output-html");
const outputTree = <HTMLDivElement>document.querySelector("#output-tree");
const tokens = <HTMLDivElement>document.querySelector("#tokens");

const markups: { [name: string]: IMarkup<any> } = {
  slacklike: new SlackLike()
};

function handleInput() {
  const exampleType = type.value;
  const exampleValue = input.value;
  let parsed = "";
  let visualizedTokens;
  let visualizedTree;

  if (markups[exampleType]) {
    let markup = markups[exampleType];
    const tokens = markup.tokenize(exampleValue);
    const node = markup.parse(tokens);

    visualizedTree = NodeDebugger.toHTMLElement(exampleValue, node, outputTree.offsetWidth, 500);
    visualizedTokens = TokenizerDebugger.toHTMLElement(exampleValue, tokens);

    parsed = node.expand(exampleValue);
  }

  output.innerHTML = parsed;
  outputHTML.innerText = parsed;

  if (visualizedTokens) {
    tokens.innerHTML = "";
    tokens.appendChild(visualizedTokens);
  }

  if (visualizedTree) {
    outputTree.innerHTML = '';
    outputTree.appendChild(visualizedTree);
  }
}

input.oninput = () => handleInput();

input.value = "*bold* _italics_ ~strike~ `code` ```preformatted``` >quote";
handleInput();



export default true;
