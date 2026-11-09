import React, { useState, useMemo } from 'react';
import { Formateur } from '../../types/formateur';
import { FormateurDetailModal } from './FormateurDetailModal';
import { AuditDiscrepanciesModal } from './AuditDiscrepanciesModal';
import { FormateursAccessGuideModal } from './FormateursAccessGuideModal';
import { TramLogoBadge, AbtbLogoBadge, AbBadge, TbBadge, CttBadge, FormateurVehicleLogos } from '../common/VehicleBadges';
import { validerEmail, validerEtFormaterMobile } from '../../utils/tpgHelpers';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Plus,
  ArrowUpDown,
  Trash2,
  FileSpreadsheet,
  ShieldAlert,
  Check,
  X,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  KeyRound
} from 'lucide-react';

interface Props {
  formateurs: Formateur[];
  onRefresh: () => Promise<void>;
  onCreate: (data: Partial<Formateur>) => Promise<void>;
  onUpdate: (id: string, data: Partial<Formateur>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onResetDefaults: () => Promise<void>;
}

export const FormateursDirectory: React.FC<Props> = ({
  formateurs,
  onRefresh,
  onCreate,
  onUpdate,
  onDelete,
  onResetDefaults
}) => {
  const { user, isAdmin, isAdminOrResp } = useAuth();
  // Seul l'administrateur (ou responsable) voit et peut modifier/ajouter des personnes
  const canManage = isAdminOrResp;
  const isStrictAdmin = isAdmin;

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'tram' | 'ab' | 'tb' | 'ctt'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Quick Add state (matching user requirements: Tram, AB, TB, CTT)
  const [newNom, setNewNom] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newHasTram, setNewHasTram] = useState(false);
  const [newHasAB, setNewHasAB] = useState(true);
  const [newHasTB, setNewHasTB] = useState(true);
  const [newHasCTT, setNewHasCTT] = useState(false);
  const [quickAddSubmitting, setQuickAddSubmitting] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Inline edit state
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [editNom, setEditNom] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [editHasTram, setEditHasTram] = useState(false);
  const [editHasAB, setEditHasAB] = useState(true);
  const [editHasTB, setEditHasTB] = useState(true);
  const [editHasCTT, setEditHasCTT] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Modals state
  const [selectedFormateur, setSelectedFormateur] = useState<Formateur | null>(null);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [accessGuideModalOpen, setAccessGuideModalOpen] = useState(false);

