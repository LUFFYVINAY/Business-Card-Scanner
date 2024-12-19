export interface ExcelJson {
    data: ExcelRow[];
    skipHeader?: boolean;
    header?: string[];
}

export interface ExcelRow {
    srNo: number;
    name: string;
    company: string;
    phone: string;
    email: string;
    address: string;
}

