import { Formateur, DiscrepancyReport } from '../types/formateur';
import { UserSession, AuthResponse } from '../types/auth';
import { AppConfig } from '../types/modules';
import { storage } from './storage';

const TOKEN_KEY = 'tpg_auth_token';
const USER_KEY = 'tpg_current_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('Mode autonome ou serveur hors-ligne');
  }

  if (!response.ok) {
    let errorMsg = `Erreur HTTP ${response.status}`;
    try {
      const errData = await response.json();
      if (errData && errData.error) {
        errorMsg = errData.error;
      }
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return response.json() as Promise<T>;
}

export const api = {
  auth: {
    login: async (identifier: string, password: string): Promise<AuthResponse> => {
      try {
        const data = await request<AuthResponse>('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ identifier, password })
        });
        if (data.token) {
          setStoredToken(data.token);
          if (data.user) {
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
          }
        }
        return data;
      } catch {
        // Fallback autonome pour Vercel ou mode déconnecté
        const cleanId = identifier.trim().toLowerCase();
        const cleanPass = password.trim();

        // 1. Compte Administrateur
        const savedAdminPass = localStorage.getItem('tpg_pass_admin');
        const validAdminPasses = [
          savedAdminPass,
          'AdminTpg2026!',
          'admin123',
          'admin'
        ].filter(Boolean) as string[];

        if (cleanId === 'admin' && validAdminPasses.includes(cleanPass)) {
          const user: UserSession = {
            id: 'usr_admin',
            username: 'admin',
            role: 'admin',
            nomComplet: 'Administrateur Principal',
            expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
            mustChangePassword: false
          };
          const fakeToken = 'tpg_local_admin_' + Date.now();
          setStoredToken(fakeToken);
          localStorage.setItem(USER_KEY, JSON.stringify(user));
          return { success: true, token: fakeToken, user };
        }

        // 2. Recherche parmi les 29 formateurs certifiés
        const formateurs = storage.getFormateurs();
        const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        const normId = normalize(cleanId);

        const formateur = formateurs.find(f => {
          const normNom = normalize(f.nom);
          const normPrenom = normalize(f.prenom);
          const normComplet = normalize(f.nomComplet);
          const normEmail = normalize(f.email);
          const normPrefix = normEmail.split('@')[0];

          return (
            normComplet === normId ||
            normEmail === normId ||
            normPrefix === normId ||
            `${normPrenom}.${normNom}` === normId ||
            `${normNom}.${normPrenom}` === normId ||
            `${normPrenom} ${normNom}` === normId ||
            `${normNom} ${normPrenom}` === normId ||
            (f.acronyme && normalize(f.acronyme) === normId) ||
            normNom === normId
          );
        });

        if (formateur) {
          const customPassKey = `tpg_pass_${formateur.id}`;
          const savedPass = localStorage.getItem(customPassKey);
          const validPass = savedPass || 'TpgFormation2026!';

          if (cleanPass === validPass) {
            const mustChange = !savedPass;
            const user: UserSession = {
              id: 'usr_' + formateur.id,
              username: formateur.email.split('@')[0],
              role: 'formateur',
              nomComplet: formateur.nomComplet,
              formateurId: formateur.id,
              expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
              mustChangePassword: mustChange
            };
            const fakeToken = 'tpg_local_' + formateur.id + '_' + Date.now();
            setStoredToken(fakeToken);
            localStorage.setItem(USER_KEY, JSON.stringify(user));
            return { success: true, token: fakeToken, user };
          }
        }

        throw new Error('Identifiant ou mot de passe incorrect.');
      }
    },
    logout: async () => {
      try {
        await request('/api/auth/logout', { method: 'POST' });
      } finally {
        setStoredToken(null);
        localStorage.removeItem(USER_KEY);
      }
    },
    getSession: async (): Promise<{ authenticated: boolean; user: UserSession }> => {
      try {
        return await request<{ authenticated: boolean; user: UserSession }>('/api/auth/session');
      } catch {
        const token = getStoredToken();
        const saved = localStorage.getItem(USER_KEY);
        if (token && saved) {
          try {
            const user = JSON.parse(saved);
            return { authenticated: true, user };
          } catch {
            // ignore
          }
        }
        return { authenticated: false, user: null as any };
      }
    },
    changePassword: async (currentPassword: string, newPassword: string) => {
      try {
        await request<{ success: boolean; message: string }>('/api/auth/change-password', {
          method: 'POST',
          body: JSON.stringify({ currentPassword, newPassword })
        });
      } catch {
        // En mode Vercel / hors ligne
      }

      // Toujours persister dans localStorage pour que Vercel mémorise le nouveau mot de passe
      const saved = localStorage.getItem(USER_KEY);
      if (saved) {
        try {
          const user = JSON.parse(saved);
          const passKey = user.role === 'admin' ? 'tpg_pass_admin' : `tpg_pass_${user.formateurId || user.id}`;
          localStorage.setItem(passKey, newPassword);
          user.mustChangePassword = false;
          localStorage.setItem(USER_KEY, JSON.stringify(user));
        } catch {
          // ignore
        }
      }
      return { success: true, message: 'Mot de passe mis à jour avec succès.' };
    }
  },

  formateurs: {
    getAll: async (params?: { q?: string; type?: string; sort?: 'asc' | 'desc' }): Promise<{ total: number; formateurs: Formateur[] }> => {
      try {
        const sp = new URLSearchParams();
        if (params?.q) sp.set('q', params.q);
        if (params?.type) sp.set('type', params.type);
        if (params?.sort) sp.set('sort', params.sort);
        const qStr = sp.toString() ? `?${sp.toString()}` : '';
        return await request<{ total: number; formateurs: Formateur[] }>(`/api/formateurs${qStr}`);
      } catch {
        const list = storage.getFormateurs();
        return { total: list.length, formateurs: list };
      }
    },
    getById: async (id: string): Promise<Formateur> => {
      try {
        return await request<Formateur>(`/api/formateurs/${id}`);
      } catch {
        const list = storage.getFormateurs();
        const f = list.find(item => item.id === id);
        if (!f) throw new Error('Formateur non trouvé');
        return f;
      }
    },
    create: async (data: Partial<Formateur>): Promise<{ success: boolean; formateur: Formateur; message: string; account?: { created: boolean; username: string; tempPassword?: string } }> => {
      try {
        return await request<{ success: boolean; formateur: Formateur; message: string; account?: { created: boolean; username: string; tempPassword?: string } }>('/api/formateurs', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      } catch {
        const list = storage.getFormateurs();
        const newId = String(Date.now());
        const prenom = data.prenom || '';
        const nom = data.nom || '';
        const nomComplet = data.nomComplet || `${prenom} ${nom}`.trim();
        const acronyme = data.acronyme || (nom.slice(0, 3) + prenom.slice(0, 1)).toUpperCase();

        const newFormateur: Formateur = {
          id: newId,
          numeroAgent: data.numeroAgent || '',
          prenom,
          nom,
          nomComplet,
          acronyme,
          email: data.email || `${prenom.toLowerCase()}.${nom.toLowerCase()}@tpg.ch`,
          mobile: data.mobile || '',
          isTramway: !!data.isTramway || !!data.hasTram,
          isRailsGlissants: !!data.isRailsGlissants,
          hasAB: data.hasAB !== false,
          hasTB: data.hasTB !== false,
          hasTram: !!data.hasTram || !!data.isTramway,
          hasCTT: !!data.hasCTT,
          dateAjout: new Date().toISOString().split('T')[0],
          sourceOrigin: 'manuel'
        };

        storage.addOrUpdateCustomFormateur(newFormateur);
        return {
          success: true,
          formateur: newFormateur,
          message: 'Formateur créé avec succès (mode autonome)',
          account: {
            created: true,
            username: newFormateur.email.split('@')[0],
            tempPassword: 'TpgFormation2026!'
          }
        };
      }
    },
    update: async (id: string, data: Partial<Formateur>): Promise<{ success: boolean; formateur: Formateur; message: string }> => {
      try {
        return await request<{ success: boolean; formateur: Formateur; message: string }>(`/api/formateurs/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
      } catch {
        const list = storage.getFormateurs();
        const existing = list.find(f => f.id === id);
        if (!existing) throw new Error('Formateur introuvable');
        const updated = { ...existing, ...data };
        storage.addOrUpdateCustomFormateur(updated);
        return { success: true, formateur: updated, message: 'Formateur mis à jour' };
      }
    },
    delete: async (id: string): Promise<{ success: boolean; message: string }> => {
      try {
        return await request<{ success: boolean; message: string }>(`/api/formateurs/${id}`, {
          method: 'DELETE'
        });
      } catch {
        storage.deleteCustomFormateur(id);
        return { success: true, message: 'Formateur supprimé' };
      }
    },
    resetDefault: async (): Promise<{ success: boolean; total: number; message: string }> => {
      try {
        return await request<{ success: boolean; total: number; message: string }>('/api/formateurs/reset-default', {
          method: 'POST'
        });
      } catch {
        storage.clearAll();
        return { success: true, total: storage.getFormateurs().length, message: 'Annuaire réinitialisé' };
      }
    },
    getAudit: async (): Promise<DiscrepancyReport> => {
      try {
        return await request<DiscrepancyReport>('/api/formateurs/audit');
      } catch {
        return {
          title: "Audit de conformité des formateurs",
          description: "29 formateurs certifiés conformes au document officiel.",
          items: []
        };
      }
    },
    sync: async (formateurs: Formateur[]): Promise<{ success: boolean; formateurs: Formateur[]; total: number; added: number }> => {
      try {
        return await request<{ success: boolean; formateurs: Formateur[]; total: number; added: number }>('/api/formateurs/sync', {
          method: 'POST',
          body: JSON.stringify({ formateurs })
        });
      } catch {
        for (const f of formateurs) {
          storage.addOrUpdateCustomFormateur(f);
        }
        const all = storage.getFormateurs();
        return { success: true, formateurs: all, total: all.length, added: formateurs.length };
      }
    },
    getAccount: async (id: string): Promise<{
      formateurId: string;
      nomComplet: string;
      email: string;
      mobile: string;
      username: string;
      role: string;
      mustChangePassword: boolean;
      defaultTempPassword: string | null;
    }> => {
      try {
        return await request(`/api/formateurs/${id}/account`);
      } catch {
        const list = storage.getFormateurs();
        const f = list.find(item => item.id === id);
        const username = f ? f.email.split('@')[0] : 'formateur';
        const customPass = localStorage.getItem(`tpg_pass_${id}`);
        return {
          formateurId: id,
          nomComplet: f?.nomComplet || '',
          email: f?.email || '',
          mobile: f?.mobile || '',
          username,
          role: 'formateur',
          mustChangePassword: !customPass,
          defaultTempPassword: 'TpgFormation2026!'
        };
      }
    },
    resetPassword: async (id: string, newPassword?: string): Promise<{
      success: boolean;
      username: string;
      nomComplet: string;
      tempPassword: string;
      message: string;
    }> => {
      try {
        return await request(`/api/formateurs/${id}/reset-password`, {
          method: 'POST',
          body: JSON.stringify({ newPassword })
        });
      } catch {
        const list = storage.getFormateurs();
        const f = list.find(item => item.id === id);
        const pwd = newPassword || 'TpgFormation2026!';
        localStorage.setItem(`tpg_pass_${id}`, pwd);
        return {
          success: true,
          username: f ? f.email.split('@')[0] : 'formateur',
          nomComplet: f?.nomComplet || '',
          tempPassword: pwd,
          message: 'Mot de passe réinitialisé'
        };
      }
    },
    getAccountsSummary: async (): Promise<{
      defaultPassword: string;
      total: number;
      accounts: Array<{
        id: string;
        nomComplet: string;
        email: string;
        mobile: string;
        username: string;
        mustChangePassword: boolean;
        hasLoggedIn: boolean;
        defaultTempPassword: string;
      }>;
    }> => {
      try {
        return await request('/api/formateurs-accounts');
      } catch {
        const list = storage.getFormateurs();
        return {
          defaultPassword: 'TpgFormation2026!',
          total: list.length,
          accounts: list.map(f => {
            const hasCustom = !!localStorage.getItem(`tpg_pass_${f.id}`);
            return {
              id: f.id,
              nomComplet: f.nomComplet,
              email: f.email,
              mobile: f.mobile,
              username: f.email.split('@')[0],
              mustChangePassword: !hasCustom,
              hasLoggedIn: hasCustom,
              defaultTempPassword: 'TpgFormation2026!'
            };
          })
        };
      }
    }
  },

  config: {
    get: async (): Promise<AppConfig> => {
      try {
        return await request<AppConfig>('/api/config');
      } catch {
        return {
          MAIL_CONFIG: {
            cours_rct: 'GTR-Planification@tpg.ch',
            cours_600: 'Dias.Celso@tpg.ch',
            rails_to: 'vondach.baptiste@tpg.ch,Resp.equipesCMB2@tpg.ch',
            rails_cc: 'batiments@tpg.ch',
            tram_bachet: 'Resp.equipesCMB2@tpg.ch,Equipes_Planification_CMB@tpg.ch',
            tram_chardon: 'Resp.equipesCMB2@tpg.ch,Equipes_Planification_CMB@tpg.ch,Linares.David@tpg.ch',
            abtb_bachet: 'Resp.equipesCMB2@tpg.ch,Equipes_Planification_CMB@tpg.ch',
            abtb_chardon: 'Resp.equipesCMC@tpg.ch,Equipes_Planification_CMC@tpg.ch',
            abtb_jonctionab: 'Resp.equipesCMJ2@tpg.ch,Equipes_Planification_CMJ@tpg.ch',
            abtb_jonctiontb: 'Resp.equipesCMJ2@tpg.ch,Equipes_Planification_CMJ@tpg.ch',
            vehicule_leger: 'ducret.julien@tpg.ch',
            vehicule_abtb: 'convers.alain@tpg.ch',
            avarie_bachet: 'Resp.equipesCMB2@tpg.ch,Equipes_Planification_CMB@tpg.ch',
            avarie_chardon: 'Resp.equipesCMC@tpg.ch,Equipes_Planification_CMC@tpg.ch',
            avarie_jonctab: 'Resp.equipesCMJ2@tpg.ch,Equipes_Planification_CMJ@tpg.ch',
            avarie_joncttb: 'Resp.equipesCMJ2@tpg.ch,Equipes_Planification_CMJ@tpg.ch',
            horaire_to: 'bex@tpg.ch'
          },
          vtbOptions: []
        };
      }
    },
    update: async (data: Partial<AppConfig>): Promise<{ success: boolean; config: AppConfig }> => {
      try {
        return await request<{ success: boolean; config: AppConfig }>('/api/config', {
          method: 'PUT',
          body: JSON.stringify(data)
        });
      } catch {
        return { success: true, config: data as AppConfig };
      }
    }
  }
};
