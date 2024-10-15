import { webcrypto as crypto } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { basename, resolve } from "node:path";

import { Config as SvgoConfig, optimize } from "svgo";

type GenerateOptions = {
  filter(file: string): boolean;
  svgoConfig?: SvgoConfig;
};

export async function generate(
  source: string,
  { filter, svgoConfig = {} }: GenerateOptions
): Promise<string> {
  let svg = `<?xml version="1.0" encoding="utf-8"?><svg xmlns="http://www.w3.org/2000/svg">`;

  for (const filename of await readdir(source)) {
    if (!filter(filename)) {
      continue;
    }

    const icon = basename(filename, ".svg");
    const path = resolve(source, filename);
    try {
      const content = await readFile(path, "utf-8");
      const optimized = optimize(content, { path, ...svgoConfig });

      const symbol = optimized.data
        .replace(/^<svg/, `<symbol id="${icon}"`)
        .replace(/<\/svg>$/, "</symbol>");

      svg += symbol;
    } catch {
      // pass
    }
  }

  svg += "</svg>";

  return svg;
}

export async function hexDigest(content: string): Promise<string> {
  const textEncoder = new TextEncoder();
  const hash = await crypto.subtle.digest("SHA-1", textEncoder.encode(content));

  return Array.from(new Uint8Array(hash.slice(0, 4)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
