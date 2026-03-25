import "dotenv/config";
import { PrismaClient, TherapeuticArea, MoleculeType, NMEStatus, TrialPhase, TrialStatus, StaffRole, ProjectStatus, MilestoneStatus, TaskStatus, TaskPriority } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { faker } from "@faker-js/faker";

faker.seed(42);

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "postgresql://claudegabriel@localhost:5433/nme_portfolio",
});
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

// ─── Domain Data ────────────────────────────────────────────────────────────

const NME_DATA = [
  { name: "Lumeviran",     code: "NME-001", area: "ONCOLOGY" as TherapeuticArea,          molType: "SMALL_MOLECULE" as MoleculeType, status: "PHASE_3" as NMEStatus,     indication: "Non-Small Cell Lung Cancer",        moa: "EGFR/ALK dual inhibitor" },
  { name: "Ostacimab",     code: "NME-002", area: "IMMUNOLOGY" as TherapeuticArea,         molType: "ANTIBODY" as MoleculeType,       status: "PHASE_2" as NMEStatus,     indication: "Rheumatoid Arthritis",              moa: "IL-6 receptor antagonist" },
  { name: "Fexipraxin",    code: "NME-003", area: "CARDIOVASCULAR" as TherapeuticArea,     molType: "SMALL_MOLECULE" as MoleculeType, status: "PHASE_2" as NMEStatus,     indication: "Heart Failure with Reduced EF",     moa: "SGLT2/SGLT1 inhibitor" },
  { name: "Dalvitinib",    code: "NME-004", area: "ONCOLOGY" as TherapeuticArea,           molType: "SMALL_MOLECULE" as MoleculeType, status: "PHASE_3" as NMEStatus,     indication: "Diffuse Large B-Cell Lymphoma",     moa: "BTK inhibitor" },
  { name: "Renaclovir",    code: "NME-005", area: "INFECTIOUS_DISEASE" as TherapeuticArea, molType: "SMALL_MOLECULE" as MoleculeType, status: "PHASE_2" as NMEStatus,     indication: "RSV Infection",                     moa: "RSV fusion protein inhibitor" },
  { name: "Sorelumab",     code: "NME-006", area: "IMMUNOLOGY" as TherapeuticArea,         molType: "ANTIBODY" as MoleculeType,       status: "PHASE_2" as NMEStatus,     indication: "Systemic Lupus Erythematosus",      moa: "BAFF/APRIL dual blocker" },
  { name: "Brevipanib",    code: "NME-007", area: "ONCOLOGY" as TherapeuticArea,           molType: "SMALL_MOLECULE" as MoleculeType, status: "PHASE_2" as NMEStatus,     indication: "Pancreatic Ductal Adenocarcinoma",  moa: "KRAS G12C inhibitor" },
  { name: "Cloxatide",     code: "NME-008", area: "CARDIOVASCULAR" as TherapeuticArea,     molType: "PEPTIDE" as MoleculeType,        status: "PHASE_1" as NMEStatus,     indication: "Acute Coronary Syndrome",           moa: "GPIIb/IIIa receptor antagonist" },
  { name: "Atorivex",      code: "NME-009", area: "METABOLIC" as TherapeuticArea,          molType: "SMALL_MOLECULE" as MoleculeType, status: "PHASE_2" as NMEStatus,     indication: "NASH/MASH",                         moa: "FXR/TGR5 dual agonist" },
  { name: "Nelufimod",     code: "NME-010", area: "NEUROLOGY" as TherapeuticArea,          molType: "SMALL_MOLECULE" as MoleculeType, status: "PHASE_2" as NMEStatus,     indication: "Multiple Sclerosis",                moa: "S1P receptor modulator" },
  { name: "Pratezumab",    code: "NME-011", area: "ONCOLOGY" as TherapeuticArea,           molType: "ANTIBODY" as MoleculeType,       status: "PHASE_3" as NMEStatus,     indication: "Triple-Negative Breast Cancer",     moa: "PD-1/TIM-3 bispecific" },
  { name: "Elvinacept",    code: "NME-012", area: "RARE_DISEASE" as TherapeuticArea,       molType: "BIOLOGIC" as MoleculeType,       status: "NDA_FILED" as NMEStatus,   indication: "Hereditary Transthyretin Amyloidosis", moa: "TTR stabilizer" },
  { name: "Zuranolide-X",  code: "NME-013", area: "NEUROLOGY" as TherapeuticArea,          molType: "SMALL_MOLECULE" as MoleculeType, status: "PHASE_3" as NMEStatus,     indication: "Major Depressive Disorder",         moa: "GABA-A positive allosteric modulator" },
  { name: "Ciritostat",    code: "NME-014", area: "ONCOLOGY" as TherapeuticArea,           molType: "SMALL_MOLECULE" as MoleculeType, status: "PHASE_1" as NMEStatus,     indication: "Hepatocellular Carcinoma",          moa: "IDH1/IDH2 inhibitor" },
  { name: "Glipavir",      code: "NME-015", area: "INFECTIOUS_DISEASE" as TherapeuticArea, molType: "SMALL_MOLECULE" as MoleculeType, status: "PHASE_1" as NMEStatus,     indication: "HIV-1 Infection",                   moa: "Capsid assembly modulator" },
  { name: "Omalizin",      code: "NME-016", area: "RESPIRATORY" as TherapeuticArea,        molType: "ANTIBODY" as MoleculeType,       status: "PHASE_2" as NMEStatus,     indication: "Severe Asthma with Eosinophilia",   moa: "IL-33 antagonist" },
  { name: "Ventiprex",     code: "NME-017", area: "CARDIOVASCULAR" as TherapeuticArea,     molType: "SMALL_MOLECULE" as MoleculeType, status: "PHASE_1" as NMEStatus,     indication: "Pulmonary Arterial Hypertension",   moa: "Soluble guanylate cyclase stimulator" },
  { name: "Halovectin",    code: "NME-018", area: "ONCOLOGY" as TherapeuticArea,           molType: "GENE_THERAPY" as MoleculeType,   status: "PHASE_1" as NMEStatus,     indication: "Glioblastoma Multiforme",           moa: "Oncolytic adenovirus vector" },
  { name: "Naxolimab",     code: "NME-019", area: "NEUROLOGY" as TherapeuticArea,          molType: "ANTIBODY" as MoleculeType,       status: "PHASE_2" as NMEStatus,     indication: "Alzheimer's Disease",               moa: "Anti-tau antibody" },
  { name: "Forsitinib",    code: "NME-020", area: "ONCOLOGY" as TherapeuticArea,           molType: "SMALL_MOLECULE" as MoleculeType, status: "APPROVED" as NMEStatus,    indication: "Chronic Myeloid Leukemia",          moa: "BCR-ABL T315I inhibitor" },
];

