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

import { deleteRmFteMatrix } from "@/actions/rm-fte-matrix.actions";

type DeleteRmFteMatrixButtonProps = {
  id: number;
  complexity: string;
  role: string;
  activity: string;
};

export function DeleteRmFteMatrixButton({
  id,
  complexity,
  role,
  activity,
}: DeleteRmFteMatrixButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteRmFteMatrix(id);
      if (result.success) {
        toast.success("Entry deleted successfully");
        setOpen(false);
      } else {
        toast.error(result.error || "Failed to delete entry");
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-red-500 hover:text-red-700"
          title="Delete entry"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete FTE Matrix Entry</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this entry?
            <span className="block mt-2 text-gray-700">
              <strong>{complexity}</strong> · <strong>{role}</strong> · <strong>{activity}</strong>
            </span>
            <span className="block mt-2">This action cannot be undone.</span>
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
