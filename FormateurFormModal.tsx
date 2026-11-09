import React, { useState } from 'react';
import { Formateur } from '../../types/formateur';
import { X, Save, AlertTriangle, ShieldCheck } from 'lucide-react';

interface Props {
  formateur?: Formateur | null;
  onClose: () => void;
  onSave: (data: Partial<Formateur>) => Promise<void>;
}

export const FormateurFormModal: React.FC<Props> = ({ formateur, onClose, onSave }) => {
  const isEditing = Boolean(formateur);

  const [prenom, setPrenom] = useState(formateur?.prenom || '');
  const [nom, setNom] = useState(formateur?.nom || '');
  const [acronyme, setAcronyme] = useState(formateur?.acronyme || '');
  const [hasTram, setHasTram] = useState(formateur?.hasTram ?? formateur?.isTramway ?? false);
  const [hasAB, setHasAB] = useState(formateur?.hasAB ?? true);
  const [hasTB, setHasTB] = useState(formateur?.hasTB ?? true);
  const [hasCTT, setHasCTT] = useState(formateur?.hasCTT ?? false);
  const [isRailsGlissants, setIsRailsGlissants] = useState(formateur?.isRailsGlissants ?? formateur?.isTramway ?? false);
  const [email, setEmail] = useState(formateur?.email || '');
  const [telephone, setTelephone] = useState(formateur?.telephone || '');
  const [notes, setNotes] = useState(formateur?.notes || '');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prenom.trim() || !nom.trim()) {
      setErrorMsg('Le prénom et le nom sont obligatoires.');
      return;
    }
    setErrorMsg(null);
    setSubmitting(true);

    try {
      await onSave({
        prenom: prenom.trim(),
        nom: nom.trim(),
        acronyme: acronyme.trim().toUpperCase(),
        isTramway: hasTram,
        hasTram,
        hasAB,
        hasTB,
        hasCTT,
        isRailsGlissants: hasTram || isRailsGlissants,
        email: email.trim(),
        mobile: telephone.trim(),
        telephone: telephone.trim(),
        notes: notes.trim() || undefined
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur lors de l’enregistrement');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        <div className="bg-[#FD5312] p-5 text-white flex justify-between items-center">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-orange-200">
              Contrôle d'Autorisation • Administrateur
            </div>
            <h2 className="text-lg font-black uppercase font-sans">
              {isEditing ? `Modifier : ${formateur?.nomComplet}` : 'Ajouter un Nouveau Formateur'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase text-gray-700 mb-1">
                Prénom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                placeholder="Ex: Christian"
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:border-[#FD5312] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase text-gray-700 mb-1">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Ex: NOVERRAZ"
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:border-[#FD5312] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase text-gray-700 mb-1">
              Acronyme TPG (Optionnel)
            </label>
            <input
              type="text"
              value={acronyme}
              onChange={(e) => setAcronyme(e.target.value.toUpperCase())}
              placeholder="Laisser vide si non attribué (règle stricte)"
              maxLength={10}
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono focus:bg-white focus:border-[#FD5312] outline-none uppercase"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Note : les fichiers sources ne fournissent aucun acronyme par défaut. Ne pas en inventer.
            </p>
          </div>

          <div className="p-3.5 bg-orange-50/60 border border-orange-200 rounded-xl space-y-2">
            <div className="text-xs font-black uppercase text-gray-900 tracking-wider">
              Qualifications & Habilitations Métier
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <label className="flex items-center gap-2 text-xs text-gray-800 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={hasTram}
                  onChange={(e) => setHasTram(e.target.checked)}
                  className="w-4 h-4 accent-[#FD5312] rounded cursor-pointer"
                />
                <span>Habilité Tram</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-gray-800 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={hasAB}
                  onChange={(e) => setHasAB(e.target.checked)}
                  className="w-4 h-4 accent-[#008CBE] rounded cursor-pointer"
                />
                <span>Habilité AB</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-gray-800 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={hasTB}
                  onChange={(e) => setHasTB(e.target.checked)}
                  className="w-4 h-4 accent-[#059669] rounded cursor-pointer"
                />
                <span>Habilité TB</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-gray-800 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={hasCTT}
                  onChange={(e) => setHasCTT(e.target.checked)}
                  className="w-4 h-4 accent-[#6D28D9] rounded cursor-pointer"
                />
                <span>Habilité CTT</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase text-gray-700 mb-1">
                Email professionnel
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="prenom.nom@tpg.ch"
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:border-[#FD5312] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase text-gray-700 mb-1">
                Téléphone professionnel
              </label>
              <input
                type="tel"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="+41 22 123 45 67"
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:border-[#FD5312] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase text-gray-700 mb-1">
              Remarques administratives
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes ou spécificités..."
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:bg-white focus:border-[#FD5312] outline-none"
            />
          </div>

          <div className="pt-3 border-t border-gray-200 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs uppercase rounded-lg transition cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#FD5312] hover:bg-[#e04508] text-white font-black text-xs uppercase rounded-lg shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Enregistrement...' : 'Enregistrer le formateur'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
