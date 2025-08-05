import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { Config as SvgoConfig } from "svgo";
import { createFilter, Plugin, ResolvedConfig } from "vite";

import { generate, hexDigest } from "./generate";
import { hmrListener } from "./hmr";

const _dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : dirname(fileURLToPath(import.meta.url));

type Options = {
  output?: string;
  include?: string;
  exclude?: string;
  svgo?: SvgoConfig;
};

export default function createSvgSpritePlugin(
  source: string,
  {
    output = "sprite.svg",
    include = "**/*.svg",
    exclude,
    svgo: svgoConfig,
  }: Options = {},
): Plugin {
  const virtualModuleId = "virtual:svg-sprite";
  const resolvedVirtualModuleId = `\0${virtualModuleId}`;

  const filter = createFilter(include, exclude);
  const absoluteSource = resolve(_dirname, "..", "..", source);

  let config: ResolvedConfig | null = null;
  let devServerSpriteUrl = "";
  let svgContent = "";
  let contentHash = "";

  return {
    name: "svg-sprite",

    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },

    configResolved(resolvedConfig) {
      // store the resolved config
      config = resolvedConfig;
    },

    configureServer(server) {
      devServerSpriteUrl = `${server.config.base}assets/${output}`;

      server.middlewares.use((req, res, next) => {
        if (
          req.method === "GET" &&
          req.url === `${devServerSpriteUrl}?hash=${contentHash}`
        ) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "image/svg+xml");
          res.write(svgContent, "utf-8");
          res.end();
        } else {
          next();
        }
      });
    },

    async handleHotUpdate({ file, server }) {
      if (file.includes(absoluteSource) && filter(file)) {
        const oldContentHash = contentHash;

        svgContent = await generate(absoluteSource, { filter, svgoConfig });
        // eslint-disable-next-line require-atomic-updates
        contentHash = await hexDigest(svgContent);

        server.ws.send({
          type: "custom",
          event: "svg-sprite:update",
          data: { name: basename(file, ".svg"), contentHash, oldContentHash },
        });
      }
    },

    async load(id) {
      if (id !== resolvedVirtualModuleId) {
        return;
      }

      svgContent = await generate(absoluteSource, { filter, svgoConfig });
      contentHash = await hexDigest(svgContent);

      if (config?.command === "serve") {
        const listener = hmrListener("svg-sprite:update", devServerSpriteUrl);
        const exports = `export default "${devServerSpriteUrl}?hash=${contentHash}"`;

        return `${listener} ${exports}`;
      }

      const referenceId = this.emitFile({
        type: "asset",
        name: output,
        source: svgContent,
      });

      return `export default import.meta.ROLLUP_FILE_URL_${referenceId};`;
    },
  };
}
