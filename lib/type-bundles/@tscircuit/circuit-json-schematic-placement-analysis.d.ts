import { BaseSolver, BasePipelineSolver, PipelineStep } from '@tscircuit/solver-utils';
import { CircuitJson } from 'circuit-json';
import { GraphicsObject } from 'graphics-debug';

interface SchematicBoxPlacement {
    positionAnchor: "center";
    schX: number;
    schY: number;
    width: number;
    height: number;
    schematicSheetId?: string;
    schematicSheetName?: string;
    sourceComponentId?: string;
    sourceComponentName?: string;
    schematicComponentId?: string;
    schematicSymbolId?: string;
    subcircuitId?: string;
}
interface SchematicBoxPlacementLineItem extends SchematicBoxPlacement {
    lineItemType: "SchematicBoxPlacement";
}
interface ComponentOverlap {
    lineItemType: "ComponentOverlap";
    firstComponent: SchematicBoxPlacement;
    secondComponent: SchematicBoxPlacement;
    overlapWidth: number;
    overlapHeight: number;
    correctionSuggestions: OverlapCorrectionSuggestion[];
}
interface OverlapCorrectionSuggestion {
    targetComponentName?: string;
    deltaSchX: number;
    deltaSchY: number;
    newSchX: number;
    newSchY: number;
}
interface SchematicBoxHasALotOfSurroundingWhitespace {
    lineItemType: "SchematicBoxHasALotOfSurroundingWhitespace";
    schematicBox: SchematicBoxPlacement;
    whitespaceLeft: number;
    whitespaceRight: number;
    whitespaceTop: number;
    whitespaceBottom: number;
}
interface CapacitorSymbolHorizontal {
    lineItemType: "CapacitorSymbolHorizontal";
    schematicBox: SchematicBoxPlacement;
    message: string;
}
/** A power-to-ground capacitor bank is spread out within one schematic block. */
interface DecouplingCapacitorsNotCloseTogether {
    lineItemType: "DecouplingCapacitorsNotCloseTogether";
    railName: string;
    groundName: string;
    /** All capacitors in this bank, sharing supply, return, and schematic scope. */
    capacitorSchematicBoxes: SchematicBoxPlacement[];
    /** Largest body gap required to connect the bank through neighboring capacitors. */
    maxBodyGap: number;
    maxRecommendedBodyGap: number;
    message: string;
}
interface VerboseSchematicNetLabel {
    lineItemType: "VerboseSchematicNetLabel";
    schematicNetLabelId?: string;
    sourceNetId?: string;
    schematicSheetId?: string;
    schematicSheetName?: string;
    text: string;
    involvedPins: string[];
    schX: number;
    schY: number;
    message: string;
}
interface BaseSchematicBoxTooWide {
    schematicBox: SchematicBoxPlacement;
    measuredInnerLabelHorizontalEmptySpace: number;
    maxAllowedInnerLabelHorizontalEmptySpace: number;
    suggestedSchWidth: number;
    message: string;
}
interface PinHeaderSchematicBoxTooWide extends BaseSchematicBoxTooWide {
    lineItemType: "PinHeaderSchematicBoxTooWide";
}
interface GenericSchematicBoxTooWide extends BaseSchematicBoxTooWide {
    lineItemType: "GenericSchematicBoxTooWide";
}
type SchematicBoxTooWideIssue = PinHeaderSchematicBoxTooWide | GenericSchematicBoxTooWide;
interface SchematicBoxInnerLabelCollision {
    lineItemType: "SchematicBoxInnerLabelCollision";
    schematicBox: SchematicBoxPlacement;
    overlappingSides: SchematicSide[];
    message: string;
}
type SchematicSide = "left" | "right" | "top" | "bottom";
type SchematicPortFacingDirection = "left" | "right" | "up" | "down";
interface SchematicPinPaddingToEdgeTooLarge {
    lineItemType: "SchematicPinPaddingToEdgeTooLarge";
    pinSide: SchematicSide;
    edgeSide: SchematicSide;
    pinName?: string;
    schematicBox: SchematicBoxPlacement;
    measuredPadding: number;
    maxAllowedPadding: number;
    excessPadding: number;
    /** All excessive gaps for this box; scalar gap fields identify the worst gap. */
    paddingDetails?: Array<{
        pinSide: SchematicSide;
        edgeSide: SchematicSide;
        pinName?: string;
        measuredPadding: number;
        maxAllowedPadding: number;
        excessPadding: number;
    }>;
    suggestedSchWidth?: number;
    suggestedSchHeight?: number;
    message: string;
}
interface DiodeResistorNotAligned {
    lineItemType: "DiodeResistorNotAligned";
    diodeSchematicBox: SchematicBoxPlacement;
    resistorSchematicBox: SchematicBoxPlacement;
    diodePin?: string;
    resistorPin?: string;
    diodePinFacingDirection?: string;
    resistorPinFacingDirection?: string;
    message: string;
}
/** Readability advisory for a local diode/resistor pair across the same two nets. */
interface ParallelDiodeResistorNotAligned {
    lineItemType: "ParallelDiodeResistorNotAligned";
    diodeSchematicBox: SchematicBoxPlacement;
    resistorSchematicBox: SchematicBoxPlacement;
    reason: "different_axes" | "crossed_connections" | "staggered";
    message: string;
}
interface ComponentPinsWouldAlignWithVerticalShift {
    lineItemType: "ComponentPinsWouldAlignWithVerticalShift";
    firstComponent: SchematicBoxPlacement;
    secondComponent: SchematicBoxPlacement;
    targetComponent: SchematicBoxPlacement;
    deltaSchY: number;
    newSchY: number;
    currentlyAlignedPinCount: number;
    alignedPinCount: number;
    alignedPinPairs: Array<{
        firstPin?: string;
        secondPin?: string;
    }>;
    message: string;
}
interface TraceCanBeSimplifiedByMovingComponent {
    lineItemType: "TraceCanBeSimplifiedByMovingComponent";
    schematicTraceId: string;
    traceName?: string;
    targetComponent: SchematicBoxPlacement;
    deltaSchX: number;
    deltaSchY: number;
    newSchX: number;
    newSchY: number;
    currentTurnCount: number;
    suggestedTurnCount: number;
    /** Collision-checked calculate-elbow routes after applying this move. */
    suggestedTraces?: Array<{
        schematicTraceId: string;
        points: Array<{
            x: number;
            y: number;
        }>;
    }>;
    message: string;
}
interface CrystalNotCenteredOverLoadCapacitors {
    lineItemType: "CrystalNotCenteredOverLoadCapacitors";
    crystalSchematicBox: SchematicBoxPlacement;
    firstLoadCapacitorSchematicBox: SchematicBoxPlacement;
    secondLoadCapacitorSchematicBox: SchematicBoxPlacement;
    deltaSchX: number;
    deltaSchY: number;
    newSchX: number;
    newSchY: number;
    message: string;
}
interface TwoPinComponentCouldBeFlipped {
    lineItemType: "TwoPinComponentCouldBeFlipped";
    schematicTraceId: string;
    traceName?: string;
    targetComponent: SchematicBoxPlacement;
    connectedComponent: SchematicBoxPlacement;
    targetPin?: string;
    currentFacingDirection: SchematicPortFacingDirection;
    suggestedFacingDirection: SchematicPortFacingDirection;
    deltaSchRotation: 180;
    currentTurnCount: number;
    suggestedTurnCount: number;
    message: string;
}
/** Advisory: a direct negative-feedback R/C network is far from its amplifier. */
interface FeedbackNetworkNotCompact {
    lineItemType: "FeedbackNetworkNotCompact";
    amplifierSchematicBox: SchematicBoxPlacement;
    feedbackComponents: SchematicBoxPlacement[];
    distantComponents: Array<{
        schematicBox: SchematicBoxPlacement;
        bodyGap: number;
        maxRecommendedBodyGap: number;
    }>;
    outputSourcePortId: string;
    invertingInputSourcePortId: string;
    message: string;
}
/** Advisory: an explicitly identified pull resistor is far on the unconventional side. */
interface PullResistorOnWrongSide {
    lineItemType: "PullResistorOnWrongSide";
    resistorSchematicBox: SchematicBoxPlacement;
    hostSchematicBox: SchematicBoxPlacement;
    signalSourcePortId: string;
    signalPinName: string;
    signalSchY: number;
    pullDirection: "up" | "down";
    preferredSide: "above" | "below";
    wrongSideGap: number;
    maxRecommendedWrongSideGap: number;
    message: string;
}
interface TwoPinComponentRailOrientation {
    schematicBox: SchematicBoxPlacement;
    railSourcePortId: string;
    railPinName: string;
    railType: "power" | "ground";
    suggestedRailFacingDirection: "up" | "down";
    message: string;
}
interface TwoPinComponentShouldBeVertical extends TwoPinComponentRailOrientation {
    lineItemType: "TwoPinComponentShouldBeVertical";
    deltaSchRotation: -90 | 90;
}
/** A vertical component has a positive supply below its ground pin or a resistor's signal pin. */
interface TwoPinComponentHasInvertedRails extends TwoPinComponentRailOrientation {
    lineItemType: "TwoPinComponentHasInvertedRails";
    railType: "power";
    deltaSchRotation: 180;
    suggestedRailFacingDirection: "up";
}
interface ComponentNetLabelCollision {
    lineItemType: "ComponentNetLabelCollision";
    firstComponent: SchematicBoxPlacement;
    secondComponent: SchematicBoxPlacement;
    message: string;
    overlappingLabel1Bounds: {
        left: number;
        right: number;
        top: number;
        bottom: number;
    };
    overlappingLabel2Bounds: {
        left: number;
        right: number;
        top: number;
        bottom: number;
    };
    suggestion?: {
        componentName: string;
        newSchX: number;
        newSchY: number;
    };
}
interface ComponentBoxNetLabelCollision {
    lineItemType: "ComponentBoxNetLabelCollision";
    boxComponent: SchematicBoxPlacement;
    labelComponent: SchematicBoxPlacement;
    message: string;
    boxBounds: {
        left: number;
        right: number;
        top: number;
        bottom: number;
    };
    labelBounds: {
        left: number;
        right: number;
        top: number;
        bottom: number;
    };
    suggestion?: {
        componentName: string;
        newSchX: number;
        newSchY: number;
    };
}
interface SchematicIssueBounds {
    left: number;
    right: number;
    top: number;
    bottom: number;
}
interface NetLabelCollision {
    lineItemType: "NetLabelCollision";
    schematicSheetId?: string;
    schematicSheetName?: string;
    /** Actual intersection regions in schematic coordinates (Y up).
     * Optional for compatibility with previously serialized reports. */
    collisionBounds?: SchematicIssueBounds[];
    pairs: Array<{
        comp1Name: string;
        comp2Name: string;
    }>;
    moves: Array<{
        componentName: string;
        newSchX: number;
        newSchY: number;
    }>;
}
interface SchematicTextCollisionObject {
    type: "text" | "trace" | "component";
    id: string;
    text?: string;
    componentName?: string;
    schematicComponentId?: string;
}
interface SchematicTextCollision {
    lineItemType: "SchematicTextCollision";
    schematicSheetId?: string;
    schematicSheetName?: string;
    schematicTextId: string;
    text: string;
    collidingObject: SchematicTextCollisionObject;
    textBounds: {
        left: number;
        right: number;
        top: number;
        bottom: number;
    };
    collidingObjectBounds: {
        left: number;
        right: number;
        top: number;
        bottom: number;
    };
    /** A clear text-anchor position for this issue; reanalyze after applying it. */
    suggestedMove?: {
        newSchX: number;
        newSchY: number;
    };
    message: string;
}
interface ResetNetworkNotGrouped {
    lineItemType: "ResetNetworkNotGrouped";
    /** The component whose reset pin is served by this network. */
    hostSchematicBox: SchematicBoxPlacement;
    resetSourcePortId: string;
    resetPinName: string;
    /** Reset pull-up, capacitor, and any associated test points; excludes the host. */
    supportNetworkComponents: SchematicBoxPlacement[];
    maxDistanceFromResetPin: number;
    maxRecommendedDistance: number;
    message: string;
}
interface ConnectorPositionCausesTraceDetours {
    lineItemType: "ConnectorPositionCausesTraceDetours";
    connectorSchematicBox: SchematicBoxPlacement;
    connectedComponents: SchematicBoxPlacement[];
    /** Existing routed signal connections that demonstrate the detours. */
    schematicTraceIds: string[];
    evaluatedSignalCount: number;
    newSchX: number;
    newSchY: number;
    deltaSchX: number;
    deltaSchY: number;
    /** Sum of Manhattan distances between the evaluated signal pins. */
    currentTotalSignalDistance: number;
    /** Sum of Manhattan pin distances after moving; not a promised routed length. */
    suggestedTotalSignalDistance: number;
    message: string;
}
/** Advisory for a grounded-emitter NPN switch; no automatic move is implied. */
interface LowSideTransistorNotAlignedWithLoad {
    lineItemType: "LowSideTransistorNotAlignedWithLoad";
    transistorSchematicBox: SchematicBoxPlacement;
    loadSchematicBox: SchematicBoxPlacement;
    baseResistorSchematicBox: SchematicBoxPlacement;
    clampDiodeSchematicBox: SchematicBoxPlacement;
    collectorSourcePortId: string;
    emitterSourcePortId: string;
    collectorFacingDirection: SchematicPortFacingDirection;
    emitterFacingDirection: SchematicPortFacingDirection;
    placementProblems: Array<"transistor_not_below_load" | "collector_not_up" | "emitter_not_down">;
    message: string;
}
/** Advisory for an electrically identified USB series pair drawn end-to-end. */
interface UsbSeriesResistorsNotAligned {
    lineItemType: "UsbSeriesResistorsNotAligned";
    positiveResistorSchematicBox: SchematicBoxPlacement;
    negativeResistorSchematicBox: SchematicBoxPlacement;
    hostSourceComponentId: string;
    positiveSourcePortId: string;
    negativeSourcePortId: string;
    signalAxis: "horizontal" | "vertical";
    message: string;
}
/** Advisory for a regulator's local input/output capacitor pair on reversed sides. */
interface RegulatorCapacitorsOnWrongSides {
    lineItemType: "RegulatorCapacitorsOnWrongSides";
    regulatorSchematicBox: SchematicBoxPlacement;
    inputCapacitorSchematicBox: SchematicBoxPlacement;
    outputCapacitorSchematicBox: SchematicBoxPlacement;
    inputSourcePortId: string;
    outputSourcePortId: string;
    message: string;
}
/** Advisory: a vertical divider's supply resistor lies clearly below its ground resistor. */
interface VoltageDividerSupplyResistorBelowGroundResistor {
    lineItemType: "VoltageDividerSupplyResistorBelowGroundResistor";
    supplyResistorSchematicBox: SchematicBoxPlacement;
    groundResistorSchematicBox: SchematicBoxPlacement;
    supplyTapSourcePortId: string;
    groundTapSourcePortId: string;
    reversedBodyGap: number;
    message: string;
}
/** Series gate and gate-source resistors scattered away from their MOSFET. */
interface MosfetGateNetworkNotGrouped {
    lineItemType: "MosfetGateNetworkNotGrouped";
    mosfetSchematicBox: SchematicBoxPlacement;
    seriesGateResistorSchematicBox: SchematicBoxPlacement;
    gateSourceResistorSchematicBox: SchematicBoxPlacement;
    /** Largest body-to-body gap from either resistor to the MOSFET. */
    maxBodyGap: number;
    maxRecommendedBodyGap: number;
    message: string;
}
/** A local flyback diode separated from the relay coil it protects. */
interface FlybackDiodeSeparatedFromRelayCoil {
    lineItemType: "FlybackDiodeSeparatedFromRelayCoil";
    relaySchematicBox: SchematicBoxPlacement;
    diodeSchematicBox: SchematicBoxPlacement;
    coilSourcePortIds: [string, string];
    distanceFromCoilPins: number;
    message: string;
}
/** Advisory for a displaced local shunt with one sense branch split by labels. */
interface CurrentSenseShuntSeparatedFromInputs {
    lineItemType: "CurrentSenseShuntSeparatedFromInputs";
    amplifierSchematicBox: SchematicBoxPlacement;
    shuntSchematicBox: SchematicBoxPlacement;
    positiveInputSourcePortId: string;
    negativeInputSourcePortId: string;
    /** Gap from the shunt body to the band spanned by the two input pins. */
    inputBandGap: number;
    message: string;
}
/** A capacitor placed far across its host chip from its two connected pins. */
interface CapacitorSeparatedFromChipPins {
    lineItemType: "CapacitorSeparatedFromChipPins";
    hostSchematicBox: SchematicBoxPlacement;
    capacitorSchematicBox: SchematicBoxPlacement;
    /** Connected chip pins, in the order of the capacitor's source ports. */
    chipSourcePortIds: [string, string];
    maxPinDistance: number;
    maxRecommendedPinDistance: number;
    message: string;
}
/** The series element and grounded shunt branches of a signal pi filter are separated. */
interface PiFilterComponentsNotGrouped {
    lineItemType: "PiFilterComponentsNotGrouped";
    inductorSchematicBox: SchematicBoxPlacement;
    firstCapacitorSchematicBox: SchematicBoxPlacement;
    secondCapacitorSchematicBox: SchematicBoxPlacement;
    /** Longest direct distance between electrically connected inductor/capacitor pins. */
    maxSignalPinDistance: number;
    maxRecommendedSignalPinDistance: number;
    message: string;
}
/** Readability advisory for a physically continuous local path to an explicit rail. */
interface RailPathTooSpreadOut {
    lineItemType: "RailPathTooSpreadOut";
    hostSchematicBox: SchematicBoxPlacement;
    sourcePortId: string;
    /** Display name for user-facing diagnostics; identity remains sourcePortId. */
    sourcePortName?: string;
    railType: "power" | "ground";
    supportSchematicBoxes: SchematicBoxPlacement[];
    schematicTraceIds: string[];
    pathPoints: Array<{
        x: number;
        y: number;
    }>;
    pathBounds: SchematicIssueBounds;
    pathLength: number;
    pathSpan: number;
    maxRecommendedSpan: number;
    maxRecommendedPathLength: number;
    message: string;
}
type SchematicPlacementIssue = RailPathTooSpreadOut | CapacitorSeparatedFromChipPins | PiFilterComponentsNotGrouped | MosfetGateNetworkNotGrouped | FlybackDiodeSeparatedFromRelayCoil | CurrentSenseShuntSeparatedFromInputs | VoltageDividerSupplyResistorBelowGroundResistor | RegulatorCapacitorsOnWrongSides | UsbSeriesResistorsNotAligned | LowSideTransistorNotAlignedWithLoad | ComponentOverlap | SchematicBoxHasALotOfSurroundingWhitespace | CapacitorSymbolHorizontal | DecouplingCapacitorsNotCloseTogether | VerboseSchematicNetLabel | SchematicBoxTooWideIssue | SchematicBoxInnerLabelCollision | SchematicPinPaddingToEdgeTooLarge | DiodeResistorNotAligned | ParallelDiodeResistorNotAligned | ComponentPinsWouldAlignWithVerticalShift | TraceCanBeSimplifiedByMovingComponent | CrystalNotCenteredOverLoadCapacitors | TwoPinComponentCouldBeFlipped | FeedbackNetworkNotCompact | PullResistorOnWrongSide | TwoPinComponentShouldBeVertical | TwoPinComponentHasInvertedRails | ComponentNetLabelCollision | ComponentBoxNetLabelCollision | NetLabelCollision | SchematicTextCollision | ResetNetworkNotGrouped | ConnectorPositionCausesTraceDetours;
interface SchematicPlacementIssues {
    lineItemType: "SchematicPlacementIssues";
    issues: SchematicPlacementIssue[];
}
type SchematicPlacementLineItem = SchematicBoxPlacementLineItem | SchematicPlacementIssues;
/** Select issue types to execute; omitted runs all checks, [] runs none. */
interface SchematicPlacementAnalysisOptions {
    /** Schematic drawing units, not PCB dimensions. Defaults: span 8, length 16. */
    railPathVisibility?: {
        maxSpan?: number;
        maxPathLength?: number;
    };
    issueTypes?: readonly SchematicPlacementIssue["lineItemType"][];
}

