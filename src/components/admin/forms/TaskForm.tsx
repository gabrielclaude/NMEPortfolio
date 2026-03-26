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
  TaskClientFormSchema,
  type TaskFormValues,
  TaskStatusValues,
  TaskStatusLabels,
  TaskPriorityValues,
  TaskPriorityLabels,
} from "@/lib/validations/task";
import type { ActionState } from "@/actions/task.actions";

type MilestoneOption = { id: string; name: string; project: { code: string } };
type StaffOption = { id: string; firstName: string; lastName: string };

type TaskFormProps = {
  defaultValues?: Partial<TaskFormValues> & { id?: string };
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  mode: "create" | "edit";
  milestones: MilestoneOption[];
  staff: StaffOption[];
};

export function TaskForm({ defaultValues, action, mode, milestones, staff }: TaskFormProps) {
  const [state, formAction, isPending] = useActionState(action, { success: false });

  const {
    register,
    formState: { errors },
    setValue,
    watch,
    setError,
  } = useForm<TaskFormValues>({
    resolver: zodResolver(TaskClientFormSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      status: defaultValues?.status,
      priority: defaultValues?.priority,
      milestoneId: defaultValues?.milestoneId ?? "",
      assigneeId: defaultValues?.assigneeId ?? "",
      estimatedHours: defaultValues?.estimatedHours ?? "",
      actualHours: defaultValues?.actualHours ?? "",
      dueDate: defaultValues?.dueDate ?? "",
      completedAt: defaultValues?.completedAt ?? "",
    },
  });

  // Sync server errors to form
  useEffect(() => {
    if (state.fieldErrors) {
      Object.entries(state.fieldErrors).forEach(([field, messages]) => {
        if (messages && messages.length > 0) {
          setError(field as keyof TaskFormValues, {
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
  const milestoneId = watch("milestoneId");
  const assigneeId = watch("assigneeId");

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Create New Task" : "Edit Task"}</CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Add a new task to track work items"
            : "Update the task details"}
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Basic Information</h3>
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Review protocol amendments"
                {...register("title")}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Task description"
                rows={3}
                {...register("description")}
              />
            </div>
          </div>

          {/* Classification */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Classification</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Milestone *</Label>
                <input type="hidden" {...register("milestoneId")} />
                <Select
                  value={milestoneId}
                  onValueChange={(val) => setValue("milestoneId", val)}
                >
                  <SelectTrigger className={errors.milestoneId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select milestone" />
                  </SelectTrigger>
                  <SelectContent>
                    {milestones.map((milestone) => (
                      <SelectItem key={milestone.id} value={milestone.id}>
                        {milestone.project.code} - {milestone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.milestoneId && (
                  <p className="text-xs text-red-500">{errors.milestoneId.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Assignee</Label>
                <input type="hidden" {...register("assigneeId")} />
                <Select
                  value={assigneeId ?? ""}
                  onValueChange={(val) => setValue("assigneeId", val || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee (optional)" />
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
                    {TaskStatusValues.map((value) => (
                      <SelectItem key={value} value={value}>
                        {TaskStatusLabels[value]}
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
            </div>
          </div>

          {/* Time Tracking */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Time Tracking</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimatedHours">Estimated Hours</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="8"
                  {...register("estimatedHours")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="actualHours">Actual Hours</Label>
                <Input
                  id="actualHours"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="0"
                  {...register("actualHours")}
                />
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Timeline</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  {...register("dueDate")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="completedAt">Completed At</Label>
                <Input
                  id="completedAt"
                  type="date"
                  {...register("completedAt")}
                />
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline" asChild>
            <Link href="/admin/tasks">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : mode === "create" ? "Create Task" : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
