import { expect, test } from "bun:test"
import importer, {
  getImportUrls,
  getDynamicModuleRegistry,
  registerDynamicModule,
} from "../lib"

test("JSCAD exporters support versioned CDN URLs and registry overrides", async () => {
  for (const name of ["jscad-to-step", "jscad-to-parasolid"] as const) {
    expect(getImportUrls(name)).toEqual([
      `https://jscdn.tscircuit.com/${name}/latest/+esm`,
      `https://esm.run/${name}`,
    ])
    const specifier = `${name}@0.0.4`
    expect(getImportUrls(specifier)[0]).toBe(
      `https://jscdn.tscircuit.com/${name}/0.0.4/+esm`,
    )
    const module =
      name === "jscad-to-step"
        ? { jscadToStep: () => "step" }
        : { jscadToParasolid: () => "parasolid" }
    registerDynamicModule(specifier, module)
    try {
      expect(await importer(specifier)).toBe(module)
    } finally {
      delete getDynamicModuleRegistry()[specifier]
    }
  }
})
