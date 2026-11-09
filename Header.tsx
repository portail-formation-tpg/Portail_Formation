import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PWAInstallButton } from './PWAInstallButton';
import { LogOut, Users, FileText, ChevronDown, Shield } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  formateursCount: number;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, formateursCount }) => {
  const { user, logout, isAdminOrResp } = useAuth();
  const [mobileGroupOpen, setMobileGroupOpen] = useState<'modules1' | 'modules2' | 'modules3' | 'admin' | null>(null);

  const toggleMobileGroup = (grp: 'modules1' | 'modules2' | 'modules3' | 'admin') => {
    setMobileGroupOpen(mobileGroupOpen === grp ? null : grp);
  };

  const selectTab = (tab: string) => {
    setActiveTab(tab);
    setMobileGroupOpen(null);
  };

  return (
    <header className="rounded-t-xl overflow-hidden shadow-sm border border-gray-200 bg-white no-print">
      {/* TPG Brand Header Bar */}
      <div className="bg-[#FD5312] text-white px-4 py-3 sm:px-6 sm:py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="h-10 sm:h-12 w-auto flex items-center shrink-0">
            <img
              src="/assets/aistudio/Logo_tpg_blanc-removebg-preview_c2267cb4.png"
              alt="Logo officiel TPG"
              className="h-9 sm:h-11 w-auto max-w-[130px] sm:max-w-[150px] object-contain drop-shadow-xs"
            />
          </div>
          <div className="border-l border-white/30 pl-3.5">
            <h1
              className="text-xl sm:text-2xl font-bold uppercase tracking-tight leading-none text-white"
              style={{ fontFamily: "'HelveticaNeue LT COM 65 MD', 'Helvetica Neue LT Com 65 Md', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}
            >
              PORTAIL FORMATION TPG
            </h1>
            <div
              className="text-[12px] font-bold uppercase tracking-wider text-white/95 mt-0.5"
              style={{ fontFamily: "'HelveticaNeue LT COM 65 MD', 'Helvetica Neue LT Com 65 Md', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}
            >
              Gestion Technique
            </div>
          </div>
        </div>

        {/* Right actions: PWA install button + User session & logout */}
        <div className="flex items-center gap-2 sm:gap-4 ml-auto">
          <PWAInstallButton />

          <div className="flex items-center gap-2 bg-black/15 px-3 py-1.5 rounded-lg border border-white/15 text-xs">
            <div className="hidden sm:block">
              <div className="text-[10px] uppercase font-bold text-orange-200 flex items-center gap-1">
                {isAdminOrResp && <Shield className="w-2.5 h-2.5 text-yellow-300" />}
                {user?.role === 'admin' ? 'Administrateur' : user?.role === 'responsable' ? 'Responsable' : 'Formateur'}
              </div>
              <div className="font-black text-white truncate max-w-[150px]">
                {user?.nomComplet}
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-1 bg-white/20 hover:bg-white/30 active:scale-95 text-white px-2.5 py-1 rounded text-xs font-black uppercase transition cursor-pointer"
              title="Se déconnecter"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Tabs Grid */}
      <div className="hidden lg:block bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-4 border-b border-gray-200 text-xs font-black uppercase">
          <button
            type="button"
            onClick={() => setActiveTab('cours')}
            className={`px-4 py-3 text-left transition border-b-4 cursor-pointer flex items-center gap-2 ${
              activeTab === 'cours'
                ? 'bg-white text-[#FD5312] border-[#FD5312] shadow-sm'
                : 'text-gray-600 hover:text-[#FD5312] hover:bg-white/60 border-transparent'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-[10px] font-mono">1</span>
            <span>Organisation Cours</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rails')}
            className={`px-4 py-3 text-left transition border-b-4 cursor-pointer flex items-center gap-2 ${
              activeTab === 'rails'
                ? 'bg-white text-[#FD5312] border-[#FD5312] shadow-sm'
                : 'text-gray-600 hover:text-[#FD5312] hover:bg-white/60 border-transparent'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-[10px] font-mono">2</span>
            <span>Rails Glissants</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tram')}
            className={`px-4 py-3 text-left transition border-b-4 cursor-pointer flex items-center gap-2 ${
              activeTab === 'tram'
                ? 'bg-white text-[#FD5312] border-[#FD5312] shadow-sm'
                : 'text-gray-600 hover:text-[#FD5312] hover:bg-white/60 border-transparent'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-[10px] font-mono">3</span>
            <span>Réservation Tramway</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('abtb')}
            className={`px-4 py-3 text-left transition border-b-4 cursor-pointer flex items-center gap-2 ${
              activeTab === 'abtb'
                ? 'bg-white text-[#FD5312] border-[#FD5312] shadow-sm'
                : 'text-gray-600 hover:text-[#FD5312] hover:bg-white/60 border-transparent'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-[10px] font-mono">4</span>
            <span>Réservation AB/TB</span>
          </button>
        </div>

        {/* Row 2: Modules 5, 6, 7 & Annuaire Formateurs */}
        <div className="grid grid-cols-4 text-xs font-black uppercase">
          <button
            type="button"
            onClick={() => setActiveTab('vehicule')}
            className={`px-4 py-3 text-left transition border-b-4 cursor-pointer flex items-center gap-2 ${
              activeTab === 'vehicule'
                ? 'bg-white text-[#FD5312] border-[#FD5312] shadow-sm'
                : 'text-gray-600 hover:text-[#FD5312] hover:bg-white/60 border-transparent'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-[10px] font-mono">5</span>
            <span className="truncate">Avarie Véhicule de Service</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('avarie')}
            className={`px-4 py-3 text-left transition border-b-4 cursor-pointer flex items-center gap-2 ${
              activeTab === 'avarie'
                ? 'bg-white text-[#FD5312] border-[#FD5312] shadow-sm'
                : 'text-gray-600 hover:text-[#FD5312] hover:bg-white/60 border-transparent'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-[10px] font-mono">6</span>
            <span>Annonce Avarie AB / TB</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('horaire')}
            className={`px-4 py-3 text-left transition border-b-4 cursor-pointer flex items-center gap-2 ${
              activeTab === 'horaire'
                ? 'bg-white text-[#FD5312] border-[#FD5312] shadow-sm'
                : 'text-gray-600 hover:text-[#FD5312] hover:bg-white/60 border-transparent'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-[10px] font-mono">7</span>
            <span>Hor Conduite</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('formateurs')}
            className={`px-4 py-3 text-left transition border-b-4 cursor-pointer flex items-center justify-between gap-2 ${
              activeTab === 'formateurs'
                ? 'bg-white text-[#FD5312] border-[#FD5312] shadow-sm'
                : 'text-gray-800 bg-orange-50/70 hover:bg-orange-100/70 hover:text-[#FD5312] border-transparent'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-[10px] font-mono">8</span>
              <span>8. Annuaire & Formateurs</span>
            </div>
            <span className="px-1.5 py-0.5 rounded-full bg-[#FD5312] text-white text-[10px] font-black">
              {formateursCount}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Accordion Navigation */}
      <div className="lg:hidden bg-gray-50 border-b border-gray-200">
        <div className="divide-y divide-gray-200 text-xs font-black uppercase">
          {/* Group 1 */}
          <div>
            <button
              type="button"
              onClick={() => toggleMobileGroup('modules1')}
              className={`w-full px-4 py-2.5 flex items-center justify-between text-left transition ${
                ['cours', 'rails', 'tram'].includes(activeTab) ? 'text-[#FD5312] bg-orange-50/50' : 'text-gray-700'
              }`}
            >
              <span>Modules 1 à 3 (Cours & Rails & Tram)</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${mobileGroupOpen === 'modules1' ? 'rotate-180' : ''}`} />
            </button>
            {mobileGroupOpen === 'modules1' && (
              <div className="p-2 space-y-1.5 bg-gray-100/70">
                <button
                  type="button"
                  onClick={() => selectTab('cours')}
                  className={`w-full p-2.5 rounded-lg text-left transition ${
                    activeTab === 'cours' ? 'bg-[#FD5312] text-white shadow' : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  1. Organisation Cours
                </button>
                <button
                  type="button"
                  onClick={() => selectTab('rails')}
                  className={`w-full p-2.5 rounded-lg text-left transition ${
                    activeTab === 'rails' ? 'bg-[#FD5312] text-white shadow' : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  2. Rails Glissants
                </button>
                <button
                  type="button"
                  onClick={() => selectTab('tram')}
                  className={`w-full p-2.5 rounded-lg text-left transition ${
                    activeTab === 'tram' ? 'bg-[#FD5312] text-white shadow' : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  3. Réservation Tramway
                </button>
              </div>
            )}
          </div>

          {/* Group 2 */}
          <div>
            <button
              type="button"
              onClick={() => toggleMobileGroup('modules2')}
              className={`w-full px-4 py-2.5 flex items-center justify-between text-left transition ${
                ['abtb', 'vehicule', 'avarie'].includes(activeTab) ? 'text-[#FD5312] bg-orange-50/50' : 'text-gray-700'
              }`}
            >
              <span>Modules 4 à 6 (Réservation & Avaries)</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${mobileGroupOpen === 'modules2' ? 'rotate-180' : ''}`} />
            </button>
            {mobileGroupOpen === 'modules2' && (
              <div className="p-2 space-y-1.5 bg-gray-100/70">
                <button
                  type="button"
                  onClick={() => selectTab('abtb')}
                  className={`w-full p-2.5 rounded-lg text-left transition ${
                    activeTab === 'abtb' ? 'bg-[#FD5312] text-white shadow' : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  4. Réservation AB/TB
                </button>
                <button
                  type="button"
                  onClick={() => selectTab('vehicule')}
                  className={`w-full p-2.5 rounded-lg text-left transition ${
                    activeTab === 'vehicule' ? 'bg-[#FD5312] text-white shadow' : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  5. Avarie Véhicule de Service
                </button>
                <button
                  type="button"
                  onClick={() => selectTab('avarie')}
                  className={`w-full p-2.5 rounded-lg text-left transition ${
                    activeTab === 'avarie' ? 'bg-[#FD5312] text-white shadow' : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  6. Annonce Avarie AB / TB
                </button>
              </div>
            )}
          </div>

          {/* Group 3 */}
          <div>
            <button
              type="button"
              onClick={() => toggleMobileGroup('modules3')}
              className={`w-full px-4 py-2.5 flex items-center justify-between text-left transition ${
                activeTab === 'horaire' ? 'text-[#FD5312] bg-orange-50/50' : 'text-gray-700'
              }`}
            >
              <span>Module 7 (Hor Conduite)</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${mobileGroupOpen === 'modules3' ? 'rotate-180' : ''}`} />
            </button>
            {mobileGroupOpen === 'modules3' && (
              <div className="p-2 bg-gray-100/70">
                <button
                  type="button"
                  onClick={() => selectTab('horaire')}
                  className={`w-full p-2.5 rounded-lg text-left transition ${
                    activeTab === 'horaire' ? 'bg-[#FD5312] text-white shadow' : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  7. Hor Conduite
                </button>
              </div>
            )}
          </div>

          {/* Dedicated Tab: Annuaire des Formateurs */}
          <div className="p-2 bg-orange-50/50">
            <button
              type="button"
              onClick={() => selectTab('formateurs')}
              className={`w-full p-3 rounded-lg flex items-center justify-between text-left transition font-black ${
                activeTab === 'formateurs'
                  ? 'bg-[#FD5312] text-white shadow-md'
                  : 'bg-white text-gray-900 border border-orange-200 hover:bg-orange-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Gestion & Annuaire des Formateurs</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === 'formateurs' ? 'bg-white text-[#FD5312]' : 'bg-[#FD5312] text-white'
              }`}>
                {formateursCount}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