const STAFF_DATA = [
  // Principal Scientists (6)
  { firstName: "Sarah",    lastName: "Okonkwo",    role: "PRINCIPAL_SCIENTIST" as StaffRole,          dept: "Oncology R&D",       spec: "Oncology" },
  { firstName: "James",    lastName: "Harrington", role: "PRINCIPAL_SCIENTIST" as StaffRole,          dept: "Cardiovascular R&D", spec: "Cardiovascular" },
  { firstName: "Elena",    lastName: "Vasquez",    role: "PRINCIPAL_SCIENTIST" as StaffRole,          dept: "Neuroscience R&D",   spec: "Neurology" },
  { firstName: "David",    lastName: "Nakamura",   role: "PRINCIPAL_SCIENTIST" as StaffRole,          dept: "Immunology R&D",     spec: "Immunology" },
  { firstName: "Priya",    lastName: "Krishnan",   role: "PRINCIPAL_SCIENTIST" as StaffRole,          dept: "Infectious Disease", spec: "Virology" },
  { firstName: "Marcus",   lastName: "Holloway",   role: "PRINCIPAL_SCIENTIST" as StaffRole,          dept: "Rare Disease",       spec: "Rare Disease" },
  // Medical Monitors (5)
  { firstName: "Mei-Ling", lastName: "Zhou",       role: "MEDICAL_MONITOR" as StaffRole,              dept: "Clinical Safety",    spec: "Oncology" },
  { firstName: "Tobias",   lastName: "Brenner",    role: "MEDICAL_MONITOR" as StaffRole,              dept: "Clinical Safety",    spec: "Cardiology" },
  { firstName: "Amara",    lastName: "Osei",       role: "MEDICAL_MONITOR" as StaffRole,              dept: "Clinical Safety",    spec: "Neurology" },
  { firstName: "Ravi",     lastName: "Subramaniam",role: "MEDICAL_MONITOR" as StaffRole,              dept: "Clinical Safety",    spec: "Immunology" },
  { firstName: "Chloe",    lastName: "Lefebvre",   role: "MEDICAL_MONITOR" as StaffRole,              dept: "Clinical Safety",    spec: "Respiratory" },
  // Research Associates (8)
  { firstName: "Marcus",   lastName: "Webb",       role: "RESEARCH_ASSOCIATE" as StaffRole,           dept: "Oncology R&D",       spec: "Biomarkers" },
  { firstName: "Fatima",   lastName: "Al-Rashid",  role: "RESEARCH_ASSOCIATE" as StaffRole,           dept: "Immunology R&D",     spec: "Flow Cytometry" },
  { firstName: "Liam",     lastName: "Fitzgerald", role: "RESEARCH_ASSOCIATE" as StaffRole,           dept: "Cardiovascular R&D", spec: "Pharmacology" },
  { firstName: "Yuki",     lastName: "Tanaka",     role: "RESEARCH_ASSOCIATE" as StaffRole,           dept: "Neuroscience R&D",   spec: "In Vivo Models" },
  { firstName: "Destiny",  lastName: "Johnson",    role: "RESEARCH_ASSOCIATE" as StaffRole,           dept: "Oncology R&D",       spec: "Molecular Biology" },
  { firstName: "Henrik",   lastName: "Sorensen",   role: "RESEARCH_ASSOCIATE" as StaffRole,           dept: "Infectious Disease", spec: "Microbiology" },
  { firstName: "Aaliyah",  lastName: "Brooks",     role: "RESEARCH_ASSOCIATE" as StaffRole,           dept: "Rare Disease",       spec: "Genetics" },
  { firstName: "Carlos",   lastName: "Reyes",      role: "RESEARCH_ASSOCIATE" as StaffRole,           dept: "Metabolic R&D",      spec: "Biochemistry" },
  // Clinical Operations Managers (2)
  { firstName: "Ingrid",   lastName: "Magnusson",  role: "CLINICAL_OPERATIONS_MANAGER" as StaffRole,  dept: "Clinical Operations", spec: undefined },
  { firstName: "Jerome",   lastName: "Thibault",   role: "CLINICAL_OPERATIONS_MANAGER" as StaffRole,  dept: "Clinical Operations", spec: undefined },
  // Data Managers (2)
  { firstName: "Nadia",    lastName: "Petrov",     role: "DATA_MANAGER" as StaffRole,                 dept: "Biometrics",          spec: "EDC Systems" },
  { firstName: "Kwame",    lastName: "Asante",     role: "DATA_MANAGER" as StaffRole,                 dept: "Biometrics",          spec: "Data Standards" },
  // Biostatistician (1)
  { firstName: "Linnea",   lastName: "Bergstrom",  role: "BIOSTATISTICIAN" as StaffRole,              dept: "Biometrics",          spec: "Adaptive Designs" },
  // Regulatory Affairs (1)
  { firstName: "Thomas",   lastName: "Nguyen",     role: "REGULATORY_AFFAIRS" as StaffRole,           dept: "Regulatory Affairs",  spec: "FDA/EMA" },
  // Project Manager (1)
  { firstName: "Samira",   lastName: "El-Amin",    role: "PROJECT_MANAGER" as StaffRole,              dept: "Program Management",  spec: undefined },
];

