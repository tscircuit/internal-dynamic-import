import { CircuitJson } from 'circuit-json';
export { CircuitJson } from 'circuit-json';
import { RenderOptionsInput } from 'poppygl';

interface FdmComponentBoxOptions {
    /** Number of compartments per row. Defaults to a near-square layout. */
    columns?: number;
    /** Clear X dimension of each compartment, in millimetres. */
    compartmentWidth?: number;
    /** Clear Y dimension of each compartment, in millimetres. */
    compartmentDepth?: number;
    /** Clear Z depth from the floor to the rim, in millimetres. */
    compartmentHeight?: number;
    /** Thickness of outside and divider walls, in millimetres. */
    wallThickness?: number;
    /** Thickness beneath each compartment, in millimetres. */
    floorThickness?: number;
    /** Solid Y-depth behind each compartment that carries its label. */
    labelBandDepth?: number;
    /** Height of the raised label above the box rim, in millimetres. */
    labelThickness?: number;
    /** Empty margin around each label, in millimetres. */
    labelPadding?: number;
    /** Smallest allowed text stroke, in millimetres. */
    minimumLabelStrokeWidth?: number;
    /** Include source components that do not have a pcb_component record. */
    includeUnplacedComponents?: boolean;
    /** Include test points, which are excluded from assembly compartments by default. */
    includeTestPoints?: boolean;
    /** Group confidently identical BOM parts into one compartment. Defaults to true. */
    groupByComponent?: boolean;
    /** Core 3MF display color for the box material, as #RRGGBB or #RRGGBBAA. */
    boxColor?: string;
    /** Core 3MF display color for the label material, as #RRGGBB or #RRGGBBAA. */
    labelColor?: string;
    /** Title stored in the 3MF model metadata. */
    title?: string;
}
interface ComponentGroup {
    /** Stable description of the BOM identity used for this group. */
    componentKey: string;
    /** Every refdes whose physical parts belong in this compartment. */
    referenceDesignators: string[];
    quantity: number;
    componentType?: string;
    manufacturerPartNumber?: string;
    supplierPartNumbers?: Record<string, string[]>;
    footprint?: string;
}
interface FdmComponentBoxDimensions {
    /** Overall X dimension, in millimetres. */
    width: number;
    /** Overall Y dimension, in millimetres. */
    depth: number;
    /** Overall Z dimension excluding raised text, in millimetres. */
    height: number;
    columns: number;
    rows: number;
}
interface CompartmentPlacement {
    /** Primary refdes, retained for compatibility with one-component compartments. */
    refdes: string;
    /** All refdes values assigned to this compartment. */
    referenceDesignators: string[];
    /** Text physically embossed above the compartment. */
    label: string;
    componentKey: string;
    quantity: number;
    row: number;
    column: number;
    /** Cavity center in the box coordinate frame, in millimetres. */
    center: {
        x: number;
        y: number;
    };
    /** Center of the solid label band behind this cavity, in millimetres. */
    labelCenter: {
        x: number;
        y: number;
    };
    width: number;
    depth: number;
}
interface FdmComponentBoxMeshStats {
    boxTriangles: number;
    labelTriangles: number;
    totalTriangles: number;
}
interface FdmComponentBoxResult {
    /** Ready-to-write 3MF package bytes. */
    threeMf: Uint8Array;
    /** Naturally sorted refdes values represented by all compartments. */
    componentRefdes: string[];
    /** BOM-aware groups, one per generated compartment. */
    componentGroups: ComponentGroup[];
    dimensions: FdmComponentBoxDimensions;
    compartments: CompartmentPlacement[];
    meshStats: FdmComponentBoxMeshStats;
}
interface ResolvedFdmComponentBoxOptions {
    columns: number;
    compartmentWidth: number;
    compartmentDepth: number;
    compartmentHeight: number;
    wallThickness: number;
    floorThickness: number;
    labelBandDepth: number;
    labelThickness: number;
    labelPadding: number;
    minimumLabelStrokeWidth: number;
    includeUnplacedComponents: boolean;
    includeTestPoints: boolean;
    groupByComponent: boolean;
    boxColor: string;
    labelColor: string;
    title: string;
}
declare const DEFAULT_FDM_COMPONENT_BOX_OPTIONS: {
    readonly compartmentWidth: 26;
    readonly compartmentDepth: 22;
    readonly compartmentHeight: 12;
    readonly wallThickness: 1.6;
    readonly floorThickness: 1.6;
    readonly labelBandDepth: 6.5;
    readonly labelThickness: 0.6;
    readonly labelPadding: 0.75;
    readonly minimumLabelStrokeWidth: 0.45;
    readonly includeUnplacedComponents: false;
    readonly includeTestPoints: false;
    readonly groupByComponent: true;
    readonly boxColor: "#D9D9D9FF";
    readonly labelColor: "#151515FF";
};

declare const createFdmComponentBox: (circuitJson: CircuitJson, options?: FdmComponentBoxOptions) => Promise<FdmComponentBoxResult>;
/** Convert Circuit JSON directly to a ready-to-write 3MF byte array. */
declare const circuitJsonToFdmComponentBox: (circuitJson: CircuitJson, options?: FdmComponentBoxOptions) => Promise<Uint8Array>;

interface ExtractComponentGroupsOptions {
    includeUnplacedComponents?: boolean;
    includeTestPoints?: boolean;
    groupByComponent?: boolean;
}
declare const naturalRefdesCollator: Intl.Collator;
declare const extractComponentGroups: (circuitJson: CircuitJson, options?: ExtractComponentGroupsOptions) => ComponentGroup[];

/**
 * Returns the physical component refdes values that should receive pockets.
 *
 * When the document contains pcb_component records, unplaced source components
 * are omitted by default. Source-only Circuit JSON falls back to all source
 * components so partially rendered documents remain useful.
 */
declare const extractComponentRefdes: (circuitJson: CircuitJson, options?: Omit<ExtractComponentGroupsOptions, "groupByComponent">) => string[];

type FdmComponentBoxPngOptions = RenderOptionsInput;
/** Render a deterministic, pure-JavaScript PNG preview directly from Circuit JSON. */
declare const renderFdmComponentBoxPng: (circuitJson: CircuitJson, boxOptions?: FdmComponentBoxOptions, renderOptions?: FdmComponentBoxPngOptions) => Promise<Uint8Array>;

export { type CompartmentPlacement, type ComponentGroup, DEFAULT_FDM_COMPONENT_BOX_OPTIONS, type ExtractComponentGroupsOptions, type FdmComponentBoxDimensions, type FdmComponentBoxMeshStats, type FdmComponentBoxOptions, type FdmComponentBoxPngOptions, type FdmComponentBoxResult, type ResolvedFdmComponentBoxOptions, circuitJsonToFdmComponentBox, createFdmComponentBox, extractComponentGroups, extractComponentRefdes, naturalRefdesCollator, renderFdmComponentBoxPng };
