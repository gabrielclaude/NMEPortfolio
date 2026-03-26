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
  ProjectClientFormSchema,
  type ProjectFormValues,
  ProjectStatusValues,
  ProjectStatusLabels,
  TaskPriorityValues,
  TaskPriorityLabels,
} from "@/lib/validations/project";
import type { ActionState } from "@/actions/project.actions";

type TrialOption = { id: string; nctNumber: string; title: string };

type ProjectFormProps = {
  defaultValues?: Partial<ProjectFormValues> & { id?: string };
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  mode: "create" | "edit";
  trials: TrialOption[];
};

export function ProjectForm({ defaultValues, action, mode, trials }: ProjectFormProps) {
  const [state, formAction, isPending] = useActionState(action, { success: false });

  const {
    register,
    formState: { errors },
    setValue,
    watch,
    setError,
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(ProjectClientFormSchema),
    defaultValues: {
      code: defaultValues?.code ?? "",
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      status: defaultValues?.status,
      priority: defaultValues?.priority,
      trialId: defaultValues?.trialId ?? "",
      plannedStart: defaultValues?.plannedStart ?? "",
      plannedEnd: defaultValues?.plannedEnd ?? "",
      actualStart: defaultValues?.actualStart ?? "",
      actualEnd: defaultValues?.actualEnd ?? "",
      budget: defaultValues?.budget ?? "",
      percentComplete: defaultValues?.percentComplete ?? "0",
    },
  });

  // Sync server errors to form
  useEffect(() => {
    if (state.fieldErrors) {
      Object.entries(state.fieldErrors).forEach(([field, messages]) => {
        if (messages && messages.length > 0) {
          setError(field as keyof ProjectFormValues, {
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
  const priority = watch("priority");
  const trialId = watch("trialId");

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Create New Project" : "Edit Project"}</CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Add a new project to track work for a clinical trial"
            : "Update the project details"}
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
                  placeholder="PROJ-001"
                  {...register("code")}
                  className={errors.code ? "border-red-500" : ""}
                />
                {errors.code && (
                  <p className="text-xs text-red-500">{errors.code.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Trial *</Label>
                <input type="hidden" {...register("trialId")} />
                <Select
                  value={trialId}
                  onValueChange={(val) => setValue("trialId", val)}
                >
                  <SelectTrigger className={errors.trialId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select trial" />
                  </SelectTrigger>
                  <SelectContent>
                    {trials.map((trial) => (
                      <SelectItem key={trial.id} value={trial.id}>
                        {trial.nctNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.trialId && (
                  <p className="text-xs text-red-500">{errors.trialId.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Site Activation"
                {...register("name")}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Project description"
                rows={3}
                {...register("description")}
              />
            </div>
          </div>

          {/* Status & Priority */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Status & Priority</h3>
            <div className="grid grid-cols-3 gap-4">
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
                    {ProjectStatusValues.map((value) => (
                      <SelectItem key={value} value={value}>
                        {ProjectStatusLabels[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-xs text-red-500">{errors.status.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Priority *</Label>
                <input type="hidden" {...register("priority")} />
                <Select
                  value={priority}
                  onValueChange={(val) => setValue("priority", val as typeof priority)}
                >
                  <SelectTrigger className={errors.priority ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {TaskPriorityValues.map((value) => (
                      <SelectItem key={value} value={value}>
                        {TaskPriorityLabels[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.priority && (
                  <p className="text-xs text-red-500">{errors.priority.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="percentComplete">Progress (%)</Label>
                <Input
                  id="percentComplete"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  {...register("percentComplete")}
                />
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Timeline</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plannedStart">Planned Start *</Label>
                <Input
                  id="plannedStart"
                  type="date"
                  {...register("plannedStart")}
                  className={errors.plannedStart ? "border-red-500" : ""}
                />
                {errors.plannedStart && (
                  <p className="text-xs text-red-500">{errors.plannedStart.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="plannedEnd">Planned End *</Label>
                <Input
                  id="plannedEnd"
                  type="date"
                  {...register("plannedEnd")}
                  className={errors.plannedEnd ? "border-red-500" : ""}
                />
                {errors.plannedEnd && (
                  <p className="text-xs text-red-500">{errors.plannedEnd.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="actualStart">Actual Start</Label>
                <Input
                  id="actualStart"
                  type="date"
                  {...register("actualStart")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="actualEnd">Actual End</Label>
                <Input
                  id="actualEnd"
                  type="date"
                  {...register("actualEnd")}
                />
              </div>
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <Label htmlFor="budget">Budget ($)</Label>
            <Input
              id="budget"
              type="number"
              min="0"
              step="0.01"
              placeholder="50000"
              {...register("budget")}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline" asChild>
            <Link href="/admin/projects">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : mode === "create" ? "Create Project" : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
