import { CircuitJson } from 'circuit-json';
import { CircuitJsonUtilObjects, cju } from '@tscircuit/circuit-json-util';
import { KicadSch, KicadPcb, SchematicSymbol } from 'kicadts';
import { Matrix } from 'transformation-matrix';

type PaperSize = "A0" | "A1" | "A2" | "A3" | "A4" | "A5";
interface PaperDimensions {
    width: number;
    height: number;
    name: PaperSize;
}

type SchematicPortId = string;
type SchematicTraceId = string;
type PcbPortId = string;
interface PcbNetInfo {
    id: number;
    name: string;
}
interface SymbolEntry {
    symbolName: string;
    symbol: SchematicSymbol;
    /**
     * Whether this symbol is from a standard library footprint (has footprinter_string).
     * If true, this is a builtin/standard symbol. If false, it's a custom/inline symbol.
     */
    isBuiltin?: boolean;
}
interface FootprintEntry {
    footprintName: string;
    kicadModString: string;
    model3dSourcePaths: string[];
    /**
     * Whether this footprint is from a standard library footprint (has footprinter_string).
     * If true, this is a builtin/standard footprint. If false, it's a custom/inline footprint.
     */
    isBuiltin?: boolean;
}
interface KicadLibraryOutput {
    kicadSymString: string;
    symbols: SymbolEntry[];
    footprints: FootprintEntry[];
    fpLibTableString: string;
    symLibTableString: string;
    model3dSourcePaths: string[];
}
interface ConverterContext {
    db: CircuitJsonUtilObjects;
    circuitJson: CircuitJson;
    kicadSch?: KicadSch;
    kicadPcb?: KicadPcb;
    /** Circuit JSON to KiCad schematic transformation matrix */
    c2kMatSch?: Matrix;
    /** Circuit JSON to KiCad PCB transformation matrix */
    c2kMatPcb?: Matrix;
    /** Selected paper size for schematic */
    schematicPaperSize?: PaperDimensions;
    pinPositions?: Map<SchematicPortId, {
        x: number;
        y: number;
    }>;
    wireConnections?: Map<SchematicTraceId, SchematicPortId[]>;
    pcbPadPositions?: Map<PcbPortId, {
        x: number;
        y: number;
    }>;
    pcbNetMap?: Map<string, PcbNetInfo>;
    numLayers?: number;
    /** Project name used as the .3dshapes folder for user-provided 3D models */
    projectName?: string;
    /** CDN URLs of 3D models needed for this PCB (collected during footprint stage) */
    pcbModel3dSourcePaths?: string[];
    libraryName?: string;
    fpLibraryName?: string;
    kicadSchString?: string;
    kicadPcbString?: string;
    symbolEntries?: SymbolEntry[];
    footprintEntries?: FootprintEntry[];
    libraryOutput?: KicadLibraryOutput;
}
declare abstract class ConverterStage<Input, Output> {
    MAX_ITERATIONS: number;
    iteration: number;
    finished: boolean;
    input: Input;
    ctx: ConverterContext;
    constructor(input: Input, ctx: ConverterContext);
    step(): void;
    _step(): void;
    runUntilFinished(): void;
    getOutput(): Output;
}

declare class CircuitJsonToKicadSchConverter {
    ctx: ConverterContext;
    pipeline: ConverterStage<CircuitJson, KicadSch>[];
    currentStageIndex: number;
    finished: boolean;
    get currentStage(): ConverterStage<CircuitJson, KicadSch> | undefined;
    constructor(circuitJson: CircuitJson);
    step(): void;
    runUntilFinished(): void;
    getOutput(): KicadSch;
    /**
     * Get the output as a string
     */
    getOutputString(): string;
}

interface CircuitJsonToKicadPcbOptions {
    /**
     * Set to true to embed "${KIPRJMOD}/3dmodels" 3D model references for
     * builtin footprints. Enable this in the CLI zip export.
     * Defaults to false.
     */
    includeBuiltin3dModels?: boolean;
    /**
     * Project name used as the .3dshapes folder for user-provided models.
     * e.g. "index" → "3dmodels/index.3dshapes/{filename}"
     */
    projectName?: string;
}
declare class CircuitJsonToKicadPcbConverter {
    ctx: ConverterContext;
    pipeline: ConverterStage<CircuitJson, KicadPcb>[];
    currentStageIndex: number;
    finished: boolean;
    get currentStage(): ConverterStage<CircuitJson, KicadPcb> | undefined;
    constructor(circuitJson: CircuitJson, options?: CircuitJsonToKicadPcbOptions);
    step(): void;
    runUntilFinished(): void;
    getOutput(): KicadPcb;
    /**
     * Get the output as a string
     */
    getOutputString(): string;
    /**
     * Returns CDN URLs for 3D model files needed by builtin footprints in this PCB.
     * The CLI can use these to download and include the models in the project zip.
     */
    getModel3dSourcePaths(): string[];
}

