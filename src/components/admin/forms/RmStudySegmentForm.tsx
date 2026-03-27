"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  RmStudySegmentClientFormSchema,
  type RmStudySegmentFormValues,
  RmSegmentActivityValues,
  RmSegmentActivityLabels,
  RmSegmentRoleValues,
  RmSegmentRoleLabels,
  RmSegmentComplexityValues,
  RmSegmentComplexityLabels,
} from "@/lib/validations/rm-study-segment";
import type { ActionState } from "@/actions/rm-study-segment.actions";

type StudyOption = {
  id: string;
  phase: number;
  status: string;
  complexity: string;
};

type RmStudySegmentFormProps = {
  defaultValues?: Partial<RmStudySegmentFormValues> & { id?: number };
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  mode: "create" | "edit";
  studies: StudyOption[];
};

export function RmStudySegmentForm({
  defaultValues,
  action,
  mode,
  studies,
}: RmStudySegmentFormProps) {
  const [state, formAction, isPending] = useActionState(action, { success: false });

  const {
    register,
    formState: { errors },
    setValue,
    watch,
    setError,
  } = useForm<RmStudySegmentFormValues>({
    resolver: zodResolver(RmStudySegmentClientFormSchema),
    defaultValues: {
      studyId: defaultValues?.studyId ?? "",
      activity: defaultValues?.activity,
      role: defaultValues?.role,
      complexity: defaultValues?.complexity ?? "Medium",
      phase: defaultValues?.phase ?? "1",
      startDate: defaultValues?.startDate ?? "",
      endDate: defaultValues?.endDate ?? "",
      ftePerMonth: defaultValues?.ftePerMonth ?? "0.5",
    },
  });

  useEffect(() => {
    if (state.fieldErrors) {
      Object.entries(state.fieldErrors).forEach(([field, messages]) => {
        if (messages && messages.length > 0) {
          setError(field as keyof RmStudySegmentFormValues, {
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

  const studyId = watch("studyId");
  const activity = watch("activity");
  const role = watch("role");
  const complexity = watch("complexity");

  // Auto-fill complexity from selected study
  const selectedStudy = studies.find((s) => s.id === studyId);
  useEffect(() => {
    if (selectedStudy && mode === "create") {
      setValue("complexity", selectedStudy.complexity as "Low" | "Medium" | "High");
      setValue("phase", String(selectedStudy.phase));
    }
  }, [selectedStudy, setValue, mode]);

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Add Study Segment" : "Edit Study Segment"}</CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Define an FTE segment for a study phase"
            : "Update segment details"}
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-6">
          {/* Study Selection */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Study & Activity</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Study *</Label>
                <input type="hidden" {...register("studyId")} />
                <Select
                  value={studyId}
                  onValueChange={(val) => setValue("studyId", val)}
                >
                  <SelectTrigger className={errors.studyId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select study" />
                  </SelectTrigger>
                  <SelectContent>
                    {studies.map((study) => (
                      <SelectItem key={study.id} value={study.id}>
                        {study.id} (Ph{study.phase} - {study.complexity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.studyId && (
                  <p className="text-xs text-red-500">{errors.studyId.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Activity *</Label>
                <input type="hidden" {...register("activity")} />
                <Select
                  value={activity}
                  onValueChange={(val) => setValue("activity", val as typeof activity)}
                >
                  <SelectTrigger className={errors.activity ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select activity" />
                  </SelectTrigger>
                  <SelectContent>
                    {RmSegmentActivityValues.map((value) => (
                      <SelectItem key={value} value={value}>
                        {RmSegmentActivityLabels[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.activity && (
                  <p className="text-xs text-red-500">{errors.activity.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Role & Complexity */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Role & Attributes</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Role *</Label>
                <input type="hidden" {...register("role")} />
                <Select
                  value={role}
                  onValueChange={(val) => setValue("role", val as typeof role)}
                >
                  <SelectTrigger className={errors.role ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {RmSegmentRoleValues.map((value) => (
                      <SelectItem key={value} value={value}>
                        {RmSegmentRoleLabels[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-xs text-red-500">{errors.role.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Complexity *</Label>
                <input type="hidden" {...register("complexity")} />
                <Select
                  value={complexity}
                  onValueChange={(val) => setValue("complexity", val as typeof complexity)}
                >
                  <SelectTrigger className={errors.complexity ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select complexity" />
                  </SelectTrigger>
                  <SelectContent>
                    {RmSegmentComplexityValues.map((value) => (
                      <SelectItem key={value} value={value}>
                        {RmSegmentComplexityLabels[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.complexity && (
                  <p className="text-xs text-red-500">{errors.complexity.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phase">Phase *</Label>
                <Input
                  id="phase"
                  type="number"
                  min="1"
                  max="4"
                  placeholder="1"
                  {...register("phase")}
                  className={errors.phase ? "border-red-500" : ""}
                />
                {errors.phase && (
                  <p className="text-xs text-red-500">{errors.phase.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Dates & FTE */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Timeline & FTE</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register("startDate")}
                  className={errors.startDate ? "border-red-500" : ""}
                />
                {errors.startDate && (
                  <p className="text-xs text-red-500">{errors.startDate.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register("endDate")}
                  className={errors.endDate ? "border-red-500" : ""}
                />
                {errors.endDate && (
                  <p className="text-xs text-red-500">{errors.endDate.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="ftePerMonth">FTE per Month *</Label>
                <Input
                  id="ftePerMonth"
                  type="number"
                  step="0.05"
                  min="0"
                  max="5"
                  placeholder="0.5"
                  {...register("ftePerMonth")}
                  className={errors.ftePerMonth ? "border-red-500" : ""}
                />
                {errors.ftePerMonth && (
                  <p className="text-xs text-red-500">{errors.ftePerMonth.message}</p>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500">
              The FTE per month value is prorated based on active days within each calendar month.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline" asChild>
            <Link href="/admin/rm/segments">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : mode === "create" ? "Add Segment" : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
