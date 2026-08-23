import React, { useState } from 'react';
import { X, User, Heart, Activity, AlertCircle, Plus, Trash2, CheckCircle2, Thermometer, Shield, Sparkles } from 'lucide-react';
import { PatientProfile } from '../types';

interface PatientProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientProfile: PatientProfile;
  onSaveProfile: (profile: PatientProfile) => void;
}

export const PatientProfileModal: React.FC<PatientProfileModalProps> = ({
  isOpen,
  onClose,
  patientProfile,
  onSaveProfile,
}) => {
  const [profile, setProfile] = useState<PatientProfile>({ ...patientProfile });
  const [newHistory, setNewHistory] = useState('');
  const [newTreatment, setNewTreatment] = useState('');
  const [newAllergy, setNewAllergy] = useState('');

  if (!isOpen) return null;

  const handleAddHistory = () => {
    if (newHistory.trim()) {
      setProfile((prev) => ({
        ...prev,
        medicalHistory: [...prev.medicalHistory, newHistory.trim()],
      }));
      setNewHistory('');
    }
  };

  const handleRemoveHistory = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      medicalHistory: prev.medicalHistory.filter((_, i) => i !== index),
    }));
  };

  const handleAddTreatment = () => {
    if (newTreatment.trim()) {
      setProfile((prev) => ({
        ...prev,
        currentTreatments: [...prev.currentTreatments, newTreatment.trim()],
      }));
      setNewTreatment('');
    }
  };

  const handleRemoveTreatment = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      currentTreatments: prev.currentTreatments.filter((_, i) => i !== index),
    }));
  };

  const handleAddAllergy = () => {
    if (newAllergy.trim()) {
      setProfile((prev) => ({
        ...prev,
        allergies: [...prev.allergies, newAllergy.trim()],
      }));
      setNewAllergy('');
    }
  };

  const handleRemoveAllergy = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    onSaveProfile(profile);
    onClose();
  };

  return (
    <div id="patient-profile-modal" className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Bento Title */}
        <div className="bg-slate-900 text-white px-6 sm:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-extrabold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  DOSSIER PATIENT
                </span>
                <span className="text-[10px] text-slate-400 font-medium">F-01 & F-13</span>
              </div>
              <h2 className="font-extrabold text-base sm:text-lg text-slate-100 mt-0.5">
                Profil Clinique & Paramètres Vitaux
              </h2>
            </div>
          </div>
          <button
            id="close-profile-modal-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Base Info Bento Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                Âge (années) *
              </label>
              <input
                id="patient-age-input"
                type="number"
                min="0"
                max="120"
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                placeholder="Ex: 42"
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200/90 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 text-sm font-semibold shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                Sexe Biologique *
              </label>
              <select
                id="patient-gender-select"
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200/90 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 text-sm font-semibold bg-white shadow-2xs"
              >
                <option value="homme">Homme</option>
                <option value="femme">Femme</option>
                <option value="autre">Autre / Non spécifié</option>
              </select>
            </div>

            {profile.gender === 'femme' && (
              <div className="flex items-end pb-2.5">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80 w-full">
                  <input
                    id="patient-pregnant-checkbox"
                    type="checkbox"
                    checked={profile.isPregnant || false}
                    onChange={(e) => setProfile({ ...profile, isPregnant: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500"
                  />
                  <span>Grossesse en cours</span>
                </label>
              </div>
            )}
          </div>

          {/* Vitals Bento Capsule */}
          <div className="bg-slate-50/80 p-5 rounded-3xl border border-slate-200/80 space-y-3.5">
            <h3 className="text-[11px] font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              <span>Constantes Vitales (optionnelles)</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Température (°C)
                </label>
                <input
                  id="vitals-temp-input"
                  type="text"
                  placeholder="37.2"
                  value={profile.vitals?.temperature || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      vitals: { ...profile.vitals, temperature: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Pouls / FC (bpm)
                </label>
                <input
                  id="vitals-hr-input"
                  type="text"
                  placeholder="75"
                  value={profile.vitals?.heartRate || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      vitals: { ...profile.vitals, heartRate: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Tension Artérielle
                </label>
                <input
                  id="vitals-bp-input"
                  type="text"
                  placeholder="120/80"
                  value={profile.vitals?.bloodPressure || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      vitals: { ...profile.vitals, bloodPressure: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  SpO2 (%)
                </label>
                <input
                  id="vitals-spo2-input"
                  type="text"
                  placeholder="98"
                  value={profile.vitals?.oxygenSaturation || ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      vitals: { ...profile.vitals, oxygenSaturation: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Antécédents Médicaux & Chirurgicaux */}
          <div className="space-y-2">
            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">
              Antécédents Médicaux & Chirurgicaux
            </label>
            <div className="flex gap-2">
              <input
                id="new-history-input"
                type="text"
                value={newHistory}
                onChange={(e) => setNewHistory(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddHistory())}
                placeholder="Ex: Asthme, Diabète Type 2, Hypertension, Appendicectomie..."
                className="flex-1 px-3.5 py-2.5 text-xs rounded-2xl border border-slate-200/90 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs font-medium"
              />
              <button
                id="add-history-btn"
                type="button"
                onClick={handleAddHistory}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2 min-h-[32px] pt-1">
              {profile.medicalHistory.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-800 rounded-xl text-xs font-semibold border border-slate-200/80"
                >
                  <span>{item}</span>
                  <button
                    onClick={() => handleRemoveHistory(idx)}
                    className="text-slate-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              {profile.medicalHistory.length === 0 && (
                <span className="text-xs text-slate-400 italic">Aucun antécédent ajouté</span>
              )}
            </div>
          </div>

          {/* Traitements en cours */}
          <div className="space-y-2">
            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">
              Traitements en cours
            </label>
            <div className="flex gap-2">
              <input
                id="new-treatment-input"
                type="text"
                value={newTreatment}
                onChange={(e) => setNewTreatment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTreatment())}
                placeholder="Ex: Paracétamol 1g, Ramipril 5mg, Lévothyrox..."
                className="flex-1 px-3.5 py-2.5 text-xs rounded-2xl border border-slate-200/90 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs font-medium"
              />
              <button
                id="add-treatment-btn"
                type="button"
                onClick={handleAddTreatment}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2 min-h-[32px] pt-1">
              {profile.currentTreatments.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-900 rounded-xl text-xs font-semibold border border-indigo-200/80"
                >
                  <span>{item}</span>
                  <button
                    onClick={() => handleRemoveTreatment(idx)}
                    className="text-indigo-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              {profile.currentTreatments.length === 0 && (
                <span className="text-xs text-slate-400 italic">Aucun traitement noté</span>
              )}
            </div>
          </div>

          {/* Allergies Connues */}
          <div className="space-y-2">
            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">
              Allergies Médicamenteuses ou Alimentaires
            </label>
            <div className="flex gap-2">
              <input
                id="new-allergy-input"
                type="text"
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAllergy())}
                placeholder="Ex: Pénicilline, AINS, Arachide, Latex..."
                className="flex-1 px-3.5 py-2.5 text-xs rounded-2xl border border-slate-200/90 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs font-medium"
              />
              <button
                id="add-allergy-btn"
                type="button"
                onClick={handleAddAllergy}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2 min-h-[32px] pt-1">
              {profile.allergies.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-900 rounded-xl text-xs font-semibold border border-rose-200/80"
                >
                  <span>{item}</span>
                  <button
                    onClick={() => handleRemoveAllergy(idx)}
                    className="text-rose-400 hover:text-rose-700 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              {profile.allergies.length === 0 && (
                <span className="text-xs text-slate-400 italic">Aucune allergie déclarée</span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50/80 px-6 sm:px-8 py-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <Shield className="w-4 h-4 text-indigo-600" />
            <span>Données pseudonymisées conformément au RGPD & HDS</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              id="cancel-profile-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-slate-600 hover:bg-slate-200 text-xs font-bold transition cursor-pointer"
            >
              Annuler
            </button>
            <button
              id="save-profile-btn"
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Enregistrer le Profil</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