interface CircuitJsonToKicadProOptions {
    projectName?: string;
    schematicFilename?: string;
    pcbFilename?: string;
}
interface KicadProProject {
    version: number;
    head: {
        generator: string;
        generator_version: string;
        project_name: string;
        created: string;
        modified: string;
    };
    meta: {
        version: number;
    };
    text_variables: Record<string, string>;
    libraries: {
        pinned_symbol_libs: string[];
        pinned_footprint_libs: string[];
    };
    boards: string[];
    cvpcb: {
        meta: {
            version: number;
        };
    };
    erc: {
        meta: {
            version: number;
        };
        erc_exclusions: unknown[];
    };
    net_settings: {
        meta: {
            version: number;
        };
        last_net_id: number;
        classes: unknown[];
    };
    pcbnew: {
        page_layout_descr_file: string;
        last_paths: Record<string, string>;
    };
    schematic: {
        meta: {
            version: number;
        };
        page_layout_descr_file: string;
        last_opened_files: string[];
    };
    board: {
        meta: {
            version: number;
        };
        last_opened_board: string;
    };
    sheets: [string, string][];
}
declare class CircuitJsonToKicadProConverter {
    ctx: {
        db: ReturnType<typeof cju>;
        circuitJson: CircuitJson;
    };
    private project;
    constructor(circuitJson: CircuitJson, options?: CircuitJsonToKicadProOptions);
    runUntilFinished(): void;
    getOutput(): KicadProProject;
    getOutputString(): string;
}

interface CircuitJsonToKicadLibraryOptions {
    libraryName?: string;
    footprintLibraryName?: string;
}

declare class CircuitJsonToKicadLibraryConverter {
    ctx: ConverterContext;
    pipeline: ConverterStage<CircuitJson, KicadLibraryOutput>[];
    currentStageIndex: number;
    finished: boolean;
    get currentStage(): ConverterStage<CircuitJson, KicadLibraryOutput> | undefined;
    constructor(circuitJson: CircuitJson, options?: CircuitJsonToKicadLibraryOptions);
    step(): void;
    runUntilFinished(): void;
    getOutput(): KicadLibraryOutput;
    getSymbolLibraryString(): string;
    getFootprints(): FootprintEntry[];
    getFpLibTableString(): string;
    getSymLibTableString(): string;
    getModel3dSourcePaths(): string[];
}

interface KicadLibraryConverterOptions {
    /**
     * Name for the generated KiCad library (e.g., "my-library").
     * This will be used for the user library files.
     */
    kicadLibraryName?: string;
    /**
     * The main entry point file for the library (e.g., "lib/my-library.ts").
     * This file's exports define the public API of the library.
     */
    entrypoint: string;
    /**
     * Callback to build circuit JSON from a file path and export name.
     * Should handle both board components and symbol components:
     * - For board components: render inside a <board> element
     * - For symbol components: render inside a <chip> with the symbol prop
     *   (Note: tscircuit symbols cannot render standalone - they must be
     *   used as a prop on a <chip> component)
     * Return null if the export cannot be rendered.
     */
    buildFileToCircuitJson: (filePath: string, componentName: string) => Promise<CircuitJson | null>;
    /**
     * Callback to get all exports from a TSX/TS file.
     * Must evaluate the file (not just parse) to handle `export * from` patterns.
     */
    getExportsFromTsxFile: (filePath: string) => Promise<string[]>;
    /**
     * Callback to resolve an export name to its file path.
     * Returns the file path where the component is defined, or null if not resolvable.
     */
    resolveExportPath?: (entrypoint: string, exportName: string) => Promise<string | null>;
    /**
     * Whether to include builtin footprints/symbols (like 0402, soic8).
     * Default: true
     */
    includeBuiltins?: boolean;
    /**
     * Whether to generate files for KiCad PCM (Plugin and Content Manager).
     * When true:
     * - Footprint references in symbols will be prefixed with "PCM_"
     * - 3D model paths will use ${KICAD_3RD_PARTY} variable instead of relative paths
     * Default: false
     */
    isPcm?: boolean;
    /**
     * The KiCad PCM package identifier (e.g., "com_tscircuit_author_package-name").
     * Required when useKicadPcmPaths is true.
     * Used to construct 3D model paths like:
     * ${KICAD9_3RD_PARTY}/3dmodels/<kicadPcmPackageId>/<library>.3dshapes/<model>.step
     */
    kicadPcmPackageId?: string;
}
interface KicadLibraryConverterOutput {
    /**
     * Map of file paths to file contents for the generated KiCad library.
     */
    kicadProjectFsMap: Record<string, string | Buffer>;
    /**
     * Source paths to 3D model files that need to be copied.
     */
    model3dSourcePaths: string[];
}

/**
 * Converts tscircuit component files to a KiCad library.
 */
declare class KicadLibraryConverter {
    private options;
    private output;
    private ctx;
    constructor(options: KicadLibraryConverterOptions);
    run(): Promise<void>;
    /**
     * Builds tscircuit components to circuit-json.
     */
    private buildTscircuitComponents;
    /**
     * Extracts KiCad footprints and symbols from built tscircuit components.
     */
    private extractKicadComponents;
    getOutput(): KicadLibraryConverterOutput;
}

export { CircuitJsonToKicadLibraryConverter, CircuitJsonToKicadPcbConverter, CircuitJsonToKicadProConverter, CircuitJsonToKicadSchConverter, type FootprintEntry, KicadLibraryConverter, type KicadLibraryConverterOptions, type KicadLibraryConverterOutput, type KicadLibraryOutput, type SymbolEntry };
