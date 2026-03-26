import { CircuitJson } from 'circuit-json';
import { LightBurnProject } from 'lbrnts';

interface ConvertCircuitJsonToLbrnOptions {
    includeSilkscreen?: boolean;
    origin?: {
        x: number;
        y: number;
    };
    margin?: number;
    includeCopper?: boolean;
    includeSoldermask?: boolean;
    includeSoldermaskCure?: boolean;
    globalCopperSoldermaskMarginAdjustment?: number;
    solderMaskMarginPercent?: number;
    includeLayers?: Array<"top" | "bottom">;
    traceMargin?: number;
    laserSpotSize?: number;
    mirrorBottomLayer?: boolean;
    /**
     * Whether to generate copper cut fill layers.
     * Creates a ring/band around traces and pads that will be laser cut
     * to remove copper, without cutting into the traces or pads themselves.
     */
    includeCopperCutFill?: boolean;
    /**
     * Margin to expand the copper outline for the cut fill band (in mm).
     * This determines how wide the band of copper removal will be around traces/pads.
     */
    copperCutFillMargin?: number;
    /**
     * Whether to generate an oxidation cleaning layer.
     * Creates a filled area covering the entire "inside" of the board outline
     * for laser ablation to clean oxidation from the copper surface.
     */
    includeOxidationCleaningLayer?: boolean;
    laserProfile?: {
        copper?: {
            speed?: number;
            numPasses?: number;
            frequency?: number;
            pulseWidth?: number;
        };
        board?: {
            speed?: number;
            numPasses?: number;
            frequency?: number;
            pulseWidth?: number;
        };
    };
}
declare const convertCircuitJsonToLbrn: (circuitJson: CircuitJson, options?: ConvertCircuitJsonToLbrnOptions) => Promise<LightBurnProject>;

export { type ConvertCircuitJsonToLbrnOptions, convertCircuitJsonToLbrn };
