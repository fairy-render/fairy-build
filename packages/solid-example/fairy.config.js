import { defineConfig } from "@fairy-render/build";

export default defineConfig(() => {
  return {
    entry: {
      client: "src/entry-client.tsx",
      server: "src/entry-server.tsx",
    },
    preset: {
      solid: {
        exclude: "src/**/*.tsx",
      },
      react: {
        jsxImportSource: "react",
        // exclude: "solid/**/*.tsx"
      },
    },
  };
});
