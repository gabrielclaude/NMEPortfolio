import * as XLSX from "xlsx";
import Papa from "papaparse";

export type ParsedRow = Record<string, string | number | boolean | null>;
export type ParsedData = {
  headers: string[];
  rows: ParsedRow[];
};

export async function parseExcel(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<ParsedRow>(sheet, { header: 1 });

        if (jsonData.length < 2) {
          reject(new Error("File must contain headers and at least one data row"));
          return;
        }

        const headers = (jsonData[0] as unknown as string[]).map((h) => String(h).trim());
        const rows = jsonData.slice(1).map((row) => {
          const rowArray = row as unknown as (string | number | boolean | null)[];
          const obj: ParsedRow = {};
          headers.forEach((header, index) => {
            obj[header] = rowArray[index] ?? null;
          });
          return obj;
        }).filter((row) => Object.values(row).some((v) => v !== null && v !== ""));

        resolve({ headers, rows });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsBinaryString(file);
  });
}

export async function parseCsv(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(results.errors[0].message));
          return;
        }

        const rows = results.data as ParsedRow[];
        if (rows.length === 0) {
          reject(new Error("File must contain at least one data row"));
          return;
        }

        const headers = Object.keys(rows[0]);
        resolve({ headers, rows });
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

export async function parseFile(file: File): Promise<ParsedData> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "csv") {
    return parseCsv(file);
  } else if (extension === "xlsx" || extension === "xls") {
    return parseExcel(file);
  } else {
    throw new Error("Unsupported file type. Please upload a CSV or Excel file.");
  }
}

export function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

export function findBestMatch(header: string, targetFields: string[]): string | null {
  const normalized = normalizeHeader(header);

  // Exact match
  const exactMatch = targetFields.find(
    (f) => normalizeHeader(f) === normalized
  );
  if (exactMatch) return exactMatch;

  // Partial match
  const partialMatch = targetFields.find(
    (f) => normalizeHeader(f).includes(normalized) || normalized.includes(normalizeHeader(f))
  );
  if (partialMatch) return partialMatch;

  return null;
}
