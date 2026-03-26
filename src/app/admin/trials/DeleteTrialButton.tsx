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
import { deleteTrial } from "@/actions/trial.actions";

type DeleteTrialButtonProps = {
  id: string;
  nctNumber: string;
  relationCount: number;
};

export function DeleteTrialButton({ id, nctNumber, relationCount }: DeleteTrialButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteTrial(id);
      if (result.success) {
        toast.success(`Trial ${nctNumber} has been deleted`);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete trial");
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
          <AlertDialogTitle>Delete Trial?</AlertDialogTitle>
          <AlertDialogDescription>
            {relationCount > 0 ? (
              <>
                <span className="text-red-600 font-medium">
                  Cannot delete {nctNumber}
                </span>{" "}
                because it has {relationCount} associated record(s). Delete the projects and assignments first.
              </>
            ) : (
              <>
                This will permanently delete <strong>{nctNumber}</strong>. This action cannot be undone.
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
