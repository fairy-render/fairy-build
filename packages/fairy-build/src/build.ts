import { build as viteBuild } from "vite";
import { resolveRuntimeConfig } from "./config.js";
import { type Options, createConfig, loadConfig } from "./shared.js";

export default async function build(options: Options) {
  const cfg = await loadConfig(options.config);

  const config = resolveRuntimeConfig(await cfg.resolve(), options);

  const [clientCfg, serverCfg] = await Promise.all([
    createConfig(config, "client", "build"),
    createConfig(config, "server", "build"),
  ]);

  await viteBuild(clientCfg);
  await viteBuild(serverCfg);
}
