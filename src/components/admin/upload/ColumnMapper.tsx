"use client";

import { useMemo } from "react";
import { ArrowRight, Check, AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { findBestMatch } from "@/lib/upload/parseFile";

export type FieldDefinition = {
  name: string;
  label: string;
  required: boolean;
  type?: "string" | "number" | "date" | "boolean" | "enum";
  enumValues?: string[];
};

export type ColumnMapping = Record<string, string | null>;

type ColumnMapperProps = {
  sourceColumns: string[];
  targetFields: FieldDefinition[];
  mapping: ColumnMapping;
  onMappingChange: (mapping: ColumnMapping) => void;
};

export function ColumnMapper({
  sourceColumns,
  targetFields,
  mapping,
  onMappingChange,
}: ColumnMapperProps) {
  const autoMapping = useMemo(() => {
    const result: ColumnMapping = {};
    sourceColumns.forEach((col) => {
      const match = findBestMatch(
        col,
        targetFields.map((f) => f.name)
      );
      result[col] = match;
    });
    return result;
  }, [sourceColumns, targetFields]);

  const currentMapping = useMemo(() => {
    return { ...autoMapping, ...mapping };
  }, [autoMapping, mapping]);

  const mappedFields = useMemo(() => {
    return new Set(Object.values(currentMapping).filter(Boolean));
  }, [currentMapping]);

  const unmappedRequired = useMemo(() => {
    return targetFields.filter(
      (f) => f.required && !mappedFields.has(f.name)
    );
  }, [targetFields, mappedFields]);

  const handleChange = (sourceColumn: string, targetField: string | null) => {
    onMappingChange({
      ...currentMapping,
      [sourceColumn]: targetField === "none" ? null : targetField,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Map Columns</h3>
        {unmappedRequired.length > 0 && (
          <div className="flex items-center gap-1 text-sm text-amber-600">
            <AlertCircle className="h-4 w-4" />
            {unmappedRequired.length} required field(s) not mapped
          </div>
        )}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-2 text-left font-medium text-gray-500">
                File Column
              </th>
              <th className="px-4 py-2 w-8"></th>
              <th className="px-4 py-2 text-left font-medium text-gray-500">
                Maps To
              </th>
              <th className="px-4 py-2 w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sourceColumns.map((col) => {
              const mappedTo = currentMapping[col];
              const targetField = targetFields.find((f) => f.name === mappedTo);
              const isMapped = !!mappedTo;

              return (
                <tr key={col} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {col}
                    </code>
                  </td>
                  <td className="px-2">
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      value={mappedTo || "none"}
                      onValueChange={(val) => handleChange(col, val)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          <span className="text-gray-400">-- Skip column --</span>
                        </SelectItem>
                        {targetFields.map((field) => (
                          <SelectItem
                            key={field.name}
                            value={field.name}
                            disabled={
                              mappedFields.has(field.name) &&
                              currentMapping[col] !== field.name
                            }
                          >
                            <span className="flex items-center gap-2">
                              {field.label}
                              {field.required && (
                                <span className="text-red-500">*</span>
                              )}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-2">
                    {isMapped && (
                      <Check
                        className={cn(
                          "h-4 w-4",
                          targetField?.required
                            ? "text-emerald-500"
                            : "text-gray-400"
                        )}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {unmappedRequired.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm text-amber-800">
            <strong>Required fields not mapped:</strong>{" "}
            {unmappedRequired.map((f) => f.label).join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}

export function useColumnMapper(
  sourceColumns: string[],
  targetFields: FieldDefinition[]
) {
  const initialMapping = useMemo(() => {
    const result: ColumnMapping = {};
    sourceColumns.forEach((col) => {
      const match = findBestMatch(
        col,
        targetFields.map((f) => f.name)
      );
      result[col] = match;
    });
    return result;
  }, [sourceColumns, targetFields]);

  return initialMapping;
}
