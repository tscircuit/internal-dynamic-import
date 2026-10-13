import { JscadOperation } from 'jscad-planner';

type StepColorInput = number[] | string;

interface Geom3Like {
    polygons: Array<{
        vertices: any[];
    }>;
    transforms?: number[];
    color?: StepColorInput;
}
interface RenderedModel {
    geometries: Array<{
        geom: Geom3Like;
        color?: StepColorInput;
    }>;
}
interface JscadToStepOptions {
    /** Merge adjacent coplanar polygons into faces with inner bounds for holes. Default: true. */
    mergeCoplanarFaces?: boolean;
}
declare function jscadToStep(operation: JscadOperation | RenderedModel, options?: JscadToStepOptions): string;

export { type JscadToStepOptions, jscadToStep };
