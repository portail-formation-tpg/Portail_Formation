export const MERCI = "\n\nL'équipe formation vous remercie par avance pour votre collaboration et reste à votre disposition pour toute information complémentaire.\n\nCordialement,";

export function fmt(dateStr: string | undefined): string {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(String(dateStr))) return "___";
  const [y, m, d] = String(dateStr).split("-").map(Number);
  const candidate = new Date(Date.UTC(y, m - 1, d));
  if (
    candidate.getUTCFullYear() !== y ||
    candidate.getUTCMonth() !== m - 1 ||
    candidate.getUTCDate() !== d
  ) {
    return "___";
  }
  return `${String(d).padStart(2, "0")}.${String(m).padStart(2, "0")}.${y}`;
}

export function mailTo(recipient: string, subject: string, body: string, cc?: string, bcc?: string) {
  const CADRES_EMAIL = 'cadres.operationnels@tpg.ch';

  const parseList = (str: string | undefined): string[] => {
    if (!str) return [];
    return str
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const recList = parseList(recipient);
  const ccList = parseList(cc);
  const bccList = parseList(bcc);

  // Vérifier et extraire systématiquement cadres.operationnels@tpg.ch de To et Cc
  let cadresFound = false;

  const cleanRecList = recList.filter((email) => {
    if (email.toLowerCase().includes('cadres.operationnels')) {
      cadresFound = true;
      return false;
    }
    return true;
  });

  const cleanCcList = ccList.filter((email) => {
    if (email.toLowerCase().includes('cadres.operationnels')) {
      cadresFound = true;
      return false;
    }
    return true;
  });

  // Si présent ou demandé, s'assurer qu'il est UNIQUEMENT en Cci (bcc)
  if (cadresFound || bccList.some((e) => e.toLowerCase().includes('cadres.operationnels'))) {
    if (!bccList.some((e) => e.toLowerCase() === CADRES_EMAIL.toLowerCase())) {
      bccList.push(CADRES_EMAIL);
    }
  }

  const queryParts: string[] = [];
  if (cleanCcList.length > 0) {
    queryParts.push(`cc=${encodeURIComponent(cleanCcList.join(';'))}`);
  }
  if (bccList.length > 0) {
    queryParts.push(`bcc=${encodeURIComponent(bccList.join(';'))}`);
  }
  queryParts.push(`subject=${encodeURIComponent(subject)}`);
  queryParts.push(`body=${encodeURIComponent(body)}`);

  const primaryRecipient = cleanRecList.join(';');
  const link = `mailto:${primaryRecipient}?${queryParts.join('&')}`;

  try {
    window.location.href = link;
  } catch (err) {
    console.error('Erreur ouverture client mail :', err);
  }
}

export function validerEmail(email: string | undefined): boolean {
  if (!email) return false;
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(String(email).trim().toLowerCase());
}

export function validerEtFormaterMobile(mobile: string | undefined): { estValide: boolean; formate: string } {
  if (!mobile) return { estValide: false, formate: '' };
  let clean = String(mobile).replace(/[^\d+]/g, '');
  if (clean.startsWith('07')) {
    clean = '+41' + clean.substring(1);
  }
  const estValide = /^\+417[5-9]\d{7}$/.test(clean);
  let formate = clean;
  if (estValide && clean.length >= 12) {
    formate = `${clean.substring(0, 3)} ${clean.substring(3, 5)} ${clean.substring(5, 8)} ${clean.substring(8, 10)} ${clean.substring(10, 12)}`;
  }
  return { estValide, formate };
}
