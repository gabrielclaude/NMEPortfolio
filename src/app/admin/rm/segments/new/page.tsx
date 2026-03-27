import { RmStudySegmentForm } from "@/components/admin/forms/RmStudySegmentForm";
import {
  createRmStudySegment,
  getRmStudiesForSegmentSelect,
} from "@/actions/rm-study-segment.actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewRmStudySegmentPage() {
  const studies = await getRmStudiesForSegmentSelect();

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/rm/segments"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Segments
        </Link>
      </div>

      <RmStudySegmentForm
        action={createRmStudySegment}
        mode="create"
        studies={studies}
      />
    </div>
  );
}
