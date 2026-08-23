import React from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Stethoscope,
  Building2,
  ListChecks,
  ChevronRight,
  GitCompare,
  FileText,
  Activity,
  Layers,
  Sparkles,
  Info,
  ExternalLink,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { DiagnosticHypothesis, RedFlag, OrientationRecommendation, UrgencyLevel } from '../types';

interface DiagnosticOverviewProps {
  urgencyLevel: UrgencyLevel;
  redFlags: RedFlag[];
  diagnosticHypotheses: DiagnosticHypothesis[];
  orientation: OrientationRecommendation;
  onRequestSecondOpinion: () => void;
  onGenerateReport: () => void;
  isSecondOpinionLoading?: boolean;
}

export const DiagnosticOverview: React.FC<DiagnosticOverviewProps> = ({
  urgencyLevel,
  redFlags,
  diagnosticHypotheses,
  orientation,
  onRequestSecondOpinion,
  onGenerateReport,
  isSecondOpinionLoading,
}) => {
  const getUrgencyBadge = (level: UrgencyLevel) => {
    switch (level) {
      case 'ROUGE':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-950',
          badgeBg: 'bg-rose-600 text-white',
          title: 'CODE ROUGE : URGENCE VITALE IMMÉDIATE',
          time: 'Prise en charge immédiate (< 15 min) - SAMU 15 / 112',
          icon: <AlertOctagon className="w-6 h-6 text-rose-600 shrink-0" />,
        };
      case 'ORANGE':
        return {
          bg: 'bg-orange-50 border-orange-200 text-orange-950',
          badgeBg: 'bg-orange-600 text-white',
          title: 'CODE ORANGE : URGENCE RELATIVE / CONSULTATION RAPIDE',
          time: 'Consultation médicale sous 4h à 12h (Maison Médicale de Garde / Urgences)',
          icon: <AlertTriangle className="w-6 h-6 text-orange-600 shrink-0" />,
        };
      case 'JAUNE':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-950',
          badgeBg: 'bg-amber-600 text-white',
          title: 'CODE JAUNE : CONSULTATION PROGRAMMÉE',
          time: 'Consultation en cabinet sous 24h à 72h (Médecin Généraliste)',
          icon: <Clock className="w-6 h-6 text-amber-600 shrink-0" />,
        };
      case 'VERT':
      default:
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-950',
          badgeBg: 'bg-emerald-600 text-white',
          title: 'CODE VERT : AUTO-SOINS SURVEILLÉS OU TÉLÉCONSULTATION',
          time: 'Surveillance à domicile / Téléconsultation différée',
          icon: <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />,
        };
    }
  };

  const badgeInfo = getUrgencyBadge(urgencyLevel);

  const hypotheses = diagnosticHypotheses || [];
  const flags = redFlags || [];

  return (
    <div id="diagnostic-overview-container" className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Urgency Level & Red Flags Bento Banner */}
      <div className={`p-6 sm:p-7 rounded-3xl border ${badgeInfo.bg} shadow-xs space-y-4`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-white shadow-2xs border border-slate-200/60 shrink-0">
              {badgeInfo.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full ${badgeInfo.badgeBg}`}>
                  {urgencyLevel}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Protocole de Triage HAS
                </span>
              </div>
              <h2 className="font-extrabold text-lg sm:text-xl text-slate-900 mt-1">{badgeInfo.title}</h2>
              <p className="text-xs sm:text-sm font-medium mt-0.5 text-slate-700">
                {badgeInfo.time}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-stretch md:self-auto shrink-0">
            <button
              id="cta-second-opinion-btn"
              onClick={onRequestSecondOpinion}
              disabled={isSecondOpinionLoading}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold shadow-sm transition cursor-pointer"
            >
              <GitCompare className="w-4 h-4 text-amber-400" />
              <span>{isSecondOpinionLoading ? 'Contre-expertise...' : 'Challenger (2e Avis)'}</span>
            </button>

            <button
              id="cta-generate-soap-btn"
              onClick={onGenerateReport}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold shadow-sm shadow-indigo-200 transition cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Générer Rapport SOAP</span>
            </button>
          </div>
        </div>

        {/* Red Flags Listing if any */}
        {flags.length > 0 && (
          <div className="pt-4 border-t border-rose-200/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-900 uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Drapeaux Rouges Identifiés ({flags.length}) :</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {flags.map((flag, idx) => (
                <div key={idx} className="bg-white/95 p-4 rounded-2xl border border-rose-200 text-xs text-rose-950 space-y-1.5 shadow-2xs">
                  <div className="font-bold text-rose-900 flex items-center justify-between">
                    <span className="text-sm">{flag.symptom}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full font-bold uppercase">
                      {flag.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-snug">
                    <strong className="text-slate-900">Risque :</strong> {flag.clinicalRisk}
                  </p>
                  <p className="text-[11px] text-rose-800 font-semibold">
                    <strong>Conduite :</strong> {flag.actionRequired}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. Main 12-col Bento Grid: Hypotheses vs Orientation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (7 cols): Ranked Diagnostic Hypotheses */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Hypothèses Diagnostiques (F-05)
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Classées par probabilité clinique</span>
          </div>

          <div className="space-y-4">
            {hypotheses.map((hyp, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:border-indigo-200 transition space-y-4"
              >
                {/* Hypothesis Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-2xl bg-indigo-50 text-indigo-700 text-xs font-black flex items-center justify-center border border-indigo-100 shrink-0">
                      #{index + 1}
                    </span>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2 flex-wrap">
                        <span>{hyp.name}</span>
                        {hyp.icd10 && (
                          <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-mono border border-slate-200">
                            CIM-10: {hyp.icd10}
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                        Spécialité : {hyp.recommendedSpecialty}
                      </p>
                    </div>
                  </div>

                  {/* Probability Bar & Score */}
                  <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                    <div className="text-right">
                      <div className="text-sm font-black text-slate-900">
                        {hyp.probability}% <span className="text-[10px] font-normal text-slate-400">probabilité</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        Indice confiance : {hyp.confidenceScore}%
                      </div>
                    </div>
                    <div className="w-20 sm:w-28 bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                      <div
                        className={`h-full rounded-full ${
                          hyp.probability > 60
                            ? 'bg-indigo-600'
                            : hyp.probability > 30
                            ? 'bg-cyan-500'
                            : 'bg-slate-400'
                        }`}
                        style={{ width: `${hyp.probability}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Clinical Rationale & Pathophysiology Tile */}
                <div className="text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5 leading-relaxed">
                  <p>
                    <strong className="text-slate-900">Justification sémiologique :</strong> {hyp.clinicalRationale}
                  </p>
                  <p>
                    <strong className="text-slate-900">Mécanisme physiopathologique :</strong> {hyp.pathophysiology}
                  </p>
                </div>

                {/* Symptoms matching & missing */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200/70">
                    <span className="text-emerald-950 font-bold block mb-1 text-[11px] uppercase tracking-wider">
                      ✓ Signes concordants :
                    </span>
                    <ul className="list-disc list-inside text-emerald-800 text-[11px] space-y-0.5 font-medium">
                      {(hyp.matchingSymptoms || []).map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  {hyp.missingKeySymptoms && hyp.missingKeySymptoms.length > 0 && (
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <span className="text-slate-700 font-bold block mb-1 text-[11px] uppercase tracking-wider">
                        ? Signes absents ou à vérifier :
                      </span>
                      <ul className="list-disc list-inside text-slate-600 text-[11px] space-y-0.5">
                        {hyp.missingKeySymptoms.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Suggested Investigations */}
                {hyp.suggestedInvestigations && hyp.suggestedInvestigations.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-1">
                    <span className="font-bold text-slate-700">Examens suggérés :</span>
                    {hyp.suggestedInvestigations.map((inv, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100 font-medium">
                        {inv}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right (5 cols): Orientation & Care Pathway Bento Module */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2 px-1">
            <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Building2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Orientation & Prise en Charge (F-07)
            </h3>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            {/* Primary Setting & Specialty */}
            <div className="bg-indigo-50/80 p-5 rounded-2xl border border-indigo-100 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-700">
                Spécialité & Structure Recommandée
              </span>
              <h4 className="text-lg font-extrabold text-indigo-950">
                {orientation.primarySpecialty}
              </h4>
              <p className="text-xs text-indigo-800 font-semibold">
                Cadre de soins : {orientation.careSetting}
              </p>
              <div className="pt-1.5 text-xs text-slate-700 border-t border-indigo-100/80">
                <span className="font-bold text-slate-900">Délai préconisé :</span> {orientation.timeframe}
              </div>
            </div>

            {/* Rationale */}
            <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <strong className="text-slate-900 block mb-1 uppercase tracking-wider text-[10px]">Justification du parcours :</strong>
              {orientation.triageRationale}
            </div>

            {/* Preparation Checklist */}
            {orientation.consultationChecklist && orientation.consultationChecklist.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <h5 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-indigo-600" />
                  <span>Checklist Préparation Consultation :</span>
                </h5>
                <ul className="space-y-2 text-xs text-slate-600">
                  {orientation.consultationChecklist.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <span className="font-medium text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warning Signs to Watch */}
            {orientation.warningSignsToWatch && orientation.warningSignsToWatch.length > 0 && (
              <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 space-y-1.5 text-xs text-rose-950">
                <strong className="text-rose-900 flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Signes de réévaluation urgente :</span>
                </strong>
                <ul className="list-disc list-inside text-rose-800 text-[11px] space-y-0.5 font-medium">
                  {orientation.warningSignsToWatch.map((sign, idx) => (
                    <li key={idx}>{sign}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
