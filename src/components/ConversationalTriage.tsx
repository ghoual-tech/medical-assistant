import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Upload,
  Image as ImageIcon,
  FileText,
  Trash2,
  Sparkles,
  AlertTriangle,
  HelpCircle,
  Clock,
  ArrowRight,
  Bot,
  User,
  CheckCircle2,
  Stethoscope,
  Activity,
  HeartPulse,
  Flame
} from 'lucide-react';
import { ChatMessage, Attachment, PatientProfile, UrgencyLevel } from '../types';

interface ConversationalTriageProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, attachments: Attachment[]) => void;
  isLoading: boolean;
  onLaunchFullAnalysis: () => void;
  patientProfile: PatientProfile;
  onOpenProfile: () => void;
  onSelectSampleCase: (caseId: string) => void;
}

export const ConversationalTriage: React.FC<ConversationalTriageProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onLaunchFullAnalysis,
  patientProfile,
  onOpenProfile,
  onSelectSampleCase,
}) => {
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && attachments.length === 0) || isLoading) return;
    onSendMessage(inputText.trim(), attachments);
    setInputText('');
    setAttachments([]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        const newAttachment: Attachment = {
          id: Math.random().toString(36).substring(7),
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : 'document',
          mimeType: file.type,
          dataUrl: base64Url,
          previewUrl: base64Url,
          size: file.size,
        };
        setAttachments((prev) => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const sampleCases = [
    {
      id: 'sca',
      badge: 'URGENCE 15',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      title: 'Douleur thoracique constrictive',
      desc: 'Homme 58 ans, irradiation mâchoire, sueurs (Suspicion SCA)',
    },
    {
      id: 'dermato',
      badge: 'SPÉCIALITÉ',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      title: 'Lésion cutanée suspecte',
      desc: 'Femme 34 ans, macule pigmentée asymétrique (Dermatologie)',
    },
    {
      id: 'appendicite',
      badge: 'URGENCES / CHIR',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      title: 'Douleur FID + Fièvre',
      desc: 'Homme 22 ans, douleur fosse iliaque droite (Appendicite)',
    },
    {
      id: 'grippe',
      badge: 'MÉDECINE GÉNÉRALE',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      title: 'Syndrome grippal fébrile',
      desc: 'Femme 40 ans, myalgies, toux et fièvre (Soins primaires)',
    },
  ];

  return (
    <div id="conversational-triage-panel" className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">
      {/* Left Column (4 cols): Bento Context & Scenario Modules */}
      <div className="lg:col-span-4 space-y-5">
        {/* 1. Bento Active Patient Context Module */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Contexte Clinique
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  Profil Patient Actif
                </h3>
              </div>
            </div>
            <button
              id="edit-profile-sidebar-btn"
              onClick={onOpenProfile}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition cursor-pointer"
            >
              Éditer
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Âge & Sexe</span>
              <p className="font-semibold text-slate-800 mt-0.5">
                {patientProfile.age ? `${patientProfile.age} ans` : 'ND'} • {patientProfile.gender === 'homme' ? 'Homme' : patientProfile.gender === 'femme' ? 'Femme' : 'Autre'}
                {patientProfile.isPregnant && ' (Enceinte)'}
              </p>
            </div>

            <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Constantes</span>
              <p className="font-semibold text-slate-800 mt-0.5 truncate">
                {patientProfile.vitals?.temperature ? `${patientProfile.vitals.temperature}°C` : '37.0°C'}
                {patientProfile.vitals?.heartRate ? ` • ${patientProfile.vitals.heartRate} bpm` : ''}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs pt-1 border-t border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Antécédents Notés :</span>
              <p className="text-slate-700 font-medium mt-0.5 leading-snug">
                {patientProfile.medicalHistory.length > 0
                  ? patientProfile.medicalHistory.join(', ')
                  : 'Aucun antécédent particulier'}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Traitements / Allergies :</span>
              <p className="text-slate-600 mt-0.5 leading-snug">
                <strong className="text-slate-800">Rx :</strong> {patientProfile.currentTreatments.join(', ') || 'Néant'} | <strong className="text-rose-700">Allergies :</strong> {patientProfile.allergies.join(', ') || 'Aucune'}
              </p>
            </div>
          </div>
        </div>

        {/* 2. Bento Quick Clinical Preset Scenarios */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-3.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Démonstrations Types
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Cas Cliniques Prédéfinis
              </h3>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Testez la détection immédiate des drapeaux rouges et la contre-expertise :
          </p>

          <div className="space-y-2.5">
            {sampleCases.map((c) => (
              <button
                key={c.id}
                id={`sample-case-${c.id}-btn`}
                onClick={() => onSelectSampleCase(c.id)}
                className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 transition text-xs group cursor-pointer shadow-2xs"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-slate-900 group-hover:text-indigo-900">
                    {c.title}
                  </span>
                  <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${c.badgeColor}`}>
                    {c.badge}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {c.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Bento Guidance & Tips */}
        <div className="bg-indigo-50/70 rounded-3xl border border-indigo-100 p-5 text-xs text-indigo-950 space-y-2 shadow-2xs">
          <div className="flex items-center gap-2 font-bold text-indigo-900">
            <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Guide d'anamnèse interactive (F-01)</span>
          </div>
          <p className="text-[11px] text-indigo-900/80 leading-relaxed">
            Pour un triage optimal, précisez la <strong>date d'apparition</strong>, l'<strong>intensité de la douleur</strong> (échelle 1-10) et joignez tout document ou cliché utile.
          </p>
        </div>
      </div>

      {/* Right Column (8 cols): Interactive Bento Chat & Multimodal Assistant */}
      <div className="lg:col-span-8 flex flex-col h-[760px] bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Chat Top Bento Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm sm:text-base text-slate-100">
                  Assistant Clinique de Triage
                </h2>
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  IA Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Recueil sémiologique, détection temps réel des drapeaux rouges (F-01, F-02, F-03)
              </p>
            </div>
          </div>

          <button
            id="launch-diagnostic-engine-header-btn"
            onClick={onLaunchFullAnalysis}
            disabled={messages.length <= 1 || isLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl text-xs font-bold shadow-md shadow-indigo-950/40 transition cursor-pointer"
          >
            <Stethoscope className="w-4 h-4" />
            <span className="hidden sm:inline">Synthétiser le Triage</span>
            <span className="sm:hidden">Synthétiser</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/40">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-3xl p-4 shadow-2xs ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-xs shadow-indigo-100'
                    : msg.isRedFlagWarning
                    ? 'bg-rose-50 text-rose-950 border border-rose-200 rounded-tl-xs'
                    : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs'
                }`}
              >
                {/* Sender tag & timestamp */}
                <div className={`flex items-center gap-1.5 text-[10px] mb-1.5 font-semibold ${msg.sender === 'user' ? 'text-indigo-100' : 'text-slate-400'}`}>
                  {msg.sender === 'assistant' ? (
                    <>
                      <Bot className="w-3 h-3 text-indigo-600" />
                      <span className="text-indigo-600 font-bold uppercase tracking-wider text-[9px]">Assistant Médical IA</span>
                    </>
                  ) : (
                    <>
                      <User className="w-3 h-3 text-indigo-200" />
                      <span className="uppercase tracking-wider text-[9px]">Patient</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Message Content */}
                <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-normal">
                  {msg.text}
                </div>

                {/* Attachments if any */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-slate-200/50">
                    {msg.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-xl border border-slate-200 text-slate-800 text-[11px]"
                      >
                        {att.type === 'image' ? (
                          <img
                            src={att.previewUrl || att.dataUrl}
                            alt={att.name}
                            className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                          />
                        ) : (
                          <FileText className="w-5 h-5 text-indigo-600" />
                        )}
                        <span className="truncate max-w-[120px] font-medium">{att.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Suggested Reply Bento Chips */}
              {msg.suggestedReplies && msg.suggestedReplies.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5 max-w-[85%]">
                  {msg.suggestedReplies.map((reply, i) => (
                    <button
                      key={i}
                      onClick={() => onSendMessage(reply, [])}
                      className="px-3 py-1.5 rounded-full bg-white hover:bg-indigo-50 text-indigo-800 border border-slate-200 hover:border-indigo-300 text-xs font-semibold transition cursor-pointer shadow-2xs text-left"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2.5 text-xs text-slate-600 bg-white px-4 py-3 rounded-2xl border border-slate-200 max-w-xs shadow-2xs">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600"></span>
              </span>
              <span className="font-medium">Analyse sémiologique & inférence en cours...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Attachment Previews before sending */}
        {attachments.length > 0 && (
          <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-slate-500">Pièces jointes :</span>
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-2 px-2.5 py-1 bg-white rounded-xl border border-slate-200 text-xs shadow-2xs"
              >
                {att.type === 'image' ? (
                  <img
                    src={att.previewUrl || att.dataUrl}
                    alt={att.name}
                    className="w-6 h-6 object-cover rounded-md"
                  />
                ) : (
                  <FileText className="w-4 h-4 text-indigo-600" />
                )}
                <span className="truncate max-w-[140px] text-slate-700 font-medium">{att.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(att.id)}
                  className="text-slate-400 hover:text-red-600 p-0.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Bento Input Bar */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 shrink-0">
          <div className="flex items-end gap-2.5">
            {/* File Upload trigger */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              accept="image/*,.pdf,.doc,.docx"
              className="hidden"
              id="file-upload-input"
            />
            <button
              type="button"
              id="upload-attachment-btn"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer shrink-0 shadow-2xs"
              title="Télécharger une photo de lésion ou un document médical (F-03)"
            >
              <Upload className="w-4 h-4 text-indigo-600" />
            </button>

            {/* Text Input */}
            <div className="flex-1 relative">
              <textarea
                id="chat-symptoms-input"
                rows={2}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Décrivez vos symptômes, localisation, durée, intensité (1-10)..."
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 text-xs sm:text-sm resize-none bg-slate-50/50"
              />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              id="send-message-btn"
              disabled={(!inputText.trim() && attachments.length === 0) || isLoading}
              className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white transition cursor-pointer shrink-0 shadow-md shadow-indigo-200"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between mt-2.5 px-1 text-[11px] text-slate-400">
            <span>Appuyez sur Entrée pour valider • Prise en charge multimodale</span>
            <button
              type="button"
              id="quick-launch-diagnostic-btn"
              onClick={onLaunchFullAnalysis}
              className="text-indigo-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Accéder à l'optimisation diagnostique</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
