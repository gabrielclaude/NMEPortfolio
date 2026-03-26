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
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import {
  RmPersonnelClientFormSchema,
  type RmPersonnelFormValues,
} from "@/lib/validations/rm-personnel";
import type { ActionState } from "@/actions/rm-personnel.actions";

type RmPersonnelFormProps = {
  defaultValues?: Partial<RmPersonnelFormValues> & { id?: number };
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  mode: "create" | "edit";
};

export function RmPersonnelForm({ defaultValues, action, mode }: RmPersonnelFormProps) {
  const [state, formAction, isPending] = useActionState(action, { success: false });

  const {
    register,
    formState: { errors },
    setError,
  } = useForm<RmPersonnelFormValues>({
    resolver: zodResolver(RmPersonnelClientFormSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      totalAllocation: defaultValues?.totalAllocation ?? "1.0",
      adjustment: defaultValues?.adjustment ?? "0",
    },
  });

  useEffect(() => {
    if (state.fieldErrors) {
      Object.entries(state.fieldErrors).forEach(([field, messages]) => {
        if (messages && messages.length > 0) {
          setError(field as keyof RmPersonnelFormValues, {
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

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Add New Personnel" : "Edit Personnel"}</CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Add a new team member for resource management"
            : "Update personnel details"}
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Basic Information</h3>
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="John Doe"
                {...register("name")}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>
          </div>

          {/* Allocation */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">FTE Allocation</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalAllocation">Total Allocation (FTE) *</Label>
                <Input
                  id="totalAllocation"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  placeholder="1.0"
                  {...register("totalAllocation")}
                  className={errors.totalAllocation ? "border-red-500" : ""}
                />
                {errors.totalAllocation && (
                  <p className="text-xs text-red-500">{errors.totalAllocation.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  Total FTE capacity for this person (e.g., 1.0 = full-time)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="adjustment">Adjustment</Label>
                <Input
                  id="adjustment"
                  type="number"
                  step="0.1"
                  min="-5"
                  max="5"
                  placeholder="0"
                  {...register("adjustment")}
                  className={errors.adjustment ? "border-red-500" : ""}
                />
                {errors.adjustment && (
                  <p className="text-xs text-red-500">{errors.adjustment.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  Temporary adjustment to capacity (e.g., -0.5 for half-time)
                </p>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline" asChild>
            <Link href="/admin/rm/personnel">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : mode === "create" ? "Add Personnel" : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
