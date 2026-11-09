import { Formateur } from '../types/formateur';

const STORAGE_KEY_FORMATEURS = 'tpg_formateurs_v21';
const STORAGE_KEY_CUSTOM = 'tpg_custom_formateurs_v21';

export const DEFAULT_OFFICIAL_FORMATEURS: Formateur[] = [
  { id: "1", numeroAgent: "53605", prenom: "Abdel Aziz", nom: "AGGOUNE", nomComplet: "Abdel Aziz AGGOUNE", email: "aggoune.abdel@tpg.ch", mobile: "+41 79 428 77 51", acronyme: "AGGO", isTramway: false, isRailsGlissants: false, hasAB: true, hasTB: true, hasTram: false, hasCTT: false, dateAjout: "2026-03-01", sourceOrigin: "source_pdf_v7" },
  { id: "2", numeroAgent: "54468", prenom: "Ailton Junior", nom: "DOS SANTOS", nomComplet: "Ailton Junior DOS SANTOS", email: "dossantos.ailton@tpg.ch", mobile: "", acronyme: "DOSS", isTramway: false, isRailsGlissants: false, hasAB: true, hasTB: true, hasTram: false, hasCTT: false, dateAjout: "2026-03-01", sourceOrigin: "source_pdf_v7" },
  { id: "3", numeroAgent: "54352", prenom: "Angelo", nom: "CEPEDA", nomComplet: "Angelo CEPEDA", email: "cepeda.angelo@tpg.ch", mobile: "+41 79 738 13 42", acronyme: "CEPE", isTramway: true, isRailsGlissants: false, hasAB: true, hasTB: true, hasTram: true, hasCTT: false, dateAjout: "2026-03-01", sourceOrigin: "source_pdf_v7" },
  { id: "4", numeroAgent: "52886", prenom: "Angelino", nom: "RIBEIRO MONTEIRO", nomComplet: "Angelino RIBEIRO MONTEIRO", email: "ribeiro.angelino@tpg.ch", mobile: "+41 79 351 88 84", acronyme: "RIBE", isTramway: false, isRailsGlissants: false, hasAB: true, hasTB: true, hasTram: false, hasCTT: false, dateAjout: "2026-03-01", sourceOrigin: "source_pdf_v7" },
  { id: "5", numeroAgent: "53104", prenom: "Anis", nom: "MENSI", nomComplet: "Anis MENSI", email: "mensi.anis@tpg.ch", mobile: "+41 79 153 29 94", acronyme: "MENS", isTramway: false, isRailsGlissants: false, hasAB: true, hasTB: true, hasTram: false, hasCTT: false, dateAjout: "2026-03-01", sourceOrigin: "source_pdf_v7" },
  { id: "6", numeroAgent: "50892", prenom: "Arvid", nom: "LEPPIN", nomComplet: "Arvid LEPPIN", email: "leppin.arvid@tpg.ch", mobile: "+41 79 443 12 07", acronyme: "LEPP", isTramway: false, isRailsGlissants: false, hasAB: true, hasTB: true, hasTram: false, hasCTT: false, dateAjout: "2026-03-01", sourceOrigin: "source_pdf_v7" },
  { id: "7", numeroAgent: "53698", prenom: "Astrid", nom: "ANNEN", nomComplet: "Astrid ANNEN", email: "annen.astrid@tpg.ch", mobile: "", acronyme: "ANNE", isTramway: false, isRailsGlissants: false, hasAB: true, hasTB: true, hasTram: false, hasCTT: false, dateAjout: "2026-03-01", sourceOrigin: "source_pdf_v7" },
  { id: "8", numeroAgent: "53514", prenom: "Benoît", nom: "THEVENIN", nomComplet: "Benoît THEVENIN", email: "thevenin.benoit@tpg.ch", mobile: "+41 79 339 86 85", acronyme: "THEV", isTramway: false, isRailsGlissants: false, hasAB: true, hasTB: true, hasTram: false, hasCTT: false, dateAjout: "2026-03-01", sourceOrigin: "source_pdf_v7" },
  { id: "9", numeroAgent: "51236", prenom: "Bruno", nom: "CIMAROSSA", nomComplet: "Bruno CIMAROSSA", email: "cimarossa.bruno@tpg.ch", mobile: "+41 79 827 41 36", acronyme: "CIMA", isTramway: false, isRailsGlissants: false, hasAB: true, hasTB: true, hasTram: false, hasCTT: false, dateAjout: "2026-03-01", sourceOrigin: "source_pdf_v7" },
  { id: "10", numeroAgent: "53446", prenom: "Carlos", nom: "MARTINS", nomComplet: "Carlos MARTINS", email: "martins.carlos@tpg.ch", mobile: "+41 79 351 17 66", acronyme: "MART", isTramway: false, isRailsGlissants: false, hasAB: true, hasTB: true, hasTram: false, hasCTT: false, dateAjout: "2026-03-01", sourceOrigin: "source_pdf_v7" },
  { id: "11", numeroAgent: "50984", prenom: "Christian", nom: "NOVERRAZ", nomComplet: "Christian NOVERRAZ", email: "noverraz.christian@tpg.ch", mobile: "+41 79 600 01 87", acronyme: "NOVE", isTramway: true, isRailsGlissants: false, hasAB: true, hasTB: true, hasTram: true, hasCTT: false, dateAjout: "2026-03-01", sourceOrigin: "source_pdf_v7" },
  { id: "12", numeroAgent: "53702", prenom: "David", nom: "ABELLANEDA", nomComplet: "David ABELLANEDA", email: "abellaneda.david@tpg.ch", mobile: "", acronyme: "ABEL", isTramway: false, isRailsGlissants: false, hasAB: true, hasTB: true, hasTram: false, hasCTT: false, dateAjout: "2026-03-01", sourceOrigin: "source_pdf_v7" },
  { id: "13", numeroAgent: "51954", prenom: "Fabio", nom: "ALEMANNO", nomComplet: "Fabio ALEMANNO", email: "alemanno.fabio@tpg.ch", mobile: "+41 79 598 24 87", acronyme: "ALEM", isTramway: true, isRailsGlissants: false, hasAB: true, hasTB: true, hasTram: true, hasCTT: false, dateAjout: "2026-03-01", sourceOrigin: "source_pdf_v7" },
  { id: "14", numeroAgent: "54066", prenom: "Fitim", nom: "ISENI", nomComplet: "Fitim ISENI", email: "iseni.fitim@tpg.ch", mobile: "", acronyme: "ISEN", isTramway: false, isRailsGlissants: false, hasAB: true, hasTB: true, hasTram: false, hasCTT: false, dateAjout: "2026-03-01", sourceOrigin: "source_pdf_v7" },
  { id: "15", numeroAgent: "51642", prenom: "Gianpiero", nom: "SEBASTIANELLI", nomComplet: "Gianpiero SEBASTIANELLI", email: "sebastianelli.gianpiero@tpg.ch", mobile: "", acronyme: "SEBA", isTramway: true, isRailsGlissants: false, hasAB: true, hasTB: true, hasTram: true, hasCTT: false, dateAjout: "2026-03-01", sourceOrigin: "source_pdf_v7" },
  { id: "16", numeroAgent: "53000", prenom: "Gregory", nom: "DESPRES", nomComplet: "Gregory DESPRES", email: "despres.gregory@tpg.ch", mobile: "+41 79 694 60 43", acronyme: "DESP", isTramway: false, isRailsGlissants: false, hasAB: true, hasTB: true, hasTram: false, hasCTT: false, dateAjout: "2026-03-01", sourceOrigin: "source_pdf_v7" },
  { id: "17", numeroAgent: "51372", prenom: "Jacques", nom: "KRIEG", nomComplet: "Jacques KRIEG", email: "krieg.jacques@tpg.ch", mobile: "+41 79 827 39 61", acronyme: "KRIE", isTramway: false, isRailsGlissants: false, hasAB: true, hasTB: true, hasTram: false, hasCTT: false, dateAjout: "2026-03-01", sourceOrigin: "source_pdf_v7" },
  { id: "18", numeroAgent: "50784", prenom: "James", nom: "SCOTTON", nomComplet: "James SCOTTON", email: "scotton.james@tpg.ch", mobile: "+41 79 827 30 69", acronyme: "SCOT", isTramway: true, isRailsGlissants: false, hasAB: true, hasTB: true, hasTram: true, hasCTT: false, dateAjout: "2026-03-01", sourceOrigin: "source_pdf_v7" },
  { id: "19", numeroAgent: "54595", prenom: "Jérôme", nom: "CHESSEL", nomComplet: "Jérôme CHESSEL", email: "chessel.jerome@tpg.ch", mobile: "+41 79 839 59 16", acronyme: "CHES", isTramway: true, isRailsGlissants: false, hasAB: true, hasTB: true, hasTram: true, hasCTT: false, dateAjout: "2026-03-01", sourceOrigin: "source_pdf_v7" },
  { id: "20", numeroAgent: "53745", prenom: "Joseph", nom: "FOTI", nomComplet: "Joseph FOTI", email: "foti.joseph@tpg.ch", mobile: "+41 76 679 04 35", acronyme: "FOTI", isTramway: false, isRailsGlissants: false, hasAB: true, hasTB: true, hasTram: false, hasCTT: false, dateAjout: "2026-03-01", sourceOrigin: "source_pdf_v7" },
  { id: "21", numeroAgent: "51444", prenom: "José", nom: "MARTIN", nomComplet: "José MARTIN", email: "martin.jose@tpg.ch", mobile: "+41 79 724 59 92", acronyme: "MART", isTramway: true, isRailsGlissants: false, hasAB: true, hasTB: true, hasTram: true, hasCTT: false, dateAjout: "2026-03-01", sourceOrigin: "source_pdf_v7" },
  { id: "22", numeroAgent: "53466", prenom: "José Manuel", nom: "MOREIRA", nomComplet: "José Manuel MOREIRA", email: "moreira.jose@tpg.ch", mobile: "+41 79 694 52 84", acronyme: "MORE", isTramway: false, isRailsGlissants: false, hasAB: true, hasTB: true, hasTram: false, hasCTT: false, dateAjout: "2026-03-01", sourceOrigin: "source_pdf_v7" },
  { id: "23", numeroAgent: "50975", prenom: "José-Antonio", nom: "PEREZ", nomComplet: "José-Antonio PEREZ", email: "perez.jose-antonio@tpg.ch", mobile: "+41 79 600 11 94", acronyme: "PERE", isTramway: true, isRailsGlissants: false, hasAB: true, hasTB: true, hasTram: true, hasCTT: false, dateAjout: "2026-03-01", sourceOrigin: "source_pdf_v7" },
  { id: "24", numeroAgent: "54086", prenom: "Luis Fernando", nom: "GARCIA DAZA", nomComplet: "Luis Fernando GARCIA DAZA", email: "garcia.fernando@tpg.ch", mobile: "", acronyme: "GARC", isTramway: true, isRailsGlissants: false, hasAB: true, hasTB: true, hasTram: true, hasCTT: false, dateAjout: "2026-03-01", sourceOrigin: "source_pdf_v7" },
  { id: "25", numeroAgent: "51401", prenom: "Mariano", nom: "DINACCI", nomComplet: "Mariano DINACCI", email: "dinacci.mariano@tpg.ch", mobile: "+41 79 248 09 46", acronyme: "DINA", isTramway: false, isRailsGlissants: false, hasAB: true, hasTB: true, hasTram: false, hasCTT: false, dateAjout: "2026-03-01", sourceOrigin: "source_pdf_v7" },
  { id: "26", numeroAgent: "53729", prenom: "Philippe", nom: "MOSER", nomComplet: "Philippe MOSER", email: "moser.philippe@tpg.ch", mobile: "+41 79 865 59 84", acronyme: "MOSE", isTramway: false, isRailsGlissants: false, hasAB: true, hasTB: true, hasTram: false, hasCTT: false, dateAjout: "2026-03-01", sourceOrigin: "source_pdf_v7" },
  { id: "27", numeroAgent: "53189", prenom: "Raffaele", nom: "CAIOLA", nomComplet: "Raffaele CAIOLA", email: "caiola.raffaele@tpg.ch", mobile: "+41 79 748 55 60", acronyme: "CAIO", isTramway: true, isRailsGlissants: false, hasAB: true, hasTB: true, hasTram: true, hasCTT: false, dateAjout: "2026-03-01", sourceOrigin: "source_pdf_v7" },
  { id: "28", numeroAgent: "55208", prenom: "Sami", nom: "ESSEBBANI", nomComplet: "Sami ESSEBBANI", email: "essebbani.sami@tpg.ch", mobile: "", acronyme: "ESSE", isTramway: true, isRailsGlissants: false, hasAB: true, hasTB: true, hasTram: true, hasCTT: false, dateAjout: "2026-03-01", sourceOrigin: "source_pdf_v7" },
  { id: "29", numeroAgent: "53582", prenom: "Stanislas", nom: "RUCKEBUSCH", nomComplet: "Stanislas RUCKEBUSCH", email: "ruckebusch.stanislas@tpg.ch", mobile: "+41 79 155 97 75", acronyme: "RUCK", isTramway: false, isRailsGlissants: false, hasAB: true, hasTB: true, hasTram: false, hasCTT: false, dateAjout: "2026-03-01", sourceOrigin: "source_pdf_v7" }
];

