import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { X, KeyRound, Copy, Check, ShieldAlert, CheckCircle2, RefreshCw, Send, AlertCircle, Search } from 'lucide-react';

interface AccountSummary {
  id: string;
  nomComplet: string;
  email: string;
  mobile: string;
  username: string;
  mustChangePassword: boolean;
  hasLoggedIn: boolean;
  defaultTempPassword: string;
}

interface Props {
  onClose: () => void;
}

export const FormateursAccessGuideModal: React.FC<Props> = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [defaultPassword, setDefaultPassword] = useState('TpgFormation2026!');
  const [accounts, setAccounts] = useState<AccountSummary[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedGeneral, setCopiedGeneral] = useState(false);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const res = await api.formateurs.getAccountsSummary();
      setDefaultPassword(res.defaultPassword);
      setAccounts(res.accounts);
    } catch (err) {
      console.error('Erreur chargement summary comptes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const portalUrl = typeof window !== 'undefined' ? window.location.origin : 'https://portail-formation.tpg.ch';

  const generalInvitationMessage = `Bonjour,\n\nVoici vos accès pour le Portail Formation TPG :\n• Lien d'accès : ${portalUrl}\n• Identifiant : votre Nom Complet (ex: Christian NOVERRAZ) ou prenom.nom\n• 1er mot de passe provisoire : ${defaultPassword}\n\n⚠️ Lors de votre toute première connexion, l'application vous demandera obligatoirement de créer votre propre mot de passe personnel secret.`;

  const copyGeneralMessage = () => {
    navigator.clipboard.writeText(generalInvitationMessage);
    setCopiedGeneral(true);
    setTimeout(() => setCopiedGeneral(false), 2500);
  };

  const copyIndividualInvitation = (acc: AccountSummary) => {
    const text = `Bonjour ${acc.nomComplet},\n\nVoici tes accès pour te connecter au Portail Formation TPG :\n• Lien : ${portalUrl}\n• Identifiant : ${acc.username} (ou "${acc.nomComplet}")\n• 1er mot de passe provisoire : ${acc.defaultTempPassword}\n\n⚠️ Dès ta première connexion, tu seras automatiquement invité à définir ton propre mot de passe personnel.`;
    navigator.clipboard.writeText(text);
    setCopiedId(acc.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleResetPassword = async (acc: AccountSummary) => {
    setResettingId(acc.id);
    try {
      const res = await api.formateurs.resetPassword(acc.id);
      setActionMessage(`Nouveau mot de passe temporaire pour ${acc.nomComplet} : ${res.tempPassword}`);
      await loadAccounts();
    } catch (err: any) {
      setActionMessage(`Erreur réinitialisation : ${err.message || 'Erreur inconnue'}`);
    } finally {
      setResettingId(null);
    }
  };

  const filtered = accounts.filter((a) => {
    const matchSearch =
      a.nomComplet.toLowerCase().includes(search.toLowerCase()) ||
      a.username.toLowerCase().includes(search.toLowerCase()) ||
      (a.email && a.email.toLowerCase().includes(search.toLowerCase()));

    if (!matchSearch) return false;
    if (filter === 'pending') return a.mustChangePassword;
    if (filter === 'active') return !a.mustChangePassword;
    return true;
  });

  const pendingCount = accounts.filter((a) => a.mustChangePassword).length;
  const activeCount = accounts.filter((a) => !a.mustChangePassword).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#FD5312] p-5 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2
                className="text-base font-bold uppercase tracking-wide"
                style={{ fontFamily: "'HelveticaNeue LT COM 65 MD', 'Helvetica Neue LT Com 65 Md', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}
              >
                Transmission des 1ers Mots de Passe aux Formateurs
              </h2>
              <p className="text-xs text-orange-100 font-semibold mt-0.5">
                Guide des accès initiaux & invitation de l'équipe
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Bloc d'explication officiel */}
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-3">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-[#FD5312] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-orange-950 uppercase">
                  Comment transmettre les accès à vos formateurs ?
                </h3>
                <p className="text-xs text-orange-900 mt-1 leading-relaxed">
                  Tous les formateurs pré-enregistrés dans l’application possèdent le même <strong>1er mot de passe provisoire d’usine</strong>. Dès qu’ils s’y connectent pour la première fois, l’application bloque l’accès et leur impose automatiquement de créer <strong>leur propre mot de passe personnel</strong>.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-orange-200/80 text-xs">
              <div className="bg-white p-3 rounded-lg border border-orange-200">
                <span className="text-[11px] font-bold uppercase text-gray-500 block mb-0.5">
                  1er Mot de passe provisoire de tous les formateurs :
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-sm text-[#FD5312] tracking-wider select-all">
                    {defaultPassword}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(defaultPassword);
                      setActionMessage('Mot de passe par défaut copié dans le presse-papier !');
                      setTimeout(() => setActionMessage(null), 2500);
                    }}
                    className="p-1 px-2 bg-orange-100 hover:bg-orange-200 text-orange-900 rounded font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copier</span>
                  </button>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-orange-200">
                <span className="text-[11px] font-bold uppercase text-gray-500 block mb-0.5">
                  Identifiants acceptés pour la connexion :
                </span>
                <p className="text-gray-800 text-xs">
                  Leur <strong>Nom complet exact</strong> (ex: <code className="bg-gray-100 px-1 rounded font-mono">Christian NOVERRAZ</code>) ou leur <strong>identifiant</strong> (ex: <code className="bg-gray-100 px-1 rounded font-mono">christian.noverraz</code>).
                </p>
              </div>
            </div>
          </div>

          {/* Modèle de message type prêt à l'envoi */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-[#FD5312]" />
                <span className="text-xs font-bold uppercase text-gray-700">
                  Modèle de message d'invitation (à envoyer par E-mail ou WhatsApp)
                </span>
              </div>
              <button
                type="button"
                onClick={copyGeneralMessage}
                className="px-3 py-1.5 bg-[#FD5312] hover:bg-[#e04508] active:scale-95 text-white rounded-lg text-xs font-black uppercase transition cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                {copiedGeneral ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Message copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier le message type</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 bg-white border border-gray-300 rounded-lg text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed select-all">
              {generalInvitationMessage}
            </pre>
          </div>

          {actionMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-900 font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionMessage}</span>
            </div>
          )}

          {/* Tableau récapitulatif individuel */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold uppercase text-gray-700">
                  Statut de connexion des formateurs ({accounts.length})
                </h4>
                <p className="text-[11px] text-gray-500">
                  {pendingCount} en attente de 1ère connexion • {activeCount} mot de passe personnalisé configuré
                </p>
              </div>

              {/* Filtres & Recherche */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Filtrer..."
                    className="pl-8 pr-2 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs outline-none focus:border-[#FD5312] w-36 sm:w-44"
                  />
                </div>

                <div className="flex items-center border border-gray-200 rounded-lg p-0.5 bg-gray-100 text-xs">
                  <button
                    type="button"
                    onClick={() => setFilter('all')}
                    className={`px-2 py-1 rounded font-bold cursor-pointer transition ${filter === 'all' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500'}`}
                  >
                    Tous
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilter('pending')}
                    className={`px-2 py-1 rounded font-bold cursor-pointer transition ${filter === 'pending' ? 'bg-white shadow-xs text-amber-700' : 'text-gray-500'}`}
                  >
                    En attente ({pendingCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilter('active')}
                    className={`px-2 py-1 rounded font-bold cursor-pointer transition ${filter === 'active' ? 'bg-white shadow-xs text-emerald-700' : 'text-gray-500'}`}
                  >
                    Actifs ({activeCount})
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-gray-500">
                <RefreshCw className="w-5 h-5 text-[#FD5312] animate-spin mx-auto mb-2" />
                Chargement des statuts de compte...
              </div>
            ) : (
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-xs max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-gray-100 text-gray-600 font-bold border-b border-gray-200 sticky top-0">
                    <tr>
                      <th className="p-2.5">Formateur</th>
                      <th className="p-2.5">Identifiant</th>
                      <th className="p-2.5">Statut de connexion</th>
                      <th className="p-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-gray-400">
                          Aucun compte ne correspond à votre recherche.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((acc) => (
                        <tr key={acc.id} className="hover:bg-gray-50/80 transition">
                          <td className="p-2.5">
                            <div className="font-bold text-gray-900">{acc.nomComplet}</div>
                            <div className="text-[11px] text-gray-500">{acc.email || 'Sans e-mail'}</div>
                          </td>

                          <td className="p-2.5 font-mono text-gray-700">
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                              {acc.username}
                            </span>
                          </td>

                          <td className="p-2.5">
                            {acc.mustChangePassword ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-[11px] font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                1ère connexion en attente
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[11px] font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Mot de passe personnalisé défini
                              </span>
                            )}
                          </td>

                          <td className="p-2.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => copyIndividualInvitation(acc)}
                                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-[11px] font-bold transition cursor-pointer flex items-center gap-1"
                                title="Copier le message d'accès pour ce formateur"
                              >
                                {copiedId === acc.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span className="text-emerald-700">Copié</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copier accès</span>
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                disabled={resettingId === acc.id}
                                onClick={() => handleResetPassword(acc)}
                                className="p-1 hover:bg-orange-50 text-gray-500 hover:text-[#FD5312] rounded transition cursor-pointer"
                                title="Régénérer un mot de passe temporaire"
                              >
                                <RefreshCw className={`w-3.5 h-3.5 ${resettingId === acc.id ? 'animate-spin' : ''}`} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center shrink-0">
          <span className="text-xs text-gray-500">
            Tous les mots de passe sont chiffrés avec Bcrypt (10 rounds).
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#FD5312] hover:bg-[#e04508] text-white font-bold text-xs uppercase rounded-lg shadow-sm transition cursor-pointer"
          >
            Fermer le guide
          </button>
        </div>
      </div>
    </div>
  );
};
