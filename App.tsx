import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginModal } from './components/auth/LoginModal';
import { Header } from './components/layout/Header';
import { OfflineIndicator } from './components/layout/OfflineIndicator';
import { Module1Cours } from './components/modules/Module1Cours';
import { Module2Rails } from './components/modules/Module2Rails';
import { Module3Tram } from './components/modules/Module3Tram';
import { Module4Abtb } from './components/modules/Module4Abtb';
import { Module5Vehicule } from './components/modules/Module5Vehicule';
import { Module6Avarie } from './components/modules/Module6Avarie';
import { Module7Horaire } from './components/modules/Module7Horaire';
import { FormateursDirectory } from './components/formateurs/FormateursDirectory';
import { Formateur } from './types/formateur';
import { AppConfig } from './types/modules';
import { api } from './services/api';
import { storage } from './services/storage';
import { ChangePasswordModal } from './components/auth/ChangePasswordModal';
import { ShieldCheck, Info, Copy, Check, KeyRound, Key, ShieldAlert } from 'lucide-react';

const MainApp: React.FC = () => {
  const { isAuthenticated, isLoading, user, logout, refreshSession } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('cours');
  const [formateurs, setFormateurs] = useState<Formateur[]>(() => storage.getFormateurs());
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(null);
  const [copiedField, setCopiedField] = useState<'user' | 'pass' | null>(null);

  const loadData = useCallback(async () => {
    if (!isAuthenticated) return;
    setDataLoading(true);
    try {
      const [formData, cfgData] = await Promise.all([
        api.formateurs.getAll(),
        api.config.get()
      ]);

      let finalFormateurs = (formData.formateurs || []).filter(
        f => !f.nomComplet?.toLowerCase().includes('de sabato')
      );

      // Persistance automatique : vérifier si des formateurs locaux (ex: créés manuellement)
      // sont absents du serveur (par ex. suite à un redémarrage du conteneur en mémoire)
      const localCustoms = storage.getCustomFormateurs();
      const missingOnServer = localCustoms.filter(
        (lc) => !finalFormateurs.some((sf) => String(sf.id) === String(lc.id) || sf.nomComplet.trim().toLowerCase() === lc.nomComplet.trim().toLowerCase())
      );

      if (missingOnServer.length > 0 && (user?.role === 'admin' || user?.role === 'responsable')) {
        try {
          const syncRes = await api.formateurs.sync(missingOnServer);
          if (syncRes.success && Array.isArray(syncRes.formateurs)) {
            finalFormateurs = syncRes.formateurs;
          }
        } catch (syncErr) {
          console.warn('Erreur sync formateurs avec le serveur:', syncErr);
          finalFormateurs = [...finalFormateurs, ...missingOnServer];
        }
      }

      setFormateurs(finalFormateurs);
      storage.saveFormateurs(finalFormateurs);
      setConfig(cfgData);
    } catch (err) {
      console.error('Error loading initial portal data:', err);
      const cached = storage.getFormateurs();
      if (cached.length > 0) {
        setFormateurs(cached);
      }
    } finally {
      setDataLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  const handleCreateFormateur = async (data: Partial<Formateur>) => {
    const result = await api.formateurs.create(data);
    if (result.success && result.formateur) {
      storage.addOrUpdateCustomFormateur(result.formateur);
      setFormateurs((prev) => {
        const updated = [...prev.filter((f) => String(f.id) !== String(result.formateur.id)), result.formateur];
        storage.saveFormateurs(updated);
        return updated;
      });
    }
    if (result.account?.tempPassword) {
      setCredentials({ username: result.account.username, password: result.account.tempPassword });
    }
    await loadData();
  };

  const handleUpdateFormateur = async (id: string, data: Partial<Formateur>) => {
    const res = await api.formateurs.update(id, data);
    if (res.success && res.formateur) {
      storage.addOrUpdateCustomFormateur(res.formateur);
      setFormateurs((prev) => {
        const updated = prev.map((f) => (String(f.id) === String(id) ? res.formateur : f));
        storage.saveFormateurs(updated);
        return updated;
      });
    }
    await loadData();
  };

  const handleDeleteFormateur = async (id: string) => {
    await api.formateurs.delete(id);
    storage.deleteCustomFormateur(id);
    setFormateurs((prev) => {
      const updated = prev.filter((f) => String(f.id) !== String(id));
      storage.saveFormateurs(updated);
      return updated;
    });
    await loadData();
  };

  const handleResetDefaults = async () => {
    storage.clearAll();
    await api.formateurs.resetDefault();
    await loadData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f0f0]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#FD5312] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-black uppercase text-gray-600 tracking-wider">
            Chargement sécurisé du Portail TPG...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginModal />;
  }

  const mailConfig = config?.MAIL_CONFIG || {
    cours_rct: 'GTR-Planification@tpg.ch',
    cours_600: 'Dias.Celso@tpg.ch',
    rails_to: 'vondach.baptiste@tpg.ch,Resp.equipesCMB2@tpg.ch',
    rails_cc: 'batiments@tpg.ch',
    tram_bachet: 'Resp.equipesCMB2@tpg.ch,Equipes_Planification_CMB@tpg.ch',
    tram_chardon: 'Resp.equipesCMB2@tpg.ch,Equipes_Planification_CMB@tpg.ch,Linares.David@tpg.ch',
    abtb_bachet: 'Resp.equipesCMB2@tpg.ch,Equipes_Planification_CMB@tpg.ch',
    abtb_chardon: 'Resp.equipesCMC@tpg.ch,Equipes_Planification_CMC@tpg.ch',
    abtb_jonctionab: 'Resp.equipesCMJ2@tpg.ch,Equipes_Planification_CMJ@tpg.ch',
    abtb_jonctiontb: 'Resp.equipesCMJ2@tpg.ch,Equipes_Planification_CMJ@tpg.ch',
    vehicule_leger: 'ducret.julien@tpg.ch',
    vehicule_abtb: 'convers.alain@tpg.ch',
    avarie_bachet: 'Resp.equipesCMB2@tpg.ch,Equipes_Planification_CMB@tpg.ch',
    avarie_chardon: 'Resp.equipesCMC@tpg.ch,Equipes_Planification_CMC@tpg.ch',
    avarie_jonctab: 'Resp.equipesCMJ2@tpg.ch,Equipes_Planification_CMJ@tpg.ch',
    avarie_joncttb: 'Resp.equipesCMJ2@tpg.ch,Equipes_Planification_CMJ@tpg.ch',
    horaire_to: 'bex@tpg.ch'
  };

  const vtbOptions = config?.vtbOptions || [];

  return (
    <div className="min-h-screen bg-[#f0f0f0] text-[#111827] flex flex-col font-sans">
      <div className="container mx-auto max-w-[1100px] p-2 sm:p-4 flex-1 flex flex-col">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-visible flex-1 flex flex-col">
          {/* Header Component */}
          <Header
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            formateursCount={formateurs.length}
          />

          {/* Module Content Switcher */}
          <main className="flex-1">
            {dataLoading && formateurs.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-3 border-[#FD5312] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span className="text-xs font-bold text-gray-500 uppercase">
                  Chargement des modules...
                </span>
              </div>
            ) : (
              <>
                {activeTab === 'cours' && (
                  <Module1Cours formateurs={formateurs} mailConfig={mailConfig} />
                )}
                {activeTab === 'rails' && (
                  <Module2Rails formateurs={formateurs} mailConfig={mailConfig} />
                )}
                {activeTab === 'tram' && (
                  <Module3Tram formateurs={formateurs} mailConfig={mailConfig} />
                )}
                {activeTab === 'abtb' && (
                  <Module4Abtb formateurs={formateurs} mailConfig={mailConfig} />
                )}
                {activeTab === 'vehicule' && (
                  <Module5Vehicule
                    formateurs={formateurs}
                    mailConfig={mailConfig}
                    vtbOptions={vtbOptions}
                  />
                )}
                {activeTab === 'avarie' && (
                  <Module6Avarie formateurs={formateurs} mailConfig={mailConfig} />
                )}
                {activeTab === 'horaire' && (
                  <Module7Horaire formateurs={formateurs} mailConfig={mailConfig} />
                )}
                {activeTab === 'formateurs' && (
                  <FormateursDirectory
                    formateurs={formateurs}
                    onRefresh={loadData}
                    onCreate={handleCreateFormateur}
                    onUpdate={handleUpdateFormateur}
                    onDelete={handleDeleteFormateur}
                    onResetDefaults={handleResetDefaults}
                  />
                )}
              </>
            )}
          </main>

          {/* Discreet Footer */}
          <footer className="p-3 bg-gray-50 border-t border-gray-200 text-center text-xs text-gray-500 flex flex-wrap items-center justify-between gap-2 no-print">
            <div className="flex items-center gap-1.5 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Transports Publics Genevois • Portail Formation Sécurisé PWA</span>
            </div>
            <div className="text-[11px] text-gray-400">
              Session active • {user?.username} ({user?.role})
            </div>
          </footer>
        </div>
      </div>

      {/* Offline Indicator Toast */}
      <OfflineIndicator />

      {/* Modal Obligatoire de Première Connexion Formateur (Création de son propre mot de passe) */}
      {user?.mustChangePassword && (
        <ChangePasswordModal
          user={user}
          onSuccess={refreshSession}
          onLogout={logout}
        />
      )}

      {/* Modal d'affichage du 1er mot de passe temporaire pour l'administrateur */}
      {credentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-[#FD5312] p-5 text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3
                  className="font-bold text-sm uppercase tracking-wide"
                  style={{ fontFamily: "'HelveticaNeue LT COM 65 MD', 'Helvetica Neue LT Com 65 Md', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}
                >
                  Compte Formateur Créé avec Succès
                </h3>
                <p className="text-xs text-orange-100 font-semibold mt-0.5">
                  1er mot de passe temporaire généré
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-950 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-[#FD5312] shrink-0 mt-0.5" />
                <p>
                  Transmettez ces identifiants au formateur. <strong>Lors de sa première connexion</strong> avec ce mot de passe temporaire, l'application lui demandera obligatoirement de <strong>créer son propre mot de passe personnel</strong>.
                </p>
              </div>

              {/* Identifiant */}
              <div>
                <label className="block text-xs text-gray-600 font-bold mb-1">
                  Identifiant de connexion
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono font-bold text-gray-900 select-all">
                    {credentials.username}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(credentials.username);
                      setCopiedField('user');
                      setTimeout(() => setCopiedField(null), 2000);
                    }}
                    className="p-2.5 bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-700 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    title="Copier l'identifiant"
                  >
                    {copiedField === 'user' ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700">Copié</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copier</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 1er mot de passe temporaire */}
              <div>
                <label className="block text-xs text-gray-600 font-bold mb-1">
                  1er mot de passe (temporaire)
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-2.5 bg-amber-50 border border-amber-300 rounded-lg text-base font-mono font-black text-amber-900 tracking-wider select-all">
                    {credentials.password}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(credentials.password);
                      setCopiedField('pass');
                      setTimeout(() => setCopiedField(null), 2000);
                    }}
                    className="p-2.5 bg-amber-100 hover:bg-amber-200 active:scale-95 text-amber-900 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    title="Copier le mot de passe temporaire"
                  >
                    {copiedField === 'pass' ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700">Copié</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copier</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCredentials(null);
                    setCopiedField(null);
                  }}
                  className="w-full py-2.5 bg-[#FD5312] hover:bg-[#e04508] active:scale-98 text-white font-black uppercase text-xs rounded-lg shadow-sm transition cursor-pointer"
                  style={{ fontFamily: "'HelveticaNeue LT COM 65 MD', 'Helvetica Neue LT Com 65 Md', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}
                >
                  J'ai noté ces identifiants • Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
