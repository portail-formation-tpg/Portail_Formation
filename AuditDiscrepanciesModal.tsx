import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { DiscrepancyReport } from '../../types/formateur';
import { X, ShieldAlert, CheckCircle, FileText, Info } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const AuditDiscrepanciesModal: React.FC<Props> = ({ onClose }) => {
  const [report, setReport] = useState<DiscrepancyReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.formateurs.getAudit()
      .then((data) => setReport(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#111827] p-5 text-white flex justify-between items-start border-b-4 border-[#FD5312]">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#FD5312] text-white">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase font-sans tracking-tight">
                Audit de Conformité & Traçabilité des Sources
              </h2>
              <p className="text-xs text-gray-300 mt-0.5">
                Rapport de réconciliation strict entre Portail HTML TPG v18 et Liste PDF v7
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-2 border-[#FD5312] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : report ? (
            <>
              {/* Summary Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-center">
                  <div className="text-[11px] font-bold text-gray-500 uppercase">HTML v18 Total</div>
                  <div className="text-xl font-black text-[#FD5312]">30</div>
                </div>

                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-center">
                  <div className="text-[11px] font-bold text-gray-500 uppercase">PDF v7 Total</div>
                  <div className="text-xl font-black text-gray-800">29</div>
                </div>

                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-center">
                  <div className="text-[11px] font-bold text-gray-500 uppercase">Tramway / Rails</div>
                  <div className="text-xl font-black text-[#008CBE]">11 / 11</div>
                </div>

                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-center">
                  <div className="text-[11px] font-bold text-gray-500 uppercase">Acronymes Source</div>
                  <div className="text-xl font-black text-amber-600">0 (Vides)</div>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3">
                <div className="text-xs font-black uppercase text-gray-700 tracking-wider">
                  Détail des vérifications et arbitrages d'intégrité :
                </div>

                {report.items.map((item, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-black text-gray-900 text-xs uppercase flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#FD5312]" />
                        <span>{item.sujet}</span>
                      </div>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-orange-100 text-[#FD5312]">
                        {item.type}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed">
                      <strong>Observation :</strong> {item.detail}
                    </p>

                    <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Décision appliquée :</strong> {item.actionPrise}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-center py-6">Rapport indisponible.</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#FD5312] hover:bg-[#e04508] text-white font-black text-xs uppercase rounded-lg transition cursor-pointer"
          >
            Fermer le rapport
          </button>
        </div>
      </div>
    </div>
  );
};
