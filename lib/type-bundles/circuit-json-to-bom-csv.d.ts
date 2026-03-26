import { AnyCircuitElement, SourceComponentBase, PcbComponent } from 'circuit-json';

type SupplierPartNumberColumn = "JLCPCB Part #";
interface BomRow {
    designator: string;
    comment: string;
    value: string;
    footprint: string;
    supplier_part_number_columns?: Partial<Record<SupplierPartNumberColumn, string>>;
    manufacturer_mpn_pairs?: Array<{
        manufacturer: string;
        mpn: string;
    }>;
    extra_columns?: Record<string, string>;
}
interface ResolvedPart {
    part_number?: string;
    footprint?: string;
    comment?: string;
    supplier_part_number_columns?: Record<SupplierPartNumberColumn, string>;
    manufacturer_mpn_pairs?: Array<{
        manufacturer: string;
        mpn: string;
    }>;
    extra_columns?: Record<string, string>;
}
declare const convertCircuitJsonToBomRows: ({ circuitJson, resolvePart, }: {
    circuitJson: AnyCircuitElement[];
    resolvePart?: (part_info: {
        source_component: SourceComponentBase;
        pcb_component: PcbComponent;
    }) => Promise<ResolvedPart | null>;
}) => Promise<BomRow[]>;
declare const convertBomRowsToCsv: (bom_rows: BomRow[]) => string;

export { convertBomRowsToCsv, convertCircuitJsonToBomRows };
