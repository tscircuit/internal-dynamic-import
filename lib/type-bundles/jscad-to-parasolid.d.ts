import { JscadOperation } from 'jscad-planner';

type Point3 = readonly [number, number, number];
type ParasolidColorInput = string | readonly number[];
type ParasolidRgbColor = readonly [number, number, number];
/** Also accepts JSON-exported JSCAD vertices and typed coordinate arrays. */
type Geom3Vertex = ArrayLike<number> | {
    readonly pos: ArrayLike<number>;
} | {
    readonly position: ArrayLike<number>;
};
interface Geom3Like {
    readonly polygons: readonly {
        readonly vertices: readonly Geom3Vertex[];
        readonly color?: ParasolidColorInput;
    }[];
    /** JSCAD's column-major, lazily applied affine matrix. */
    readonly transforms?: ArrayLike<number>;
    readonly color?: ParasolidColorInput;
}
type JscadGeometryInput = JscadOperation | Geom3Like;
/** The vanilla renderer can use either jscad-planner or @jscad/modeling. */
interface RenderedModel {
    readonly geometries: readonly {
        readonly geom: JscadGeometryInput;
        readonly color?: ParasolidColorInput;
        readonly name?: string;
    }[];
}
type JscadToParasolidInput = JscadGeometryInput | readonly JscadGeometryInput[] | RenderedModel;
interface JscadToParasolidOptions {
    /** Merge adjacent coplanar CAD faces. Default true; curves remain faceted. */
    readonly mergeCoplanarFaces?: boolean;
    /** Input length unit. X_T coordinates are always written in metres. */
    readonly units?: "mm" | "m";
    /** Reserved for future X_T name attributes; not transmitted yet. */
    readonly name?: string;
}
interface ParasolidBodyInput {
    readonly polygons: readonly (readonly Point3[])[];
    readonly name?: string;
    readonly color?: ParasolidRgbColor;
    readonly faceColors?: readonly (ParasolidRgbColor | undefined)[];
}

/**
 * Resolve JSCAD geometry into world-coordinate polygon bodies, in input units.
 * No caller-owned geometry or matrices are mutated. RGB colors are preserved;
 * alpha is not represented by the supported native color attributes.
 * The converter validates planarity and closed-manifold topology before serialization.
 */
declare function jscadToParasolidBodies(input: JscadToParasolidInput, options?: JscadToParasolidOptions): ParasolidBodyInput[];
/**
 * Convert JSCAD/modelprinter geometry to native Parasolid text (.x_t).
 * Curves remain JSCAD's planar facets; this does not reconstruct analytic curves.
 */
declare function jscadToParasolid(input: JscadToParasolidInput, options?: JscadToParasolidOptions): string;

export { type Geom3Like, type Geom3Vertex, type JscadGeometryInput, type JscadToParasolidInput, type JscadToParasolidOptions, type ParasolidBodyInput, type ParasolidColorInput, type ParasolidRgbColor, type Point3, type RenderedModel, jscadToParasolid, jscadToParasolidBodies };