interface SolverContext {
    circuitJson: CircuitJson;
    componentPlacements: SchematicBoxPlacementLineItem[];
}

/** Draw an unambiguous local parallel pair as two paths with matching ends. */
declare class ParallelDiodeResistorPlacementSolver extends BaseSolver {
    private readonly params;
    private readonly banks;
    private bankIndex;
    constructor(params: {
        ctx: SolverContext;
        issues: SchematicPlacementIssue[];
    });
    _step(): void;
    static issueToString(issue: ParallelDiodeResistorNotAligned): string;
}

declare class SchematicPlacementAnalysis {
    private readonly lineItems;
    private readonly groupBySchematicSheet;
    constructor(lineItems: SchematicPlacementLineItem[], groupBySchematicSheet?: boolean);
    getLineItems(): SchematicPlacementLineItem[];
    /** Filter emitted issues without rerunning or changing the solvers. */
    getIssues(filter?: {
        issueTypes?: readonly SchematicPlacementIssue["lineItemType"][];
        schematicSheetId?: string;
    }): SchematicPlacementIssue[];
    /** Counts emitted issue objects, including zero counts for known types. */
    getIssueCounts(filter?: {
        schematicSheetId?: string;
    }): {
        FlybackDiodeSeparatedFromRelayCoil: number;
        ComponentOverlap: number;
        SchematicBoxHasALotOfSurroundingWhitespace: number;
        CapacitorSymbolHorizontal: number;
        VerboseSchematicNetLabel: number;
        PinHeaderSchematicBoxTooWide: number;
        GenericSchematicBoxTooWide: number;
        SchematicBoxInnerLabelCollision: number;
        SchematicPinPaddingToEdgeTooLarge: number;
        DiodeResistorNotAligned: number;
        ParallelDiodeResistorNotAligned: number;
        ComponentPinsWouldAlignWithVerticalShift: number;
        TraceCanBeSimplifiedByMovingComponent: number;
        CrystalNotCenteredOverLoadCapacitors: number;
        ComponentNetLabelCollision: number;
        ComponentBoxNetLabelCollision: number;
        NetLabelCollision: number;
        FeedbackNetworkNotCompact: number;
        PullResistorOnWrongSide: number;
        SchematicTextCollision: number;
        ResetNetworkNotGrouped: number;
        TwoPinComponentCouldBeFlipped: number;
        TwoPinComponentShouldBeVertical: number;
        TwoPinComponentHasInvertedRails: number;
        DecouplingCapacitorsNotCloseTogether: number;
        ConnectorPositionCausesTraceDetours: number;
        LowSideTransistorNotAlignedWithLoad: number;
        UsbSeriesResistorsNotAligned: number;
        RegulatorCapacitorsOnWrongSides: number;
        VoltageDividerSupplyResistorBelowGroundResistor: number;
        CurrentSenseShuntSeparatedFromInputs: number;
        PiFilterComponentsNotGrouped: number;
        MosfetGateNetworkNotGrouped: number;
        CapacitorSeparatedFromChipPins: number;
        RailPathTooSpreadOut: number;
    };
    getString(): string;
    schematicBoxPlacementsToString(lineItem: SchematicBoxPlacementLineItem): string;
    schematicIssuesToString(issue: SchematicPlacementIssue): string;
    toString(): string;
    private issueContextToLines;
}
declare const analyzeSchematicPlacement: (circuitJson: CircuitJson, options?: SchematicPlacementAnalysisOptions) => SchematicPlacementAnalysis;

