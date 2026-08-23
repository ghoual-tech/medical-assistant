import React from 'react';
import {
  GitCompare,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Stethoscope,
  ShieldCheck,
  Sparkles,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Search,
  FileSpreadsheet
} from 'lucide-react';
import { SecondOpinionReport, DiagnosticHypothesis } from '../types';

interface SecondOpinionViewProps {
  secondOpinion: SecondOpinionReport | null;
  initialHypotheses: DiagnosticHypothesis[];
  onRequestSecondOpinion: () => void;
  isLoading: boolean;
  onGoToReport: () => void;
}

export const SecondOpinionView: React.FC<SecondOpinionViewProps> = ({
  secondOpinion,
  initialHypotheses,
  onRequestSecondOpinion,
  isLoading,
  onGoToReport,
}) => {
  if (!secondOpinion && !isLoading) {
    return (
      <div id="second-opinion-empty-state" className="max-w-4xl mx-auto bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xs text-center space-y-4 my-8">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-2xs">
          <GitCompare className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
            Contre-Expertise Indépendante (CDC F-10, F-11, F-12)
          </span>
          <h3 className="text-xl font-extrabold text-slate-900">
            Module Deuxième Avis & Challenge Diagnostique
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
            L'IA adopte la posture d'un contre-expert clinique indépendant. Elle traque les biais d'ancrage, explore les diagnostics différentiels masqués et met en confrontation directe les deux réflexions.
          </p>
        </div>

        <div className="pt-3">
          <button
            id="trigger-second-opinion-main-btn"
            onClick={onRequestSecondOpinion}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-slate-900/20 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Lancer l'Analyse Contradictoire & Deuxième Avis</span>
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 my-8 shadow-xs">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mx-auto"></div>
        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-slate-900">
            Analyse Contradictoire en cours...
          </h3>
          <p className="text-xs text-slate-500">
            Recherche de diagnostics différentiels, détection de biais cognitifs & examen des formes atypiques
          </p>
        </div>
      </div>
    );
  }

  if (!secondOpinion) return null;

  const topPrimary = initialHypotheses && initialHypotheses.length > 0 ? initialHypotheses[0] : null;
  const differentialDiagnoses = secondOpinion.differentialDiagnoses || [];
  const firstDiff = differentialDiagnoses.length > 0 ? differentialDiagnoses[0] : null;
  const agreementPoints = secondOpinion.agreementPoints || [];
  const divergencePoints = secondOpinion.divergencePoints || [];
  const cognitiveBiases = secondOpinion.cognitiveBiasesIdentified || [];
  const confirmatoryTests = secondOpinion.recommendedConfirmatoryTests || [];

  return (
    <div id="second-opinion-content" className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Bento Hero Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-7 rounded-3xl shadow-sm border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
              <GitCompare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-extrabold tracking-widest px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  CDC F-10 / F-11 / F-12
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Contre-Expertise Clinique
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-extrabold text-slate-100 mt-0.5">
                Deuxième Avis & Challenge Diagnostique
              </h2>
              <p className="text-xs text-slate-300">
                Diagnostic initial challengé : <strong className="text-amber-300">{secondOpinion.primaryHypothesisChallenged || topPrimary?.name || 'Diagnostic initial'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              id="refresh-second-opinion-btn"
              onClick={onRequestSecondOpinion}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-xs font-semibold transition cursor-pointer border border-slate-700 shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Réévaluer</span>
            </button>
            <button
              id="goto-report-from-second-opinion-btn"
              onClick={onGoToReport}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold shadow-md shadow-indigo-950/40 transition cursor-pointer"
            >
              <span>Intégrer au Compte-Rendu SOAP</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Counter Expert Summary */}
        <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700/80 text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
          <p>
            <strong className="text-amber-400 block text-xs uppercase tracking-wider mb-1 font-bold">Posture du Contre-Expert :</strong>
            « {secondOpinion.counterExpertSummary || "Analyse contradictoire des hypothèses diagnostiques."} »
          </p>
        </div>
      </div>

      {/* 2. Confrontation Bento Grid (F-11) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Confrontation des Avis (F-11) : Premier Avis vs Deuxième Avis
            </h3>
          </div>
          <span className="text-xs text-slate-400">Analyse croisée</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* 1st Opinion Bento Card */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-indigo-600" />
                <span>Premier Diagnostic</span>
              </span>
              {topPrimary && (
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  {topPrimary.probability}% probabilité
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                {topPrimary?.name || secondOpinion.primaryHypothesisChallenged || 'Diagnostic initial'}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {topPrimary?.clinicalRationale || 'Hypothèse dominante issue de l\'anamnèse initiale.'}
              </p>
            </div>

            <div className="text-[11px] text-slate-600 bg-white p-3 rounded-xl border border-slate-200/90">
              <strong className="text-slate-800">Mécanisme :</strong> {topPrimary?.pathophysiology || 'Processus standard'}
            </div>
          </div>

          {/* 2nd Opinion / Differential Bento Card */}
          <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <GitCompare className="w-4 h-4 text-amber-600" />
                <span>Deuxième Avis (Contre-Expert)</span>
              </span>
              <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                Confiance : {secondOpinion.confidenceScore || 85}%
              </span>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-extrabold text-amber-950 text-sm sm:text-base">
                {firstDiff?.name || 'Diagnostics Différentiels Élargis'}
              </h4>
              <p className="text-xs text-amber-900 leading-relaxed font-normal">
                {firstDiff?.reasoning || 'Recherche élargie de diagnostics d\'exclusion et formes atypiques.'}
              </p>
            </div>

            <div className="text-[11px] text-amber-900 bg-white/95 p-3 rounded-xl border border-amber-200">
              <strong className="text-amber-950">Pourquoi négligé initialement ? :</strong>{' '}
              {firstDiff?.whyOverlookedInitially || 'Biais d\'ancrage sur le motif principal ou clôture prématurée.'}
            </div>
          </div>
        </div>

        {/* Agreement vs Divergence Bento Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Agreement */}
          <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 space-y-2">
            <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Points d'Accord Clinique :</span>
            </span>
            <ul className="space-y-1.5 text-xs text-emerald-800 font-medium">
              {agreementPoints.map((pt, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>{pt}</span>
                </li>
              ))}
              {agreementPoints.length === 0 && (
                <li className="text-xs text-emerald-700 italic">Concordance globale sur la nécessité d'un examen médical.</li>
              )}
            </ul>
          </div>

          {/* Divergence */}
          <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200/80 space-y-2">
            <span className="text-xs font-bold text-rose-950 flex items-center gap-1.5 uppercase tracking-wider">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Points de Divergence / Vigilance :</span>
            </span>
            <ul className="space-y-1.5 text-xs text-rose-900 font-medium">
              {divergencePoints.map((pt, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">•</span>
                  <span>{pt}</span>
                </li>
              ))}
              {divergencePoints.length === 0 && (
                <li className="text-xs text-rose-700 italic">Élargissement du spectre des diagnostics différentiels.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* 3. Cognitive Biases & Differential Diagnoses Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Differential Diagnoses (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center gap-2 px-1">
            <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Search className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Diagnostics Différentiels Suggérés (F-10)
            </h3>
          </div>

          <div className="space-y-3.5">
            {differentialDiagnoses.map((diff, index) => (
              <div
                key={index}
                className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-3 hover:border-indigo-200 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="font-extrabold text-slate-900 text-sm sm:text-base">{diff.name}</span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      diff.severityRisk === 'Élevé'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : diff.severityRisk === 'Modéré'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      Risque : {diff.severityRisk || 'Modéré'}
                    </span>
                  </div>
                  <span className="text-xs font-black text-slate-900">
                    {diff.probability}% probabilité
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong className="text-slate-900">Argumentaire :</strong> {diff.reasoning}
                </p>
                <p className="text-[11px] text-amber-950 bg-amber-50 p-3 rounded-2xl border border-amber-200/80 leading-relaxed font-medium">
                  <strong className="text-amber-900">Piège diagnostique :</strong> {diff.whyOverlookedInitially}
                </p>
              </div>
            ))}
            {differentialDiagnoses.length === 0 && (
              <div className="bg-white p-5 rounded-3xl border border-slate-200 text-center text-xs text-slate-500">
                Aucun diagnostic différentiel supplémentaire à signaler.
              </div>
            )}
          </div>
        </div>

        {/* Cognitive Biases & Ref HAS (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Cognitive Biases Trapped */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Biais Cognitifs Identifiés (F-10)</span>
            </h4>
            <div className="space-y-2">
              {cognitiveBiases.map((bias, idx) => (
                <div key={idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs space-y-1">
                  <span className="font-bold text-slate-900 block">{bias.biasType}</span>
                  <p className="text-slate-600 text-[11px] leading-snug">{bias.explanation}</p>
                </div>
              ))}
              {cognitiveBiases.length === 0 && (
                <p className="text-xs text-slate-400 italic">Aucun biais cognitif saillant identifié.</p>
              )}
            </div>
          </div>

          {/* Confirmatory Tests to arbitrate */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-indigo-600" />
              <span>Examens d'Arbitrage (F-12)</span>
            </h4>
            <div className="space-y-2">
              {confirmatoryTests.map((t, idx) => (
                <div key={idx} className="text-xs p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-indigo-950 font-bold">{t.testName}</strong>
                    <span className="text-[10px] text-indigo-700 font-bold px-2 py-0.5 bg-indigo-100 rounded-md">
                      {t.urgency}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">{t.purpose}</p>
                </div>
              ))}
              {confirmatoryTests.length === 0 && (
                <p className="text-xs text-slate-400 italic">Bilan biologique standard préconisé.</p>
              )}
            </div>
          </div>

          {/* HAS / Scientific Reference (R-05) */}
          <div className="bg-slate-900 text-slate-200 p-4 rounded-3xl text-xs space-y-2 shadow-xs">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <BookOpen className="w-4 h-4" />
              <span>Référentiel Clinique HAS</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
              {secondOpinion.hasGuidelinesReference || "Haute Autorité de Santé (HAS) - Guide méthodologique pour la démarche diagnostique."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