// Trial templates: each entry defines which NME (by index) gets a trial
const TRIAL_TEMPLATES = [
  // Lumeviran (PHASE_3) - 2 trials
  { nmeIdx: 0,  phase: "PHASE_3" as TrialPhase, status: "ACTIVE" as TrialStatus,             tEnroll: 450, aEnroll: 387, sites: 42, countries: ["US","UK","DE","FR","JP"], suffix: "A", endpoint: "Overall Survival" },
  { nmeIdx: 0,  phase: "PHASE_2" as TrialPhase, status: "ENROLLMENT_COMPLETE" as TrialStatus, tEnroll: 180, aEnroll: 180, sites: 18, countries: ["US","CA","AU"],            suffix: "B", endpoint: "PFS in 2L NSCLC" },
  // Ostacimab (PHASE_2) - 2 trials
  { nmeIdx: 1,  phase: "PHASE_2" as TrialPhase, status: "ACTIVE" as TrialStatus,             tEnroll: 240, aEnroll: 156, sites: 24, countries: ["US","DE","ES","IT"],        suffix: "A", endpoint: "ACR50 at Week 24" },
  { nmeIdx: 1,  phase: "PHASE_1B" as TrialPhase,status: "COMPLETED" as TrialStatus,          tEnroll: 60,  aEnroll: 60,  sites: 6,  countries: ["US"],                       suffix: "B", endpoint: "Safety & PK" },
  // Fexipraxin (PHASE_2) - 1 trial
  { nmeIdx: 2,  phase: "PHASE_2" as TrialPhase, status: "RECRUITING" as TrialStatus,         tEnroll: 320, aEnroll: 88,  sites: 30, countries: ["US","UK","SE","NL"],        suffix: "A", endpoint: "Change in NT-proBNP" },
  // Dalvitinib (PHASE_3) - 2 trials
  { nmeIdx: 3,  phase: "PHASE_3" as TrialPhase, status: "RECRUITING" as TrialStatus,         tEnroll: 600, aEnroll: 234, sites: 56, countries: ["US","UK","DE","FR","CN","JP"], suffix: "A", endpoint: "Event-Free Survival" },
  { nmeIdx: 3,  phase: "PHASE_2B" as TrialPhase,status: "COMPLETED" as TrialStatus,          tEnroll: 200, aEnroll: 200, sites: 22, countries: ["US","CA"],                  suffix: "B", endpoint: "CR rate" },
  // Renaclovir (PHASE_2) - 1 trial
  { nmeIdx: 4,  phase: "PHASE_2" as TrialPhase, status: "ACTIVE" as TrialStatus,             tEnroll: 160, aEnroll: 120, sites: 15, countries: ["US","UK","ZA"],             suffix: "A", endpoint: "Viral Load Reduction" },
  // Sorelumab (PHASE_2) - 1 trial
  { nmeIdx: 5,  phase: "PHASE_2" as TrialPhase, status: "RECRUITING" as TrialStatus,         tEnroll: 280, aEnroll: 67,  sites: 28, countries: ["US","DE","IT","FR"],        suffix: "A", endpoint: "SLEDAI Score" },
  // Brevipanib (PHASE_2) - 1 trial
  { nmeIdx: 6,  phase: "PHASE_2" as TrialPhase, status: "ACTIVE" as TrialStatus,             tEnroll: 120, aEnroll: 95,  sites: 14, countries: ["US","FR"],                  suffix: "A", endpoint: "ORR" },
  // Cloxatide (PHASE_1) - 1 trial
  { nmeIdx: 7,  phase: "PHASE_1" as TrialPhase, status: "ACTIVE" as TrialStatus,             tEnroll: 48,  aEnroll: 36,  sites: 3,  countries: ["US"],                       suffix: "A", endpoint: "MAD/SAD Safety" },
  // Atorivex (PHASE_2) - 1 trial
  { nmeIdx: 8,  phase: "PHASE_2" as TrialPhase, status: "RECRUITING" as TrialStatus,         tEnroll: 200, aEnroll: 42,  sites: 20, countries: ["US","DE","AU"],             suffix: "A", endpoint: "Liver Fat Fraction" },
  // Nelufimod (PHASE_2) - 2 trials
  { nmeIdx: 9,  phase: "PHASE_2" as TrialPhase, status: "ACTIVE" as TrialStatus,             tEnroll: 300, aEnroll: 210, sites: 30, countries: ["US","UK","DE","SE"],        suffix: "A", endpoint: "EDSS at 24 months" },
  { nmeIdx: 9,  phase: "PHASE_1B" as TrialPhase,status: "COMPLETED" as TrialStatus,          tEnroll: 72,  aEnroll: 72,  sites: 5,  countries: ["US","UK"],                  suffix: "B", endpoint: "Safety/PK" },
  // Pratezumab (PHASE_3) - 1 trial
  { nmeIdx: 10, phase: "PHASE_3" as TrialPhase, status: "RECRUITING" as TrialStatus,         tEnroll: 520, aEnroll: 189, sites: 48, countries: ["US","UK","DE","FR","BR"],   suffix: "A", endpoint: "pCR at Surgery" },
  // Elvinacept (NDA_FILED) - 1 trial (Phase 3 completed)
  { nmeIdx: 11, phase: "PHASE_3" as TrialPhase, status: "COMPLETED" as TrialStatus,          tEnroll: 225, aEnroll: 225, sites: 38, countries: ["US","UK","DE","JP"],        suffix: "A", endpoint: "mNIS+7 Change" },
  // Zuranolide-X (PHASE_3) - 1 trial
  { nmeIdx: 12, phase: "PHASE_3" as TrialPhase, status: "ACTIVE" as TrialStatus,             tEnroll: 400, aEnroll: 310, sites: 35, countries: ["US","CA","DE","AU"],        suffix: "A", endpoint: "HAMD-17 Remission" },
  // Ciritostat (PHASE_1) - 1 trial
  { nmeIdx: 13, phase: "PHASE_1" as TrialPhase, status: "ACTIVE" as TrialStatus,             tEnroll: 60,  aEnroll: 44,  sites: 4,  countries: ["US","DE"],                  suffix: "A", endpoint: "MTD/RP2D" },
  // Glipavir (PHASE_1) - 1 trial
  { nmeIdx: 14, phase: "PHASE_1" as TrialPhase, status: "RECRUITING" as TrialStatus,         tEnroll: 54,  aEnroll: 12,  sites: 3,  countries: ["US"],                       suffix: "A", endpoint: "SAD Safety & PK" },
  // Omalizin (PHASE_2) - 1 trial
  { nmeIdx: 15, phase: "PHASE_2" as TrialPhase, status: "ACTIVE" as TrialStatus,             tEnroll: 190, aEnroll: 140, sites: 20, countries: ["US","UK","DE"],             suffix: "A", endpoint: "Asthma Control Score" },
  // Ventiprex (PHASE_1) - 1 trial
  { nmeIdx: 16, phase: "PHASE_1" as TrialPhase, status: "PLANNING" as TrialStatus,           tEnroll: 42,  aEnroll: 0,   sites: 2,  countries: ["US"],                       suffix: "A", endpoint: "Safety/PK/PD" },
  // Halovectin (PHASE_1) - 1 trial
  { nmeIdx: 17, phase: "PHASE_1" as TrialPhase, status: "RECRUITING" as TrialStatus,         tEnroll: 36,  aEnroll: 8,   sites: 4,  countries: ["US","UK"],                  suffix: "A", endpoint: "Safety & Tumor Response" },
  // Naxolimab (PHASE_2) - 2 trials
  { nmeIdx: 18, phase: "PHASE_2" as TrialPhase, status: "ACTIVE" as TrialStatus,             tEnroll: 260, aEnroll: 185, sites: 25, countries: ["US","UK","DE","JP"],        suffix: "A", endpoint: "ADAS-Cog Change" },
  { nmeIdx: 18, phase: "PHASE_2" as TrialPhase, status: "RECRUITING" as TrialStatus,         tEnroll: 180, aEnroll: 35,  sites: 18, countries: ["US","CA"],                  suffix: "B", endpoint: "Early AD Biomarkers" },
  // Forsitinib (APPROVED) - Phase 4
  { nmeIdx: 19, phase: "PHASE_4" as TrialPhase, status: "ACTIVE" as TrialStatus,             tEnroll: 1200, aEnroll: 876, sites: 85, countries: ["US","EU","JP","CN","BR"], suffix: "A", endpoint: "Long-term OS / RWE" },
  { nmeIdx: 19, phase: "PHASE_4" as TrialPhase, status: "ACTIVE" as TrialStatus,             tEnroll: 400, aEnroll: 198, sites: 30, countries: ["US","UK","DE"],             suffix: "B", endpoint: "Pediatric Safety" },
  // Extra trials to reach 30
  { nmeIdx: 2,  phase: "PHASE_1" as TrialPhase, status: "COMPLETED" as TrialStatus,          tEnroll: 36,  aEnroll: 36,  sites: 3,  countries: ["US"],                       suffix: "C", endpoint: "First-in-human SAD" },
  { nmeIdx: 5,  phase: "PHASE_1B" as TrialPhase,status: "COMPLETED" as TrialStatus,          tEnroll: 48,  aEnroll: 48,  sites: 4,  countries: ["US","DE"],                  suffix: "C", endpoint: "Dose-escalation Safety" },
  { nmeIdx: 10, phase: "PHASE_2" as TrialPhase, status: "SUSPENDED" as TrialStatus,          tEnroll: 100, aEnroll: 45,  sites: 10, countries: ["US"],                       suffix: "B", endpoint: "1L TNBC ORR" },
];

