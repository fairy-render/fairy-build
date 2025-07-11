import Path from "node:path";
import type { ConfigEnv, Plugin } from "vite";

const defaultExtensions = [
  "js",
  "cjs",
  "ts",
  "tsx",
  "jsx",
  "mjs",
  "mts",
  "mtsx",
];

export interface Options {
  extensions?: string[];
  include?: string[];
  exclude?: string[];
}

export default function ({
  extensions = defaultExtensions,
}: Options = {}): Plugin {
  const filterRe = new RegExp(`\\.(?:${extensions.join("|")})$`);

  let environ: ConfigEnv;

  const resolveDir = (env: ConfigEnv, ssr: boolean, path?: string) => {
    const sec = ssr ? "server" : "client";
    return path ? Path.join(path, sec) : Path.join("dist", sec);
  };

  return {
    name: "FairyImport",
    config(config, env) {
      const ssr = env.isSsrBuild || (env as any).isSsrBuild;
      return {
        ssr: {
          noExternal: true,
        },
        build: {
          manifest: true,
          ssrManifest: !ssr,
          outDir: resolveDir(env, ssr, config.build?.outDir),
        },
      };
    },

    renderDynamicImport(options) {
      if (
        !options.targetModuleId ||
        !(environ.isSsrBuild || (environ as any).isSsrBuild)
      )
        return;
      const key = options.targetModuleId
        ?.replace(process.cwd(), "")
        .substring(1);

      // return {
      // 	left: "Fairy.import(() => import(",
      // 	right: `), "${key}")`,
      // };
      return {
        left: "import(",
        right: `).then((mod) => ({default: mod.default, __fairy_key: "${key}"}))`,
      };
    },
    apply(config, env) {
      environ = env;
      return env.command === "build";
    },
  };
}
