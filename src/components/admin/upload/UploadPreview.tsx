"use client";

import { useMemo } from "react";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ParsedRow } from "@/lib/upload/parseFile";
import type { ColumnMapping, FieldDefinition } from "./ColumnMapper";

export type ValidationError = {
  row: number;
  field: string;
  message: string;
};

export type ValidatedRow = {
  data: Record<string, unknown>;
  errors: ValidationError[];
  isValid: boolean;
};

type UploadPreviewProps = {
  rows: ParsedRow[];
  mapping: ColumnMapping;
  fields: FieldDefinition[];
  maxPreviewRows?: number;
};

function validateValue(
  value: unknown,
  field: FieldDefinition
): string | null {
  const strValue = value === null || value === undefined ? "" : String(value).trim();

  if (field.required && strValue === "") {
    return `${field.label} is required`;
  }

  if (strValue === "") return null;

  if (field.type === "number") {
    const num = Number(strValue);
    if (isNaN(num)) {
      return `${field.label} must be a number`;
    }
  }

  if (field.type === "date") {
    const date = new Date(strValue);
    if (isNaN(date.getTime())) {
      return `${field.label} must be a valid date`;
    }
  }

  if (field.type === "enum" && field.enumValues) {
    const normalizedValue = strValue.toUpperCase().replace(/\s+/g, "_");
    if (!field.enumValues.includes(normalizedValue) && !field.enumValues.includes(strValue)) {
      return `${field.label} must be one of: ${field.enumValues.join(", ")}`;
    }
  }

  return null;
}

function transformRow(
  row: ParsedRow,
  mapping: ColumnMapping,
  fields: FieldDefinition[],
  rowIndex: number
): ValidatedRow {
  const data: Record<string, unknown> = {};
  const errors: ValidationError[] = [];

  // Build reverse mapping: targetField -> sourceColumn
  const reverseMapping: Record<string, string> = {};
  Object.entries(mapping).forEach(([source, target]) => {
    if (target) reverseMapping[target] = source;
  });

  fields.forEach((field) => {
    const sourceColumn = reverseMapping[field.name];
    const rawValue = sourceColumn ? row[sourceColumn] : null;

    // Transform value based on type
    let transformedValue: unknown = rawValue;
    const strValue = rawValue === null || rawValue === undefined ? "" : String(rawValue).trim();

    if (strValue !== "") {
      if (field.type === "number") {
        transformedValue = Number(strValue);
      } else if (field.type === "date") {
        transformedValue = strValue;
      } else if (field.type === "boolean") {
        transformedValue = ["true", "yes", "1", "on"].includes(strValue.toLowerCase());
      } else if (field.type === "enum" && field.enumValues) {
        const normalized = strValue.toUpperCase().replace(/\s+/g, "_");
        transformedValue = field.enumValues.includes(normalized) ? normalized : strValue;
      } else {
        transformedValue = strValue;
      }
    } else {
      transformedValue = null;
    }

    data[field.name] = transformedValue;

    // Validate
    const error = validateValue(rawValue, field);
    if (error) {
      errors.push({ row: rowIndex, field: field.name, message: error });
    }
  });

  return { data, errors, isValid: errors.length === 0 };
}

export function useValidatedRows(
  rows: ParsedRow[],
  mapping: ColumnMapping,
  fields: FieldDefinition[]
): { validatedRows: ValidatedRow[]; summary: { total: number; valid: number; invalid: number } } {
  return useMemo(() => {
    const validatedRows = rows.map((row, index) =>
      transformRow(row, mapping, fields, index)
    );

    const valid = validatedRows.filter((r) => r.isValid).length;
    return {
      validatedRows,
      summary: {
        total: rows.length,
        valid,
        invalid: rows.length - valid,
      },
    };
  }, [rows, mapping, fields]);
}

export function UploadPreview({
  rows,
  mapping,
  fields,
  maxPreviewRows = 10,
}: UploadPreviewProps) {
  const { validatedRows, summary } = useValidatedRows(rows, mapping, fields);

  const previewRows = validatedRows.slice(0, maxPreviewRows);
  const mappedFields = fields.filter((f) =>
    Object.values(mapping).includes(f.name)
  );

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gray-200 rounded-full">
            <span className="text-sm font-semibold text-gray-700">
              {summary.total}
            </span>
          </div>
          <span className="text-sm text-gray-600">Total rows</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-100 rounded-full">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </div>
          <span className="text-sm text-gray-600">
            <strong className="text-emerald-700">{summary.valid}</strong> valid
          </span>
        </div>
        {summary.invalid > 0 && (
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-100 rounded-full">
              <XCircle className="h-4 w-4 text-red-600" />
            </div>
            <span className="text-sm text-gray-600">
              <strong className="text-red-700">{summary.invalid}</strong> with errors
            </span>
          </div>
        )}
      </div>

      {/* Preview Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-3 py-2 text-left font-medium text-gray-500 w-8">
                  #
                </th>
                <th className="px-3 py-2 text-left font-medium text-gray-500 w-8">
                  Status
                </th>
                {mappedFields.map((field) => (
                  <th
                    key={field.name}
                    className="px-3 py-2 text-left font-medium text-gray-500"
                  >
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {previewRows.map((row, index) => (
                <tr
                  key={index}
                  className={cn(
                    "hover:bg-gray-50",
                    !row.isValid && "bg-red-50"
                  )}
                >
                  <td className="px-3 py-2 text-gray-500">{index + 1}</td>
                  <td className="px-3 py-2">
                    {row.isValid ? (
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <div className="group relative">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <div className="absolute left-6 top-0 hidden group-hover:block z-10 w-64 p-2 bg-white border rounded-lg shadow-lg">
                          <ul className="text-xs text-red-600 space-y-1">
                            {row.errors.map((err, i) => (
                              <li key={i}>{err.message}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </td>
                  {mappedFields.map((field) => {
                    const value = row.data[field.name];
                    const hasError = row.errors.some(
                      (e) => e.field === field.name
                    );
                    return (
                      <td
                        key={field.name}
                        className={cn(
                          "px-3 py-2",
                          hasError && "text-red-600 font-medium"
                        )}
                      >
                        {value === null || value === undefined
                          ? <span className="text-gray-300">-</span>
                          : String(value)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length > maxPreviewRows && (
          <div className="px-4 py-2 bg-gray-50 border-t text-sm text-gray-500">
            Showing {maxPreviewRows} of {rows.length} rows
          </div>
        )}
      </div>
    </div>
  );
}
