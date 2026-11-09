import React, { useState, useMemo } from 'react';
import { Formateur } from '../../types/formateur';
import { MailConfig } from '../../types/modules';
import { fmt, MERCI, mailTo } from '../../utils/tpgHelpers';
import { Printer, Mail, RotateCcw, AlertTriangle, Info } from 'lucide-react';

interface Props {
  formateurs: Formateur[];
  mailConfig: MailConfig;
}

const AUTOBUS_OPTIONS = [
  'AB Citaro',
  'ABA Citaro',
  'AB E-Bus',
  'ABA E-Bus',
  'ABAA E-Bus'
];
const TROLLEYBUS_OPTIONS = [
  'Hess TBA',
  'Hess TBAA',
  'ExquiCity'
];

export const Module4Abtb: React.FC<Props> = ({ formateurs, mailConfig }) => {
  const [formateur, setFormateur] = useState<string>('');
  const [depot, setDepot] = useState<string>('');
  const [date1, setDate1] = useState<string>('');
  const [date2, setDate2] = useState<string>('');
  const [selectedAb, setSelectedAb] = useState<string[]>([]);
  const [selectedTb, setSelectedTb] = useState<string[]>([]);
  const [motif, setMotif] = useState<string>('');
  const [remarques, setRemarques] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleAb = (v: string) => {
    setSelectedAb((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );
  };

  const toggleTb = (v: string) => {
    setSelectedTb((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );
  };

  const previewText = useMemo(() => {
    const d1 = fmt(date1);
    const d2 = fmt(date2);
    const rem = remarques.trim() || 'Aucune';

    const vehLines: string[] = [];
    if (selectedAb.length) vehLines.push(`Autobus : ${selectedAb.join(', ')}`);
    if (selectedTb.length) vehLines.push(`Trolleybus : ${selectedTb.join(', ')}`);
    const vehText = vehLines.length ? vehLines.join(' | ') : '___';

    return (
      `Bonjour,\n\n` +
      `Dans le cadre de nos besoins en formation, nous souhaiterions réserver un véhicule AB/TB au dépôt de ${depot || '___'} ` +
      `aux dates suivantes :\n\n` +
      `• Dates : du ${d1} au ${d2}\n` +
      `• Formateur : ${formateur || '___'}\n` +
      `• Véhicules : ${vehText}\n` +
      `• Motif : ${motif || 'Non précisé'}${motif ? ' (Réservation fin des voies 111 à 113 : 2 véhicules par voie)' : ''}\n` +
      `• Remarques : ${rem}` +
      MERCI
    );
  }, [formateur, depot, date1, date2, selectedAb, selectedTb, motif, remarques]);

  const handleReset = () => {
    setFormateur('');
    setDepot('');
    setDate1('');
    setDate2('');
    setSelectedAb([]);
    setSelectedTb([]);
    setMotif('');
    setRemarques('');
    setErrorMsg(null);
  };

  const handleSendMail = () => {
    if (!formateur || !depot) {
      setErrorMsg('Veuillez renseigner les champs obligatoires (*) Formateur et Dépôt.');
      return;
    }
    setErrorMsg(null);

    let recipient = '';
    const bcc = 'cadres.operationnels@tpg.ch';

    if (depot === 'Bachet') {
      recipient = mailConfig.abtb_bachet || 'Resp.equipesCMB2@tpg.ch,Equipes_Planification_CMB@tpg.ch';
    } else if (depot === 'En-Chardon') {
      recipient = mailConfig.abtb_chardon || 'Resp.equipesCMC@tpg.ch,Equipes_Planification_CMC@tpg.ch';
    } else if (depot === 'Jonction') {
      if (selectedTb.length > 0) {
        recipient = mailConfig.abtb_jonctiontb || 'Resp.equipesCMJ2@tpg.ch,Equipes_Planification_CMJ@tpg.ch';
      } else {
        recipient = mailConfig.abtb_jonctionab || 'Resp.equipesCMJ2@tpg.ch,Equipes_Planification_CMJ@tpg.ch';
      }
    }

    const subject = 'Réservation AB/TB';
    mailTo(recipient, subject, previewText, undefined, bcc);
  };

  return (
    <section className="p-4 sm:p-6" aria-label="4. Réservation AB/TB">
      <div className="border-l-4 border-[#FD5312] pl-3 mb-4">
        <h2 className="text-lg font-black uppercase text-[#FD5312] tracking-wide">
          4. Réservation AB/TB
        </h2>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs uppercase text-gray-700 mb-1">
            Formateur <span className="text-red-500 font-black">*</span>
          </label>
          <select
            value={formateur}
            onChange={(e) => setFormateur(e.target.value)}
            className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:border-[#FD5312] focus:ring-2 focus:ring-[#FD5312]/20 outline-none"
            required
          >
            <option value="">-- Formateur --</option>
            {formateurs.map((f) => {
              const tram = f.hasTram ?? f.isTramway;
              const ab = f.hasAB ?? true;
              const tb = f.hasTB ?? true;
              const ctt = f.hasCTT;
              const parts: string[] = [];
              if (tram) parts.push('TRAM');
              if (ab && tb) parts.push('AB/TB');
              else if (ab) parts.push('AB');
              else if (tb) parts.push('TB');
              if (ctt) parts.push('CTT');
              const badge = parts.length ? `(${parts.join(' + ')})` : '';

              return (
                <option key={f.id} value={f.nomComplet}>
                  {f.nomComplet} {badge}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block text-xs uppercase text-gray-700 mb-1">
            Dépôt <span className="text-red-500 font-black">*</span>
          </label>
          <select
            value={depot}
            onChange={(e) => setDepot(e.target.value)}
            className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:border-[#FD5312] focus:ring-2 focus:ring-[#FD5312]/20 outline-none"
            required
          >
            <option value="">-- Dépôt --</option>
            <option value="Bachet">Bachet</option>
            <option value="En-Chardon">En-Chardon</option>
            <option value="Jonction">Jonction</option>
          </select>
        </div>

        <div className="flex items-end pb-2">
          <div className="text-xs text-gray-500">
            Choisir Autobus / Trolleybus pour routage automatique
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
        <div>
          <label className="block text-xs uppercase text-gray-700 mb-1">Date début</label>
          <input
            type="date"
            value={date1}
            onChange={(e) => setDate1(e.target.value)}
            className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:border-[#FD5312] focus:ring-2 focus:ring-[#FD5312]/20 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs uppercase text-gray-700 mb-1">Date fin</label>
          <input
            type="date"
            value={date2}
            onChange={(e) => setDate2(e.target.value)}
            className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:border-[#FD5312] focus:ring-2 focus:ring-[#FD5312]/20 outline-none"
          />
        </div>
      </div>

      {/* Checkboxes Autobus */}
      <div className="mt-4">
        <div className="text-xs font-black uppercase text-gray-900 border-b border-gray-200 pb-1 mb-2 tracking-wider">
          AUTOBUS
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 bg-gray-50 border border-gray-200 rounded-xl">
          {AUTOBUS_OPTIONS.map((v) => (
            <label
              key={v}
              className="flex items-center gap-2.5 text-xs text-gray-800 cursor-pointer p-1.5 hover:bg-white rounded transition"
            >
              <input
                type="checkbox"
                checked={selectedAb.includes(v)}
                onChange={() => toggleAb(v)}
                className="w-4 h-4 accent-[#FD5312] rounded"
              />
              <span>{v}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Checkboxes Trolleybus */}
      <div className="mt-4">
        <div className="text-xs font-black uppercase text-gray-900 border-b border-gray-200 pb-1 mb-2 tracking-wider">
          TROLLEYBUS
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 bg-gray-50 border border-gray-200 rounded-xl">
          {TROLLEYBUS_OPTIONS.map((v) => (
            <label
              key={v}
              className="flex items-center gap-2.5 text-xs text-gray-800 cursor-pointer p-1.5 hover:bg-white rounded transition"
            >
              <input
                type="checkbox"
                checked={selectedTb.includes(v)}
                onChange={() => toggleTb(v)}
                className="w-4 h-4 accent-[#FD5312] rounded"
              />
              <span>{v}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Champ Motif (en dessous de Trolleybus) */}
      <div className="mt-4">
        <label className="block text-xs uppercase text-gray-700 mb-1">
          Motif
        </label>
        <select
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
          className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:border-[#FD5312] focus:ring-2 focus:ring-[#FD5312]/20 outline-none text-gray-800"
        >
          <option value="">-- Choisir un motif (optionnel) --</option>
          <option value="Examen de conduite OCVE">Examen de conduite OCVE</option>
          <option value="Exercice de parcage">Exercice de parcage</option>
        </select>
        {Boolean(motif) && (
          <div className="mt-2.5 p-3 bg-amber-50 border border-[#FD5312]/30 rounded-lg flex items-center gap-2.5 text-xs font-semibold text-gray-900 shadow-xs animate-in fade-in">
            <Info className="w-4 h-4 text-[#FD5312] shrink-0" />
            <span>Réservation fin des voies 111 à 113 (2 véhicules par voie)</span>
          </div>
        )}
      </div>

      <div className="mt-3">
        <label className="block text-xs uppercase text-gray-700 mb-1">Remarques</label>
        <textarea
          rows={3}
          value={remarques}
          onChange={(e) => setRemarques(e.target.value)}
          placeholder="Remarques..."
          className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:border-[#FD5312] focus:ring-2 focus:ring-[#FD5312]/20 outline-none"
        />
      </div>

      <div className="mt-4">
        <div className="text-xs font-black uppercase tracking-wider text-gray-600 mb-1">
          Aperçu du message formaté
        </div>
        <div className="p-4 bg-white border-2 border-[#FD5312] rounded-xl whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-900 shadow-sm min-h-[160px]">
          {previewText}
        </div>
        {depot && (
          <div className="mt-2 text-xs text-gray-600 flex flex-wrap items-center gap-x-4 gap-y-1 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
            <div>
              <span className="font-bold text-gray-700">Destinataire(s) :</span>{' '}
              <span className="font-mono text-gray-800">
                {depot === 'Bachet'
                  ? (mailConfig.abtb_bachet || 'Resp.equipesCMB2@tpg.ch,Equipes_Planification_CMB@tpg.ch')
                  : depot === 'En-Chardon'
                  ? (mailConfig.abtb_chardon || 'Resp.equipesCMC@tpg.ch,Equipes_Planification_CMC@tpg.ch')
                  : selectedTb.length > 0
                  ? (mailConfig.abtb_jonctiontb || 'Resp.equipesCMJ2@tpg.ch,Equipes_Planification_CMJ@tpg.ch')
                  : (mailConfig.abtb_jonctionab || 'Resp.equipesCMJ2@tpg.ch,Equipes_Planification_CMJ@tpg.ch')}
              </span>
            </div>
            <div>
              <span className="font-bold text-gray-700">Cci :</span>{' '}
              <span className="font-mono text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200 font-semibold">cadres.operationnels@tpg.ch</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2.5 mt-4 no-print">
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#8C8C8E] hover:bg-gray-600 active:scale-95 text-white font-black uppercase text-xs rounded-lg transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Vider</span>
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#008CBE] hover:bg-blue-600 active:scale-95 text-white font-black uppercase text-xs rounded-lg transition cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Imprimer</span>
        </button>

        <button
          type="button"
          onClick={handleSendMail}
          className="flex-1 min-w-[200px] flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#FD5312] hover:bg-[#e04508] active:scale-95 text-white font-black uppercase text-xs rounded-lg shadow-sm transition cursor-pointer"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Générer le mail</span>
        </button>
      </div>
    </section>
  );
};