declare class CapacitorOrientationSolver extends BaseSolver {
    private static readonly EPSILON;
    private static readonly ORIENTATION_MESSAGE;
    private readonly ctx;
    private readonly out;
    private readonly schematicComponentById;
    private readonly sourceComponentById;
    private readonly capacitorPlacements;
    private readonly feedbackCapacitorIds;
    private currentPlacementIndex;
    private readonly horizontalSymbolNames;
    constructor({ ctx, issues: out, }: {
        ctx: SolverContext;
        issues: SchematicPlacementIssue[];
    });
    private getCapacitorPlacements;
    _step(): void;
    visualize(): GraphicsObject;
    private getFocusedPlacement;
    private buildSchematicComponentById;
    private buildSourceComponentById;
    private createIssuePlacement;
    private getIssueForPlacement;
    private isInlineWithHorizontalTraces;
    private getOutwardHorizontalTrace;
    private pointsEqual;
    static issueToString(issue: CapacitorSymbolHorizontal): string;
}

declare class DecouplingCapacitorGroupingSolver extends BaseSolver {
    private readonly params;
    private static readonly MIN_BODY_GAP;
    private readonly banks;
    private readonly netNames;
    private bankIndex;
    constructor(params: {
        ctx: SolverContext;
        issues: SchematicPlacementIssue[];
    });
    _step(): void;
    private static bodyGap;
    static issueToString(issue: DecouplingCapacitorsNotCloseTogether): string;
}

