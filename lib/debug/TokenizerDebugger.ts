import Token from "../token/Token";
import TokenKind from "../token/TokenKind";

class TokenizerDebugger {
  static toHTMLElement<T extends number>(
    text: string,
    tokens: Array<Token<T>>
  ): HTMLElement | undefined {
    if (typeof document === "undefined") {
      console.warn("toHTMLElement requires document");
      return;
    }

    const p = document.createElement("div");
    p.className = "tokens";
    tokens.forEach(token => {
      const tokenDiv = document.createElement("div");
      tokenDiv.className = `token token--${token.id} token--kind-${token.kind}`;
      const tokenHead = document.createElement("div");
      tokenHead.className = "token__head";
      let tokenKindStrings = [];
      tokenKindStrings.push(
        token.kind & TokenKind.Default ? "Default" : undefined
      );
      tokenKindStrings.push(token.kind & TokenKind.Opens ? "Opens" : undefined);
      tokenKindStrings.push(
        token.kind & TokenKind.Closes ? "Closes" : undefined
      );
      tokenHead.innerText = `${token.id} ${tokenKindStrings
        .filter(Boolean)
        .join("|")}`;
      tokenDiv.appendChild(tokenHead);

      const tokenText = document.createElement("div");
      tokenText.className = "token__text";
      tokenText.innerHTML = `${text.substring(token.start, token.end)}&nbsp;`;
      tokenDiv.appendChild(tokenText);
      p.appendChild(tokenDiv);
    });

    return p;
  }
}

export default TokenizerDebugger;
