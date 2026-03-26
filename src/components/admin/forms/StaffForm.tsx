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
  StaffClientFormSchema,
  type StaffFormValues,
  StaffRoleValues,
  StaffRoleLabels,
} from "@/lib/validations/staff";
import type { ActionState } from "@/actions/staff.actions";

type StaffFormProps = {
  defaultValues?: Partial<StaffFormValues> & { id?: string };
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  mode: "create" | "edit";
};

export function StaffForm({ defaultValues, action, mode }: StaffFormProps) {
  const [state, formAction, isPending] = useActionState(action, { success: false });

  const {
    register,
    formState: { errors },
    setValue,
    watch,
    setError,
  } = useForm<StaffFormValues>({
    resolver: zodResolver(StaffClientFormSchema),
    defaultValues: {
      employeeId: defaultValues?.employeeId ?? "",
      firstName: defaultValues?.firstName ?? "",
      lastName: defaultValues?.lastName ?? "",
      email: defaultValues?.email ?? "",
      role: defaultValues?.role,
      department: defaultValues?.department ?? "",
      specialization: defaultValues?.specialization ?? "",
      yearsExperience: defaultValues?.yearsExperience ?? "",
      isActive: defaultValues?.isActive ?? true,
      hireDate: defaultValues?.hireDate ?? "",
    },
  });

  // Sync server errors to form
  useEffect(() => {
    if (state.fieldErrors) {
      Object.entries(state.fieldErrors).forEach(([field, messages]) => {
        if (messages && messages.length > 0) {
          setError(field as keyof StaffFormValues, {
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

  const role = watch("role");
  const isActive = watch("isActive");

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Add New Staff Member" : "Edit Staff Member"}</CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Add a new team member to the organization"
            : "Update staff member details"}
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID *</Label>
                <Input
                  id="employeeId"
                  placeholder="EMP-001"
                  {...register("employeeId")}
                  className={errors.employeeId ? "border-red-500" : ""}
                />
                {errors.employeeId && (
                  <p className="text-xs text-red-500">{errors.employeeId.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@company.com"
                  {...register("email")}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  {...register("firstName")}
                  className={errors.firstName ? "border-red-500" : ""}
                />
                {errors.firstName && (
                  <p className="text-xs text-red-500">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  {...register("lastName")}
                  className={errors.lastName ? "border-red-500" : ""}
                />
                {errors.lastName && (
                  <p className="text-xs text-red-500">{errors.lastName.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Role & Department */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Role & Department</h3>
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
                    {StaffRoleValues.map((value) => (
                      <SelectItem key={value} value={value}>
                        {StaffRoleLabels[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-xs text-red-500">{errors.role.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Input
                  id="department"
                  placeholder="Clinical Operations"
                  {...register("department")}
                  className={errors.department ? "border-red-500" : ""}
                />
                {errors.department && (
                  <p className="text-xs text-red-500">{errors.department.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  placeholder="Oncology"
                  {...register("specialization")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearsExperience">Years of Experience *</Label>
                <Input
                  id="yearsExperience"
                  type="number"
                  min="0"
                  max="50"
                  placeholder="5"
                  {...register("yearsExperience")}
                  className={errors.yearsExperience ? "border-red-500" : ""}
                />
                {errors.yearsExperience && (
                  <p className="text-xs text-red-500">{errors.yearsExperience.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Employment Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Employment Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hireDate">Hire Date *</Label>
                <Input
                  id="hireDate"
                  type="date"
                  {...register("hireDate")}
                  className={errors.hireDate ? "border-red-500" : ""}
                />
                {errors.hireDate && (
                  <p className="text-xs text-red-500">{errors.hireDate.message}</p>
                )}
              </div>
              <div className="space-y-2 flex items-end pb-2">
                <div className="flex items-center space-x-2">
                  <input type="hidden" name="isActive" value={isActive ? "true" : "false"} />
                  <Checkbox
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={(checked) => setValue("isActive", checked === true)}
                  />
                  <Label htmlFor="isActive" className="font-normal">
                    Active Employee
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline" asChild>
            <Link href="/admin/staff">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : mode === "create" ? "Add Staff Member" : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
