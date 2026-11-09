import React from 'react';

/**
 * TPG Official-styled vehicle badges
 * - TRAM: Tramway certified badge with tram silhouette & pantograph (#FD5312)
 * - AB/TB: Autobus / Trolleybus certified badge (#008CBE)
 * - AB: Autobus certified badge (#008CBE)
 * - TB: Trolleybus certified badge with overhead pantograph poles (#059669)
 */

export const TramLogoBadge: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span
    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#FD5312] text-white font-black text-[10.5px] tracking-wide uppercase shadow-xs border border-orange-700/20 select-none shrink-0 ${className}`}
    title="Habilité TRAM (Tramway)"
  >
    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      {/* Tramway silhouette with roof pantograph */}
      <path d="M11 1.5h2v2h-2zM9 3.5h6v1.5H9zM7 6h10a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-1v1.5a1 1 0 0 1-2 0V19h-4v1.5a1 1 0 0 1-2 0V19H7a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zm0 2v4.5h10V8H7zm1 6.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm8 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
    </svg>
    <span>TRAM</span>
  </span>
);

export const AbtbLogoBadge: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span
    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#008CBE] text-white font-black text-[10.5px] tracking-wide uppercase shadow-xs border border-sky-700/20 select-none shrink-0 ${className}`}
    title="Habilité AB/TB (Autobus & Trolleybus)"
  >
    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      {/* Autobus / Trolleybus silhouette */}
      <path d="M4 16c0 .88.39 1.67 1 2.22V20a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h8v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm9 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM5 11V6c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v5H5z" />
    </svg>
    <span>AB/TB</span>
  </span>
);

export const AbBadge: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span
    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#008CBE] text-white font-black text-[10.5px] tracking-wide uppercase shadow-xs border border-sky-700/20 select-none shrink-0 ${className}`}
    title="Habilité AB (Autobus)"
  >
    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4 16c0 .88.39 1.67 1 2.22V20a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h8v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm9 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM5 11V6c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v5H5z" />
    </svg>
    <span>AB</span>
  </span>
);

export const TbBadge: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span
    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#059669] text-white font-black text-[10.5px] tracking-wide uppercase shadow-xs border border-emerald-700/20 select-none shrink-0 ${className}`}
    title="Habilité TB (Trolleybus)"
  >
    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      {/* Trolleybus silhouette with dual overhead poles */}
      <path d="M8 1l3 4h2l3-4h1.5L14 5.5h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-1v1.5a1 1 0 0 1-2 0V18.5h-4v1.5a1 1 0 0 1-2 0V18.5H7a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h3L6.5 1H8zm-1 6.5v4h10v-4H7zm1 6a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm8 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
    </svg>
    <span>TB</span>
  </span>
);

export const CttBadge: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span
    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#6D28D9] text-white font-black text-[10.5px] tracking-wide uppercase shadow-xs border border-purple-900/20 select-none shrink-0 ${className}`}
    title="Habilité CTT"
  >
    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="3" width="16" height="15" rx="2" fill="currentColor" fillOpacity="0.2" />
      <path d="M4 11h16" />
      <path d="M12 3v8" />
      <circle cx="8" cy="15" r="1.5" fill="currentColor" />
      <circle cx="16" cy="15" r="1.5" fill="currentColor" />
      <path d="M7 21l2-3" />
      <path d="M17 21l-2-3" />
    </svg>
    <span>CTT</span>
  </span>
);

export const FormateurVehicleLogos: React.FC<{
  hasTram?: boolean;
  hasAB?: boolean;
  hasTB?: boolean;
  hasCTT?: boolean;
  isTramway?: boolean;
  className?: string;
}> = ({ hasTram, hasAB, hasTB, hasCTT, isTramway, className = '' }) => {
  const tram = hasTram !== undefined ? hasTram : Boolean(isTramway);
  const ab = hasAB !== undefined ? hasAB : true;
  const tb = hasTB !== undefined ? hasTB : true;
  const ctt = Boolean(hasCTT);

  return (
    <div className={`inline-flex items-center gap-1.5 flex-wrap ${className}`}>
      {tram && <TramLogoBadge />}
      {ab && tb && <AbtbLogoBadge />}
      {ab && !tb && <AbBadge />}
      {!ab && tb && <TbBadge />}
      {ctt && <CttBadge />}
      {!tram && !ab && !tb && !ctt && (
        <span className="text-[10px] text-gray-400 italic font-semibold">Non habilité</span>
      )}
    </div>
  );
};