declare class ComponentNetLabelCollisionSolver extends BaseSolver {
    private readonly params;
    private readonly placements;
    private readonly netLabelsByComponentId;
    private rawCollisions;
    private firstIndex;
    private secondIndex;
    constructor(params: {
        ctx: SolverContext;
        issues: SchematicPlacementIssue[];
    });
    _step(): void;
    private detectPair;
    private detectLabelLabel;
    private detectBoxLabel;
    private buildAndPushIssues;
    private buildAndPushIssueForSheet;
    private computeGlobalFixes;
    private buildNetLabelsByComponentId;
    static netLabelCollisionToString(issue: NetLabelCollision): string;
}

declare class ComponentPinAlignmentSolver extends BaseSolver {
    private static readonly ALIGNMENT_EPSILON;
    private readonly ctx;
    private readonly out;
    constructor({ ctx, issues, }: {
        ctx: SolverContext;
        issues: SchematicPlacementIssue[];
    });
    _step(): void;
    private getTracePinPair;
    private findPortAtPoint;
    private findVerticalShiftIssue;
    private getPinLabel;
    static issueToString(issue: ComponentPinsWouldAlignWithVerticalShift): string;
}

declare class CrystalLoadCapacitorPlacementSolver extends BaseSolver {
    private static readonly ALIGNMENT_TOLERANCE;
    private readonly issues;
    private readonly networks;
    private currentNetworkIndex;
    constructor({ ctx, issues, }: {
        ctx: SolverContext;
        issues: SchematicPlacementIssue[];
    });
    _step(): void;
    private findCrystalLoadNetworks;
    static issueToString(issue: CrystalNotCenteredOverLoadCapacitors): string;
}

