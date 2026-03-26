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

import { deleteRmStudy } from "@/actions/rm-study.actions";

type DeleteRmStudyButtonProps = {
  id: string;
  relationCount: number;
};

export function DeleteRmStudyButton({ id, relationCount }: DeleteRmStudyButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteRmStudy(id);
      if (result.success) {
        toast.success("Study deleted successfully");
        setOpen(false);
      } else {
        toast.error(result.error || "Failed to delete study");
      }
    });
  };

  const hasRelations = relationCount > 0;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className={hasRelations ? "text-gray-300 cursor-not-allowed" : "text-red-500 hover:text-red-700"}
          disabled={hasRelations}
          title={hasRelations ? `Cannot delete: ${relationCount} associated record(s)` : "Delete study"}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Study</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete study <strong>{id}</strong>? This action cannot be undone.
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