  // Deletion confirmation modal
  const [deleteCandidate, setDeleteCandidate] = useState<Formateur | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset confirmation modal
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setActionFeedback({ message, type });
    setTimeout(() => {
      setActionFeedback(null);
    }, 4000);
  };

  // Filter across nom, e-mail, mobile & qualifications
  const filteredFormateurs = useMemo(() => {
    let list = [...formateurs];

    if (searchQuery.trim()) {
      const q = searchQuery
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

      list = list.filter((f) => {
        const nom = (f.nomComplet || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const email = (f.email || '').toLowerCase();
        const mobile = (f.mobile || f.telephone || '').replace(/\s+/g, '');
        const qClean = q.replace(/\s+/g, '');

        return nom.includes(q) || email.includes(q) || mobile.includes(qClean);
      });
    }

    if (filterType === 'tram') {
      list = list.filter((f) => f.hasTram ?? f.isTramway);
    } else if (filterType === 'ab') {
      list = list.filter((f) => f.hasAB ?? true);
    } else if (filterType === 'tb') {
      list = list.filter((f) => f.hasTB ?? true);
    } else if (filterType === 'ctt') {
      list = list.filter((f) => f.hasCTT);
    }

    list.sort((a, b) => {
      const comp = a.nomComplet.localeCompare(b.nomComplet, 'fr', { sensitivity: 'base' });
      return sortOrder === 'desc' ? -comp : comp;
    });

    return list;
  }, [formateurs, searchQuery, filterType, sortOrder]);

  const tramCount = useMemo(
    () => formateurs.filter((f) => f.hasTram ?? f.isTramway).length,
    [formateurs]
  );
  const abCount = useMemo(
    () => formateurs.filter((f) => f.hasAB ?? true).length,
    [formateurs]
  );
  const tbCount = useMemo(
    () => formateurs.filter((f) => f.hasTB ?? true).length,
    [formateurs]
  );
  const cttCount = useMemo(
    () => formateurs.filter((f) => f.hasCTT).length,
    [formateurs]
  );

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNom.trim()) {
      showNotification('Veuillez renseigner un Nom & Prénom.', 'error');
      return;
    }
    setQuickAddSubmitting(true);
    try {
      await onCreate({
        nom: newNom.trim(),
        email: newEmail.trim(),
        mobile: newMobile.trim(),
        telephone: newMobile.trim(),
        hasTram: newHasTram,
        hasAB: newHasAB,
        hasTB: newHasTB,
        hasCTT: newHasCTT,
        isTramway: newHasTram,
        isRailsGlissants: newHasTram
      });
      showNotification(`Formateur ${newNom.trim()} ajouté avec succès à la liste.`);
      setNewNom('');
      setNewEmail('');
      setNewMobile('');
      setNewHasTram(false);
      setNewHasAB(true);
      setNewHasTB(true);
      setNewHasCTT(false);
    } catch (err: any) {
      showNotification(err?.message || 'Erreur lors de l’ajout du formateur.', 'error');
    } finally {
      setQuickAddSubmitting(false);
    }
  };

  const startInlineEdit = (f: Formateur) => {
    setInlineEditingId(f.id);
    setEditNom(f.nomComplet);
    setEditEmail(f.email || '');
    setEditMobile(f.mobile || f.telephone || '');
    setEditHasTram(Boolean(f.hasTram ?? f.isTramway));
    setEditHasAB(f.hasAB !== undefined ? Boolean(f.hasAB) : true);
    setEditHasTB(f.hasTB !== undefined ? Boolean(f.hasTB) : true);
    setEditHasCTT(Boolean(f.hasCTT));
  };

  const cancelInlineEdit = () => {
    setInlineEditingId(null);
  };

  const saveInlineEdit = async (id: string) => {
    if (!editNom.trim()) {
      showNotification('Le nom ne peut pas être vide.', 'error');
      return;
    }
    setIsSavingEdit(true);
    try {
      await onUpdate(id, {
        nom: editNom.trim(),
        email: editEmail.trim(),
        mobile: editMobile.trim(),
        telephone: editMobile.trim(),
        hasTram: editHasTram,
        hasAB: editHasAB,
        hasTB: editHasTB,
        hasCTT: editHasCTT,
        isTramway: editHasTram,
        isRailsGlissants: editHasTram
      });
      showNotification(`Formateur ${editNom.trim()} mis à jour avec succès.`);
      setInlineEditingId(null);
    } catch (err: any) {
      showNotification(err?.message || 'Erreur lors de la mise à jour.', 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteCandidate.id);
      showNotification(`Formateur ${deleteCandidate.nomComplet} supprimé.`);
      setDeleteCandidate(null);
    } catch (err: any) {
      showNotification(err?.message || 'Erreur lors de la suppression.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmReset = async () => {
    setIsResetting(true);
    try {
      await onResetDefaults();
      showNotification('Liste des formateurs réinitialisée selon la source officielle.');
      setShowResetConfirm(false);
    } catch (err: any) {
      showNotification(err?.message || 'Erreur lors de la réinitialisation.', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  const exportCSV = () => {
    const headers = ['ID', 'Nom & Prénom', 'E-mail TPG', 'Numéro Portable', 'Habilité Tram', 'Habilité AB', 'Habilité TB', 'Habilité CTT'];
    const rows = filteredFormateurs.map((f) => [
      `"${f.id}"`,
      `"${f.nomComplet}"`,
      `"${f.email || ''}"`,
      `"${f.mobile || f.telephone || ''}"`,
      (f.hasTram ?? f.isTramway) ? 'OUI' : 'NON',
      (f.hasAB ?? true) ? 'OUI' : 'NON',
      (f.hasTB ?? true) ? 'OUI' : 'NON',
      f.hasCTT ? 'OUI' : 'NON'
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `formateurs_tpg_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="p-4 sm:p-6" aria-label="8. Annuaire & Gestion des Formateurs TPG">
      {/* Module Header with vertical orange bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-l-4 border-[#FD5312] pl-3 mb-5">
        <div>
          <h2
            className="text-lg font-black uppercase text-[#FD5312] tracking-wide"
            style={{ fontFamily: "'HelveticaNeue LT COM 65 MD', 'Helvetica Neue LT Com 65 Md', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}
          >
            8. ANNUAIRE & GESTION DES FORMATEURS TPG
          </h2>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">
            {formateurs.length} formateurs enregistrés • {tramCount} certifiés TRAM • {abCount} certifiés AB • {tbCount} certifiés TB • {cttCount} certifiés CTT
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canManage && (
            <button
              type="button"
              onClick={() => setAccessGuideModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-900 rounded-lg text-xs font-bold transition cursor-pointer"
              title="Guide et transmission des 1ers mots de passe provisoires"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#FD5312]" />
              <span className="hidden sm:inline">Accès & Mots de passe</span>
            </button>
          )}

          {canManage && (
            <button
              type="button"
              onClick={() => setAuditModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold transition cursor-pointer"
              title="Consulter l'audit des données sources"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-[#FD5312]" />
              <span className="hidden sm:inline">Audit Sources</span>
            </button>
          )}

          <button
            type="button"
            onClick={async () => {
              await onRefresh();
              showNotification('Annuaire synchronisé et actualisé.');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold transition cursor-pointer"
            title="Rafraîchir et synchroniser la liste"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Actualiser</span>
          </button>

          <button
            type="button"
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold transition cursor-pointer"
            title="Exporter en CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          {isStrictAdmin && (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-700 text-gray-600 rounded-lg text-xs font-bold transition cursor-pointer"
              title="Réinitialiser l'annuaire d'origine v20 (29 formateurs officiels)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-red-500" />
              <span className="hidden md:inline text-red-600">Réinit. Usine (29)</span>
            </button>
          )}
        </div>
      </div>

      {/* Floating feedback alert */}
      {actionFeedback && (
        <div
          className={`mb-4 p-3 rounded-lg text-xs font-bold flex items-center justify-between shadow-xs transition animate-in fade-in ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-300 text-emerald-800'
              : 'bg-red-50 border border-red-300 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionFeedback.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{actionFeedback.message}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-gray-400 hover:text-gray-700 p-0.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Formulaire d'ajout rapide (Visible EXCLUSIVEMENT pour le compte administrateur/responsable) */}
      {canManage && (
        <div className="bg-[#f9fafb] border border-[#e5e7eb] rounded-xl p-4 sm:p-5 mb-5 shadow-xs">
          <h3
            className="text-sm font-bold text-[#FD5312] uppercase tracking-wide mb-3"
            style={{ fontFamily: "'HelveticaNeue LT COM 65 MD', 'Helvetica Neue LT Com 65 Md', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}
          >
            Ajouter un nouveau formateur
          </h3>
          <form onSubmit={handleQuickAdd}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div>
                <label
                  className="block text-xs text-gray-700 mb-1"
                  style={{ fontFamily: "'HelveticaNeue LT COM 65 MD', 'Helvetica Neue LT Com 65 Md', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}
                >
                  Nom & Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newNom}
                  onChange={(e) => setNewNom(e.target.value)}
                  placeholder="Ex: Jean DUPONT"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:border-[#FD5312] focus:ring-2 focus:ring-[#FD5312]/20 outline-none transition"
                />
              </div>

              <div>
                <label
                  className="block text-xs text-gray-700 mb-1"
                  style={{ fontFamily: "'HelveticaNeue LT COM 65 MD', 'Helvetica Neue LT Com 65 Md', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}
                >
                  E-mail TPG
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="dupont.j@tpg.ch"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:border-[#FD5312] focus:ring-2 focus:ring-[#FD5312]/20 outline-none transition"
                />
              </div>

              <div>
                <label
                  className="block text-xs text-gray-700 mb-1"
                  style={{ fontFamily: "'HelveticaNeue LT COM 65 MD', 'Helvetica Neue LT Com 65 Md', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}
                >
                  Portable
                </label>
                <input
                  type="text"
                  value={newMobile}
                  onChange={(e) => setNewMobile(e.target.value)}
                  placeholder="+41 79 000 00 00"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:border-[#FD5312] focus:ring-2 focus:ring-[#FD5312]/20 outline-none transition font-mono"
                />
              </div>
            </div>

            {/* Choix des qualifications requises : Habilité Tram, Habilité AB, Habilité TB */}
            <div className="pt-2 border-t border-gray-200 mt-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs text-gray-700 uppercase">
                    Qualifications :
                  </span>

                  <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs text-gray-800 p-1.5 px-2 bg-white rounded-lg border border-gray-200 hover:border-orange-300 transition">
                    <input
                      type="checkbox"
                      checked={newHasTram}
                      onChange={(e) => setNewHasTram(e.target.checked)}
                      className="w-4 h-4 accent-[#FD5312] rounded cursor-pointer"
                    />
                    <span>Habilité Tram</span>
                    <TramLogoBadge />
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs text-gray-800 p-1.5 px-2 bg-white rounded-lg border border-gray-200 hover:border-sky-300 transition">
                    <input
                      type="checkbox"
                      checked={newHasAB}
                      onChange={(e) => setNewHasAB(e.target.checked)}
                      className="w-4 h-4 accent-[#008CBE] rounded cursor-pointer"
                    />
                    <span>Habilité AB</span>
                    <AbBadge />
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs text-gray-800 p-1.5 px-2 bg-white rounded-lg border border-gray-200 hover:border-emerald-300 transition">
                    <input
                      type="checkbox"
                      checked={newHasTB}
                      onChange={(e) => setNewHasTB(e.target.checked)}
                      className="w-4 h-4 accent-[#059669] rounded cursor-pointer"
                    />
                    <span>Habilité TB</span>
                    <TbBadge />
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs text-gray-800 p-1.5 px-2 bg-white rounded-lg border border-gray-200 hover:border-purple-300 transition">
                    <input
                      type="checkbox"
                      checked={newHasCTT}
                      onChange={(e) => setNewHasCTT(e.target.checked)}
                      className="w-4 h-4 accent-[#6D28D9] rounded cursor-pointer"
                    />
                    <span>Habilité CTT</span>
                    <CttBadge />
                  </label>

                  <div className="hidden lg:flex items-center gap-1 pl-2 text-xs text-gray-500">
                    <span className="text-gray-400">Aperçu :</span>
                    <FormateurVehicleLogos hasTram={newHasTram} hasAB={newHasAB} hasTB={newHasTB} hasCTT={newHasCTT} />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={quickAddSubmitting}
                  className="px-5 py-2.5 bg-[#FD5312] hover:bg-[#e04508] active:scale-95 text-white font-extrabold uppercase text-xs rounded-lg shadow-sm hover:shadow transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  style={{ fontFamily: "'HelveticaNeue LT COM 65 MD', 'Helvetica Neue LT Com 65 Md', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}
                >
                  <Plus className="w-4 h-4" />
                  <span>{quickAddSubmitting ? 'Ajout en cours...' : '+ AJOUTER À LA LISTE'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Barre de Recherche et Filtres */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 no-print">
        <div>
          <label
            className="block text-xs text-gray-700 mb-1"
            style={{ fontFamily: "'HelveticaNeue LT COM 65 MD', 'Helvetica Neue LT Com 65 Md', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}
          >
            Rechercher un formateur
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="searchAnnuaire"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nom, e-mail, mobile..."
              className="w-full pl-9 pr-14 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:border-[#FD5312] focus:ring-2 focus:ring-[#FD5312]/20 outline-none transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-gray-400 hover:text-gray-600 font-bold cursor-pointer"
              >
                Effacer
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col justify-end">
          <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 pb-1 gap-2">
            <span className="italic text-[12px] text-gray-500">
              Les modifications ou ajouts mettent à jour automatiquement l'application.
            </span>
            <div className="flex items-center gap-1.5 ml-auto flex-wrap">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-[#FD5312] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Tous ({formateurs.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('tram')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  filterType === 'tram'
                    ? 'bg-[#FD5312] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>Tram ({tramCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterType('ab')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  filterType === 'ab'
                    ? 'bg-[#008CBE] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>AB ({abCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterType('tb')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  filterType === 'tb'
                    ? 'bg-[#059669] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>TB ({tbCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterType('ctt')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  filterType === 'ctt'
                    ? 'bg-[#6D28D9] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>CTT ({cttCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1 text-gray-500 hover:text-gray-800 transition cursor-pointer"
                title={`Tri alphabétique (${sortOrder === 'asc' ? 'A à Z' : 'Z à A'})`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE VIEW (Exact design matching screenshot image_835315b1.png) */}
      <div className="w-full overflow-x-auto border border-gray-200 rounded-xl bg-white shadow-xs">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-200 text-xs font-bold text-gray-700">
              <th
                className="p-3.5"
                style={{ fontFamily: "'HelveticaNeue LT COM 65 MD', 'Helvetica Neue LT Com 65 Md', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}
              >
                Nom & Prénom
              </th>
              <th
                className="p-3.5"
                style={{ fontFamily: "'HelveticaNeue LT COM 65 MD', 'Helvetica Neue LT Com 65 Md', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}
              >
                Adresse E-mail TPG
              </th>
              <th
                className="p-3.5"
                style={{ fontFamily: "'HelveticaNeue LT COM 65 MD', 'Helvetica Neue LT Com 65 Md', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}
              >
                Numéro Portable
              </th>
              {canManage && (
                <th
                  className="p-3.5 no-print w-44 text-right"
                  style={{ fontFamily: "'HelveticaNeue LT COM 65 MD', 'Helvetica Neue LT Com 65 Md', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredFormateurs.length === 0 ? (
              <tr>
                <td colSpan={canManage ? 4 : 3} className="p-8 text-center text-gray-500 text-xs">
                  Aucun formateur trouvé pour « {searchQuery} ».
                </td>
              </tr>
            ) : (
              filteredFormateurs.map((f) => {
                const emailOk = validerEmail(f.email);
                const { estValide: mobileOk, formate: mobileFormate } = validerEtFormaterMobile(f.mobile || f.telephone);
                const isEditingThis = inlineEditingId === f.id;

                return (
                  <tr key={f.id} className="hover:bg-gray-50/90 transition">
                    {/* Nom & Prénom + Logos TRAM / AB/TB */}
                    <td className="p-3.5 font-semibold text-gray-900">
                      {isEditingThis ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editNom}
                            onChange={(e) => setEditNom(e.target.value)}
                            className="w-full p-2 border-2 border-[#FD5312] rounded-lg text-sm bg-white outline-none font-semibold"
                            placeholder="Nom & Prénom"
                            autoFocus
                          />
                          <div className="flex flex-wrap items-center gap-2.5 text-xs p-2 bg-gray-50 rounded-lg border border-gray-200">
                            <span className="text-gray-500 uppercase text-[11px]">Qualifications :</span>
                            <label className="flex items-center gap-1 cursor-pointer text-gray-700">
                              <input
                                type="checkbox"
                                checked={editHasTram}
                                onChange={(e) => setEditHasTram(e.target.checked)}
                                className="w-3.5 h-3.5 accent-[#FD5312] rounded cursor-pointer"
                              />
                              <span>Habilité Tram</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer text-gray-700">
                              <input
                                type="checkbox"
                                checked={editHasAB}
                                onChange={(e) => setEditHasAB(e.target.checked)}
                                className="w-3.5 h-3.5 accent-[#008CBE] rounded cursor-pointer"
                              />
                              <span>Habilité AB</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer text-gray-700">
                              <input
                                type="checkbox"
                                checked={editHasTB}
                                onChange={(e) => setEditHasTB(e.target.checked)}
                                className="w-3.5 h-3.5 accent-[#059669] rounded cursor-pointer"
                              />
                              <span>Habilité TB</span>
                            </label>
                            <label className="flex items-center gap-1 cursor-pointer text-gray-700">
                              <input
                                type="checkbox"
                                checked={editHasCTT}
                                onChange={(e) => setEditHasCTT(e.target.checked)}
                                className="w-3.5 h-3.5 accent-[#6D28D9] rounded cursor-pointer"
                              />
                              <span>Habilité CTT</span>
                            </label>
                            <span className="text-gray-300">|</span>
                            <div className="flex items-center gap-1">
                              <span className="text-gray-500 text-[11px]">Aperçu :</span>
                              <FormateurVehicleLogos hasTram={editHasTram} hasAB={editHasAB} hasTB={editHasTB} hasCTT={editHasCTT} />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedFormateur(f)}
                            className="text-left font-semibold text-gray-900 hover:text-[#FD5312] transition cursor-pointer"
                            title="Cliquer pour afficher la fiche complète"
                          >
                            {f.nomComplet}
                          </button>
                          {f.numeroAgent && (
                            <span className="text-[11px] text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200" title="Numéro d'agent TPG">
                              N° {f.numeroAgent}
                            </span>
                          )}

                          {/* Logos TPG selon qualifications */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <FormateurVehicleLogos
                              hasTram={f.hasTram}
                              hasAB={f.hasAB}
                              hasTB={f.hasTB}
                              hasCTT={f.hasCTT}
                              isTramway={f.isTramway}
                            />
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Adresse E-mail TPG + badge ✓ / ✗ */}
                    <td className="p-3.5 text-xs">
                      {isEditingThis ? (
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-[#FD5312]"
                          placeholder="e-mail@tpg.ch"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          {f.email ? (
                            <a
                              href={`mailto:${f.email}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                            >
                              {f.email}
                            </a>
                          ) : (
                            <span className="text-gray-400 italic">Non renseigné</span>
                          )}
                          <span
                            className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-black text-white shrink-0 ${
                              emailOk ? 'bg-[#16a34a]' : 'bg-[#dc2626]'
                            }`}
                            title={emailOk ? 'Adresse e-mail valide' : 'Format e-mail invalide'}
                          >
                            {emailOk ? '✓' : '✗'}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Numéro Portable + badge ✓ / ✗ */}
                    <td className="p-3.5 text-xs">
                      {isEditingThis ? (
                        <input
                          type="text"
                          value={editMobile}
                          onChange={(e) => setEditMobile(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-[#FD5312] font-mono"
                          placeholder="+41 79 000 00 00"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          {f.mobile || f.telephone ? (
                            <>
                              <a
                                href={`tel:${(f.mobile || f.telephone || '').replace(/\s+/g, '')}`}
                                className="text-blue-600 hover:text-blue-800 hover:underline font-medium font-mono"
                              >
                                {mobileFormate || f.mobile || f.telephone}
                              </a>
                              <span
                                className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-black text-white shrink-0 ${
                                  mobileOk ? 'bg-[#16a34a]' : 'bg-[#dc2626]'
                                }`}
                                title={mobileOk ? 'Numéro de mobile suisse valide' : 'Format invalide (attendu +41 7x)'}
                              >
                                {mobileOk ? '✓' : '✗'}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-gray-400 italic">Non renseigné</span>
                              <span
                                className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-bold text-gray-500 bg-gray-100 border border-gray-200 shrink-0"
                                title="Numéro de portable non attribué pour le moment"
                              >
                                En attente
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Actions (Accessible EXCLUSIVEMENT à l'administrateur / responsable) */}
                    {canManage && (
                      <td className="p-3.5 text-right no-print">
                        {isEditingThis ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              disabled={isSavingEdit}
                              onClick={() => saveInlineEdit(f.id)}
                              className="px-3 py-1.5 bg-[#16a34a] hover:bg-emerald-700 active:scale-95 text-white rounded text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-xs disabled:opacity-50"
                            >
                              {isSavingEdit ? '...' : 'Enregistrer'}
                            </button>
                            <button
                              type="button"
                              onClick={cancelInlineEdit}
                              className="px-2.5 py-1.5 bg-gray-400 hover:bg-gray-500 active:scale-95 text-white rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                            >
                              Annuler
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => startInlineEdit(f)}
                              className="px-3 py-1.5 bg-[#1d7ed2] hover:bg-[#186bb5] active:scale-95 text-white rounded text-[11px] font-black uppercase tracking-wider transition cursor-pointer shadow-xs"
                              title="Modifier ce formateur"
                            >
                              ÉDITER
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteCandidate(f)}
                              className="px-3 py-1.5 bg-[#dc2626] hover:bg-red-700 active:scale-95 text-white rounded text-[11px] font-black uppercase tracking-wider transition cursor-pointer shadow-xs"
                              title="Supprimer ce formateur"
                            >
                              SUPPR.
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal for Deletion */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="bg-red-600 p-4 text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-sm uppercase tracking-wide">
                Confirmation de suppression
              </h3>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-sm text-gray-700">
                Êtes-vous certain de vouloir supprimer le formateur suivant du portail ?
              </p>
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="font-black text-gray-900 text-base">{deleteCandidate.nomComplet}</div>
                <div className="text-xs text-gray-600 mt-1">E-mail : {deleteCandidate.email || 'Non renseigné'}</div>
                <div className="text-xs text-gray-600">Portable : {deleteCandidate.mobile || 'Non renseigné'}</div>
                <div className="mt-2 flex items-center gap-1.5">
                  <FormateurVehicleLogos
                    hasTram={deleteCandidate.hasTram}
                    hasAB={deleteCandidate.hasAB}
                    hasTB={deleteCandidate.hasTB}
                    hasCTT={deleteCandidate.hasCTT}
                    isTramway={deleteCandidate.isTramway}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Cette suppression mettra à jour instantanément la liste des formateurs ainsi que l'ensemble des 7 modules techniques.
              </p>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-black uppercase transition cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Suppression...' : 'Supprimer définitivement'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Resetting to Defaults */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="bg-[#FD5312] p-4 text-white flex items-center gap-2">
              <RotateCcw className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-sm uppercase tracking-wide">
                Réinitialisation aux données sources
              </h3>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-sm text-gray-700">
                Voulez-vous réinitialiser l’annuaire des formateurs à l'état strict du fichier source officiel ?
              </p>
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-950 space-y-1">
                <div>• Restaure les 29 formateurs certifiés</div>
                <div>• Restaure les 11 habilitations Tramway certifiées</div>
                <div>• Réassigne les e-mails et numéros de mobile d'origine</div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isResetting}
                onClick={confirmReset}
                className="px-4 py-2 bg-[#FD5312] hover:bg-[#e04508] text-white rounded-lg text-xs font-black uppercase transition cursor-pointer shadow-sm"
              >
                {isResetting ? 'Réinitialisation...' : 'Confirmer la réinitialisation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Individual Formateur Detail Modal */}
      {selectedFormateur && (
        <FormateurDetailModal
          formateur={selectedFormateur}
          onClose={() => setSelectedFormateur(null)}
          onEdit={() => {
            startInlineEdit(selectedFormateur);
            setSelectedFormateur(null);
          }}
          canEdit={canManage}
        />
      )}

      {/* Audit Sources Modal */}
      {auditModalOpen && (
        <AuditDiscrepanciesModal onClose={() => setAuditModalOpen(false)} />
      )}

      {/* Access & Passwords Guide Modal */}
      {accessGuideModalOpen && (
        <FormateursAccessGuideModal onClose={() => setAccessGuideModalOpen(false)} />
      )}
    </section>
  );
};
