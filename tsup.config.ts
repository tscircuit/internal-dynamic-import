import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["lib/index.ts"],
  format: ["esm"],
  target: "es2022",
  clean: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
  dts: {
    resolve: [/^circuit-json-to-/, /^circuit-to-/],
  },
})
