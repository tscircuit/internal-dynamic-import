import { LayerRef, SupplierName, AnyCircuitElement } from 'circuit-json';

interface PickAndPlaceRow {
    designator: string;
    mid_x: number;
    mid_y: number;
    layer: LayerRef;
    rotation: number;
}
interface PickAndPlaceConversionOptions {
    flip_y_axis?: boolean;
    /**
     * Adjust component rotations from the authored footprint's pin-1 frame to
     * the selected supplier footprint's pin-1 frame when both are available.
     */
    supplier?: SupplierName;
}
declare const convertCircuitJsonToPickAndPlaceRows: (circuitJson: AnyCircuitElement[], opts?: PickAndPlaceConversionOptions) => PickAndPlaceRow[];
declare const convertCircuitJsonToPickAndPlaceCsv: (circuitJson: AnyCircuitElement[], opts?: PickAndPlaceConversionOptions) => string;

export { type PickAndPlaceConversionOptions, type PickAndPlaceRow, convertCircuitJsonToPickAndPlaceCsv, convertCircuitJsonToPickAndPlaceRows };
