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
  RmFteMatrixClientFormSchema,
  type RmFteMatrixFormValues,
  RmFteMatrixComplexityValues,
  RmFteMatrixComplexityLabels,
  RmFteMatrixRoleValues,
  RmFteMatrixRoleLabels,
  RmFteMatrixActivityValues,
  RmFteMatrixActivityLabels,
} from "@/lib/validations/rm-fte-matrix";
import type { ActionState } from "@/actions/rm-fte-matrix.actions";

type RmFteMatrixFormProps = {
  defaultValues?: Partial<RmFteMatrixFormValues> & { id?: number };
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  mode: "create" | "edit";
};

export function RmFteMatrixForm({ defaultValues, action, mode }: RmFteMatrixFormProps) {
  const [state, formAction, isPending] = useActionState(action, { success: false });

  const {
    register,
    formState: { errors },
    setValue,
    watch,
    setError,
  } = useForm<RmFteMatrixFormValues>({
    resolver: zodResolver(RmFteMatrixClientFormSchema),
    defaultValues: {
      complexity: defaultValues?.complexity ?? "Medium",
      role: defaultValues?.role,
      phase: defaultValues?.phase ?? "1",
      activity: defaultValues?.activity,
      ftePerMonth: defaultValues?.ftePerMonth ?? "0.5",
    },
  });

  useEffect(() => {
    if (state.fieldErrors) {
      Object.entries(state.fieldErrors).forEach(([field, messages]) => {
        if (messages && messages.length > 0) {
          setError(field as keyof RmFteMatrixFormValues, {
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

  const complexity = watch("complexity");
  const role = watch("role");
  const activity = watch("activity");

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Add FTE Matrix Entry" : "Edit FTE Matrix Entry"}</CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Define an FTE reference value for a specific combination"
            : "Update FTE matrix entry"}
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-6">
          {/* Complexity & Role */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Classification</h3>
            <div className="grid grid-cols-2 gap-4">
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
                    {RmFteMatrixComplexityValues.map((value) => (
                      <SelectItem key={value} value={value}>
                        {RmFteMatrixComplexityLabels[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.complexity && (
                  <p className="text-xs text-red-500">{errors.complexity.message}</p>
                )}
              </div>
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
                    {RmFteMatrixRoleValues.map((value) => (
                      <SelectItem key={value} value={value}>
                        {RmFteMatrixRoleLabels[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-xs text-red-500">{errors.role.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Phase & Activity */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Phase & Activity</h3>
            <div className="grid grid-cols-2 gap-4">
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
                    {RmFteMatrixActivityValues.map((value) => (
                      <SelectItem key={value} value={value}>
                        {RmFteMatrixActivityLabels[value]}
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

          {/* FTE Value */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">FTE Value</h3>
            <div className="space-y-2">
              <Label htmlFor="ftePerMonth">FTE per Month *</Label>
              <Input
                id="ftePerMonth"
                type="number"
                step="0.01"
                min="0"
                max="10"
                placeholder="0.5"
                {...register("ftePerMonth")}
                className={errors.ftePerMonth ? "border-red-500" : ""}
              />
              {errors.ftePerMonth && (
                <p className="text-xs text-red-500">{errors.ftePerMonth.message}</p>
              )}
              <p className="text-xs text-gray-500">
                Reference FTE value for this combination of complexity, role, phase, and activity.
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline" asChild>
            <Link href="/admin/rm/fte-matrix">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : mode === "create" ? "Add Entry" : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
