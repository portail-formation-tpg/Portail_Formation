import React, { useState, useMemo } from 'react';
import { Formateur } from '../../types/formateur';
import { MailConfig } from '../../types/modules';
import { fmt, MERCI, mailTo } from '../../utils/tpgHelpers';
import { Printer, Mail, RotateCcw, AlertTriangle } from 'lucide-react';

interface Props {
  formateurs: Formateur[];
  mailConfig: MailConfig;
}

export const Module6Avarie: React.FC<Props> = ({ formateurs, mailConfig }) => {
  const [formateur, setFormateur] = useState<string>('');
  const [depot, setDepot] = useState<string>('');
  const [vehicule, setVehicule] = useState<string>('');
  const [date1, setDate1] = useState<string>('');
  const [date2, setDate2] = useState<string>('');
  const [remarques, setRemarques] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const previewText = useMemo(() => {
    const d1 = fmt(date1);
    const d2 = fmt(date2);
    const rem = remarques.trim() || 'Aucune';

    return (
      `Bonjour,\n\n` +
      `Annonce d'avarie :\n\n` +
      `• Formateur : ${formateur || '___'}\n` +
      `• Dépôt : ${depot || '___'}\n` +
      `• N° véhicule : ${vehicule || '___'}\n` +
      `• Dates : du ${d1} au ${d2}\n` +
      `• Remarques : ${rem}` +
      MERCI
    );
  }, [formateur, depot, vehicule, date1, date2, remarques]);

  const handleReset = () => {
    setFormateur('');
    setDepot('');
    setVehicule('');
    setDate1('');
    setDate2('');
    setRemarques('');
    setErrorMsg(null);
  };

  const handleSendMail = () => {
    if (!formateur || !depot || !vehicule.trim()) {
      setErrorMsg('Veuillez renseigner les champs obligatoires (*) Formateur, Dépôt et N° véhicule.');
      return;
    }
    setErrorMsg(null);

    let recipient = mailConfig.avarie_bachet;
    if (depot === 'En-Chardon') {
      recipient = mailConfig.avarie_chardon;
    } else if (depot === 'Jonction') {
      recipient = mailConfig.avarie_jonctab;
    }

    const subject = 'Annonce Avarie AB / TB';
    mailTo(recipient, subject, previewText);
  };

  return (
    <section className="p-4 sm:p-6" aria-label="6. Annonce Avarie AB / TB">
      <div className="border-l-4 border-[#FD5312] pl-3 mb-4">
        <h2 className="text-lg font-black uppercase text-[#FD5312] tracking-wide">
          6. Annonce Avarie AB / TB
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

        <div>
          <label className="block text-xs uppercase text-gray-700 mb-1">
            N° véhicule <span className="text-red-500 font-black">*</span>
          </label>
          <input
            type="text"
            value={vehicule}
            onChange={(e) => setVehicule(e.target.value)}
            placeholder="Ex: AB 123 / TB 456..."
            className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:border-[#FD5312] focus:ring-2 focus:ring-[#FD5312]/20 outline-none"
            required
          />
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
