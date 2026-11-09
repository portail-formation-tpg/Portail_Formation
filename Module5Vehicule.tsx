import React, { useState, useMemo } from 'react';
import { Formateur } from '../../types/formateur';
import { MailConfig } from '../../types/modules';
import { fmt, MERCI, mailTo } from '../../utils/tpgHelpers';
import { Printer, Mail, RotateCcw, AlertTriangle } from 'lucide-react';

interface Props {
  formateurs: Formateur[];
  mailConfig: MailConfig;
  vtbOptions?: string[];
}

const VEHICULE_LEGER_OPTIONS = [
  '3001 - Citroën Space Tourer',
  '3002 - Citroën Space Tourer',
  '1070 - Mercedes Vito'
];

const AUTOBUS_OPTIONS = [
  'AB 535',
  'AB 536',
  'AB 537',
  'AB 538',
  'AB 539',
  'AB 540',
  'AB 541',
  'AB 542'
];

const TROLLEYBUS_OPTIONS_V20 = [
  'TB 760',
  'TB 766',
  'TB 1636'
];

export const Module5Vehicule: React.FC<Props> = ({ formateurs, mailConfig, vtbOptions }) => {
  const [formateur, setFormateur] = useState<string>('');
  const [date1, setDate1] = useState<string>('');
  const [date2, setDate2] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string[]>([]);
  const [selectedAb, setSelectedAb] = useState<string[]>([]);
  const [selectedTb, setSelectedTb] = useState<string[]>([]);
  const [remarques, setRemarques] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const tbOptionsToDisplay = (vtbOptions && vtbOptions.length > 0) ? vtbOptions : TROLLEYBUS_OPTIONS_V20;

  const toggleItem = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, val: string) => {
    setList((prev) => (prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]));
  };

  const previewText = useMemo(() => {
    const d1 = fmt(date1);
    const d2 = fmt(date2);
    const rem = remarques.trim() || 'Aucune';

    const categories: string[] = [];
    if (selectedService.length) categories.push(`Véhicule léger : ${selectedService.join(', ')}`);
    if (selectedAb.length) categories.push(`Autobus : ${selectedAb.join(', ')}`);
    if (selectedTb.length) categories.push(`Trolleybus : ${selectedTb.join(', ')}`);

    const vehText = categories.length ? categories.join(' | ') : '___';

    return (
      `Bonjour,\n\n` +
      `Annonce d'avarie :\n\n` +
      `• Formateur : ${formateur || '___'}\n` +
      `• Véhicules : ${vehText}\n` +
      `• Dates : du ${d1} au ${d2}\n` +
      `• Remarques : ${rem}` +
      MERCI
    );
  }, [formateur, date1, date2, selectedService, selectedAb, selectedTb, remarques]);

  const handleReset = () => {
    setFormateur('');
    setDate1('');
    setDate2('');
    setSelectedService([]);
    setSelectedAb([]);
    setSelectedTb([]);
    setRemarques('');
    setErrorMsg(null);
  };

  const handleSendMail = () => {
    if (!formateur) {
      setErrorMsg('Veuillez renseigner le champ obligatoire Formateur (*).');
      return;
    }

    const recipients: string[] = [];
    if (selectedService.length > 0 && mailConfig.vehicule_leger) {
      recipients.push(mailConfig.vehicule_leger);
    }
    if ((selectedAb.length > 0 || selectedTb.length > 0) && mailConfig.vehicule_abtb) {
      recipients.push(mailConfig.vehicule_abtb);
    }

    if (recipients.length === 0) {
      setErrorMsg('Veuillez sélectionner au moins une catégorie de véhicule.');
      return;
    }
    setErrorMsg(null);

    const subject = 'Avarie véhicule de service';
    mailTo(recipients.join(','), subject, previewText);
  };

  return (
    <section className="p-4 sm:p-6" aria-label="5. Avarie Véhicule de Service">
      <div className="border-l-4 border-[#FD5312] pl-3 mb-4">
        <h2 className="text-lg font-black uppercase text-[#FD5312] tracking-wide">
          5. Avarie Véhicule de Service
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
            {formateurs.map((f) => (
              <option key={f.id} value={f.nomComplet}>
                {f.nomComplet}
              </option>
            ))}
          </select>
        </div>

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

      {/* Section Véhicule Léger */}
      <div className="mt-4">
        <div className="text-xs font-black uppercase text-gray-900 border-b border-gray-200 pb-1 mb-2 tracking-wider">
          Véhicule léger
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 bg-gray-50 border border-gray-200 rounded-xl">
          {VEHICULE_LEGER_OPTIONS.map((v) => (
            <label
              key={v}
              className="flex items-center gap-2.5 text-xs text-gray-800 cursor-pointer p-1.5 hover:bg-white rounded transition"
            >
              <input
                type="checkbox"
                checked={selectedService.includes(v)}
                onChange={() => toggleItem(selectedService, setSelectedService, v)}
                className="w-4 h-4 accent-[#FD5312] rounded"
              />
              <span>{v}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Section Autobus */}
      <div className="mt-4">
        <div className="text-xs font-black uppercase text-gray-900 border-b border-gray-200 pb-1 mb-2 tracking-wider">
          Autobus
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-gray-50 border border-gray-200 rounded-xl">
          {AUTOBUS_OPTIONS.map((v) => (
            <label
              key={v}
              className="flex items-center gap-2.5 text-xs text-gray-800 cursor-pointer p-1.5 hover:bg-white rounded transition"
            >
              <input
                type="checkbox"
                checked={selectedAb.includes(v)}
                onChange={() => toggleItem(selectedAb, setSelectedAb, v)}
                className="w-4 h-4 accent-[#FD5312] rounded"
              />
              <span>{v}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Section Trolleybus (v20) */}
      <div className="mt-4">
        <div className="text-xs font-black uppercase text-gray-900 border-b border-gray-200 pb-1 mb-2 tracking-wider">
          Trolleybus
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 bg-gray-50 border border-gray-200 rounded-xl">
          {tbOptionsToDisplay.map((v) => (
            <label
              key={v}
              className="flex items-center gap-2.5 text-xs text-gray-800 cursor-pointer p-1.5 hover:bg-white rounded transition"
            >
              <input
                type="checkbox"
                checked={selectedTb.includes(v)}
                onChange={() => toggleItem(selectedTb, setSelectedTb, v)}
                className="w-4 h-4 accent-[#FD5312] rounded"
              />
              <span>{v}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-3">
        <label className="block text-xs uppercase text-gray-700 mb-1">Remarques</label>
        <textarea
          rows={2}
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
