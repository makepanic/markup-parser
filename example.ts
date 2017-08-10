import * as SlackLike from './examples/slack-like';
import TokenizerDebugger from "./lib/debug/TokenizerDebugger";

const input = <HTMLInputElement>document.querySelector('#example-input');
const type = <HTMLSelectElement>document.querySelector('#example-type');
const output = <HTMLDivElement>document.querySelector('#output');
const outputHTML = <HTMLDivElement>document.querySelector('#output-html');
const tokens = <HTMLDivElement>document.querySelector('#tokens');

input.oninput = () => {
  const exampleType = type.value;
  const exampleValue = input.value;
  let parsed = '';
  let visualized;

  switch (exampleType) {
    case 'slacklike': {
      const tokens = SlackLike.tokenizer.tokenize(exampleValue);
      const node = SlackLike.parser.parse(tokens);
      visualized = TokenizerDebugger.toHTMLElement(exampleValue, tokens);
      parsed = node.expand(exampleValue);
      break;
    }
  }

  output.innerHTML = parsed;
  outputHTML.innerText = parsed;

  if (visualized) {
    tokens.innerHTML = '';
    tokens.appendChild(visualized);
  }
};

export default true;
