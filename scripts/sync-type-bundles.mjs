import { access, mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const supportedModules = [
  "circuit-json-to-bom-csv",
  "circuit-json-to-bpc",
  "circuit-json-to-connectivity-map",
  "circuit-json-to-gerber",
  "circuit-json-to-gltf",
  "circuit-json-to-kicad",
  "circuit-json-to-lbrn",
  "circuit-json-to-pnp-csv",
  "circuit-json-to-readable-netlist",
  "circuit-json-to-simple-3d",
  "circuit-json-to-spice",
  "circuit-json-to-step",
  "circuit-json-to-tscircuit",
  "circuit-to-canvas",
  "circuit-to-svg",
]

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const outputDir = path.join(rootDir, "lib", "type-bundles")

const getDeclarationPath = async (moduleName) => {
  const packageDir = path.join(rootDir, "node_modules", moduleName)
  const packageJson = JSON.parse(
    await readFile(path.join(packageDir, "package.json"), "utf8"),
  )

  const candidates = [
    packageJson.types,
    packageJson.typings,
    packageJson.exports?.["."]?.types,
    typeof packageJson.exports?.["."] === "string"
      ? packageJson.exports["."].replace(/\.js$/u, ".d.ts")
      : undefined,
    typeof packageJson.main === "string"
      ? packageJson.main.replace(/\.js$/u, ".d.ts")
      : undefined,
    "dist/index.d.ts",
  ].filter(Boolean)

  for (const relativePath of candidates) {
    const declarationPath = path.join(packageDir, relativePath)
    try {
      await access(declarationPath)
      return declarationPath
    } catch {}
  }

  throw new Error(`Could not find declaration entrypoint for ${moduleName}`)
}

await mkdir(outputDir, { recursive: true })

for (const moduleName of supportedModules) {
  const sourcePath = await getDeclarationPath(moduleName)
  const outputPath = path.join(outputDir, `${moduleName}.d.ts`)
  await writeFile(outputPath, await readFile(sourcePath, "utf8"))
}
