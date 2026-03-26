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
  RmStudyClientFormSchema,
  type RmStudyFormValues,
  RmStudyStatusValues,
  RmStudyComplexityValues,
  RmStudyStatusLabels,
  RmStudyComplexityLabels,
} from "@/lib/validations/rm-study";
import type { ActionState } from "@/actions/rm-study.actions";

type NmeOption = {
  id: string;
  code: string;
  name: string;
};

type RmStudyFormProps = {
  defaultValues?: Partial<RmStudyFormValues> & { id?: string };
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  mode: "create" | "edit";
  nmes: NmeOption[];
};

export function RmStudyForm({ defaultValues, action, mode, nmes }: RmStudyFormProps) {
  const [state, formAction, isPending] = useActionState(action, { success: false });

  const {
    register,
    formState: { errors },
    setValue,
    watch,
    setError,
  } = useForm<RmStudyFormValues>({
    resolver: zodResolver(RmStudyClientFormSchema),
    defaultValues: {
      id: defaultValues?.id ?? "",
      phase: defaultValues?.phase ?? "1",
      status: defaultValues?.status ?? "Active",
      complexity: defaultValues?.complexity ?? "Medium",
      nmeId: defaultValues?.nmeId ?? "",
    },
  });

  useEffect(() => {
    if (state.fieldErrors) {
      Object.entries(state.fieldErrors).forEach(([field, messages]) => {
        if (messages && messages.length > 0) {
          setError(field as keyof RmStudyFormValues, {
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

  const status = watch("status");
  const complexity = watch("complexity");
  const nmeId = watch("nmeId");

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Add New RM Study" : "Edit RM Study"}</CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Add a new resource management study"
            : "Update study details"}
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-6">
          {/* Study Identification */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Study Identification</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="id">Study ID *</Label>
                <Input
                  id="id"
                  placeholder="NME-001-S1"
                  {...register("id")}
                  className={errors.id ? "border-red-500" : ""}
                  disabled={mode === "edit"}
                />
                {errors.id && (
                  <p className="text-xs text-red-500">{errors.id.message}</p>
                )}
                {mode === "edit" && (
                  <p className="text-xs text-gray-500">Study ID cannot be changed</p>
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

          {/* Status & Complexity */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Status & Complexity</h3>
            <div className="grid grid-cols-2 gap-4">
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
                    {RmStudyStatusValues.map((value) => (
                      <SelectItem key={value} value={value}>
                        {RmStudyStatusLabels[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-xs text-red-500">{errors.status.message}</p>
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
                    {RmStudyComplexityValues.map((value) => (
                      <SelectItem key={value} value={value}>
                        {RmStudyComplexityLabels[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.complexity && (
                  <p className="text-xs text-red-500">{errors.complexity.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* NME Association */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">NME Association</h3>
            <div className="space-y-2">
              <Label>Associated NME</Label>
              <input type="hidden" {...register("nmeId")} />
              <Select
                value={nmeId || "none"}
                onValueChange={(val) => setValue("nmeId", val === "none" ? null : val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select NME (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No NME Association</SelectItem>
                  {nmes.map((nme) => (
                    <SelectItem key={nme.id} value={nme.id}>
                      {nme.code} - {nme.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Optionally link this study to an NME for resource planning
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline" asChild>
            <Link href="/admin/rm/studies">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : mode === "create" ? "Add Study" : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