declare class DiodeResistorAlignmentSolver extends BaseSolver {
    private static readonly DIODE_FTYPES;
    private readonly ctx;
    private readonly out;
    private readonly schematicTraces;
    private currentIndex;
    private readonly sourceConnectivity;
    private readonly sourceComponentFtypeById;
    private readonly sourceComponentIdBySourcePortId;
    private readonly schematicPorts;
    private readonly schematicBoxBySourceComponentId;
    constructor({ ctx, issues, }: {
        ctx: SolverContext;
        issues: SchematicPlacementIssue[];
    });
    _step(): void;
    private static isCoLinear;
    private static pinsFacingEachOther;
    private static dist;
    private findNearestPort;
    private findSourceComponentIdNearPoint;
    private buildSourceComponentFtypeById;
    private buildSourceComponentIdBySourcePortId;
    private buildSchematicBoxBySourceComponentId;
    static issueToString(issue: DiodeResistorNotAligned): string;
}

declare class FeedbackNetworkPlacementSolver extends BaseSolver {
    private static readonly MIN_BODY_GAP;
    private readonly index;
    private readonly amplifierIds;
    private readonly issues;
    private currentIndex;
    constructor({ ctx, issues, }: {
        ctx: SolverContext;
        issues: SchematicPlacementIssue[];
    });
    _step(): void;
    static issueToString(issue: FeedbackNetworkNotCompact): string;
}

declare class PullResistorPlacementSolver extends BaseSolver {
    private static readonly MIN_WRONG_SIDE_GAP;
    private readonly index;
    private readonly resistorIds;
    private readonly horizontalPushbuttonComponentIds;
    private readonly issues;
    private currentIndex;
    constructor({ ctx, issues, }: {
        ctx: SolverContext;
        issues: SchematicPlacementIssue[];
    });
    _step(): void;
    static issueToString(issue: PullResistorOnWrongSide): string;
}

/** Recognize switch pull branches without requiring IC pull-pin metadata. */
declare class SwitchPullResistorPlacementSolver extends BaseSolver {
    private readonly params;
    constructor(params: {
        ctx: SolverContext;
        issues: SchematicPlacementIssue[];
    });
    _step(): void;
}

/** Prefer vertical two-pin components with power above and ground below. */
declare class TwoPinComponentRailOrientationSolver extends BaseSolver {
    private static readonly EPSILON;
    private readonly index;
    private readonly powerNets;
    private readonly groundNets;
    private readonly positiveVoltageNets;
    private readonly componentIds;
    private readonly horizontalPushbuttonComponentIds;
    private readonly issues;
    private currentIndex;
    constructor({ ctx, issues, }: {
        ctx: SolverContext;
        issues: SchematicPlacementIssue[];
    });
    _step(): void;
    static issueToString(issue: TwoPinComponentShouldBeVertical | TwoPinComponentHasInvertedRails): string;
}