const PROJECT_TYPES = [
  { name: "Site Initiation Package",     desc: "Site qualification, selection, and initiation activities" },
  { name: "Protocol Amendment Review",   desc: "Protocol change impact assessment and regulatory notification" },
  { name: "CRF Design & Validation",     desc: "Case report form design, build, and UAT for EDC system" },
  { name: "Statistical Analysis Plan",   desc: "SAP authoring, review, and statistical programming setup" },
  { name: "Interim Safety Review",       desc: "DSMB preparation, unblinding procedure, and report" },
  { name: "Regulatory Submission Pkg",   desc: "IND/CTA submission package preparation and response" },
  { name: "Clinical Study Report",       desc: "CSR writing, QC, and final report packaging" },
];

const MILESTONE_TEMPLATES: Record<string, Array<{ name: string; isCritical: boolean }>> = {
  "Site Initiation Package": [
    { name: "Protocol Finalization",   isCritical: true  },
    { name: "IRB/IEC Approval",        isCritical: true  },
    { name: "Site Selection Complete", isCritical: false },
    { name: "Site Initiation Visit",   isCritical: true  },
  ],
  "Protocol Amendment Review": [
    { name: "Amendment Draft v1.0",    isCritical: true  },
    { name: "Regulatory Notification", isCritical: true  },
    { name: "Site Communication",      isCritical: false },
  ],
  "CRF Design & Validation": [
    { name: "Annotated CRF Draft",     isCritical: false },
    { name: "EDC Build Complete",      isCritical: true  },
    { name: "UAT Sign-off",            isCritical: true  },
  ],
  "Statistical Analysis Plan": [
    { name: "SAP Draft v1.0",          isCritical: true  },
    { name: "Biostatistics Review",    isCritical: false },
    { name: "Final SAP Approval",      isCritical: true  },
  ],
  "Interim Safety Review": [
    { name: "DSMB Charter Approval",   isCritical: true  },
    { name: "Unblinding Procedure",    isCritical: true  },
    { name: "Safety Signal Review",    isCritical: true  },
    { name: "DSMB Report Final",       isCritical: false },
  ],
  "Regulatory Submission Pkg": [
    { name: "Dossier Compilation",     isCritical: true  },
    { name: "Country Addenda",         isCritical: false },
    { name: "Agency Submission",       isCritical: true  },
    { name: "Query Response",          isCritical: false },
  ],
  "Clinical Study Report": [
    { name: "Database Lock",           isCritical: true  },
    { name: "Statistical Outputs",     isCritical: true  },
    { name: "CSR Draft v1.0",          isCritical: false },
    { name: "Final CSR Sign-off",      isCritical: true  },
  ],
};

