"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { deleteRmPersonnel } from "@/actions/rm-personnel.actions";

type DeleteRmPersonnelButtonProps = {
  id: number;
  name: string;
  assignmentCount: number;
};

export function DeleteRmPersonnelButton({ id, name, assignmentCount }: DeleteRmPersonnelButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteRmPersonnel(id);
      if (result.success) {
        toast.success("Personnel deleted successfully");
        setOpen(false);
      } else {
        toast.error(result.error || "Failed to delete personnel");
      }
    });
  };

  const hasAssignments = assignmentCount > 0;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className={hasAssignments ? "text-gray-300 cursor-not-allowed" : "text-red-500 hover:text-red-700"}
          disabled={hasAssignments}
          title={hasAssignments ? `Cannot delete: ${assignmentCount} study assignment(s)` : "Delete personnel"}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Personnel</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{name}</strong>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