declare class SchematicBoxInnerLabelCollisionSolver extends BaseSolver {
    private readonly params;
    private entries;
    private readonly placementById;
    private currentIndex;
    constructor(params: {
        ctx: SolverContext;
        issues: SchematicPlacementIssue[];
    });
    _step(): void;
    static issueToString(issue: SchematicBoxInnerLabelCollision): string;
    private getMessage;
    private isSchematicPort;
    private isSchematicSide;
    private getPlacementBySchematicComponentId;
    private getPortsBySchematicComponentId;
    private getCollisionSummary;
    private sortSides;
}

declare class SchematicBoxOverlapSolver extends BaseSolver {
    private readonly params;
    private readonly placements;
    private firstIndex;
    private secondIndex;
    constructor(params: {
        ctx: SolverContext;
        issues: SchematicPlacementIssue[];
    });
    _step(): void;
    private getCenteredRectBounds;
    private getOverlapCorrectionSuggestions;
    static issueToString(issue: ComponentOverlap): string;
    private static correctionSuggestionToString;
    private getComponentOverlap;
}

declare class SchematicBoxTooWideSolver extends BaseSolver {
    private readonly params;
    private readonly SCHEMATIC_BOX_TOO_WIDE_MESSAGE;
    private readonly PIN_HEADER_MAX_ALLOWED_GAP;
    private readonly GENERIC_MAX_ALLOWED_GAP;
    private readonly PIN_LABEL_EDGE_PADDING;
    private readonly GAP_COMPARISON_EPSILON;
    private readonly entries;
    private readonly placementById;
    private readonly schematicComponentById;
    private readonly sourceComponentById;
    private currentIndex;
    constructor(params: {
        ctx: SolverContext;
        issues: SchematicPlacementIssue[];
    });
    _step(): void;
    static issueToString(issue: SchematicBoxTooWideIssue): string;
    private isSchematicPort;
    private getSourceComponentWithFtype;
    private exceedsMaxAllowedGap;
    private getCenteredRectBounds;
    private getSourceComponentById;
    private getPlacementBySchematicComponentId;
    private getPortsBySchematicComponentId;
    private getSourceComponentFtype;
    private getLabelColumn;
    private getInnerLabelEdge;
    private getSuggestedWidth;
}

declare class SchematicPinPaddingToEdgeSolver extends BaseSolver {
    private readonly params;
    private readonly MESSAGE;
    private readonly GAP_COMPARISON_EPSILON;
    private readonly entries;
    private readonly placementById;
    private readonly schematicComponentById;
    private readonly sourcePortById;
    private currentIndex;
    constructor(params: {
        ctx: SolverContext;
        issues: SchematicPlacementIssue[];
    });
    _step(): void;
    static issueToString(issue: SchematicPinPaddingToEdgeTooLarge): string;
    private isSchematicPort;
    private isSourcePort;
    private isSchematicComponent;
    private isHorizontalSide;
    private isVerticalSide;
    private isSchematicSide;
    private exceedsMaxAllowedGap;
    private getCenteredRectBounds;
    private getSourcePortById;
    private getSchematicComponentById;
    private getPlacementBySchematicComponentId;
    private getPortsBySchematicComponentId;
    private getPinSpacing;
    private getPinName;
    private getMaxLabelLengthBySide;
    private getOuterPinBySide;
    private getPinPaddingToEdge;
    private getBoxEdgeSidesForPinSide;
    private getMaxAllowedPinPadding;
    private createIssue;
}

declare class SchematicPlacementPipeline extends BasePipelineSolver<CircuitJson> {
    ctx: SolverContext;
    readonly issues: SchematicPlacementIssue[];
    pipelineDef: PipelineStep<any>[];
    private readonly selectedIssueTypes?;
    private readonly railPathVisibility;
    constructor(circuitJson: CircuitJson, options?: SchematicPlacementAnalysisOptions);
    _setup(): void;
    getOutput(): {
        issues: SchematicPlacementIssue[];
        componentPlacements: SchematicBoxPlacementLineItem[];
    };
}

declare class TraceSimplificationSolver extends BaseSolver {
    private static readonly EPSILON;
    private readonly ctx;
    private readonly out;
    constructor({ ctx, issues, }: {
        ctx: SolverContext;
        issues: SchematicPlacementIssue[];
    });
    _step(): void;
    private getCandidate;
    /** calculate-elbow proposes geometry, not obstacle avoidance. Only report a
     * move when every attached route can be preserved or improved and the exact
     * proposed geometry is clear. Unsupported junctions are deliberately skipped. */
    private validateMove;
    private getTracePoints;
    private countTurns;
    private pointsEqual;
    private getAxis;
    private isPointInFacingDirection;
    private findPortAtPoint;
    private wouldOverlapAnotherComponent;
    private makeIssue;
    private getMoveDirection;
    static issueToString(issue: TraceCanBeSimplifiedByMovingComponent): string;
}

declare class TwoPinComponentOrientationSolver extends BaseSolver {
    private static readonly EPSILON;
    private readonly ctx;
    private readonly out;
    private readonly powerOrGroundConnectionIds;
    constructor({ ctx, issues, }: {
        ctx: SolverContext;
        issues: SchematicPlacementIssue[];
    });
    _step(): void;
    private getFlipCandidate;
    private getTraceEndpoints;
    private getTracePoints;
    private countTurns;
    private traceLeavesPortInFacingDirection;
    private areOppositePorts;
    private getMinimumTurnCount;
    private isPointInFacingDirection;
    private getAxis;
    private pointsEqual;
    private findPortAtPoint;
    private getTraceLength;
    private isBetterCandidate;
    private makeIssue;
    static issueToString(issue: TwoPinComponentCouldBeFlipped): string;
}

