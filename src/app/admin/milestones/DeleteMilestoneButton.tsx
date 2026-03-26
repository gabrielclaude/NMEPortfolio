"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
import { deleteMilestone } from "@/actions/milestone.actions";

type DeleteMilestoneButtonProps = {
  id: string;
  name: string;
  relationCount: number;
};

export function DeleteMilestoneButton({ id, name, relationCount }: DeleteMilestoneButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteMilestone(id);
      if (result.success) {
        toast.success(`${name} has been deleted`);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete milestone");
      }
    } catch {
      toast.error("An error occurred while deleting");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Milestone?</AlertDialogTitle>
          <AlertDialogDescription>
            {relationCount > 0 ? (
              <>
                <span className="text-red-600 font-medium">
                  Cannot delete {name}
                </span>{" "}
                because it has {relationCount} associated task(s). Delete the tasks first.
              </>
            ) : (
              <>
                This will permanently delete <strong>{name}</strong>. This action cannot be undone.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {relationCount === 0 && (
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
