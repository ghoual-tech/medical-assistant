import React, { useState } from 'react';
import { Header, ActiveTab } from './components/Header';
import { EmergencyBanner } from './components/EmergencyBanner';
import { PatientProfileModal } from './components/PatientProfileModal';
import { ConversationalTriage } from './components/ConversationalTriage';
import { DiagnosticOverview } from './components/DiagnosticOverview';
import { SecondOpinionView } from './components/SecondOpinionView';
import { ClinicalReportView } from './components/ClinicalReportView';
import { ClinicalDashboard } from './components/ClinicalDashboard';
import { DegradedModeSimulator } from './components/DegradedModeSimulator';
import { ComplianceModal } from './components/ComplianceModal';
import {
  PatientProfile,
  ChatMessage,
  Attachment,
  UrgencyLevel,
  RedFlag,
  DiagnosticHypothesis,
  OrientationRecommendation,
  SecondOpinionReport,
  ClinicalSOAPReport,
  TriageAuditRecord,
} from './types';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('triage');

  // Modals
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isComplianceOpen, setIsComplianceOpen] = useState(false);

  // Patient Profile State
  const [patientProfile, setPatientProfile] = useState<PatientProfile>({
    age: '42',
    gender: 'homme',
    medicalHistory: ['Hypertension artérielle contrôlée'],
    currentTreatments: ['Ramipril 5mg (1/j)'],
    allergies: ['Pénicilline'],
    smoking: 'non',
    alcohol: 'modere',
    vitals: {
      temperature: '37.4',
      heartRate: '78',
      bloodPressure: '125/80',
      oxygenSaturation: '98',
    },
  });

  // Conversation State (F-01, F-02, F-03)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: "Bonjour. Je suis votre assistant médical d'orientation et de triage préliminaire.\n\nQuel est votre motif de consultation aujourd'hui ? Décrivez vos symptômes, leur localisation, depuis quand ils sont apparus, et leur intensité (1 à 10). Vous pouvez également joindre une photo ou un document d'analyse.",
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      suggestedReplies: [
        "J'ai une forte douleur au ventre depuis ce matin",
        "Toux avec fièvre à 38.5°C et fatigue",
        "Douleur dans la poitrine avec essoufflement",
        "Éruption cutanée inhabituelle qui démange",
      ],
    },
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Diagnostic State (F-04, F-05, F-06, F-07, F-08)
  const [urgencyLevel, setUrgencyLevel] = useState<UrgencyLevel>('JAUNE');
  const [redFlags, setRedFlags] = useState<RedFlag[]>([]);
  const [diagnosticHypotheses, setDiagnosticHypotheses] = useState<DiagnosticHypothesis[]>([]);
  const [orientation, setOrientation] = useState<OrientationRecommendation | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);

  // Second Opinion State (F-10, F-11, F-12)
  const [secondOpinion, setSecondOpinion] = useState<SecondOpinionReport | null>(null);
  const [isSecondOpinionLoading, setIsSecondOpinionLoading] = useState(false);

  // Clinical Report SOAP State (F-09, F-15)
  const [clinicalReport, setClinicalReport] = useState<ClinicalSOAPReport | null>(null);
  const [isReportLoading, setIsReportLoading] = useState(false);

  // Audit Logs (F-13, F-14)
  const [auditRecords, setAuditRecords] = useState<TriageAuditRecord[]>([
    {
      id: 'AUD-9104',
      timestamp: 'Aujourd\'hui, 10:15',
      patientAge: '42',
      gender: 'homme',
      chiefComplaint: 'Douleur abdominale aiguë fosse iliaque droite',
      urgencyLevel: 'ORANGE',
      redFlagsCount: 1,
      primarySpecialty: 'Chirurgie Viscérale / Urgences',
      isSecondOpinionGenerated: true,
      aiModelUsed: 'gemini-3.7-flash',
      latencyMs: 1450,
    },
    {
      id: 'AUD-8832',
      timestamp: 'Hier, 16:40',
      patientAge: '28',
      gender: 'femme',
      chiefComplaint: 'Syndrome grippal fébrile saisonnier',
      urgencyLevel: 'VERT',
      redFlagsCount: 0,
      primarySpecialty: 'Médecine Générale',
      isSecondOpinionGenerated: false,
      aiModelUsed: 'gemini-3.7-flash',
      latencyMs: 1100,
    },
  ]);

  // 1. Send Message to Chat Guidance Agent
  const handleSendMessage = async (text: string, attachments: Attachment[]) => {
    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      sender: 'user',
      text,
      attachments,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };

    const newThread = [...messages, userMsg];
    setMessages(newThread);
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/chat-guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newThread,
          patientProfile,
        }),
      });

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: Math.random().toString(36).substring(7),
        sender: 'assistant',
        text: data.reply || "J'ai bien noté vos réponses. Vous pouvez préciser ou lancer l'analyse diagnostique complète.",
        suggestedReplies: data.suggestedReplies || [],
        isRedFlagWarning: data.isRedFlagWarning || false,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        metadata: {
          urgencyDetected: data.urgencyDetected,
        },
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Error in handleSendMessage:', err);
      // Fallback message
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(7),
          sender: 'assistant',
          text: "Merci pour ces précisions. Vos symptômes sont enregistrés. Cliquez sur 'Synthétiser le Diagnostic & Triage' pour afficher l'arbre complet d'orientation.",
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          suggestedReplies: ["Lancer l'analyse diagnostique"],
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // 2. Launch Full Diagnostic Analysis & Triage (F-04 to F-08)
  const handleLaunchFullAnalysis = async () => {
    setIsAnalysisLoading(true);
    setActiveTab('diagnostic');

    // Aggregate user messages
    const userDescriptions = messages
      .filter((m) => m.sender === 'user')
      .map((m) => m.text)
      .join(' | ');

    // Collect all attachments
    const allAttachments = messages
      .filter((m) => m.attachments && m.attachments.length > 0)
      .flatMap((m) => m.attachments || []);

    const startTime = performance.now();

    try {
      const response = await fetch('/api/analyze-symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptomsDescription: userDescriptions || 'Consultation générale',
          patientProfile,
          attachments: allAttachments,
        }),
      });

      const data = await response.json();
      const endTime = performance.now();

      setUrgencyLevel(data.urgencyLevel || 'JAUNE');
      setRedFlags(data.redFlags || []);
      setDiagnosticHypotheses(data.diagnosticHypotheses || []);
      setOrientation(data.orientation || null);

      // Add to Audit Records (F-13, F-14)
      const newAudit: TriageAuditRecord = {
        id: 'AUD-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        patientAge: patientProfile.age || 'ND',
        gender: patientProfile.gender,
        chiefComplaint: userDescriptions.slice(0, 70) || 'Symptômes variés',
        urgencyLevel: data.urgencyLevel || 'JAUNE',
        redFlagsCount: data.redFlags?.length || 0,
        primarySpecialty: data.orientation?.primarySpecialty || 'Médecine Générale',
        isSecondOpinionGenerated: false,
        aiModelUsed: 'gemini-3.7-flash',
        latencyMs: Math.round(endTime - startTime),
      };

      setAuditRecords((prev) => [newAudit, ...prev]);
    } catch (err) {
      console.error('Error in handleLaunchFullAnalysis:', err);
    } finally {
      setIsAnalysisLoading(false);
    }
  };

  // 3. Request Second Opinion / Adversarial Counter-Expert (F-10, F-11, F-12)
  const handleRequestSecondOpinion = async () => {
    setIsSecondOpinionLoading(true);
    setActiveTab('second_opinion');

    const userDescriptions = messages
      .filter((m) => m.sender === 'user')
      .map((m) => m.text)
      .join(' | ');

    try {
      const response = await fetch('/api/second-opinion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primaryHypotheses: diagnosticHypotheses,
          patientProfile,
          symptomsDescription: userDescriptions || 'Description des symptômes',
          firstAnalysisDetails: {
            urgencyLevel,
            redFlags,
            orientation,
          },
        }),
      });

      const data = await response.json();
      setSecondOpinion(data);

      // Update current audit record to reflect 2nd opinion
      setAuditRecords((prev) =>
        prev.map((r, i) => (i === 0 ? { ...r, isSecondOpinionGenerated: true } : r))
      );
    } catch (err) {
      console.error('Error in handleRequestSecondOpinion:', err);
    } finally {
      setIsSecondOpinionLoading(false);
    }
  };

  // 4. Generate Clinical SOAP Report (F-09, F-15)
  const handleGenerateReport = async () => {
    setIsReportLoading(true);
    setActiveTab('report');

    const userDescriptions = messages
      .filter((m) => m.sender === 'user')
      .map((m) => m.text)
      .join(' | ');

    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientProfile,
          symptomsDescription: userDescriptions || 'Motif de consultation',
          firstAnalysis: {
            urgencyLevel,
            redFlags,
            diagnosticHypotheses,
            orientation,
          },
          secondOpinion,
        }),
      });

      const data = await response.json();
      setClinicalReport(data);
    } catch (err) {
      console.error('Error in handleGenerateReport:', err);
    } finally {
      setIsReportLoading(false);
    }
  };

  // 5. Sample Preset Scenarios
  const handleSelectSampleCase = (caseId: string) => {
    if (caseId === 'sca') {
      setPatientProfile({
        age: '58',
        gender: 'homme',
        medicalHistory: ['Hypertension', 'Tabagisme actif (25 PA)', 'Dyslipidémie'],
        currentTreatments: ['Atorvastatine 20mg', 'Amlodipine 5mg'],
        allergies: [],
        smoking: 'regulier',
        alcohol: 'modere',
        vitals: {
          temperature: '36.8',
          heartRate: '95',
          bloodPressure: '155/95',
          oxygenSaturation: '96',
        },
      });
      setMessages([
        {
          id: 's1',
          sender: 'user',
          text: "J'ai une violente douleur oppressive dans la poitrine depuis 45 minutes, qui serre comme un étau et irradie dans mon bras gauche et ma mâchoire. J'ai des sueurs froides et du mal à respirer.",
          timestamp: '10:00',
        },
      ]);
    } else if (caseId === 'dermato') {
      setPatientProfile({
        age: '34',
        gender: 'femme',
        medicalHistory: ['Expositions solaires fréquentes', 'Nombreux nævus'],
        currentTreatments: [],
        allergies: ['Latex'],
        smoking: 'non',
        alcohol: 'non',
        vitals: {
          temperature: '37.0',
          heartRate: '70',
          bloodPressure: '118/75',
          oxygenSaturation: '99',
        },
      });
      setMessages([
        {
          id: 's2',
          sender: 'user',
          text: "J'ai remarqué une tache brune/noire sur mon épaule droite qui a changé de forme depuis 3 mois. Les bords sont devenus irréguliers et elle a une double teinte. Pas de douleur mais un léger prurit occasionnel.",
          timestamp: '10:00',
        },
      ]);
    } else if (caseId === 'appendicite') {
      setPatientProfile({
        age: '22',
        gender: 'homme',
        medicalHistory: ['Aucun antécédent'],
        currentTreatments: [],
        allergies: [],
        smoking: 'non',
        alcohol: 'occasionnel',
        vitals: {
          temperature: '38.4',
          heartRate: '88',
          bloodPressure: '120/80',
          oxygenSaturation: '99',
        },
      });
      setMessages([
        {
          id: 's3',
          sender: 'user',
          text: "J'ai très mal en bas à droite du ventre (fosse iliaque droite) depuis hier soir. La douleur a commencé autour du nombril puis a migré. J'ai de la fièvre à 38.4°C, des nausées et j'ai vomi une fois. La marche est douloureuse.",
          timestamp: '10:00',
        },
      ]);
    } else if (caseId === 'grippe') {
      setPatientProfile({
        age: '40',
        gender: 'femme',
        medicalHistory: ['Rhinite allergique'],
        currentTreatments: ['Antihistaminique si besoin'],
        allergies: ['Graminées'],
        smoking: 'non',
        alcohol: 'non',
        vitals: {
          temperature: '38.2',
          heartRate: '76',
          bloodPressure: '120/75',
          oxygenSaturation: '98',
        },
      });
      setMessages([
        {
          id: 's4',
          sender: 'user',
          text: "Depuis 2 jours, j'ai des courbatures généralisées, de la fatigue, une toux sèche et de la fièvre autour de 38°C avec des frissons. Pas de gêne respiratoire.",
          timestamp: '10:00',
        },
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Permanent Emergency Banner (CDC R-04) */}
      <EmergencyBanner onTriggerEmergencyModal={() => setIsComplianceOpen(true)} />

      {/* Main Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        patientProfile={patientProfile}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenCompliance={() => setIsComplianceOpen(true)}
        hasAnalysis={diagnosticHypotheses.length > 0}
        hasSecondOpinion={Boolean(secondOpinion)}
        hasReport={Boolean(clinicalReport)}
        isUrgent={urgencyLevel === 'ROUGE' || urgencyLevel === 'ORANGE'}
      />

      {/* Main Workspace View */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        {activeTab === 'triage' && (
          <ConversationalTriage
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isChatLoading}
            onLaunchFullAnalysis={handleLaunchFullAnalysis}
            patientProfile={patientProfile}
            onOpenProfile={() => setIsProfileOpen(true)}
            onSelectSampleCase={handleSelectSampleCase}
          />
        )}

        {activeTab === 'diagnostic' && (
          <DiagnosticOverview
            urgencyLevel={urgencyLevel}
            redFlags={redFlags}
            diagnosticHypotheses={
              diagnosticHypotheses.length > 0
                ? diagnosticHypotheses
                : [
                    {
                      name: "Évaluation clinique préliminaire requise",
                      icd10: "R69",
                      probability: 70,
                      confidenceScore: 75,
                      clinicalRationale: "Pour obtenir une analyse diagnostique fine, décrivez vos symptômes dans l'onglet 'Triage' puis cliquez sur Synthétiser.",
                      pathophysiology: "Analyse sémiologique basée sur le recueil d'anamnèse.",
                      matchingSymptoms: ["Symptômes généraux rapportés"],
                      missingKeySymptoms: ["Constantes complètes"],
                      recommendedSpecialty: "Médecine Générale",
                      suggestedInvestigations: ["Examen clinique en cabinet"],
                    },
                  ]
            }
            orientation={
              orientation || {
                primarySpecialty: 'Médecine Générale',
                careSetting: 'Cabinet de Médecine Générale',
                urgencyLevel: urgencyLevel,
                timeframe: 'Sous 48h à 72h',
                triageRationale: 'Orientation de premier recours pour examen clinique complet.',
                consultationChecklist: ['Carte Vitale et ordonnances', 'Historique des symptômes'],
                warningSignsToWatch: ['Apparition de douleur brutale', 'Fièvre élevée > 39°C'],
              }
            }
            onRequestSecondOpinion={handleRequestSecondOpinion}
            onGenerateReport={handleGenerateReport}
            isSecondOpinionLoading={isSecondOpinionLoading}
          />
        )}

        {activeTab === 'second_opinion' && (
          <SecondOpinionView
            secondOpinion={secondOpinion}
            initialHypotheses={diagnosticHypotheses}
            onRequestSecondOpinion={handleRequestSecondOpinion}
            isLoading={isSecondOpinionLoading}
            onGoToReport={() => handleGenerateReport()}
          />
        )}

        {activeTab === 'report' && (
          <ClinicalReportView
            report={clinicalReport}
            onGenerateReport={handleGenerateReport}
            isLoading={isReportLoading}
          />
        )}

        {activeTab === 'dashboard' && (
          <ClinicalDashboard
            auditRecords={auditRecords}
            onClearHistory={() => setAuditRecords([])}
          />
        )}

        {activeTab === 'degraded_mode' && <DegradedModeSimulator />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 px-4 sm:px-8 border-t border-slate-800 text-xs text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-medium text-slate-400">
            © {new Date().getFullYear()} Assistant Intelligent d'Orientation Médicale & Deuxième Avis (Conforme CDC & HAS).
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsComplianceOpen(true)}
              className="text-indigo-400 hover:text-indigo-300 font-semibold transition cursor-pointer"
            >
              Dossier Réglementaire (DM Classe IIa / AI Act / RGPD)
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('degraded_mode')}
              className="text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              Mode Dégradé (NF-06)
            </button>
          </div>
        </div>
      </footer>

      {/* Patient Profile Modal */}
      <PatientProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        patientProfile={patientProfile}
        onSaveProfile={(updated) => setPatientProfile(updated)}
      />

      {/* Compliance & Regulatory Modal */}
      <ComplianceModal
        isOpen={isComplianceOpen}
        onClose={() => setIsComplianceOpen(false)}
      />
    </div>
  );
}
