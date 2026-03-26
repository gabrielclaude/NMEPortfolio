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
  TrialClientFormSchema,
  type TrialFormValues,
  TrialPhaseValues,
  TrialPhaseLabels,
  TrialStatusValues,
  TrialStatusLabels,
} from "@/lib/validations/trial";
import type { ActionState } from "@/actions/trial.actions";

type NMEOption = { id: string; code: string; name: string };
type StaffOption = { id: string; firstName: string; lastName: string };

type TrialFormProps = {
  defaultValues?: Partial<TrialFormValues> & { id?: string };
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  mode: "create" | "edit";
  nmes: NMEOption[];
  staff: StaffOption[];
};

export function TrialForm({ defaultValues, action, mode, nmes, staff }: TrialFormProps) {
  const [state, formAction, isPending] = useActionState(action, { success: false });

  const {
    register,
    formState: { errors },
    setValue,
    watch,
    setError,
  } = useForm<TrialFormValues>({
    resolver: zodResolver(TrialClientFormSchema),
    defaultValues: {
      nctNumber: defaultValues?.nctNumber ?? "",
      title: defaultValues?.title ?? "",
      phase: defaultValues?.phase,
      status: defaultValues?.status,
      nmeId: defaultValues?.nmeId ?? "",
      leadStaffId: defaultValues?.leadStaffId ?? "",
      sponsorProtocolId: defaultValues?.sponsorProtocolId ?? "",
      primaryEndpoint: defaultValues?.primaryEndpoint ?? "",
      studyDesign: defaultValues?.studyDesign ?? "",
      targetEnrollment: defaultValues?.targetEnrollment ?? "",
      actualEnrollment: defaultValues?.actualEnrollment ?? "",
      plannedStartDate: defaultValues?.plannedStartDate ?? "",
      plannedEndDate: defaultValues?.plannedEndDate ?? "",
      actualStartDate: defaultValues?.actualStartDate ?? "",
      actualEndDate: defaultValues?.actualEndDate ?? "",
      sites: defaultValues?.sites ?? "",
      budget: defaultValues?.budget ?? "",
      notes: defaultValues?.notes ?? "",
    },
  });

  // Sync server errors to form
  useEffect(() => {
    if (state.fieldErrors) {
      Object.entries(state.fieldErrors).forEach(([field, messages]) => {
        if (messages && messages.length > 0) {
          setError(field as keyof TrialFormValues, {
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

  const phase = watch("phase");
  const status = watch("status");
  const nmeId = watch("nmeId");
  const leadStaffId = watch("leadStaffId");

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Create New Trial" : "Edit Trial"}</CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Add a new clinical trial to the portfolio"
            : "Update the clinical trial details"}
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nctNumber">NCT Number *</Label>
                <Input
                  id="nctNumber"
                  placeholder="NCT12345678"
                  {...register("nctNumber")}
                  className={errors.nctNumber ? "border-red-500" : ""}
                />
                {errors.nctNumber && (
                  <p className="text-xs text-red-500">{errors.nctNumber.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sponsorProtocolId">Sponsor Protocol ID</Label>
                <Input
                  id="sponsorProtocolId"
                  placeholder="PROT-001"
                  {...register("sponsorProtocolId")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Trial Title *</Label>
              <Textarea
                id="title"
                placeholder="A Phase 2 Study of..."
                rows={2}
                {...register("title")}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title.message}</p>
              )}
            </div>
          </div>

          {/* Classification */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Classification</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>NME *</Label>
                <input type="hidden" {...register("nmeId")} />
                <Select
                  value={nmeId}
                  onValueChange={(val) => setValue("nmeId", val)}
                >
                  <SelectTrigger className={errors.nmeId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select NME" />
                  </SelectTrigger>
                  <SelectContent>
                    {nmes.map((nme) => (
                      <SelectItem key={nme.id} value={nme.id}>
                        {nme.code} - {nme.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.nmeId && (
                  <p className="text-xs text-red-500">{errors.nmeId.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Phase *</Label>
                <input type="hidden" {...register("phase")} />
                <Select
                  value={phase}
                  onValueChange={(val) => setValue("phase", val as typeof phase)}
                >
                  <SelectTrigger className={errors.phase ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select phase" />
                  </SelectTrigger>
                  <SelectContent>
                    {TrialPhaseValues.map((value) => (
                      <SelectItem key={value} value={value}>
                        {TrialPhaseLabels[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.phase && (
                  <p className="text-xs text-red-500">{errors.phase.message}</p>
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
                    {TrialStatusValues.map((value) => (
                      <SelectItem key={value} value={value}>
                        {TrialStatusLabels[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-xs text-red-500">{errors.status.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Lead Staff</Label>
              <input type="hidden" {...register("leadStaffId")} />
              <Select
                value={leadStaffId ?? ""}
                onValueChange={(val) => setValue("leadStaffId", val || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select lead staff (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.firstName} {s.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Study Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Study Details</h3>
            <div className="space-y-2">
              <Label htmlFor="studyDesign">Study Design</Label>
              <Input
                id="studyDesign"
                placeholder="Randomized, Double-Blind, Placebo-Controlled"
                {...register("studyDesign")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="primaryEndpoint">Primary Endpoint</Label>
              <Textarea
                id="primaryEndpoint"
                placeholder="Overall Response Rate (ORR)"
                rows={2}
                {...register("primaryEndpoint")}
              />
            </div>
          </div>

          {/* Enrollment & Sites */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Enrollment & Sites</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetEnrollment">Target Enrollment</Label>
                <Input
                  id="targetEnrollment"
                  type="number"
                  min="0"
                  placeholder="100"
                  {...register("targetEnrollment")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="actualEnrollment">Actual Enrollment</Label>
                <Input
                  id="actualEnrollment"
                  type="number"
                  min="0"
                  placeholder="0"
                  {...register("actualEnrollment")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sites">Number of Sites</Label>
                <Input
                  id="sites"
                  type="number"
                  min="0"
                  placeholder="10"
                  {...register("sites")}
                />
              </div>
            </div>
          </div>

          {/* Timeline & Budget */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Timeline & Budget</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plannedStartDate">Planned Start Date *</Label>
                <Input
                  id="plannedStartDate"
                  type="date"
                  {...register("plannedStartDate")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plannedEndDate">Planned End Date *</Label>
                <Input
                  id="plannedEndDate"
                  type="date"
                  {...register("plannedEndDate")}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="actualStartDate">Actual Start Date</Label>
                <Input
                  id="actualStartDate"
                  type="date"
                  {...register("actualStartDate")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="actualEndDate">Actual End Date</Label>
                <Input
                  id="actualEndDate"
                  type="date"
                  {...register("actualEndDate")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Budget ($)</Label>
              <Input
                id="budget"
                type="number"
                min="0"
                step="0.01"
                placeholder="1000000"
                {...register("budget")}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about this trial"
              rows={3}
              {...register("notes")}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline" asChild>
            <Link href="/admin/trials">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : mode === "create" ? "Create Trial" : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
