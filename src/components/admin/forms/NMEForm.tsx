"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import {
  NMEClientFormSchema,
  type NMEFormValues,
  TherapeuticAreaValues,
  TherapeuticAreaLabels,
  MoleculeTypeValues,
  MoleculeTypeLabels,
  NMEStatusValues,
  NMEStatusLabels,
} from "@/lib/validations/nme";
import type { ActionState } from "@/actions/nme.actions";

type NMEFormProps = {
  defaultValues?: Partial<NMEFormValues> & { id?: string };
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  mode: "create" | "edit";
};

export function NMEForm({ defaultValues, action, mode }: NMEFormProps) {
  const [state, formAction, isPending] = useActionState(action, { success: false });

  const {
    register,
    formState: { errors },
    setValue,
    watch,
    setError,
  } = useForm<NMEFormValues>({
    resolver: zodResolver(NMEClientFormSchema),
    defaultValues: {
      code: defaultValues?.code ?? "",
      name: defaultValues?.name ?? "",
      genericName: defaultValues?.genericName ?? "",
      therapeuticArea: defaultValues?.therapeuticArea,
      moleculeType: defaultValues?.moleculeType,
      status: defaultValues?.status,
      targetIndication: defaultValues?.targetIndication ?? "",
      mechanismOfAction: defaultValues?.mechanismOfAction ?? "",
      originatorCompany: defaultValues?.originatorCompany ?? "",
      patentExpiry: defaultValues?.patentExpiry ?? "",
      indFilingDate: defaultValues?.indFilingDate ?? "",
      discoveryDate: defaultValues?.discoveryDate ?? "",
      notes: defaultValues?.notes ?? "",
    },
  });

  // Sync server errors to form
  useEffect(() => {
    if (state.fieldErrors) {
      Object.entries(state.fieldErrors).forEach(([field, messages]) => {
        if (messages && messages.length > 0) {
          setError(field as keyof NMEFormValues, {
            type: "server",
            message: messages[0],
          });
        }
      });
    }
    if (state.error && !state.fieldErrors) {
      toast.error(state.error);
    }
  }, [state, setError]);

  const therapeuticArea = watch("therapeuticArea");
  const moleculeType = watch("moleculeType");
  const status = watch("status");

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Create New NME" : "Edit NME"}</CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Add a new molecular entity to the portfolio"
            : "Update the NME details"}
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  placeholder="NME-001"
                  {...register("code")}
                  className={errors.code ? "border-red-500" : ""}
                />
                {errors.code && (
                  <p className="text-xs text-red-500">{errors.code.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="Lumeviran"
                  {...register("name")}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="genericName">Generic Name</Label>
              <Input
                id="genericName"
                placeholder="Optional generic name"
                {...register("genericName")}
              />
            </div>
          </div>

          {/* Classification */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Classification</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Therapeutic Area *</Label>
                <input type="hidden" {...register("therapeuticArea")} />
                <Select
                  value={therapeuticArea}
                  onValueChange={(val) => setValue("therapeuticArea", val as typeof therapeuticArea)}
                >
                  <SelectTrigger className={errors.therapeuticArea ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select area" />
                  </SelectTrigger>
                  <SelectContent>
                    {TherapeuticAreaValues.map((value) => (
                      <SelectItem key={value} value={value}>
                        {TherapeuticAreaLabels[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.therapeuticArea && (
                  <p className="text-xs text-red-500">{errors.therapeuticArea.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Molecule Type *</Label>
                <input type="hidden" {...register("moleculeType")} />
                <Select
                  value={moleculeType}
                  onValueChange={(val) => setValue("moleculeType", val as typeof moleculeType)}
                >
                  <SelectTrigger className={errors.moleculeType ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {MoleculeTypeValues.map((value) => (
                      <SelectItem key={value} value={value}>
                        {MoleculeTypeLabels[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.moleculeType && (
                  <p className="text-xs text-red-500">{errors.moleculeType.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Status *</Label>
                <input type="hidden" {...register("status")} />
                <Select
                  value={status}
                  onValueChange={(val) => setValue("status", val as typeof status)}
                >
                  <SelectTrigger className={errors.status ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {NMEStatusValues.map((value) => (
                      <SelectItem key={value} value={value}>
                        {NMEStatusLabels[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-xs text-red-500">{errors.status.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Clinical Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Clinical Details</h3>
            <div className="space-y-2">
              <Label htmlFor="targetIndication">Target Indication *</Label>
              <Input
                id="targetIndication"
                placeholder="e.g., Advanced Solid Tumors"
                {...register("targetIndication")}
                className={errors.targetIndication ? "border-red-500" : ""}
              />
              {errors.targetIndication && (
                <p className="text-xs text-red-500">{errors.targetIndication.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="mechanismOfAction">Mechanism of Action</Label>
              <Textarea
                id="mechanismOfAction"
                placeholder="Describe the mechanism of action"
                rows={3}
                {...register("mechanismOfAction")}
              />
            </div>
          </div>

          {/* Company & Dates */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Company & Timeline</h3>
            <div className="space-y-2">
              <Label htmlFor="originatorCompany">Originator Company</Label>
              <Input
                id="originatorCompany"
                placeholder="e.g., NovaMed Therapeutics"
                {...register("originatorCompany")}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discoveryDate">Discovery Date *</Label>
                <Input
                  id="discoveryDate"
                  type="date"
                  {...register("discoveryDate")}
                  className={errors.discoveryDate ? "border-red-500" : ""}
                />
                {errors.discoveryDate && (
                  <p className="text-xs text-red-500">{errors.discoveryDate.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="indFilingDate">IND Filing Date</Label>
                <Input
                  id="indFilingDate"
                  type="date"
                  {...register("indFilingDate")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patentExpiry">Patent Expiry</Label>
                <Input
                  id="patentExpiry"
                  type="date"
                  {...register("patentExpiry")}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about this NME"
              rows={3}
              {...register("notes")}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline" asChild>
            <Link href="/admin/nmes">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : mode === "create" ? "Create NME" : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
