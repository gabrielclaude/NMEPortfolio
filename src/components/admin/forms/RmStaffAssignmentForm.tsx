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
  RmStaffAssignmentClientFormSchema,
  type RmStaffAssignmentFormValues,
  RmStaffRoleValues,
  RmStaffRoleLabels,
} from "@/lib/validations/rm-staff-assignment";
import type { ActionState } from "@/actions/rm-staff-assignment.actions";

type StudyOption = {
  id: string;
  phase: number;
  status: string;
};

type PersonnelOption = {
  id: number;
  name: string;
  total_allocation: number;
};

type RmStaffAssignmentFormProps = {
  defaultValues?: Partial<RmStaffAssignmentFormValues> & { id?: number };
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  mode: "create" | "edit";
  studies: StudyOption[];
  personnel: PersonnelOption[];
};

export function RmStaffAssignmentForm({
  defaultValues,
  action,
  mode,
  studies,
  personnel,
}: RmStaffAssignmentFormProps) {
  const [state, formAction, isPending] = useActionState(action, { success: false });

  const {
    register,
    formState: { errors },
    setValue,
    watch,
    setError,
  } = useForm<RmStaffAssignmentFormValues>({
    resolver: zodResolver(RmStaffAssignmentClientFormSchema),
    defaultValues: {
      studyId: defaultValues?.studyId ?? "",
      personnelId: defaultValues?.personnelId ?? "",
      role: defaultValues?.role,
      allocationPct: defaultValues?.allocationPct ?? "0.5",
    },
  });

  useEffect(() => {
    if (state.fieldErrors) {
      Object.entries(state.fieldErrors).forEach(([field, messages]) => {
        if (messages && messages.length > 0) {
          setError(field as keyof RmStaffAssignmentFormValues, {
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
  const personnelId = watch("personnelId");
  const role = watch("role");

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Add Staff Assignment" : "Edit Staff Assignment"}</CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Assign a team member to a study with a specific role"
            : "Update assignment details"}
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-6">
          {/* Study & Personnel */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Assignment Details</h3>
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
                        {study.id} (Ph{study.phase} - {study.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.studyId && (
                  <p className="text-xs text-red-500">{errors.studyId.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Personnel *</Label>
                <input type="hidden" {...register("personnelId")} />
                <Select
                  value={personnelId}
                  onValueChange={(val) => setValue("personnelId", val)}
                >
                  <SelectTrigger className={errors.personnelId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select person" />
                  </SelectTrigger>
                  <SelectContent>
                    {personnel.map((person) => (
                      <SelectItem key={person.id} value={String(person.id)}>
                        {person.name} ({person.total_allocation.toFixed(1)} FTE)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.personnelId && (
                  <p className="text-xs text-red-500">{errors.personnelId.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Role & Allocation */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Role & Allocation</h3>
            <div className="grid grid-cols-2 gap-4">
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
                    {RmStaffRoleValues.map((value) => (
                      <SelectItem key={value} value={value}>
                        {RmStaffRoleLabels[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-xs text-red-500">{errors.role.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="allocationPct">Allocation (FTE) *</Label>
                <Input
                  id="allocationPct"
                  type="number"
                  step="0.05"
                  min="0"
                  max="2"
                  placeholder="0.5"
                  {...register("allocationPct")}
                  className={errors.allocationPct ? "border-red-500" : ""}
                />
                {errors.allocationPct && (
                  <p className="text-xs text-red-500">{errors.allocationPct.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  FTE allocated to this study (e.g., 0.5 = 50% time)
                </p>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline" asChild>
            <Link href="/admin/rm/assignments">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : mode === "create" ? "Add Assignment" : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
