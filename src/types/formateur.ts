export interface Formateur {
  id: string;
  numeroAgent?: string;
  prenom: string;
  nom: string;
  nomComplet: string;
  acronyme: string;
  isTramway: boolean;
  hasTram?: boolean;
  hasAB?: boolean;
  hasTB?: boolean;
  hasCTT?: boolean;
  isRailsGlissants: boolean;
  email: string;
  mobile: string;
  telephone?: string;
  notes?: string;
  dateAjout?: string;
  sourceOrigin: 'source_html_v20' | 'source_html_v18' | 'source_pdf_v7' | 'manuel';
}

export interface DiscrepancyReport {
  title: string;
  description: string;
  items: {
    type: 'difference_nom' | 'absent_html' | 'absent_pdf' | 'acronyme_manquant' | 'option_tb_manquante';
    sujet: string;
    detail: string;
    actionPrise: string;
  }[];
}
