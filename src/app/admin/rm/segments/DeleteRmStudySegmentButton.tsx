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

import { deleteRmStudySegment } from "@/actions/rm-study-segment.actions";

type DeleteRmStudySegmentButtonProps = {
  id: number;
  studyId: string;
  activity: string;
  role: string;
  monthlyFteCount: number;
};

export function DeleteRmStudySegmentButton({
  id,
  studyId,
  activity,
  role,
  monthlyFteCount,
}: DeleteRmStudySegmentButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteRmStudySegment(id);
      if (result.success) {
        toast.success("Segment deleted successfully");
        setOpen(false);
      } else {
        toast.error(result.error || "Failed to delete segment");
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
          title="Delete segment"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Study Segment</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the <strong>{activity}</strong> segment for{" "}
            <strong>{role}</strong> in study <strong>{studyId}</strong>?
            {monthlyFteCount > 0 && (
              <span className="block mt-2 text-amber-600">
                This will also delete {monthlyFteCount} associated monthly FTE records.
              </span>
            )}
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
