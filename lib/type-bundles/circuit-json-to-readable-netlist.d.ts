import { AnyCircuitElement } from 'circuit-json';

declare const convertCircuitJsonToReadableNetlist: (circuitJson: AnyCircuitElement[]) => string;

export { convertCircuitJsonToReadableNetlist };
