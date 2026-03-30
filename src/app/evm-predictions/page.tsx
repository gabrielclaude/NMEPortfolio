export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { EVMPredictionDashboard } from "@/components/evm-predictions/EVMPredictionDashboard";

interface ProjectEVMWithStatus {
  project_id: string;
  project_code: string;
  project_name: string;
  project_status: string;
  nme_id: string;
  nme_name: string;
  nme_code: string;
  therapeutic_area: string;
  nme_status: string;
  bac: number;
  pv: number;
  ev: number;
  ac: number;
  pct_complete: number;
}

export default async function EVMPredictionsPage() {
  // Fetch project EVM data with NME status from the database
  const projectRows = await prisma.$queryRaw<ProjectEVMWithStatus[]>`
    SELECT
      p.project_id,
      p.project_code,
      p.project_name,
      p.project_status,
      p.nme_id,
      p.nme_name,
      p.nme_code,
      p.therapeutic_area,
      n.status as nme_status,
      p.bac,
      p.pv,
      p.ev,
      p.ac,
      p.pct_complete
    FROM v_project_evm p
    JOIN "NME" n ON n.id = p.nme_id
    ORDER BY p.bac DESC
  `;

  // Transform data for the prediction model
  const projectData = projectRows.map((row) => ({
    project_id: row.project_code,
    project_name: row.project_name,
    nme_name: row.nme_name,
    therapeutic_area: row.therapeutic_area,
    nme_status: row.nme_status,
    bac: Number(row.bac) || 0,
    pv: Number(row.pv) || 0,
    ev: Number(row.ev) || 0,
    ac: Number(row.ac) || 0,
    percent_complete: Number(row.pct_complete) || 0,
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">EVM Deep Learning Predictions</h1>
        <p className="text-sm text-gray-500 mt-1">
          Neural network predictions for Earned Value using TensorFlow model
        </p>
      </div>

      {/* Dashboard Component */}
      <EVMPredictionDashboard projectData={projectData} />
    </div>
  );
}
