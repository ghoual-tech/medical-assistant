export type UrgencyLevel = 'VERT' | 'JAUNE' | 'ORANGE' | 'ROUGE';

export interface Vitals {
  temperature?: string;
  heartRate?: string;
  bloodPressure?: string;
  oxygenSaturation?: string;
  glycemia?: string;
}

export interface PatientProfile {
  id?: string;
  age: string;
  gender: 'homme' | 'femme' | 'autre';
  isPregnant?: boolean;
  medicalHistory: string[];
  currentTreatments: string[];
  allergies: string[];
  smoking: 'non' | 'occasionnel' | 'regulier';
  alcohol: 'non' | 'modere' | 'regulier';
  vitals?: Vitals;
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'document';
  mimeType: string;
  dataUrl: string; // base64
  previewUrl?: string;
  size?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  attachments?: Attachment[];
  suggestedReplies?: string[];
  isRedFlagWarning?: boolean;
  metadata?: {
    urgencyDetected?: UrgencyLevel;
    step?: string;
  };
}

export interface RedFlag {
  symptom: string;
  severity: 'CRITIQUE' | 'ELEVE' | 'MODERE';
  clinicalRisk: string;
  actionRequired: string;
  emergencyNumber?: string;
}

export interface DiagnosticHypothesis {
  name: string;
  icd10?: string;
  probability: number; // 0 to 100
  confidenceScore: number; // 0 to 100
  clinicalRationale: string;
  pathophysiology: string;
  matchingSymptoms: string[];
  missingKeySymptoms: string[];
  recommendedSpecialty: string;
  suggestedInvestigations: string[];
}

export interface OrientationRecommendation {
  primarySpecialty: string;
  secondarySpecialty?: string;
  careSetting: 'Urgences / SAMU 15' | 'Maison Médicale de Garde / SOS Médecins' | 'Cabinet de Médecine Générale' | 'Consultation Spécialiste' | 'Téléconsultation / Auto-soins';
  urgencyLevel: UrgencyLevel;
  timeframe: string; // e.g. "Immédiat (<15 min)", "Dans les 24h", "Sous 48-72h"
  triageRationale: string;
  consultationChecklist: string[];
  warningSignsToWatch: string[];
}

export interface SecondOpinionReport {
  timestamp: string;
  primaryHypothesisChallenged: string;
  counterExpertSummary: string;
  differentialDiagnoses: {
    name: string;
    probability: number;
    reasoning: string;
    whyOverlookedInitially: string;
    severityRisk: 'Faible' | 'Modéré' | 'Élevé';
  }[];
  agreementPoints: string[];
  divergencePoints: string[];
  cognitiveBiasesIdentified: {
    biasType: string; // e.g., "Biais d'ancrage", "Clôture prématurée", "Biais de représentativité"
    explanation: string;
  }[];
  atypicalPresentationsConsidered: string[];
  recommendedConfirmatoryTests: {
    testName: string;
    purpose: string;
    urgency: 'Prioritaire' | 'Complémentaire' | 'Différé';
  }[];
  hasGuidelinesReference: string;
  confidenceScore: number;
}

export interface ClinicalSOAPReport {
  id: string;
  date: string;
  patientProfile: PatientProfile;
  symptomsSummary: string;
  urgencyLevel: UrgencyLevel;
  soap: {
    subjective: string; // Motifs, anamnèse, symptômes rapportés
    objective: string;   // Données biométriques, constantes, éléments visuels/documents
    assessment: string;  // Analyse diagnostique, probabilités, drapeaux rouges
    plan: string;        // Orientation, examens à prescrire, consignes de surveillance
  };
  primaryHypotheses: DiagnosticHypothesis[];
  secondOpinionSummary?: string;
  complianceDisclaimers: string[];
  auditHash: string;
}

export interface TriageAuditRecord {
  id: string;
  timestamp: string;
  patientAge: string;
  gender: string;
  chiefComplaint: string;
  urgencyLevel: UrgencyLevel;
  redFlagsCount: number;
  primarySpecialty: string;
  isSecondOpinionGenerated: boolean;
  aiModelUsed: string;
  latencyMs: number;
}
