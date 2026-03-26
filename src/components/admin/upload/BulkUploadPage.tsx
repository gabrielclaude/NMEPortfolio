"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FileUploadZone } from "./FileUploadZone";
import { ColumnMapper, type FieldDefinition, type ColumnMapping } from "./ColumnMapper";
import { UploadPreview, useValidatedRows } from "./UploadPreview";
import { parseFile, type ParsedData, type ParsedRow } from "@/lib/upload/parseFile";
import type { BulkUploadResult } from "@/actions/upload.actions";

type Step = "upload" | "map" | "preview" | "complete";

type BulkUploadPageProps = {
  title: string;
  description: string;
  backHref: string;
  backLabel: string;
  fields: FieldDefinition[];
  onUpload: (data: Record<string, unknown>[]) => Promise<BulkUploadResult>;
};

export function BulkUploadPage({
  title,
  description,
  backHref,
  backLabel,
  fields,
  onUpload,
}: BulkUploadPageProps) {
  const [step, setStep] = useState<Step>("upload");
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<BulkUploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);
    try {
      const data = await parseFile(file);
      setParsedData(data);
      setStep("map");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse file");
    }
  }, []);

  const handleMappingChange = useCallback((newMapping: ColumnMapping) => {
    setMapping(newMapping);
  }, []);

  const handleContinueToPreview = useCallback(() => {
    setStep("preview");
  }, []);

  const handleBack = useCallback(() => {
    if (step === "map") {
      setStep("upload");
      setParsedData(null);
      setMapping({});
    } else if (step === "preview") {
      setStep("map");
    }
  }, [step]);

  const { validatedRows, summary } = useValidatedRows(
    parsedData?.rows || [],
    mapping,
    fields
  );

  const handleUpload = useCallback(async () => {
    const validData = validatedRows.filter((r) => r.isValid).map((r) => r.data);
    if (validData.length === 0) {
      toast.error("No valid rows to upload");
      return;
    }

    setIsUploading(true);
    try {
      const uploadResult = await onUpload(validData);
      setResult(uploadResult);
      setStep("complete");
      if (uploadResult.success) {
        toast.success(`Successfully created ${uploadResult.created} record(s)`);
      } else {
        toast.warning(
          `Created ${uploadResult.created} record(s), ${uploadResult.failed} failed`
        );
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }, [validatedRows, onUpload]);

  const requiredFieldsMapped = fields
    .filter((f) => f.required)
    .every((f) => Object.values(mapping).includes(f.name));

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href={backHref} className="flex items-center gap-1 hover:text-gray-900">
          <ChevronLeft className="h-4 w-4" />
          {backLabel}
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{description}</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4">
        {(["upload", "map", "preview", "complete"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === s
                  ? "bg-amber-500 text-white"
                  : ["upload", "map", "preview", "complete"].indexOf(step) > i
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {["upload", "map", "preview", "complete"].indexOf(step) > i ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                i + 1
              )}
            </div>
            <span
              className={`text-sm ${
                step === s ? "font-medium text-gray-900" : "text-gray-500"
              }`}
            >
              {s === "upload"
                ? "Upload File"
                : s === "map"
                ? "Map Columns"
                : s === "preview"
                ? "Preview"
                : "Complete"}
            </span>
            {i < 3 && <div className="w-8 h-px bg-gray-300" />}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {step === "upload" && (
          <div className="space-y-4">
            <FileUploadZone onFileSelect={handleFileSelect} />
            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            <div className="text-sm text-gray-500">
              <p className="font-medium mb-2">Expected columns:</p>
              <div className="flex flex-wrap gap-2">
                {fields.map((f) => (
                  <span
                    key={f.name}
                    className={`px-2 py-1 rounded text-xs ${
                      f.required
                        ? "bg-amber-100 text-amber-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {f.label}
                    {f.required && " *"}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === "map" && parsedData && (
          <div className="space-y-6">
            <ColumnMapper
              sourceColumns={parsedData.headers}
              targetFields={fields}
              mapping={mapping}
              onMappingChange={handleMappingChange}
            />
            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button
                onClick={handleContinueToPreview}
                disabled={!requiredFieldsMapped}
              >
                Continue to Preview
              </Button>
            </div>
          </div>
        )}

        {step === "preview" && parsedData && (
          <div className="space-y-6">
            <UploadPreview
              rows={parsedData.rows}
              mapping={mapping}
              fields={fields}
            />
            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button
                onClick={handleUpload}
                disabled={isUploading || summary.valid === 0}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload {summary.valid} Record{summary.valid !== 1 ? "s" : ""}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === "complete" && result && (
          <div className="space-y-6 text-center py-8">
            <div
              className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                result.success ? "bg-emerald-100" : "bg-amber-100"
              }`}
            >
              {result.success ? (
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              ) : (
                <AlertCircle className="h-8 w-8 text-amber-600" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {result.success ? "Upload Complete" : "Upload Completed with Errors"}
              </h3>
              <p className="text-gray-500 mt-1">
                {result.created} record(s) created successfully
                {result.failed > 0 && `, ${result.failed} failed`}
              </p>
            </div>
            {result.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left max-h-48 overflow-y-auto">
                <p className="font-medium text-red-800 mb-2">Errors:</p>
                <ul className="text-sm text-red-600 space-y-1">
                  {result.errors.map((err, i) => (
                    <li key={i}>
                      Row {err.row}: {err.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex justify-center gap-4">
              <Button variant="outline" asChild>
                <Link href={backHref}>Back to List</Link>
              </Button>
              <Button
                onClick={() => {
                  setStep("upload");
                  setParsedData(null);
                  setMapping({});
                  setResult(null);
                }}
              >
                Upload More
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
