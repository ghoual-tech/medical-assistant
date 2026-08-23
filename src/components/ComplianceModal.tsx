import React from 'react';
import {
  X,
  ShieldCheck,
  FileCheck,
  Lock,
  Cpu,
  AlertTriangle,
  Scale,
  Building,
  CheckCircle2,
  ExternalLink,
  Info,
  Sparkles
} from 'lucide-react';

interface ComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ComplianceModal: React.FC<ComplianceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const regulatoryItems = [
    {
      id: 'R-01',
      title: 'Dispositif Médical (Règlement UE 2017/745)',
      desc: "L'application se positionne comme un logiciel d'aide à la décision clinique (MDSW - Medical Device Software). Prévu pour une qualification en Classe IIa (Règle 11 du MDR).",
      status: 'Conforme CDC',
      icon: <Scale className="w-5 h-5 text-indigo-600" />,
    },
    {
      id: 'R-02',
      title: 'RGPD & Hébergement de Données de Santé (HDS)',
      desc: 'Pseudonymisation des données patients, chiffrement AES-256 en transit et au repos. Aucune conservation non consentie de données nominatives (article 9 du RGPD).',
      status: 'Conforme RGPD',
      icon: <Lock className="w-5 h-5 text-indigo-600" />,
    },
    {
      id: 'R-03',
      title: 'Conformité European AI Act (Système à Haut Risque)',
      desc: 'Classé système d\'IA à haut risque : traçabilité des décisions, explicabilité du raisonnement clinique (XAI), détection des biais cognitifs et supervision humaine obligatoire.',
      status: 'Audit XAI Actif',
      icon: <Cpu className="w-5 h-5 text-indigo-600" />,
    },
    {
      id: 'R-04',
      title: 'Avertissement Légal & Sécurité Clinique',
      desc: 'Bannière d\'avertissement permanent rappelant la non-substitution à l\'avis médical et boutons d\'appel d\'urgence vers le 15 (SAMU) et le 112.',
      status: 'Actif en permanence',
      icon: <AlertTriangle className="w-5 h-5 text-rose-600" />,
    },
    {
      id: 'R-05',
      title: 'Référentiel Haute Autorité de Santé (HAS)',
      desc: 'Respect des 101 bonnes pratiques de la HAS pour le développement des applications et objets connectés en santé (qualité des contenus, ergonomie, sécurité des protocoles).',
      status: 'Conforme HAS',
      icon: <FileCheck className="w-5 h-5 text-emerald-600" />,
    },
  ];

  const nonFunctionalSpecs = [
    { code: 'NF-01', name: 'Sécurité & HDS', detail: 'Chiffrement TLS 1.3 / AES-256, pseudonymisation systématique.' },
    { code: 'NF-02', name: 'Disponibilité 99,5%', detail: 'Architecture redondée avec basculement automatique.' },
    { code: 'NF-03', name: 'Performance < 3s', detail: 'Modèle Gemini Flash optimisé pour une réponse de triage en temps réel.' },
    { code: 'NF-04', name: 'Traçabilité & Audit', detail: 'Journalisation inviolable des hypothèses et scores de confiance.' },
    { code: 'NF-05', name: 'Accessibilité WCAG 2.1', detail: 'Contrastes élevés, navigation clavier, support lecteur d\'écran.' },
    { code: 'NF-06', name: 'Mode Dégradé', detail: 'Moteur de règles déterministe autonome sans dépendance IA.' },
  ];

  return (
    <div id="compliance-regulatory-modal" className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header Bento */}
        <div className="bg-slate-900 text-white px-6 sm:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-extrabold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  RÉGLEMENTATION & ÉTHIQUE
                </span>
                <span className="text-[10px] text-slate-400 font-medium">MDR • RGPD • AI Act</span>
              </div>
              <h2 className="font-extrabold text-base sm:text-lg text-slate-100 mt-0.5">
                Dossier Réglementaire, Éthique & CDC
              </h2>
            </div>
          </div>
          <button
            id="close-compliance-modal-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Exigences Réglementaires (R-01 à R-05) */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-600" />
              <span>1. Exigences Réglementaires & Éthiques (Section 5 du CDC)</span>
            </h3>

            <div className="space-y-2.5">
              {regulatoryItems.map((item) => (
                <div key={item.id} className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/60 space-y-1.5 hover:bg-slate-50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 font-mono text-[10px] font-extrabold">
                        {item.id}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{item.title}</h4>
                    </div>
                    <span className="text-[10px] px-2.5 py-0.5 bg-indigo-50 text-indigo-800 font-bold rounded-full border border-indigo-200">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-8 font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Exigences Non Fonctionnelles (NF-01 à NF-06) */}
          <div className="space-y-3.5 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-600" />
              <span>2. Exigences Non Fonctionnelles (Section 3 du CDC)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {nonFunctionalSpecs.map((spec) => (
                <div key={spec.code} className="p-3.5 rounded-2xl border border-slate-200/90 bg-white text-xs space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{spec.code} : {spec.name}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug font-medium">{spec.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Architecture Multi-Agents (Section 4 du CDC) */}
          <div className="bg-slate-900 text-slate-200 p-5 rounded-3xl text-xs space-y-2 border border-slate-800">
            <h4 className="font-extrabold text-indigo-300 uppercase tracking-widest text-[10px] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Orchestration Multi-Agents & RAG Médical</span>
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
              Le système active 4 agents spécialisés en cascade : (1) Agent d'extraction & guidage dynamique, (2) Agent de triage et détection des drapeaux rouges, (3) Moteur diagnostique probabiliste avec calcul de confiance, (4) Agent contradictoire de deuxième avis traquant les biais cognitifs.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50/80 px-6 sm:px-8 py-4 border-t border-slate-100 flex items-center justify-end">
          <button
            id="close-compliance-modal-bottom-btn"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition cursor-pointer shadow-sm"
          >
            Fermer le Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
