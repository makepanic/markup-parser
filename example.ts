import SlackLike from "./markups/SlackLike";
import TokenizerDebugger from "./lib/debug/TokenizerDebugger";
import IMarkup from "./markups/IMarkup";

const input = <HTMLInputElement>document.querySelector("#example-input");
const type = <HTMLSelectElement>document.querySelector("#example-type");
const output = <HTMLDivElement>document.querySelector("#output");
const outputHTML = <HTMLDivElement>document.querySelector("#output-html");
const tokens = <HTMLDivElement>document.querySelector("#tokens");

const markups: { [name: string]: IMarkup<any> } = {
  slacklike: new SlackLike()
};

function handleInput() {
  const exampleType = type.value;
  const exampleValue = input.value;
  let parsed = "";
  let visualized;

  if (markups[exampleType]) {
    let markup = markups[exampleType];
    const tokens = markup.tokenize(exampleValue);
    visualized = TokenizerDebugger.toHTMLElement(exampleValue, tokens);
    parsed = markup.parse(tokens).expand(exampleValue);
  }

  output.innerHTML = parsed;
  outputHTML.innerText = parsed;

  if (visualized) {
    tokens.innerHTML = "";
    tokens.appendChild(visualized);
  }
}

input.oninput = () => handleInput();

input.value = "*bold* _italics_ ~strike~ `code` ```preformatted``` >quote";
handleInput();

export default true;
