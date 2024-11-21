import { createServer } from "vite";
import { resolveRuntimeConfig } from "./config.js";
import { type Options, createConfig, loadConfig } from "./shared.js";

export default async function watch(options: Options) {
  const cfg = await loadConfig(options.config);

  const config = await createConfig(
    resolveRuntimeConfig(await cfg.resolve(), options),
    "client",
    "watch",
  );

  const server = await createServer(config);

  await server.listen();

  server.printUrls();
  server.bindCLIShortcuts({ print: true });
}