export const storage = {
  getFormateurs(): Formateur[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_FORMATEURS);
      const customs = this.getCustomFormateurs();

      let baseList: Formateur[] = [];
      if (data) {
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed) && parsed.length > 0) {
            baseList = parsed;
          }
        } catch {}
      }

      if (baseList.length === 0) {
        baseList = [...DEFAULT_OFFICIAL_FORMATEURS];
      }

      // Fusionner systématiquement tous les formateurs personnalisés
      for (const c of customs) {
        if (!baseList.some(f => String(f.id) === String(c.id) || f.nomComplet.trim().toLowerCase() === c.nomComplet.trim().toLowerCase())) {
          baseList.push(c);
        }
      }

      return baseList.filter(f => !f.nomComplet?.toLowerCase().includes('de sabato'));
    } catch (e) {
      console.warn('Erreur lecture localStorage formateurs:', e);
      return DEFAULT_OFFICIAL_FORMATEURS;
    }
  },

  saveFormateurs(list: Formateur[]): void {
    try {
      const filtered = list.filter(f => !f.nomComplet?.toLowerCase().includes('de sabato'));
      localStorage.setItem(STORAGE_KEY_FORMATEURS, JSON.stringify(filtered));

      // Conserver et fusionner tous les formateurs personnalisés pour ne JAMAIS les effacer
      const existingCustoms = this.getCustomFormateurs();
      const customMap = new Map<string, Formateur>();
      for (const ec of existingCustoms) {
        customMap.set(String(ec.id), ec);
      }

      for (const f of filtered) {
        const isOfficial = DEFAULT_OFFICIAL_FORMATEURS.some(
          o => String(o.id) === String(f.id) && o.nomComplet.trim().toLowerCase() === f.nomComplet.trim().toLowerCase()
        );
        if (!isOfficial || f.sourceOrigin === 'manuel' || Number(f.id) > 29) {
          customMap.set(String(f.id), f);
        }
      }

      localStorage.setItem(STORAGE_KEY_CUSTOM, JSON.stringify(Array.from(customMap.values())));
    } catch (e) {
      console.warn('Erreur sauvegarde localStorage formateurs:', e);
    }
  },

  getCustomFormateurs(): Formateur[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_CUSTOM);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  },

  addOrUpdateCustomFormateur(formateur: Formateur): void {
    try {
      const customs = this.getCustomFormateurs();
      const idx = customs.findIndex(c => String(c.id) === String(formateur.id));
      if (idx !== -1) {
        customs[idx] = formateur;
      } else {
        customs.push(formateur);
      }
      localStorage.setItem(STORAGE_KEY_CUSTOM, JSON.stringify(customs));

      const all = this.getFormateurs();
      const allIdx = all.findIndex(f => String(f.id) === String(formateur.id));
      if (allIdx !== -1) {
        all[allIdx] = formateur;
      } else {
        all.push(formateur);
      }
      localStorage.setItem(STORAGE_KEY_FORMATEURS, JSON.stringify(all));
    } catch (e) {
      console.warn('Erreur addOrUpdateCustomFormateur:', e);
    }
  },

  deleteCustomFormateur(id: string): void {
    try {
      const customs = this.getCustomFormateurs().filter(c => String(c.id) !== String(id));
      localStorage.setItem(STORAGE_KEY_CUSTOM, JSON.stringify(customs));

      const all = this.getFormateurs().filter(f => String(f.id) !== String(id));
      localStorage.setItem(STORAGE_KEY_FORMATEURS, JSON.stringify(all));
    } catch (e) {
      console.warn('Erreur deleteCustomFormateur:', e);
    }
  },

  clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_FORMATEURS);
      localStorage.removeItem(STORAGE_KEY_CUSTOM);
    } catch (e) {
      console.warn('Erreur clearAll:', e);
    }
  }
};
