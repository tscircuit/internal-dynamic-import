import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { build } from "tsup"
import ts from "typescript"

const supportedModules = [
  "circuit-json-to-3d-png",
  "circuit-json-to-bom-csv",
  "circuit-json-to-bpc",
  "circuit-json-to-connectivity-map",
  "circuit-json-to-fdm-component-box",
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
  "kicad-to-circuit-json",
  "@tscircuit/circuit-json-schematic-placement-analysis",
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
  await mkdir(path.dirname(outputPath), { recursive: true })
  if (sourcePath.endsWith(".d.ts")) {
    await writeFile(outputPath, await readFile(sourcePath, "utf8"))
  } else {
    // Some packages expose TypeScript source as their types entrypoint. Emit
    // and bundle their declarations rather than copying unresolved re-exports.
    const temporaryDir = await mkdtemp(
      path.join(tmpdir(), "dynamic-import-types-"),
    )
    try {
      const sourceDir = path.dirname(await realpath(sourcePath))
      const declarationDir = path.join(temporaryDir, "declarations")
      const program = ts.createProgram(
        ts.sys.readDirectory(sourceDir, [".ts", ".tsx"]),
        {
          module: ts.ModuleKind.Preserve,
          moduleResolution: ts.ModuleResolutionKind.Bundler,
          target: ts.ScriptTarget.ESNext,
          declaration: true,
          emitDeclarationOnly: true,
          skipLibCheck: true,
          rootDir: sourceDir,
          outDir: declarationDir,
        },
      )
      const result = program.emit()
      if (result.emitSkipped || result.diagnostics.length > 0) {
        throw new Error(
          `Could not emit declarations for ${moduleName}: ${ts.formatDiagnostics(
            result.diagnostics,
            {
              getCanonicalFileName: (fileName) => fileName,
              getCurrentDirectory: () => rootDir,
              getNewLine: () => "\n",
            },
          )}`,
        )
      }
      await build({
        entry: {
          index: path.join(
            declarationDir,
            path.basename(sourcePath).replace(/\.tsx?$/u, ".d.ts"),
          ),
        },
        outDir: temporaryDir,
        format: ["esm"],
        config: false,
        tsconfig: path.join(rootDir, "tsconfig.json"),
        dts: { only: true },
        silent: true,
      })
      await writeFile(
        outputPath,
        await readFile(path.join(temporaryDir, "index.d.ts"), "utf8"),
      )
    } finally {
      await rm(temporaryDir, { recursive: true, force: true })
    }
  }
}