const TASK_TEMPLATES: Record<string, string[]> = {
  "Protocol Finalization":   ["Draft protocol synopsis", "Review inclusion/exclusion criteria", "Finalize endpoints and estimands"],
  "IRB/IEC Approval":        ["Prepare IRB submission package", "Respond to IRB queries", "File approval certificates"],
  "Site Selection Complete": ["Evaluate investigator CVs", "Conduct feasibility questionnaires", "Negotiate site contracts"],
  "Site Initiation Visit":   ["Deliver protocol training", "Set up IP accountability log", "Verify site documentation"],
  "Amendment Draft v1.0":    ["Draft amendment rationale", "Update IB reference section", "Revise study schedule"],
  "Regulatory Notification": ["Prepare cover letter", "Submit amendment to FDA/EMA", "Log submission in tracker"],
  "Site Communication":      ["Draft site notification letter", "Update site-specific materials", "Confirm receipt from sites"],
  "Annotated CRF Draft":     ["Map data dictionary to CRF", "Review with clinical team", "Incorporate TA standards"],
  "EDC Build Complete":       ["Configure study in Medidata Rave", "Build derived fields", "Conduct edit check validation"],
  "UAT Sign-off":             ["Execute UAT test scripts", "Document defects and resolutions", "Obtain business sign-off"],
  "SAP Draft v1.0":          ["Define primary/secondary estimands", "Write missing data methodology", "Draft sensitivity analyses"],
  "Biostatistics Review":    ["Perform internal stats peer review", "Align on imputation strategy", "Review sample size assumptions"],
  "Final SAP Approval":      ["Circulate for final review", "Address reviewer comments", "Archive signed SAP"],
  "DSMB Charter Approval":   ["Draft DSMB charter", "Obtain member signatures", "Distribute to sites"],
  "Unblinding Procedure":    ["Write emergency unblinding SOP", "Test randomization system", "Train pharmacist on procedure"],
  "Safety Signal Review":    ["Compile adverse event listings", "Review SAE narratives", "Reconcile lab abnormalities"],
  "DSMB Report Final":       ["Prepare safety data package", "Write DSMB meeting minutes", "File report in TMF"],
  "Dossier Compilation":     ["Compile Module 2 summary", "Assemble nonclinical data tables", "Format clinical overview"],
  "Country Addenda":         ["Prepare local PI CV package", "Translate label into local language", "File country-specific addenda"],
  "Agency Submission":       ["Upload eCTD to gateway", "Confirm acknowledgment receipt", "Track agency clock"],
  "Query Response":          ["Draft responses to agency questions", "Review with medical team", "Submit response package"],
  "Database Lock":           ["Finalize data cleaning queries", "Complete coding review", "Execute database lock procedure"],
  "Statistical Outputs":     ["Generate primary analysis tables", "Produce Kaplan-Meier plots", "Validate statistical programs"],
  "CSR Draft v1.0":          ["Write clinical narrative section", "Integrate statistical appendices", "Conduct QC check"],
  "Final CSR Sign-off":      ["Circulate to PI for review", "Address medical monitor comments", "Archive signed final CSR"],
};