declare class VerboseNetLabelSolver extends BaseSolver {
    private readonly params;
    readonly VERBOSE_NET_LABEL_MESSAGE = "Create trace with schDisplayLabel";
    private readonly netLabels;
    private readonly tokenToInvolvedPin;
    private readonly schematicSheetNameById;
    private currentIndex;
    private readonly seen;
    constructor(params: {
        ctx: SolverContext;
        issues: SchematicPlacementIssue[];
    });
    _step(): void;
    static issueToString(issue: VerboseSchematicNetLabel): string;
    private isSchematicNetLabel;
    private isSourcePort;
    private getSourceComponentWithName;
    private getSourcePortNameCandidates;
    private getBestSourcePortName;
    private buildTokenToInvolvedPinMap;
    private getInvolvedPins;
}

/** Advisory for an unambiguous grounded-emitter NPN driving a local load. */
declare class LowSideTransistorPlacementSolver extends BaseSolver {
    private readonly index;
    private readonly positiveNets;
    private readonly transistorIds;
    private readonly issues;
    private currentIndex;
    constructor({ ctx, issues, }: {
        ctx: SolverContext;
        issues: SchematicPlacementIssue[];
    });
    _step(): void;
    static issueToString(issue: LowSideTransistorNotAlignedWithLoad): string;
}

/** Report a USB series pair drawn end-to-end instead of in parallel paths. */
declare class UsbSeriesResistorPlacementSolver extends BaseSolver {
    private readonly params;
    private readonly index;
    private readonly hostIds;
    private readonly reportedPairs;
    private currentIndex;
    constructor(params: {
        ctx: SolverContext;
        issues: SchematicPlacementIssue[];
    });
    _step(): void;
    private seriesResistor;
    private shareInterface;
    static issueToString(issue: UsbSeriesResistorsNotAligned): string;
}

interface SchematicPlacementIssueArtifact {
    /** Stable within this analysis, even when filtering the returned artifacts. */
    issueIndex: number;
    issue: SchematicPlacementIssue;
    schematicSheetId?: string;
    /** Unpadded issue geometry and involved component bounds; schematic units, Y up. */
    bounds?: SchematicIssueBounds;
    descriptionXml: string;
    fileName: string;
    contentType: "image/svg+xml";
    /** A cropped schematic with just this issue's overlay and its XML underneath. */
    content: string;
}
interface SchematicPlacementIssueArtifactOptions {
    /** Reuse an analysis of the same circuit to avoid running the solvers again. */
    analysis?: SchematicPlacementAnalysis;
    issueTypes?: readonly SchematicPlacementIssue["lineItemType"][];
    schematicSheetId?: string;
    /** Width and height of the schematic panel; the XML panel adds to total height. */
    width?: number;
    height?: number;
}
/** Create one self-contained SVG per emitted issue, without filesystem access.
 * No issues (or no filter matches) returns []. Other issues' overlays, counts,
 * and XML are excluded; surrounding schematic elements remain as context. */
declare function createSchematicPlacementIssueArtifacts(circuitJson: CircuitJson, options?: SchematicPlacementIssueArtifactOptions): SchematicPlacementIssueArtifact[];

declare class SchematicTextClearanceSolver extends BaseSolver {
    private readonly params;
    private readonly texts;
    private readonly obstacles;
    private readonly sheetNames;
    private index;
    constructor(params: {
        ctx: SolverContext;
        issues: SchematicPlacementIssue[];
    });
    _step(): void;
    private collides;
    private findClearPosition;
    static issueToString(issue: SchematicTextCollision): string;
}

declare class ResetNetworkGroupingSolver extends BaseSolver {
    private readonly params;
    private static readonly MIN_DISTANCE;
    private readonly networks;
    private index;
    constructor(params: {
        ctx: SolverContext;
        issues: SchematicPlacementIssue[];
    });
    _step(): void;
    private findNetworks;
    static issueToString(issue: ResetNetworkNotGrouped): string;
}

/** Translate a one-sided connector when multiple signal routes double back. */
declare class ConnectorPlacementSolver extends BaseSolver {
    private readonly params;
    constructor(params: {
        ctx: SolverContext;
        issues: SchematicPlacementIssue[];
    });
    _step(): void;
    static issueToString(issue: ConnectorPositionCausesTraceDetours): string;
}

/** A local input/output capacitor pair placed across the regulator from its ports. */
declare class RegulatorInputOutputCapacitorPlacementSolver extends BaseSolver {
    private readonly params;
    private readonly index;
    private readonly hostIds;
    private currentIndex;
    constructor(params: {
        ctx: SolverContext;
        issues: SchematicPlacementIssue[];
    });
    _step(): void;
    private localCapacitor;
    static issueToString(issue: RegulatorCapacitorsOnWrongSides): string;
}

/** Recognize divider topology, including taps joined through net labels. */
declare class VoltageDividerPlacementSolver extends BaseSolver {
    private readonly params;
    private readonly index;
    private readonly positiveNets;
    private readonly resistorIds;
    private currentIndex;
    constructor(params: {
        ctx: SolverContext;
        issues: SchematicPlacementIssue[];
    });
    _step(): void;
    private isResistor;
    private getDownwardResistorPorts;
    static issueToString(issue: VoltageDividerSupplyResistorBelowGroundResistor): string;
}

/** A displaced local shunt whose sense pair is split between a wire and labels. */
declare class CurrentSenseShuntPlacementSolver extends BaseSolver {
    private readonly params;
    private readonly index;
    private readonly hostIds;
    private readonly traces;
    private currentIndex;
    constructor(params: {
        ctx: SolverContext;
        issues: SchematicPlacementIssue[];
    });
    _step(): void;
    private hasVisibleConnection;
    private sourceTraceTouchesNet;
    static issueToString(issue: CurrentSenseShuntSeparatedFromInputs): string;
}

