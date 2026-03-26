import { CircuitJson } from 'circuit-json';

interface CircuitJsonToStepOptions {
    /** Board width in mm (optional if pcb_board is present) */
    boardWidth?: number;
    /** Board height in mm (optional if pcb_board is present) */
    boardHeight?: number;
    /** Board thickness in mm (default: 1.6mm or from pcb_board) */
    boardThickness?: number;
    /** Product name (default: "PCB") */
    productName?: string;
    /** Include component meshes (default: false) */
    includeComponents?: boolean;
    /** Include external model meshes from model_*_url fields (default: false). Only applicable when includeComponents is true. */
    includeExternalMeshes?: boolean;
    /**
     * Pre-loaded STEP file contents, keyed by URL/path.
     * If a URL is found here, the content is used directly instead of fetching.
     * Useful for tests that need to load local files.
     */
    fsMap?: Record<string, string>;
}
/**
 * Converts circuit JSON to STEP format, creating holes in a PCB board
 */
declare function circuitJsonToStep(circuitJson: CircuitJson, options?: CircuitJsonToStepOptions): Promise<string>;

export { type CircuitJsonToStepOptions, circuitJsonToStep };
