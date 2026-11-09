import React, { useState } from 'react';
import { UserSession } from '../../types/auth';
import { api } from '../../services/api';
import { Lock, ShieldAlert, CheckCircle2, Eye, EyeOff, KeyRound, LogOut } from 'lucide-react';

interface Props {
  user: UserSession;
  onSuccess: () => Promise<void>;
  onLogout: () => Promise<void>;
}

export const ChangePasswordModal: React.FC<Props> = ({ user, onSuccess, onLogout }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentPassword) {
      setError('Veuillez renseigner votre mot de passe temporaire actuel.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Le nouveau mot de passe doit comporter au moins 8 caractères.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('La confirmation ne correspond pas au nouveau mot de passe.');
      return;
    }

    if (newPassword === currentPassword) {
      setError('Le nouveau mot de passe doit être différent du mot de passe temporaire.');
      return;
    }

    setSubmitting(true);
    try {
      await api.auth.changePassword(currentPassword, newPassword);
      setSuccessMsg('Votre mot de passe a été personnalisé avec succès ! Accès au portail...');
      setTimeout(async () => {
        await onSuccess();
      }, 1200);
    } catch (err: any) {
      setError(err?.message || 'Erreur lors du changement de mot de passe. Vérifiez le mot de passe actuel.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header TPG */}
        <div className="bg-[#FD5312] p-6 text-white text-center">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <KeyRound className="w-6 h-6 text-white" />
          </div>
          <h2
            className="text-lg font-bold uppercase tracking-wide"
            style={{ fontFamily: "'HelveticaNeue LT COM 65 MD', 'Helvetica Neue LT Com 65 Md', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}
          >
            Première connexion obligatoire
          </h2>
          <p className="text-xs text-orange-100 font-semibold mt-1">
            Personnalisation de votre mot de passe formateur
          </p>
        </div>

        {/* Content body */}
        <div className="p-6">
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Bonjour {user.nomComplet},</span>
              <p className="mt-0.5 text-amber-800">
                Vous êtes connecté avec un mot de passe temporaire. Pour des raisons de sécurité, vous devez obligatoirement définir votre propre mot de passe personnel avant d'accéder au portail.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold flex items-start gap-2 animate-shake">
              <span className="font-bold">✗</span>
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mot de passe temporaire actuel */}
            <div>
              <label
                className="block text-xs text-gray-700 font-bold mb-1"
                style={{ fontFamily: "'HelveticaNeue LT COM 65 MD', 'Helvetica Neue LT Com 65 Md', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}
              >
                1. 1er mot de passe (temporaire) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Mot de passe temporaire transmis"
                  className="w-full pl-3 pr-10 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:border-[#FD5312] outline-none font-mono transition"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Nouveau mot de passe */}
            <div>
              <label
                className="block text-xs text-gray-700 font-bold mb-1"
                style={{ fontFamily: "'HelveticaNeue LT COM 65 MD', 'Helvetica Neue LT Com 65 Md', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}
              >
                2. Votre nouveau mot de passe personnel <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 caractères"
                  className="w-full pl-3 pr-10 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:border-[#FD5312] outline-none font-mono transition"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Doit contenir au moins 8 caractères (lettres, chiffres ou symboles).
              </p>
            </div>

            {/* Confirmation du mot de passe */}
            <div>
              <label
                className="block text-xs text-gray-700 font-bold mb-1"
                style={{ fontFamily: "'HelveticaNeue LT COM 65 MD', 'Helvetica Neue LT Com 65 Md', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}
              >
                3. Confirmer le nouveau mot de passe <span className="text-red-500">*</span>
              </label>
              <input
                type={showNew ? 'text' : 'password'}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Répétez votre nouveau mot de passe"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:border-[#FD5312] outline-none font-mono transition"
              />
            </div>

            {/* Boutons d'action */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={submitting || !!successMsg}
                className="w-full py-3 bg-[#FD5312] hover:bg-[#e04508] active:scale-98 text-white font-black uppercase text-xs tracking-wider rounded-lg shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ fontFamily: "'HelveticaNeue LT COM 65 MD', 'Helvetica Neue LT Com 65 Md', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Enregistrement en cours...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Créer mon mot de passe et continuer</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="w-full py-2 text-gray-500 hover:text-gray-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Se déconnecter sans changer maintenant</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
