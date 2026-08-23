import React from 'react';
import {
  Stethoscope,
  Activity,
  GitCompare,
  FileText,
  ShieldCheck,
  BarChart3,
  UserCheck,
  Cpu,
  Sparkles
} from 'lucide-react';
import { PatientProfile } from '../types';

export type ActiveTab = 'triage' | 'diagnostic' | 'second_opinion' | 'report' | 'dashboard' | 'degraded_mode';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  patientProfile: PatientProfile;
  onOpenProfile: () => void;
  onOpenCompliance: () => void;
  hasAnalysis: boolean;
  hasSecondOpinion: boolean;
  hasReport: boolean;
  isUrgent?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  patientProfile,
  onOpenProfile,
  onOpenCompliance,
  hasAnalysis,
  hasSecondOpinion,
  hasReport,
  isUrgent,
}) => {
  return (
    <header id="main-medical-header" className="sticky top-0 z-30 pt-3 pb-2 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-xs p-3 sm:p-4 space-y-3">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-3">
          {/* Logo & Platform Info */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200/70 shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Dispositif Médical IA • HAS & CDC
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                  v2.4
                </span>
              </div>
              <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 flex items-center gap-2">
                <span>MED-ORIENT AI</span>
                <span className="text-xs font-normal text-slate-400 hidden md:inline">|</span>
                <span className="text-xs font-medium text-slate-500 hidden md:inline">
                  Triage Clinique, Optimisation Diagnostique & 2e Avis
                </span>
              </h1>
            </div>
          </div>

          {/* Right Action Bento Badges */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Patient Context Bento Pill */}
            <button
              id="patient-profile-toggle-btn"
              onClick={onOpenProfile}
              className="flex items-center gap-2 p-1.5 px-3 sm:px-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/90 text-xs font-medium transition cursor-pointer shadow-2xs group"
              title="Modifier le profil patient (âge, antécédents, constantes)"
            >
              <div className="w-6 h-6 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-50 transition">
                <UserCheck className="w-3.5 h-3.5" />
              </div>
              <div className="text-left hidden sm:block">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Patient</span>
                <span className="font-semibold text-slate-900">
                  {patientProfile.age ? `${patientProfile.age} ans` : 'Non renseigné'} ({patientProfile.gender === 'homme' ? 'H' : patientProfile.gender === 'femme' ? 'F' : 'Autre'})
                </span>
              </div>
              <span className="sm:hidden text-xs font-semibold text-slate-900">Profil</span>
            </button>

            {/* Regulatory & Compliance Trigger Bento Pill */}
            <button
              id="compliance-modal-trigger-btn"
              onClick={onOpenCompliance}
              className="flex items-center gap-1.5 p-2 px-3 sm:px-3.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200/80 text-xs font-semibold transition cursor-pointer shadow-2xs"
              title="Conformité RGPD, HDS, Dispositif Médical Classe IIa & AI Act"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="hidden sm:inline">Conformité DM & RGPD</span>
              <span className="sm:hidden">Légal</span>
            </button>
          </div>
        </div>

        {/* Bento Tab Navigation Bar */}
        <nav className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 no-scrollbar text-xs sm:text-sm">
          <button
            id="tab-triage"
            onClick={() => setActiveTab('triage')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'triage'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>1. Triage & Symptômes</span>
          </button>

          <button
            id="tab-diagnostic"
            onClick={() => setActiveTab('diagnostic')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl font-semibold whitespace-nowrap transition cursor-pointer relative ${
              activeTab === 'diagnostic'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>2. Diagnostic & Orientation</span>
            {hasAnalysis && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white inline-block"></span>
            )}
          </button>

          <button
            id="tab-second-opinion"
            onClick={() => setActiveTab('second_opinion')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl font-semibold whitespace-nowrap transition cursor-pointer relative ${
              activeTab === 'second_opinion'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <GitCompare className="w-4 h-4" />
            <span>3. Deuxième Avis (Contre-Expert)</span>
            {hasSecondOpinion && (
              <span className="w-2 h-2 rounded-full bg-amber-400 ring-2 ring-white inline-block"></span>
            )}
          </button>

          <button
            id="tab-report"
            onClick={() => setActiveTab('report')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl font-semibold whitespace-nowrap transition cursor-pointer relative ${
              activeTab === 'report'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>4. Compte-Rendu (SOAP / HAS)</span>
            {hasReport && (
              <span className="w-2 h-2 rounded-full bg-blue-400 ring-2 ring-white inline-block"></span>
            )}
          </button>

          <button
            id="tab-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>5. Tableau de Bord & Audit</span>
          </button>

          <button
            id="tab-degraded-mode"
            onClick={() => setActiveTab('degraded_mode')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl font-semibold whitespace-nowrap transition cursor-pointer ml-auto ${
              activeTab === 'degraded_mode'
                ? 'bg-slate-900 text-amber-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/80'
            }`}
            title="Mode de secours déterministe hors-ligne (NF-06)"
          >
            <Cpu className="w-4 h-4 text-amber-500" />
            <span>Mode Dégradé (NF-06)</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
