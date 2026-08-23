import React from 'react';
import { AlertTriangle, PhoneCall, ShieldAlert, HeartPulse } from 'lucide-react';

interface EmergencyBannerProps {
  onTriggerEmergencyModal?: () => void;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({ onTriggerEmergencyModal }) => {
  return (
    <div id="emergency-safety-banner" className="pt-2 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white rounded-3xl p-3 sm:p-4 shadow-sm border border-red-500/40 text-xs sm:text-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-center md:text-left">
            <span className="flex h-3 w-3 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-200 shrink-0 hidden sm:inline" />
            <p className="font-medium text-red-50 leading-snug">
              <strong className="text-white font-bold uppercase tracking-wider text-[11px] bg-red-800/80 px-2 py-0.5 rounded-md mr-1.5 inline-block">
                URGENCE VITALE (CDC R-04)
              </strong>
              Détresse respiratoire, douleur thoracique constrictive, perte de connaissance ou déficit brutal ? Contactez immédiatement le <span className="font-extrabold underline text-white">15 (SAMU)</span> ou le <span className="font-extrabold underline text-white">112</span>.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              id="emergency-call-15-btn"
              href="tel:15"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-red-700 font-extrabold rounded-2xl hover:bg-red-50 transition text-xs shadow-sm cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Appeler le 15</span>
            </a>
            <a
              id="emergency-call-112-btn"
              href="tel:112"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-900/80 text-white font-bold rounded-2xl hover:bg-red-900 transition text-xs border border-red-400/40 cursor-pointer"
            >
              <span>112 (Europe)</span>
            </a>
            {onTriggerEmergencyModal && (
              <button
                id="emergency-red-flags-guide-btn"
                onClick={onTriggerEmergencyModal}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-950/50 hover:bg-red-950/70 text-red-100 font-semibold rounded-2xl transition text-xs border border-red-400/30 cursor-pointer"
                title="Guide des drapeaux rouges vitaux"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden lg:inline">Signes d'Alerte</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
