import Path from "node:path";
import fairyPlugin from "@fairy-render/vite-plugin";
import { type InlineConfig, type PluginOption, mergeConfig } from "vite";
import { type Entry, FairyConfig, type RuntimeOptions } from "./config.js";
import { type EntryPoint, isEntry, resolvePresets } from "./config.js";
import type { Cmd } from "./presets.js";

export async function loadConfig(path?: string): Promise<FairyConfig> {
  let configPath: string | undefined;
  if (path && Path.isAbsolute(path)) {
    configPath = path;
  } else {
    configPath = Path.resolve(process.cwd(), "fairy.config.js");
  }

  const output = await import(configPath);

  if (!output?.default || !(output.default instanceof FairyConfig)) {
    throw new Error("invalid config");
  }

  return output.default;
}

export function resolveUserInput(entry: EntryPoint, kind: "client" | "server") {
  if (typeof entry === "string") return entry;
  if (isEntry(entry)) {
    return entry[kind];
  }

  const out: Record<string, string> = {};
  for (const k in entry) {
    const v = entry[k];
    out[k] = isEntry(v) ? v[kind] : v;
  }

  return out;
}

export async function createConfig(
  cfg: RuntimeOptions,
  kind: "client" | "server",
  cmd: Cmd,
): Promise<InlineConfig> {
  const presets = await resolvePresets(cmd, cfg.preset);

  const mode = cmd === "build" ? "production" : "development";

  const opts = {
    configFile: false,
    root: cfg.root,
    base: cfg.base,
    resolve: cfg.alias ? { alias: cfg.alias } : void 0,
    build: {
      ssr: kind === "server" && cmd === "build",
      rollupOptions: {
        input: resolveUserInput(cfg.entry, kind),
      },
      minify: cfg.minify ?? (kind === "client" && mode === "production"),
      assetsDir: cfg.assets,
      outDir: cfg.outputDir,
    },
    define: {
      "process.env.NODE_ENV": JSON.stringify(mode),
      "process.env.API_SERVER": JSON.stringify(cfg.apiServer ?? "/"),
      "import.meta.env.API_SERVER": JSON.stringify(cfg.apiServer ?? "/"),
    },
    server: cmd === "watch" ? { port: cfg.port } : void 0,
    plugins: [
      fairyPlugin() as PluginOption,
      ...presets,
      ...(cfg.plugins ?? []),
    ],
  } satisfies InlineConfig;

  if (cfg.viteOptions) {
    return mergeConfig(cfg.viteOptions, opts);
  }
  return opts;
}

export interface Options {
  config?: string;
  workDir?: string;
  mode?: string;
  port: string;
  apiServer?: string;
}

export function createRuntimeConfigJson(cfg: RuntimeOptions) {
  const entry = cfg.entry;

  let entries: Record<string, Entry> | Entry = {};

  if (typeof entry === "string") {
    throw new Error("server");
  }
  if (isEntry(entry)) {
    entries = entry;
  } else {
    for (const k in entry) {
      entries[k] = entry[k] as Entry;
    }
  }

  const opts = {
    workDir: cfg.root,
    root: cfg.outputDir,
    entries,
    base: cfg.base,
    port: cfg.port,
    assets: cfg.assets,
    assetsPath: `/${cfg.assets}`,
    clientManifest: "client/.vite/manifest.json",
    serverManifest: "server/.vite/manifest.json",
    ssrManifest: "client/.vite/ssr-manifest.json",
  };

  return opts;
}
