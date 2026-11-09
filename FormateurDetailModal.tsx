import React, { useState, useEffect } from 'react';
import { Formateur } from '../../types/formateur';
import { FormateurVehicleLogos } from '../common/VehicleBadges';
import { api } from '../../services/api';
import { X, Mail, Phone, Calendar, CheckCircle2, AlertCircle, FileCode, KeyRound, Copy, Check, RefreshCw } from 'lucide-react';

interface Props {
  formateur: Formateur;
  onClose: () => void;
  onEdit?: () => void;
  canEdit?: boolean;
}

export const FormateurDetailModal: React.FC<Props> = ({ formateur, onClose, onEdit, canEdit }) => {
  const [account, setAccount] = useState<{
    username: string;
    mustChangePassword: boolean;
    defaultTempPassword: string | null;
  } | null>(null);
  const [loadingAccount, setLoadingAccount] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [resettingPass, setResettingPass] = useState(false);
  const [accountFeedback, setAccountFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (canEdit && formateur.id) {
      setLoadingAccount(true);
      api.formateurs.getAccount(formateur.id)
        .then((acc) => {
          setAccount({
            username: acc.username,
            mustChangePassword: acc.mustChangePassword,
            defaultTempPassword: acc.defaultTempPassword
          });
        })
        .catch((err) => {
          console.warn('Impossible de charger le compte formateur:', err);
        })
        .finally(() => {
          setLoadingAccount(false);
        });
    }
  }, [canEdit, formateur.id]);

  const copyInvitation = () => {
    const portalUrl = typeof window !== 'undefined' ? window.location.origin : 'https://portail-formation.tpg.ch';
    const pwd = account?.defaultTempPassword || 'TpgFormation2026!';
    const uname = account?.username || formateur.nomComplet;
    const text = `Bonjour ${formateur.nomComplet},\n\nVoici tes accès pour le Portail Formation TPG :\n• Lien : ${portalUrl}\n• Identifiant : ${uname} (ou "${formateur.nomComplet}")\n• 1er mot de passe provisoire : ${pwd}\n\n⚠️ Dès ta première connexion, l'application te demandera de créer ton propre mot de passe personnel.`;
    navigator.clipboard.writeText(text);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2500);
  };

  const handleResetPassword = async () => {
    setResettingPass(true);
    try {
      const res = await api.formateurs.resetPassword(formateur.id);
      setAccountFeedback(`Nouveau mot de passe provisoire : ${res.tempPassword}`);
      setAccount((prev) => prev ? { ...prev, mustChangePassword: true, defaultTempPassword: res.tempPassword } : null);
    } catch (err: any) {
      setAccountFeedback(`Erreur : ${err.message || 'Échec de réinitialisation'}`);
    } finally {
      setResettingPass(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header in TPG orange */}
        <div className="bg-[#FD5312] p-5 text-white flex justify-between items-start">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-orange-200 mb-1">
              Fiche Individuelle Formateur
            </div>
            <h2 className="text-xl font-black uppercase font-sans tracking-tight">
              {formateur.nomComplet}
            </h2>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <FormateurVehicleLogos
                hasTram={formateur.hasTram}
                hasAB={formateur.hasAB}
                hasTB={formateur.hasTB}
                hasCTT={formateur.hasCTT}
                isTramway={formateur.isTramway}
              />
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-mono font-bold">
                ID: {formateur.id}
              </span>
              {formateur.numeroAgent ? (
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-mono font-bold">
                  N° agent: {formateur.numeroAgent}
                </span>
              ) : null}
              {formateur.acronyme ? (
                <span className="text-xs bg-black/20 px-2 py-0.5 rounded font-mono font-bold">
                  Acronyme: {formateur.acronyme}
                </span>
              ) : null}
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-5">
          {/* Qualifications & Habilitations Métier */}
          <div>
            <div className="text-xs font-black uppercase text-gray-500 tracking-wider mb-2">
              Qualifications & Habilitations Métier
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {/* Tramway */}
              <div
                className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                  (formateur.hasTram ?? formateur.isTramway)
                    ? 'bg-orange-50 border-orange-200 text-[#FD5312]'
                    : 'bg-gray-50 border-gray-200 text-gray-400'
                }`}
              >
                {(formateur.hasTram ?? formateur.isTramway) ? (
                  <CheckCircle2 className="w-5 h-5 text-[#FD5312] shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-gray-300 shrink-0" />
                )}
                <div>
                  <div className="text-xs font-black uppercase flex items-center gap-1">
                    <span>Tram</span>
                  </div>
                  <div className="text-[11px] font-semibold opacity-90">
                    {(formateur.hasTram ?? formateur.isTramway) ? 'Habilité Tram' : 'Non habilité'}
                  </div>
                </div>
              </div>

              {/* Autobus (AB) */}
              <div
                className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                  (formateur.hasAB ?? true)
                    ? 'bg-sky-50 border-sky-200 text-[#008CBE]'
                    : 'bg-gray-50 border-gray-200 text-gray-400'
                }`}
              >
                {(formateur.hasAB ?? true) ? (
                  <CheckCircle2 className="w-5 h-5 text-[#008CBE] shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-gray-300 shrink-0" />
                )}
                <div>
                  <div className="text-xs font-black uppercase">Autobus</div>
                  <div className="text-[11px] font-semibold opacity-90">
                    {(formateur.hasAB ?? true) ? 'Habilité AB' : 'Non habilité'}
                  </div>
                </div>
              </div>

              {/* Trolleybus (TB) */}
              <div
                className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                  (formateur.hasTB ?? true)
                    ? 'bg-emerald-50 border-emerald-200 text-[#059669]'
                    : 'bg-gray-50 border-gray-200 text-gray-400'
                }`}
              >
                {(formateur.hasTB ?? true) ? (
                  <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-gray-300 shrink-0" />
                )}
                <div>
                  <div className="text-xs font-black uppercase">Trolleybus</div>
                  <div className="text-[11px] font-semibold opacity-90">
                    {(formateur.hasTB ?? true) ? 'Habilité TB' : 'Non habilité'}
                  </div>
                </div>
              </div>

              {/* CTT */}
              <div
                className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                  formateur.hasCTT
                    ? 'bg-purple-50 border-purple-200 text-[#6D28D9]'
                    : 'bg-gray-50 border-gray-200 text-gray-400'
                }`}
              >
                {formateur.hasCTT ? (
                  <CheckCircle2 className="w-5 h-5 text-[#6D28D9] shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-gray-300 shrink-0" />
                )}
                <div>
                  <div className="text-xs font-black uppercase">CTT</div>
                  <div className="text-[11px] font-semibold opacity-90">
                    {formateur.hasCTT ? 'Habilité CTT' : 'Non habilité'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <div className="text-xs font-black uppercase text-gray-500 tracking-wider mb-2">
              Coordonnées professionnelles
            </div>
            <div className="space-y-2 text-sm bg-gray-50 p-3.5 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 text-gray-700">
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="font-semibold">{formateur.email || 'Email non renseigné'}</span>
                {formateur.email && (
                  <a
                    href={`mailto:${formateur.email}`}
                    className="ml-auto text-xs font-black text-[#FD5312] hover:underline"
                  >
                    Écrire
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2 text-gray-700">
                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                <span>{formateur.mobile || formateur.telephone || 'Portable non renseigné'}</span>
                {(formateur.mobile || formateur.telephone) && (
                  <a
                    href={`tel:${(formateur.mobile || formateur.telephone || '').replace(/\s+/g, '')}`}
                    className="ml-auto text-xs font-black text-[#FD5312] hover:underline"
                  >
                    Appeler
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-xs text-gray-500">
                  Enregistré dans le portail : {formateur.dateAjout || 'Initialisation système'}
                </span>
              </div>
            </div>
          </div>

          {/* Provenance source badge */}
          <div>
            <div className="text-xs font-black uppercase text-gray-500 tracking-wider mb-1.5">
              Provenance des données source
            </div>
            <div className="p-3 bg-gray-100 rounded-lg text-xs text-gray-700 flex items-start gap-2 border border-gray-200">
              <FileCode className="w-4 h-4 text-[#FD5312] shrink-0 mt-0.5" />
              <div>
                <span className="font-black text-gray-900">
                  {formateur.sourceOrigin === 'source_html_v18'
                    ? 'Portail HTML TPG v18 (Source de vérité principale)'
                    : formateur.sourceOrigin === 'source_pdf_v7'
                    ? 'Liste des formateurs PDF v7 (Document annexe)'
                    : 'Création manuelle certifiée'}
                </span>
                <p className="mt-0.5 text-gray-500 text-[11px]">
                  {formateur.sourceOrigin === 'source_html_v18' &&
                    'Orthographe et patronyme importés avec stricte fidélité à l’identique.'}
                  {formateur.sourceOrigin === 'source_pdf_v7' &&
                    'Identifié dans le PDF v7 et réconcilié dans le référentiel opérationnel.'}
                </p>
              </div>
            </div>
          </div>

          {formateur.notes && (
            <div>
              <div className="text-xs font-black uppercase text-gray-500 tracking-wider mb-1">
                Remarques & Observations
              </div>
              <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200 whitespace-pre-wrap">
                {formateur.notes}
              </p>
            </div>
          )}

          {/* Section Identifiants & Accès initial (visible par l'Administrateur) */}
          {canEdit && (
            <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#FD5312]" />
                  <span className="text-xs font-bold uppercase text-gray-800">
                    Accès & 1er Mot de Passe Formateur
                  </span>
                </div>
                {loadingAccount ? (
                  <RefreshCw className="w-3.5 h-3.5 text-[#FD5312] animate-spin" />
                ) : account?.mustChangePassword ? (
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    🟡 1ère connexion en attente
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    🟢 Mot de passe personnalisé actif
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-orange-200">
                  <span className="text-[10px] uppercase font-bold text-gray-500 block">Identifiant</span>
                  <span className="font-mono font-bold text-gray-900 select-all">
                    {account?.username || formateur.nomComplet}
                  </span>
                  <div className="text-[10px] text-gray-400 mt-0.5">ou son nom complet</div>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-orange-200">
                  <span className="text-[10px] uppercase font-bold text-gray-500 block">
                    {account?.mustChangePassword ? '1er Mot de passe provisoire' : 'Statut sécurité'}
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#FD5312] select-all">
                      {account?.mustChangePassword
                        ? (account?.defaultTempPassword || 'TpgFormation2026!')
                        : '••••••••••••'}
                    </span>
                    {account?.mustChangePassword && (
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(account?.defaultTempPassword || 'TpgFormation2026!');
                          setAccountFeedback('Mot de passe copié !');
                          setTimeout(() => setAccountFeedback(null), 2500);
                        }}
                        className="text-gray-500 hover:text-[#FD5312] p-1 cursor-pointer"
                        title="Copier le mot de passe provisoire"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {account?.mustChangePassword
                      ? 'Changement forcé dès connexion'
                      : 'Secret personnel du formateur'}
                  </div>
                </div>
              </div>

              {accountFeedback && (
                <div className="p-2 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs rounded-lg font-bold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{accountFeedback}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={copyInvitation}
                  className="px-3 py-1.5 bg-[#FD5312] hover:bg-[#e04508] active:scale-95 text-white rounded-lg text-xs font-black uppercase transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  {copiedAccount ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Accès copiés !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier le message d'invitation</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={resettingPass}
                  onClick={handleResetPassword}
                  className="px-2.5 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1"
                  title="Réinitialiser un mot de passe provisoire si le formateur a oublié son accès"
                >
                  <RefreshCw className={`w-3 h-3 ${resettingPass ? 'animate-spin text-[#FD5312]' : ''}`} />
                  <span>{resettingPass ? 'Génération...' : 'Régénérer mot de passe provisoire'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 font-bold text-xs uppercase rounded-lg transition cursor-pointer"
          >
            Fermer
          </button>

          {canEdit && onEdit && (
            <button
              onClick={() => {
                onClose();
                onEdit();
              }}
              className="px-4 py-2 bg-[#FD5312] hover:bg-[#e04508] text-white font-black text-xs uppercase rounded-lg shadow-sm transition cursor-pointer"
            >
              Modifier la fiche
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