/** Local relay protection whose diode is displaced and connected through labels. */
declare class RelayFlybackDiodePlacementSolver extends BaseSolver {
    private readonly params;
    private readonly index;
    private readonly relayIds;
    private currentIndex;
    constructor(params: {
        ctx: SolverContext;
        issues: SchematicPlacementIssue[];
    });
    _step(): void;
    private hasWireAtPin;
    private uniquePort;
    private coilPorts;
    private hasGroundedDriver;
    static issueToString(issue: FlybackDiodeSeparatedFromRelayCoil): string;
}

/** A local series-gate / gate-source resistor pair scattered away from its MOSFET. */
declare class MosfetGateNetworkPlacementSolver extends BaseSolver {
    private readonly params;
    private readonly index;
    private readonly mosfetIds;
    private currentIndex;
    constructor(params: {
        ctx: SolverContext;
        issues: SchematicPlacementIssue[];
    });
    _step(): void;
    private mosfetPorts;
    static issueToString(issue: MosfetGateNetworkNotGrouped): string;
}

/** A capacitor connected across two chip pins, placed far across the chip from them. */
declare class ChipPinPairCapacitorPlacementSolver extends BaseSolver {
    private readonly params;
    private readonly index;
    private readonly capacitorIds;
    private readonly unpopulated;
    private currentIndex;
    constructor(params: {
        ctx: SolverContext;
        issues: SchematicPlacementIssue[];
    });
    _step(): void;
    static issueToString(issue: CapacitorSeparatedFromChipPins): string;
}

/** Group an unambiguous signal C–L–C pi filter without prescribing its orientation. */
declare class PiFilterPlacementSolver extends BaseSolver {
    private readonly params;
    private readonly index;
    private readonly inductorIds;
    private readonly unpopulated;
    private currentIndex;
    constructor(params: {
        ctx: SolverContext;
        issues: SchematicPlacementIssue[];
    });
    _step(): void;
    private localPart;
    static issueToString(issue: PiFilterComponentsNotGrouped): string;
}

/** Advisory about visible drawing extent, not electrical impedance or PCB distance.
 * Only explicit rails, routed segments, and local two-terminal R/C/L bridges count.
 * Labels never teleport a route across the drawing or to another sheet.
 */
declare class RailPathVisibilitySolver extends BaseSolver {
    private readonly index;
    private readonly nodes;
    private readonly starts;
    private currentIndex;
    private readonly issues;
    private readonly maxSpan;
    private readonly maxLength;
    constructor({ ctx, issues, maxSpan, maxLength, }: {
        ctx: SolverContext;
        issues: SchematicPlacementIssue[];
        maxSpan?: number;
        maxLength?: number;
    });
    _step(): void;
    static issueToString(issue: RailPathTooSpreadOut): string;
}

export { CapacitorOrientationSolver, type CapacitorSeparatedFromChipPins, type CapacitorSymbolHorizontal, ChipPinPairCapacitorPlacementSolver, type ComponentBoxNetLabelCollision, type ComponentNetLabelCollision, ComponentNetLabelCollisionSolver, type ComponentOverlap, ComponentPinAlignmentSolver, type ComponentPinsWouldAlignWithVerticalShift, ConnectorPlacementSolver, type ConnectorPositionCausesTraceDetours, CrystalLoadCapacitorPlacementSolver, type CrystalNotCenteredOverLoadCapacitors, CurrentSenseShuntPlacementSolver, type CurrentSenseShuntSeparatedFromInputs, DecouplingCapacitorGroupingSolver, type DecouplingCapacitorsNotCloseTogether, DiodeResistorAlignmentSolver, type DiodeResistorNotAligned, type FeedbackNetworkNotCompact, FeedbackNetworkPlacementSolver, type FlybackDiodeSeparatedFromRelayCoil, type GenericSchematicBoxTooWide, type LowSideTransistorNotAlignedWithLoad, LowSideTransistorPlacementSolver, type MosfetGateNetworkNotGrouped, MosfetGateNetworkPlacementSolver, type NetLabelCollision, type OverlapCorrectionSuggestion, type ParallelDiodeResistorNotAligned, ParallelDiodeResistorPlacementSolver, type PiFilterComponentsNotGrouped, PiFilterPlacementSolver, type PinHeaderSchematicBoxTooWide, type PullResistorOnWrongSide, PullResistorPlacementSolver, type RailPathTooSpreadOut, RailPathVisibilitySolver, type RegulatorCapacitorsOnWrongSides, RegulatorInputOutputCapacitorPlacementSolver, RelayFlybackDiodePlacementSolver, ResetNetworkGroupingSolver, type ResetNetworkNotGrouped, type SchematicBoxHasALotOfSurroundingWhitespace, type SchematicBoxInnerLabelCollision, SchematicBoxInnerLabelCollisionSolver, SchematicBoxOverlapSolver, type SchematicBoxPlacement, type SchematicBoxPlacementLineItem, type SchematicBoxTooWideIssue, SchematicBoxTooWideSolver, type SchematicIssueBounds, SchematicPinPaddingToEdgeSolver, type SchematicPinPaddingToEdgeTooLarge, SchematicPlacementAnalysis, type SchematicPlacementAnalysisOptions, type SchematicPlacementIssue, type SchematicPlacementIssueArtifact, type SchematicPlacementIssueArtifactOptions, type SchematicPlacementIssues, type SchematicPlacementLineItem, SchematicPlacementPipeline, type SchematicPortFacingDirection, type SchematicSide, SchematicTextClearanceSolver, type SchematicTextCollision, type SchematicTextCollisionObject, SwitchPullResistorPlacementSolver, type TraceCanBeSimplifiedByMovingComponent, TraceSimplificationSolver, type TwoPinComponentCouldBeFlipped, type TwoPinComponentHasInvertedRails, TwoPinComponentOrientationSolver, TwoPinComponentRailOrientationSolver, type TwoPinComponentShouldBeVertical, UsbSeriesResistorPlacementSolver, type UsbSeriesResistorsNotAligned, VerboseNetLabelSolver, type VerboseSchematicNetLabel, VoltageDividerPlacementSolver, type VoltageDividerSupplyResistorBelowGroundResistor, analyzeSchematicPlacement, createSchematicPlacementIssueArtifacts };
