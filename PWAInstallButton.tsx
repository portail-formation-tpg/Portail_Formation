import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 text-xs font-black uppercase tracking-wider transition border border-white/30 backdrop-blur-sm cursor-pointer shadow-sm"
        title="Installer l'application sur cet appareil"
      >
        <Download className="w-3.5 h-3.5 text-white" />
        <span>Installer PWA</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 text-xs font-black uppercase tracking-wider transition border border-white/30 backdrop-blur-sm cursor-pointer"
          title="Installer sur iPhone/iPad"
        >
          <Smartphone className="w-3.5 h-3.5 text-white" />
          <span>Installer iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl border border-gray-200">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <h3 className="text-base font-black text-gray-900 uppercase tracking-tight">
                  Installer sur iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-gray-400 hover:text-gray-700 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                Pour utiliser le Portail Formation TPG en mode plein écran autonome et hors-ligne :
              </p>
              <ol className="mt-3 text-sm text-gray-700 space-y-2 list-decimal list-inside bg-gray-50 p-3 rounded-lg border border-gray-200">
                <li>
                  Touchez le bouton <strong>Partager</strong> <span className="text-blue-500 font-bold">⎋</span> dans la barre Safari.
                </li>
                <li>
                  Faites défiler vers le bas et touchez <strong>« Sur l’écran d’accueil »</strong>.
                </li>
                <li>
                  Touchez <strong>Ajouter</strong> en haut à droite.
                </li>
              </ol>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-lg bg-[#FD5312] py-2.5 text-sm font-black text-white hover:bg-[#e04508] transition uppercase cursor-pointer"
              >
                J'ai compris
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
