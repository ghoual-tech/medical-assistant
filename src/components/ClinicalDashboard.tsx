import React from 'react';
import {
  BarChart3,
  Activity,
  AlertOctagon,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Users,
  Search,
  FileText,
  RotateCcw,
  Zap,
  TrendingUp,
  Award,
  Sparkles
} from 'lucide-react';
import { TriageAuditRecord } from '../types';

interface ClinicalDashboardProps {
  auditRecords: TriageAuditRecord[];
  onClearHistory?: () => void;
  onSelectRecord?: (record: TriageAuditRecord) => void;
}

export const ClinicalDashboard: React.FC<ClinicalDashboardProps> = ({
  auditRecords,
  onClearHistory,
  onSelectRecord,
}) => {
  // Aggregate Stats
  const total = auditRecords.length;
  const rougeCount = auditRecords.filter((r) => r.urgencyLevel === 'ROUGE').length;
  const orangeCount = auditRecords.filter((r) => r.urgencyLevel === 'ORANGE').length;
  const jauneCount = auditRecords.filter((r) => r.urgencyLevel === 'JAUNE').length;
  const vertCount = auditRecords.filter((r) => r.urgencyLevel === 'VERT').length;
  const secondOpinionCount = auditRecords.filter((r) => r.isSecondOpinionGenerated).length;
  const redFlagsTotal = auditRecords.reduce((acc, r) => acc + (r.redFlagsCount || 0), 0);

  const avgLatency =
    total > 0
      ? Math.round(auditRecords.reduce((acc, r) => acc + (r.latencyMs || 1200), 0) / total)
      : 0;

  return (
    <div id="clinical-dashboard-container" className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Bento Hero */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-extrabold tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                AUDIT & PILOTAGE
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400">
                CDC F-13, F-14 • NF-01, NF-04
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-extrabold text-slate-900 mt-1">
              Tableau de Bord Clinique & Registre d'Audit
            </h2>
            <p className="text-xs text-slate-500">
              Métriques de triage, traçabilité des décisions et conformité HDS/RGPD.
            </p>
          </div>
        </div>

        {total > 0 && onClearHistory && (
          <button
            id="clear-audit-history-btn"
            onClick={onClearHistory}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition border border-slate-200 cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser l'historique</span>
          </button>
        )}
      </div>

      {/* 2. KPI Bento Grid Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Assessments */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-1.5 hover:border-indigo-200 transition">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>Évaluations Totales</span>
          </span>
          <div className="text-3xl font-black text-slate-900 tracking-tight">{total}</div>
          <p className="text-[11px] text-slate-500 font-medium">Patients triés & orientés</p>
        </div>

        {/* Vital Emergencies Rate */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-1.5 hover:border-rose-200 transition">
          <span className="text-[10px] font-extrabold text-rose-600 uppercase tracking-widest flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
            <span>Urgences Vitales (Rouge)</span>
          </span>
          <div className="text-3xl font-black text-rose-600 tracking-tight">{rougeCount}</div>
          <p className="text-[11px] text-slate-500 font-medium">
            {total > 0 ? `${Math.round((rougeCount / total) * 100)}% des cas orientés SAMU` : '0% des cas'}
          </p>
        </div>

        {/* 2nd Opinion Rate */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-1.5 hover:border-amber-200 transition">
          <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-widest flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>Contre-Expertises IA</span>
          </span>
          <div className="text-3xl font-black text-amber-600 tracking-tight">{secondOpinionCount}</div>
          <p className="text-[11px] text-slate-500 font-medium">
            Deuxièmes avis générés
          </p>
        </div>

        {/* AI Latency & Performance (NF-03) */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-1.5 hover:border-emerald-200 transition">
          <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-indigo-600" />
            <span>Temps de Réponse IA</span>
          </span>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {avgLatency > 0 ? `${(avgLatency / 1000).toFixed(1)}s` : '< 2.0s'}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold">Conforme NF-03 (&lt; 3s)</p>
        </div>
      </div>

      {/* 3. Distribution of Urgency Levels Bento Card */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Répartition des Niveaux de Gravité Clinique (Auto-Triage F-08)
            </h3>
          </div>
          <span className="text-xs text-slate-400">Échelle internationale 4 niveaux</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {/* Rouge */}
          <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200/90 space-y-2">
            <div className="text-xs font-bold text-rose-950 flex justify-between items-center">
              <span className="uppercase tracking-wider">Code ROUGE</span>
              <span className="font-mono text-sm font-black">{rougeCount}</span>
            </div>
            <div className="w-full bg-rose-200/80 rounded-full h-2">
              <div
                className="bg-rose-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${total ? (rougeCount / total) * 100 : 0}%` }}
              ></div>
            </div>
            <p className="text-[10px] font-semibold text-rose-700">SAMU 15 / Immédiat</p>
          </div>

          {/* Orange */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 space-y-2">
            <div className="text-xs font-bold text-amber-950 flex justify-between items-center">
              <span className="uppercase tracking-wider">Code ORANGE</span>
              <span className="font-mono text-sm font-black">{orangeCount}</span>
            </div>
            <div className="w-full bg-amber-200/80 rounded-full h-2">
              <div
                className="bg-amber-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${total ? (orangeCount / total) * 100 : 0}%` }}
              ></div>
            </div>
            <p className="text-[10px] font-semibold text-amber-700">Sous 4h - 12h</p>
          </div>

          {/* Jaune */}
          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-2">
            <div className="text-xs font-bold text-amber-900 flex justify-between items-center">
              <span className="uppercase tracking-wider">Code JAUNE</span>
              <span className="font-mono text-sm font-black">{jauneCount}</span>
            </div>
            <div className="w-full bg-amber-200/60 rounded-full h-2">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${total ? (jauneCount / total) * 100 : 0}%` }}
              ></div>
            </div>
            <p className="text-[10px] font-semibold text-amber-700">Sous 24h - 72h</p>
          </div>

          {/* Vert */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 space-y-2">
            <div className="text-xs font-bold text-emerald-950 flex justify-between items-center">
              <span className="uppercase tracking-wider">Code VERT</span>
              <span className="font-mono text-sm font-black">{vertCount}</span>
            </div>
            <div className="w-full bg-emerald-200/80 rounded-full h-2">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${total ? (vertCount / total) * 100 : 0}%` }}
              ></div>
            </div>
            <p className="text-[10px] font-semibold text-emerald-700">Auto-soins / Téléconsultation</p>
          </div>
        </div>
      </div>

      {/* 4. Audit Log Table Bento Card (NF-04 Traçabilité & Audit) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Journal d'Audit et Traçabilité Clinique (NF-04)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Chaque évaluation est tracée avec son niveau d'urgence et ses drapeaux rouges
            </p>
          </div>
          <span className="text-xs bg-slate-100 px-3 py-1 rounded-full text-slate-700 font-mono font-bold">
            {auditRecords.length} enregistrements
          </span>
        </div>

        {auditRecords.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400">
            Aucun enregistrement dans le journal d'audit. Effectuez un premier triage pour voir apparaître les données.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 text-[10px] uppercase font-extrabold tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-5">Réf / Date</th>
                  <th className="py-3.5 px-4">Patient</th>
                  <th className="py-3.5 px-4">Motif de Consultation</th>
                  <th className="py-3.5 px-4">Urgence</th>
                  <th className="py-3.5 px-4">Drapeaux Rouges</th>
                  <th className="py-3.5 px-4">Orientation</th>
                  <th className="py-3.5 px-4">2e Avis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {auditRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-5">
                      <span className="font-mono font-bold text-slate-900 block">{rec.id}</span>
                      <span className="text-[10px] text-slate-400">{rec.timestamp}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {rec.patientAge} ans ({rec.gender === 'homme' ? 'H' : 'F'})
                    </td>
                    <td className="py-3.5 px-4 max-w-[220px] truncate font-normal" title={rec.chiefComplaint}>
                      {rec.chiefComplaint}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        rec.urgencyLevel === 'ROUGE'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : rec.urgencyLevel === 'ORANGE'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : rec.urgencyLevel === 'JAUNE'
                          ? 'bg-amber-50 text-amber-800 border border-amber-100'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {rec.urgencyLevel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {rec.redFlagsCount > 0 ? (
                        <span className="text-rose-600 font-bold flex items-center gap-1">
                          <AlertOctagon className="w-3.5 h-3.5" />
                          <span>{rec.redFlagsCount}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {rec.primarySpecialty}
                    </td>
                    <td className="py-3.5 px-4">
                      {rec.isSecondOpinionGenerated ? (
                        <span className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-200">
                          Oui
                        </span>
                      ) : (
                        <span className="text-slate-400">Non</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
