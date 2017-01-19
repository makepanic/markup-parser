import Token from "../lib/Token";
import TokenKind from "../lib/TokenKind";

class TokenizerDebugger<T extends number> {
  toHTMLElement(text: string, tokens: Array<Token<T>>) {
    const p = document.createElement('div');
    p.className = 'tokens';
    tokens.forEach((token) => {
      const tokenDiv = document.createElement('div');
      tokenDiv.className = `token token--${token.id} token--kind-${token.kind}`;
      const tokenHead = document.createElement('div');
      tokenHead.className = 'token__head';
      let tokenKindStrings = [];
      tokenKindStrings.push(token.kind & TokenKind.Default ? 'Default' : undefined);
      tokenKindStrings.push(token.kind & TokenKind.Opens ? 'Opens' : undefined);
      tokenKindStrings.push(token.kind & TokenKind.Closes ? 'Closes' : undefined);
      tokenHead.innerText = `${token.id} ${tokenKindStrings.filter(Boolean).join('|')}`;
      tokenDiv.appendChild(tokenHead);

      const tokenText = document.createElement('div');
      tokenText.className = 'token__text';
      tokenText.innerHTML = `${text.substring(token.start, token.end)}&nbsp;`;
      tokenDiv.appendChild(tokenText);
      p.appendChild(tokenDiv);
    });

    return p;
  }
}

export default TokenizerDebugger;
