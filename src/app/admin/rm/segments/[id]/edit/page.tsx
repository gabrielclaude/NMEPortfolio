import { notFound } from "next/navigation";
import { RmStudySegmentForm } from "@/components/admin/forms/RmStudySegmentForm";
import {
  updateRmStudySegment,
  getRmStudySegmentById,
  getRmStudiesForSegmentSelect,
} from "@/actions/rm-study-segment.actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type PageProps = {
  params: Promise<{ id: string }>;
};

function formatDateForInput(date: Date): string {
  return date.toISOString().split("T")[0];
}

export default async function EditRmStudySegmentPage({ params }: PageProps) {
  const { id } = await params;
  const segmentId = parseInt(id, 10);

  if (isNaN(segmentId)) {
    notFound();
  }

  const [segment, studies] = await Promise.all([
    getRmStudySegmentById(segmentId),
    getRmStudiesForSegmentSelect(),
  ]);

  if (!segment) {
    notFound();
  }

  const boundAction = updateRmStudySegment.bind(null, segmentId);

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
        defaultValues={{
          id: segment.id,
          studyId: segment.study_id,
          activity: segment.activity as "Start Up" | "Conduct" | "Close Out",
          role: segment.role as "Clinical Scientist" | "Medical Monitor" | "Clinical RA",
          complexity: segment.complexity as "Low" | "Medium" | "High",
          phase: String(segment.phase),
          startDate: formatDateForInput(segment.start_date),
          endDate: formatDateForInput(segment.end_date),
          ftePerMonth: String(segment.fte_per_month),
        }}
        action={boundAction}
        mode="edit"
        studies={studies}
      />
    </div>
  );
}
