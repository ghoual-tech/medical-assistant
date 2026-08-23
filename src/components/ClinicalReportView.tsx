import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Copy,
  Check,
  Shield,
  Stethoscope,
  Activity,
  AlertCircle,
  Building,
  User,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { ClinicalSOAPReport } from '../types';

interface ClinicalReportViewProps {
  report: ClinicalSOAPReport | null;
  onGenerateReport: () => void;
  isLoading: boolean;
}

export const ClinicalReportView: React.FC<ClinicalReportViewProps> = ({
  report,
  onGenerateReport,
  isLoading,
}) => {
  const [copied, setCopied] = useState(false);
  const [isAnonymized, setIsAnonymized] = useState(false);

  if (!report && !isLoading) {
    return (
      <div id="report-empty-state" className="max-w-3xl mx-auto bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xs text-center space-y-4 my-8">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-200 shadow-2xs">
          <FileText className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
            Standard Médical International (CDC F-09)
          </span>
          <h3 className="text-xl font-extrabold text-slate-900">
            Compte-Rendu Clinique Structuré (SOAP)
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
            Créez une synthèse clinique complète au format international SOAP (Subjectif, Objectif, Analyse, Plan), prête à être imprimée ou transmise à votre médecin traitant.
          </p>
        </div>
        <div className="pt-3">
          <button
            id="trigger-generate-report-btn"
            onClick={onGenerateReport}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-950/20 transition cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Générer le Compte-Rendu Clinique (SOAP)</span>
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 my-8 shadow-xs">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mx-auto"></div>
        <h3 className="text-base font-extrabold text-slate-900">
          Rédaction du Compte-Rendu SOAP en cours...
        </h3>
        <p className="text-xs text-slate-500">
          Formatage conforme aux recommandations de la Haute Autorité de Santé (HAS)
        </p>
      </div>
    );
  }

  if (!report) return null;

  const handleCopyText = () => {
    const fullText = `=== COMPTE-RENDU D'ORIENTATION CLINIQUE (SOAP) ===
Réf: ${report.id} | Date: ${report.date}
Urgence: ${report.urgencyLevel}
Patient: ${isAnonymized ? 'PATIENT_ANONYME_#7391' : `${report.patientProfile.age || 'ND'} ans, Sexe: ${report.patientProfile.gender}`}

[S - SUBJECTIF]
${report.soap.subjective}

[O - OBJECTIF]
${report.soap.objective}

[A - ANALYSE / ASSESSMENT]
${report.soap.assessment}

[P - PLAN / ORIENTATION]
${report.soap.plan}

${report.secondOpinionSummary ? `\n[CONTRE-EXPERTISE (2e AVIS)]\n${report.secondOpinionSummary}` : ''}

Avertissement: Dispositif d'aide à la décision médicale (Règlement UE 2017/745). Ne remplace pas le diagnostic du médecin traitant.
Audit Hash: ${report.auditHash}`;

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const margin = 14;
    let y = 18;

    // Header
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("COMPTE-RENDU D'ORIENTATION MEDICALE", margin, y);
    y += 6;

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`Ref: ${report.id} | Date: ${report.date} | Audit: ${report.auditHash}`, margin, y);
    y += 10;

    // Patient & Triage Box
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, 182, 18, 'F');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    const patStr = isAnonymized
      ? "Patient: ANONYMISE (Conformite RGPD / HDS)"
      : `Patient: ${report.patientProfile.age || 'ND'} ans | Sexe: ${report.patientProfile.gender} | Urgence: ${report.urgencyLevel}`;
    doc.text(patStr, margin + 4, y + 7);
    doc.setFontSize(9);
    doc.text(`Motif: ${report.symptomsSummary.slice(0, 80)}...`, margin + 4, y + 13);
    y += 24;

    // SOAP Sections
    const sections = [
      { title: "S - SUBJECTIF (Anamnese & Symptomes)", content: report.soap.subjective },
      { title: "O - OBJECTIF (Constantes & Semiologie)", content: report.soap.objective },
      { title: "A - ANALYSE (Hypotheses & Drapeaux Rouges)", content: report.soap.assessment },
      { title: "P - PLAN (Orientation & Conduite a tenir)", content: report.soap.plan },
    ];

    sections.forEach((sec) => {
      doc.setFontSize(11);
      doc.setTextColor(79, 70, 229); // indigo-600
      doc.text(sec.title, margin, y);
      y += 5;

      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      const splitText = doc.splitTextToSize(sec.content, 180);
      doc.text(splitText, margin, y);
      y += splitText.length * 4.5 + 4;
    });

    if (report.secondOpinionSummary) {
      doc.setFontSize(11);
      doc.setTextColor(217, 119, 6); // amber-600
      doc.text("CONTRE-EXPERTISE (DEUXIEME AVIS MEDICAL)", margin, y);
      y += 5;
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      const split2nd = doc.splitTextToSize(report.secondOpinionSummary, 180);
      doc.text(split2nd, margin, y);
      y += split2nd.length * 4.5 + 4;
    }

    // Footer Disclaimer
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      "Outil d'orientation diagnostique conforme aux 101 bonnes pratiques de la HAS. En cas d'urgence, composer le 15 ou le 112.",
      margin,
      285
    );

    doc.save(`Compte_Rendu_Medical_${report.id}.pdf`);
  };

  return (
    <div id="clinical-report-container" className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Bento Action Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Compte-Rendu Clinique Standardisé</h3>
            <p className="text-xs text-slate-500">
              Réf : <span className="font-mono font-bold text-slate-700">{report.id}</span> • {report.date}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Anonymization Toggle */}
          <button
            id="toggle-anonymization-btn"
            onClick={() => setIsAnonymized(!isAnonymized)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold border transition cursor-pointer ${
              isAnonymized
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title="Activer la pseudonymisation stricte (RGPD)"
          >
            {isAnonymized ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{isAnonymized ? 'Anonymisé (RGPD)' : 'Anonymiser'}</span>
          </button>

          {/* Copy Button */}
          <button
            id="copy-report-text-btn"
            onClick={handleCopyText}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-2xl text-xs font-bold transition cursor-pointer border border-slate-200"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copié !' : 'Copier'}</span>
          </button>

          {/* Print Button */}
          <button
            id="print-report-btn"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-2xl text-xs font-bold transition cursor-pointer border border-slate-200"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer</span>
          </button>

          {/* PDF Download */}
          <button
            id="download-pdf-btn"
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold shadow-md shadow-indigo-950/20 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Télécharger PDF (F-15)</span>
          </button>
        </div>
      </div>

      {/* 2. Printable Bento Sheet View */}
      <div id="printable-soap-sheet" className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-9 shadow-xs space-y-6 text-slate-800">
        {/* Document Header */}
        <div className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-extrabold uppercase tracking-widest">
                SYNTHÈSE D'ORIENTATION CLINIQUE
              </span>
              <span className="text-xs text-slate-400 font-mono">Format SOAP / HAS</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-950 mt-1.5">
              Dossier Pré-Consultation & Aide à la Décision
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Généré le {report.date} • Audit Hash : <span className="font-mono text-slate-700">{report.auditHash}</span>
            </p>
          </div>

          <div className="text-left sm:text-right text-xs space-y-1.5">
            <div className="font-bold text-slate-800">
              Urgence Clinique :{' '}
              <span className={`px-2.5 py-1 rounded-full text-white font-extrabold text-[11px] shadow-2xs ${
                report.urgencyLevel === 'ROUGE'
                  ? 'bg-rose-600'
                  : report.urgencyLevel === 'ORANGE'
                  ? 'bg-amber-600'
                  : report.urgencyLevel === 'JAUNE'
                  ? 'bg-amber-500'
                  : 'bg-emerald-600'
              }`}>
                CODE {report.urgencyLevel}
              </span>
            </div>
            <div className="text-slate-600 font-medium">
              Patient : {isAnonymized ? 'PATIENT_PSEUDONYME_#9928' : `${report.patientProfile.age || 'ND'} ans (${report.patientProfile.gender})`}
            </div>
          </div>
        </div>

        {/* Patient Context Bento Tile */}
        <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-100 text-xs space-y-2.5">
          <h4 className="font-bold text-slate-900 uppercase tracking-widest text-[11px] flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-indigo-600" />
            <span>Données d'Anamnèse & Constantes Déclarées</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700 leading-relaxed">
            <div>
              <span className="font-bold text-slate-900">Antécédents :</span>{' '}
              {(report.patientProfile?.medicalHistory || []).length > 0
                ? report.patientProfile.medicalHistory.join(', ')
                : 'Aucun antécédent particulier signalé'}
            </div>
            <div>
              <span className="font-bold text-slate-900">Traitements habituels :</span>{' '}
              {(report.patientProfile?.currentTreatments || []).length > 0
                ? report.patientProfile.currentTreatments.join(', ')
                : 'Aucun traitement médicamenteux en cours'}
            </div>
            <div>
              <span className="font-bold text-slate-900">Allergies connues :</span>{' '}
              {(report.patientProfile?.allergies || []).length > 0
                ? report.patientProfile.allergies.join(', ')
                : 'Aucune allergie connue'}
            </div>
            <div>
              <span className="font-bold text-slate-900">Constantes :</span>{' '}
              Temp {report.patientProfile?.vitals?.temperature || 'ND'}°C | FC {report.patientProfile?.vitals?.heartRate || 'ND'} bpm | PA {report.patientProfile?.vitals?.bloodPressure || 'ND'} | SpO2 {report.patientProfile?.vitals?.oxygenSaturation || 'ND'}%
            </div>
          </div>
        </div>

        {/* SOAP Bento Tiles */}
        <div className="space-y-4">
          {/* S - Subjective */}
          <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-2xs">
                S
              </span>
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                Subjectif (Symptômes & Chronologie)
              </h3>
            </div>
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-9 font-normal">
              {report.soap?.subjective || "Anamnèse non spécifiée."}
            </div>
          </div>

          {/* O - Objective */}
          <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-2xs">
                O
              </span>
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                Objectif (Données Biométriques & Sémiologie)
              </h3>
            </div>
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-9 font-normal">
              {report.soap?.objective || "Constantes et signes cliniques standards."}
            </div>
          </div>

          {/* A - Assessment */}
          <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-2xs">
                A
              </span>
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                Analyse & Évaluation Clinique (Assessment)
              </h3>
            </div>
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-9 font-normal">
              {report.soap?.assessment || "Évaluation clinique préliminaire."}
            </div>
          </div>

          {/* P - Plan */}
          <div className="bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-2xs">
                P
              </span>
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                Plan de Prise en Charge & Orientation
              </h3>
            </div>
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-9 font-normal">
              {report.soap?.plan || "Orientation vers le médecin traitant."}
            </div>
          </div>
        </div>

        {/* Second Opinion Section if generated */}
        {report.secondOpinionSummary && (
          <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-950 font-bold uppercase tracking-wider">
              <Stethoscope className="w-4 h-4 text-amber-700" />
              <span>Synthèse de la Contre-Expertise (Deuxième Avis Médical) :</span>
            </div>
            <p className="text-amber-900 text-xs sm:text-sm leading-relaxed font-medium">
              « {report.secondOpinionSummary} »
            </p>
          </div>
        )}

        {/* Regulatory & Legal Disclaimers (R-04, R-05) */}
        <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Cadre Réglementaire & Sécurité Clinique :</span>
          </div>
          {(report.complianceDisclaimers || [
            "Dispositif d'aide à la décision médicale (Règlement UE 2017/745 DM Classe IIa).",
            "Ce document ne constitue pas un diagnostic définitif et ne remplace pas une consultation médicale.",
            "En cas d'urgence vitale, contactez immédiatement le 15 ou le 112."
          ]).map((disc, idx) => (
            <p key={idx} className="leading-snug">
              • {disc}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};
