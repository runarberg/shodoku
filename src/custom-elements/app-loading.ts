import loadingIcon from "../assets/loading.svg?raw";

const style = new CSSStyleSheet();
style.replaceSync(`
svg {
  block-size: 1em;
  fill: currentColor;
  inline-size: 1em;
}
`);

class CAppLoadingElement extends HTMLElement {
  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: "open" });

    shadowRoot.adoptedStyleSheets = [style];
    shadowRoot.innerHTML = loadingIcon;
  }
}

customElements.define("c-app-loading", CAppLoadingElement);
