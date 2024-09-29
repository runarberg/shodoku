export function hmrListener(event: string, url: string): string {
  const args = "{ name, contentHash, oldContentHash }";
  const oldHref = `${url}?hash=\${oldContentHash}#\${name}`;
  const selector = `\`use[href="${oldHref}"]\``;
  const href = `\`${url}?hash=\${contentHash}#\${name}\``;
  const loopBody = `el.setAttribute("href", ${href});`;
  const listener = `(${args}) => { for (const el of document.querySelectorAll(${selector})) { ${loopBody} } }`;

  return `import.meta.hot.on("${event}", ${listener});`;
}