function randomPick<T>(arr: T[]): T {
  return arr[faker.number.int({ min: 0, max: arr.length - 1 })];
}

function addMonths(date: Date, n: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

function subtractMonths(date: Date, n: number): Date {
  return addMonths(date, -n);
}

async function main() {
  console.log("🌱 Starting seed...");

  // Clear in reverse dependency order
  await prisma.task.deleteMany();
  await prisma.milestoneAssignment.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.project.deleteMany();
  await prisma.trialStaffAssignment.deleteMany();
  await prisma.clinicalTrial.deleteMany();
  await prisma.nME.deleteMany();
  await prisma.staff.deleteMany();

  // ── 1. NMEs ──────────────────────────────────────────────────────────────
  console.log("Creating NMEs...");
  const nmes = await Promise.all(
    NME_DATA.map((d) =>
      prisma.nME.create({
        data: {
          code:              d.code,
          name:              d.name,
          therapeuticArea:   d.area,
          moleculeType:      d.molType,
          status:            d.status,
          targetIndication:  d.indication,
          mechanismOfAction: d.moa,
          originatorCompany: "NovaMed Therapeutics",
          discoveryDate:     faker.date.between({ from: "2015-01-01", to: "2021-12-31" }),
          indFilingDate:     d.status !== "PRECLINICAL" ? faker.date.between({ from: "2019-01-01", to: "2023-06-30" }) : null,
          patentExpiry:      faker.date.between({ from: "2033-01-01", to: "2040-12-31" }),
        },
      })
    )
  );
  console.log(`  ✓ ${nmes.length} NMEs`);

  // ── 2. Staff ──────────────────────────────────────────────────────────────
  console.log("Creating staff...");
  const staff = await Promise.all(
    STAFF_DATA.map((d, i) =>
      prisma.staff.create({
        data: {
          employeeId:      `EMP-${String(1000 + i).padStart(4, "0")}`,
          firstName:       d.firstName,
          lastName:        d.lastName,
          email:           `${d.firstName.toLowerCase().replace("-", "")}.${d.lastName.toLowerCase().replace(" ", "").replace("'", "")}@novamed.com`,
          role:            d.role,
          department:      d.dept,
          specialization:  d.spec ?? null,
          yearsExperience: faker.number.int({ min: 3, max: 22 }),
          isActive:        true,
          hireDate:        faker.date.between({ from: "2010-01-01", to: "2022-12-31" }),
        },
      })
    )
  );
  console.log(`  ✓ ${staff.length} staff`);

  const principalScientists = staff.filter((s) => s.role === "PRINCIPAL_SCIENTIST");
  const medMonitors         = staff.filter((s) => s.role === "MEDICAL_MONITOR");
  const researchAssociates  = staff.filter((s) => s.role === "RESEARCH_ASSOCIATE");
  const allStaff            = staff;

  // ── 3. Clinical Trials ────────────────────────────────────────────────────
  console.log("Creating clinical trials...");
  let trialCounter = 1000;
  const trials = await Promise.all(
    TRIAL_TEMPLATES.map((t) => {
      const nme = nmes[t.nmeIdx];
      const nctNum = `NCT0${trialCounter++}`;
      const startDate = faker.date.between({ from: "2020-01-01", to: "2024-06-30" });
      const endDate = addMonths(startDate, faker.number.int({ min: 24, max: 60 }));
      const actualStart = t.status !== "PLANNING" ? faker.date.between({ from: startDate, to: addMonths(startDate, 3) }) : null;
      const actualEnd   = t.status === "COMPLETED" ? faker.date.between({ from: subtractMonths(endDate, 3), to: endDate }) : null;
      const leadStaff   = randomPick(principalScientists);
      const studyDesigns = [
        "Randomized, Double-blind, Placebo-controlled",
        "Open-label, Dose-escalation",
        "Randomized, Single-blind, Active-controlled",
        "Single-arm, Open-label",
        "Randomized, Double-blind, Multi-arm",
      ];

      return prisma.clinicalTrial.create({
        data: {
          nctNumber:        nctNum,
          title:            `A ${randomPick(studyDesigns)} Study of ${nme.name} in ${nme.targetIndication}${t.suffix !== "A" ? ` (${t.suffix})` : ""}`,
          phase:            t.phase,
          status:           t.status,
          sponsorProtocolId:`NMD-${nme.code}-${t.suffix}`,
          primaryEndpoint:  t.endpoint,
          studyDesign:      randomPick(studyDesigns),
          targetEnrollment: t.tEnroll,
          actualEnrollment: t.aEnroll,
          plannedStartDate: startDate,
          plannedEndDate:   endDate,
          actualStartDate:  actualStart,
          actualEndDate:    actualEnd,
          sites:            t.sites,
          countries:        t.countries,
          budget:           faker.number.float({ min: 2_000_000, max: 80_000_000, fractionDigits: 2 }),
          nmeId:            nme.id,
          leadStaffId:      leadStaff.id,
        },
      });
    })
  );
  console.log(`  ✓ ${trials.length} clinical trials`);

  // ── 4. Trial Staff Assignments ─────────────────────────────────────────────
  console.log("Creating staff assignments...");
  let assignCount = 0;
  for (const trial of trials) {
    const monitor = randomPick(medMonitors);
    const ra1     = randomPick(researchAssociates);
    const ra2     = researchAssociates.find((r) => r.id !== ra1.id) ?? ra1;
    const ps      = staff.find((s) => s.id === trial.leadStaffId) ?? randomPick(principalScientists);

    const assignees = [
      { staffId: ps.id,      role: "PRINCIPAL_SCIENTIST" as StaffRole, effort: 0.5 },
      { staffId: monitor.id, role: "MEDICAL_MONITOR" as StaffRole,      effort: 0.3 },
      { staffId: ra1.id,     role: "RESEARCH_ASSOCIATE" as StaffRole,   effort: 0.8 },
      { staffId: ra2.id,     role: "RESEARCH_ASSOCIATE" as StaffRole,   effort: 0.6 },
    ];

    for (const a of assignees) {
      try {
        await prisma.trialStaffAssignment.create({
          data: {
            trialId:   trial.id,
            staffId:   a.staffId,
            role:      a.role,
            startDate: trial.actualStartDate ?? trial.plannedStartDate,
            endDate:   trial.actualEndDate ?? null,
            effort:    a.effort,
          },
        });
        assignCount++;
      } catch {
        // skip duplicate assignment
      }
    }
  }
  console.log(`  ✓ ${assignCount} trial-staff assignments`);

  // ── 5. Projects ───────────────────────────────────────────────────────────
  console.log("Creating projects...");
  let projectCounter = 1;
  const projects: Awaited<ReturnType<typeof prisma.project.create>>[] = [];

  for (const trial of trials) {
    const numProjects = faker.number.int({ min: 1, max: 3 });
    const shuffled = faker.helpers.shuffle([...PROJECT_TYPES]).slice(0, numProjects);

    for (const pt of shuffled) {
      const projStart = trial.actualStartDate ?? trial.plannedStartDate;
      const projEnd   = addMonths(projStart, faker.number.int({ min: 6, max: 30 }));
      const statusOptions: ProjectStatus[] = trial.status === "COMPLETED"
        ? ["COMPLETED"]
        : trial.status === "PLANNING"
        ? ["NOT_STARTED"]
        : ["IN_PROGRESS", "AT_RISK", "IN_PROGRESS", "IN_PROGRESS"];
      const projStatus = randomPick(statusOptions);
      const pct = projStatus === "COMPLETED" ? 100
        : projStatus === "NOT_STARTED"       ? 0
        : faker.number.int({ min: 15, max: 90 });

      const p = await prisma.project.create({
        data: {
          code:           `PROJ-${String(projectCounter++).padStart(4, "0")}`,
          name:           pt.name,
          description:    pt.desc,
          status:         projStatus,
          priority:       randomPick(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as TaskPriority[]),
          plannedStart:   projStart,
          plannedEnd:     projEnd,
          actualStart:    projStatus !== "NOT_STARTED" ? faker.date.between({ from: projStart, to: addMonths(projStart, 2) }) : null,
          actualEnd:      projStatus === "COMPLETED"   ? faker.date.between({ from: subtractMonths(projEnd, 2), to: projEnd }) : null,
          budget:         faker.number.float({ min: 100_000, max: 3_000_000, fractionDigits: 2 }),
          percentComplete: pct,
          trialId:        trial.id,
        },
      });
      projects.push(p);
    }
  }
  console.log(`  ✓ ${projects.length} projects`);

  // ── 6. Milestones ─────────────────────────────────────────────────────────
  console.log("Creating milestones...");
  const milestones: Awaited<ReturnType<typeof prisma.milestone.create>>[] = [];

  for (const project of projects) {
    const templates = MILESTONE_TEMPLATES[project.name] ?? MILESTONE_TEMPLATES["Site Initiation Package"];
    let sortOrder = 0;

    for (const mt of templates) {
      const dueDate = addMonths(project.plannedStart, faker.number.int({ min: 2, max: 12 }));
      const isCompleted = project.status === "COMPLETED" || Math.random() > 0.6;
      const isDelayed   = !isCompleted && dueDate < new Date() && Math.random() > 0.5;

      let msStatus: MilestoneStatus =
        project.status === "NOT_STARTED"          ? "PENDING"
        : isCompleted                              ? "COMPLETED"
        : isDelayed                                ? "DELAYED"
        : dueDate < addMonths(new Date(), 1)       ? "IN_PROGRESS"
        : "PENDING";

      const m = await prisma.milestone.create({
        data: {
          name:          mt.name,
          description:   `Milestone: ${mt.name} for ${project.name}`,
          status:        msStatus,
          dueDate:       dueDate,
          completedDate: msStatus === "COMPLETED" ? faker.date.between({ from: subtractMonths(dueDate, 2), to: dueDate }) : null,
          isCriticalPath: mt.isCritical,
          sortOrder:     sortOrder++,
          projectId:     project.id,
        },
      });
      milestones.push(m);

      // Assign a staff member to the milestone
      const assignee = randomPick(allStaff);
      await prisma.milestoneAssignment.create({
        data: { milestoneId: m.id, staffId: assignee.id },
      });
    }
  }
  console.log(`  ✓ ${milestones.length} milestones`);

  // ── 7. Tasks ──────────────────────────────────────────────────────────────
  console.log("Creating tasks...");
  let taskCount = 0;

  for (const milestone of milestones) {
    const taskTitles = TASK_TEMPLATES[milestone.name] ?? [
      "Review documentation",
      "Update tracking spreadsheet",
      "Conduct team meeting",
    ];

    for (const title of taskTitles) {
      const dueDate = milestone.dueDate
        ? faker.date.between({ from: subtractMonths(milestone.dueDate, 1), to: milestone.dueDate })
        : null;

      const statusMap: Record<MilestoneStatus, TaskStatus[]> = {
        COMPLETED:   ["DONE"],
        IN_PROGRESS: ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"],
        PENDING:     ["BACKLOG", "TODO"],
        DELAYED:     ["IN_PROGRESS", "BLOCKED", "TODO"],
        SKIPPED:     ["CANCELLED"],
      };
      const taskStatus = randomPick(statusMap[milestone.status] ?? ["TODO"]);
      const assignee = randomPick(allStaff);

      await prisma.task.create({
        data: {
          title:          title,
          description:    `${title} for milestone: ${milestone.name}`,
          status:         taskStatus,
          priority:       randomPick(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as TaskPriority[]),
          estimatedHours: faker.number.float({ min: 2, max: 40, fractionDigits: 1 }),
          actualHours:    taskStatus === "DONE" ? faker.number.float({ min: 2, max: 50, fractionDigits: 1 }) : null,
          dueDate:        dueDate,
          completedAt:    taskStatus === "DONE" ? faker.date.recent({ days: 90 }) : null,
          tags:           faker.helpers.arrayElements(["safety", "regulatory", "data", "statistics", "clinical", "site-ops"], faker.number.int({ min: 0, max: 3 })),
          milestoneId:    milestone.id,
          assigneeId:     assignee.id,
        },
      });
      taskCount++;
    }
  }
  console.log(`  ✓ ${taskCount} tasks`);

  // ── Summary ──────────────────────────────────────────────────────────────
  const counts = {
    nmes:     await prisma.nME.count(),
    trials:   await prisma.clinicalTrial.count(),
    staff:    await prisma.staff.count(),
    projects: await prisma.project.count(),
    milestones: await prisma.milestone.count(),
    tasks:    await prisma.task.count(),
  };
  console.log("\n✅ Seed complete!");
  console.log("  Counts:", counts);
  console.log("  Total rows:", Object.values(counts).reduce((a, b) => a + b, 0));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
