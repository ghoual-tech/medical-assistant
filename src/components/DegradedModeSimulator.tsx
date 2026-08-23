import React, { useState } from 'react';
import {
  Cpu,
  ShieldCheck,
  AlertOctagon,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  Check
} from 'lucide-react';
import { UrgencyLevel } from '../types';

export const DegradedModeSimulator: React.FC = () => {
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([]);
  const [patientAge, setPatientAge] = useState('45');
  const [result, setResult] = useState<{
    urgency: UrgencyLevel;
    rationale: string;
    action: string;
    protocol: string;
  } | null>(null);

  const criteriaList = [
    {
      id: 'c1',
      text: 'Douleur thoracique constrictive irradiant au bras ou à la mâchoire',
      weight: 'ROUGE',
      protocol: 'Suspicion Syndrome Coronarien Aigu (SCA)',
    },
    {
      id: 'c2',
      text: 'Déficit neurologique brutal (paralysie faciale, bras, perte de parole)',
      weight: 'ROUGE',
      protocol: 'Suspicion Accident Vasculaire Cérébral (AVC - Urgence thrombolyse)',
    },
    {
      id: 'c3',
      text: 'Détresse respiratoire aiguë (impossibilité de parler, cyanose, tirage)',
      weight: 'ROUGE',
      protocol: 'Insuffisance respiratoire aiguë',
    },
    {
      id: 'c4',
      text: 'Perte de connaissance brève ou malaise avec chute inexpliquée',
      weight: 'ROUGE',
      protocol: 'Malaise syncope / Trouble du rythme',
    },
    {
      id: 'c5',
      text: 'Fièvre > 39.5°C avec céphalées intenses et raideur de nuque',
      weight: 'ORANGE',
      protocol: 'Syndrome méningé aigu',
    },
    {
      id: 'c6',
      text: 'Douleur abdominale aiguë intense avec défense ou vomissements fécoïdes',
      weight: 'ORANGE',
      protocol: 'Urgence médico-chirurgicale abdominale',
    },
    {
      id: 'c7',
      text: 'Dyspnée d\'effort récente ou toux fébrile depuis 48h',
      weight: 'JAUNE',
      protocol: 'Infection respiratoire basse / Exacerbation',
    },
    {
      id: 'c8',
      text: 'Symptômes ORL banals (rhinorrhée, odynophagie sans dyspnée)',
      weight: 'VERT',
      protocol: 'Rhinopharyngite virale simple',
    },
  ];

  const handleToggle = (id: string) => {
    if (selectedCriteria.includes(id)) {
      setSelectedCriteria(selectedCriteria.filter((c) => c !== id));
    } else {
      setSelectedCriteria([...selectedCriteria, id]);
    }
  };

  const handleRunEvaluation = () => {
    if (selectedCriteria.length === 0) {
      setResult({
        urgency: 'VERT',
        rationale: 'Aucun critère d\'alerte coché. Triage par défaut en niveau vert.',
        action: 'Surveillance simple à domicile. Reconsulter en cas d\'aggravation.',
        protocol: 'Règle déterministe standard',
      });
      return;
    }

    const hasRed = selectedCriteria.some((id) =>
      criteriaList.find((c) => c.id === id && c.weight === 'ROUGE')
    );
    const hasOrange = selectedCriteria.some((id) =>
      criteriaList.find((c) => c.id === id && c.weight === 'ORANGE')
    );
    const hasJaune = selectedCriteria.some((id) =>
      criteriaList.find((c) => c.id === id && c.weight === 'JAUNE')
    );

    if (hasRed) {
      setResult({
        urgency: 'ROUGE',
        rationale: 'Présence d\'au moins un signe de détresse vitale immédiate.',
        action: 'Appel immédiat du SAMU (15) ou du 112. Patient au repos strict.',
        protocol: 'Protocole SAMU Triage Urgent (Règle d\'exclusion absolue)',
      });
    } else if (hasOrange) {
      setResult({
        urgency: 'ORANGE',
        rationale: 'Signes cliniques aigus nécessitant un avis médical rapide dans les 4 à 12h.',
        action: 'Orientation Maison Médicale de Garde ou Service d\'Accueil des Urgences.',
        protocol: 'Protocole de garde / Urgence médico-chirurgicale',
      });
    } else if (hasJaune) {
      setResult({
        urgency: 'JAUNE',
        rationale: 'Symptômes persistants sans détresse immédiate.',
        action: 'Consultation chez le Médecin Traitant sous 24h à 72h.',
        protocol: 'Parcours de soins primaires programmés',
      });
    } else {
      setResult({
        urgency: 'VERT',
        rationale: 'Tableau clinique compatible avec une affection bénigne auto-résolutive.',
        action: 'Conseils hygiéno-diététiques et surveillance officinale.',
        protocol: 'Prise en charge ambulatoire de premier recours',
      });
    }
  };

  return (
    <div id="degraded-mode-container" className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Bento Hero */}
      <div className="bg-slate-900 text-white p-6 sm:p-7 rounded-3xl border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-extrabold tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                EXIGENCE NF-06
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Haute Disponibilité 99.5%
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-extrabold text-slate-100 mt-1">
              Moteur de Triage Déterministe en Mode Dégradé (Hors-Ligne)
            </h2>
            <p className="text-xs text-slate-300">
              Arbre décisionnel de secours 100% hors-ligne (Manchester Triage System & Référentiel SAMU).
            </p>
          </div>
        </div>
      </div>

      {/* 2. Simulator 12-Column Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Checklist criteria */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              1. Sélectionnez les critères cliniques observés :
            </h3>
            <button
              onClick={() => setSelectedCriteria([])}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 px-2.5 py-1 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Tout décocher</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {criteriaList.map((crit) => {
              const isChecked = selectedCriteria.includes(crit.id);
              return (
                <div
                  key={crit.id}
                  onClick={() => handleToggle(crit.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    isChecked
                      ? crit.weight === 'ROUGE'
                        ? 'bg-rose-50 border-rose-300 text-rose-950 shadow-2xs'
                        : crit.weight === 'ORANGE'
                        ? 'bg-amber-50 border-amber-300 text-amber-950 shadow-2xs'
                        : crit.weight === 'JAUNE'
                        ? 'bg-amber-50/60 border-amber-200 text-amber-950 shadow-2xs'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-2xs'
                      : 'bg-slate-50/70 border-slate-200/80 text-slate-700 hover:bg-slate-100/80'
                  }`}
                >
                  <div className={`w-5 h-5 mt-0.5 rounded-lg border flex items-center justify-center shrink-0 transition ${
                    isChecked
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}>
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div className="flex-1 text-xs">
                    <div className="font-bold text-slate-900">{crit.text}</div>
                    <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                      <span>Protocole : <strong className="font-semibold text-slate-700">{crit.protocol}</strong></span>
                      <span>•</span>
                      <span className={`font-extrabold uppercase px-2 py-0.5 rounded-md text-[10px] ${
                        crit.weight === 'ROUGE'
                          ? 'bg-rose-100 text-rose-800'
                          : crit.weight === 'ORANGE'
                          ? 'bg-amber-100 text-amber-800'
                          : crit.weight === 'JAUNE'
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {crit.weight}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <button
              id="run-degraded-triage-btn"
              onClick={handleRunEvaluation}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-slate-900/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 text-amber-400" />
              <span>Évaluer l'Arbre Déterministe (Sans Dépendance IA)</span>
            </button>
          </div>
        </div>

        {/* Right 4 Cols: Output result */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              2. Résultat du Triage Déterministe
            </h3>

            {result ? (
              <div className="space-y-3">
                <div
                  className={`p-5 rounded-2xl text-xs space-y-2 ${
                    result.urgency === 'ROUGE'
                      ? 'bg-rose-100 text-rose-950 border border-rose-300'
                      : result.urgency === 'ORANGE'
                      ? 'bg-amber-100 text-amber-950 border border-amber-300'
                      : result.urgency === 'JAUNE'
                      ? 'bg-amber-50 text-amber-950 border border-amber-200'
                      : 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest block">
                    NIVEAU CALCULÉ
                  </span>
                  <div className="text-lg font-black flex items-center gap-2">
                    {result.urgency === 'ROUGE' ? (
                      <AlertOctagon className="w-5 h-5 text-rose-600" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    )}
                    <span>CODE {result.urgency}</span>
                  </div>
                  <p className="text-xs font-medium mt-1 leading-relaxed">{result.rationale}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs space-y-1">
                  <span className="font-bold text-slate-900 block uppercase tracking-wider text-[11px]">Conduite Immédiate :</span>
                  <p className="text-slate-700 text-xs leading-relaxed font-medium">{result.action}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs space-y-1">
                  <span className="font-bold text-slate-900 block uppercase tracking-wider text-[11px]">Règle de Référence :</span>
                  <p className="text-slate-600 text-[11px] font-mono">{result.protocol}</p>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 leading-relaxed font-medium">
                Sélectionnez des critères et cliquez sur "Évaluer" pour déclencher le moteur de règles déterministe.
              </div>
            )}
          </div>

          <div className="bg-indigo-50/70 p-5 rounded-3xl border border-indigo-100 text-xs text-indigo-950 space-y-2">
            <span className="font-bold flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Garantie de Disponibilité 99.5% (NF-02)</span>
            </span>
            <p className="text-[11px] text-indigo-900 leading-relaxed font-medium">
              En cas d'interruption du service cloud ou d'indisponibilité du modèle IA, l'arbre de règles s'exécute directement en local pour assurer un triage médical continu sans rupture.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
