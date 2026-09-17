// Resuelve el alias `@/` de tsconfig para scripts de Node con TypeScript
// (`node --import ./scripts/alias-src.mjs script.ts`). Solo para ficheros
// .ts sin JSX: los scripts leen contenido, no componentes.
import { registerHooks } from "node:module";
import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";

const SRC = path.resolve(import.meta.dirname, "../src");

registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith("@/")) {
      const base = path.join(SRC, specifier.slice(2));
      for (const f of [`${base}.ts`, path.join(base, "index.ts"), base]) {
        if (existsSync(f)) return next(pathToFileURL(f).href, context);
      }
    }
    return next(specifier, context);
  },
});
