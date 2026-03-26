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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import {
  MilestoneClientFormSchema,
  type MilestoneFormValues,
  MilestoneStatusValues,
  MilestoneStatusLabels,
} from "@/lib/validations/milestone";
import type { ActionState } from "@/actions/milestone.actions";

type ProjectOption = { id: string; code: string; name: string };

type MilestoneFormProps = {
  defaultValues?: Partial<MilestoneFormValues> & { id?: string };
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  mode: "create" | "edit";
  projects: ProjectOption[];
};

export function MilestoneForm({ defaultValues, action, mode, projects }: MilestoneFormProps) {
  const [state, formAction, isPending] = useActionState(action, { success: false });

  const {
    register,
    formState: { errors },
    setValue,
    watch,
    setError,
  } = useForm<MilestoneFormValues>({
    resolver: zodResolver(MilestoneClientFormSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      status: defaultValues?.status,
      projectId: defaultValues?.projectId ?? "",
      dueDate: defaultValues?.dueDate ?? "",
      completedDate: defaultValues?.completedDate ?? "",
      isCriticalPath: defaultValues?.isCriticalPath ?? false,
      sortOrder: defaultValues?.sortOrder ?? "0",
    },
  });

  // Sync server errors to form
  useEffect(() => {
    if (state.fieldErrors) {
      Object.entries(state.fieldErrors).forEach(([field, messages]) => {
        if (messages && messages.length > 0) {
          setError(field as keyof MilestoneFormValues, {
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
  const projectId = watch("projectId");
  const isCriticalPath = watch("isCriticalPath");

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Create New Milestone" : "Edit Milestone"}</CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Add a new milestone to track project progress"
            : "Update the milestone details"}
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Project *</Label>
                <input type="hidden" {...register("projectId")} />
                <Select
                  value={projectId}
                  onValueChange={(val) => setValue("projectId", val)}
                >
                  <SelectTrigger className={errors.projectId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.code} - {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.projectId && (
                  <p className="text-xs text-red-500">{errors.projectId.message}</p>
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
                    {MilestoneStatusValues.map((value) => (
                      <SelectItem key={value} value={value}>
                        {MilestoneStatusLabels[value]}
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
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Site Initiation Visit"
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
                placeholder="Milestone description"
                rows={3}
                {...register("description")}
              />
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Timeline</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  {...register("dueDate")}
                  className={errors.dueDate ? "border-red-500" : ""}
                />
                {errors.dueDate && (
                  <p className="text-xs text-red-500">{errors.dueDate.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="completedDate">Completed Date</Label>
                <Input
                  id="completedDate"
                  type="date"
                  {...register("completedDate")}
                />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  min="0"
                  placeholder="0"
                  {...register("sortOrder")}
                />
              </div>
              <div className="space-y-2 flex items-end pb-2">
                <div className="flex items-center space-x-2">
                  <input type="hidden" name="isCriticalPath" value={isCriticalPath ? "true" : "false"} />
                  <Checkbox
                    id="isCriticalPath"
                    checked={isCriticalPath}
                    onCheckedChange={(checked) => setValue("isCriticalPath", checked === true)}
                  />
                  <Label htmlFor="isCriticalPath" className="font-normal">
                    Critical Path Milestone
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline" asChild>
            <Link href="/admin/milestones">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : mode === "create" ? "Create Milestone" : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
