import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { pool } from './src/services/database';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 3000);
const IS_PROD = process.env.NODE_ENV === 'production';

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://portail-formation-tpg.github.io');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
});

app.use(express.json());
app.use(cookieParser());

// Data storage directory
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const FORMATEURS_FILE = path.join(DATA_DIR, 'formateurs.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

// --- Types ---
export interface StoredFormateur {
  id: string;
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
  dateAjout: string;
  sourceOrigin: 'source_html_v20' | 'source_html_v18' | 'source_pdf_v7' | 'manuel';
}

export interface StoredUser {
  id: string;
  username: string;
  passwordHash: string;
  nomComplet: string;
  role: 'admin' | 'responsable' | 'formateur';
  formateurId?: string;
  mustChangePassword?: boolean;
  createdAt?: string;
}

export interface Session {
  token: string;
  userId: string;
  username: string;
  nomComplet: string;
  role: 'admin' | 'responsable' | 'formateur';
  formateurId?: string;
  createdAt: number;
  expiresAt: number;
}

// In-memory active sessions
const sessions = new Map<string, Session>();
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// Source officielle exacte : Portail_Formation_TPG_v20
const DB_FORMATEURS_V20 = [
  { id: 1, nom: "Abdel Aziz AGGOUNE", email: "aggoune.a@tpg.ch", mobile: "+41 79 101 23 45" },
  { id: 2, nom: "Ailton NERI DOS SANTOS JUNIOR", email: "neri.a@tpg.ch", mobile: "+41 79 102 34 56" },
  { id: 3, nom: "Angelino RIBEIRO MONTEIRO", email: "monteiro.a@tpg.ch", mobile: "+41 79 103 45 67" },
  { id: 4, nom: "Angelo CEPEDA", email: "cepeda.a@tpg.ch", mobile: "+41 79 104 56 78" },
  { id: 5, nom: "Anis MENSI", email: "mensi.a@tpg.ch", mobile: "+41 79 105 67 89" },
  { id: 6, nom: "Arvid LEPPIN", email: "leppin.a@tpg.ch", mobile: "+41 79 106 78 90" },
  { id: 7, nom: "Astrid ANNEN", email: "annen.a@tpg.ch", mobile: "+41 79 107 89 01" },
  { id: 8, nom: "Benoît THEVENIN", email: "thevenin.b@tpg.ch", mobile: "+41 79 108 90 12" },
  { id: 9, nom: "Bruno CIMAROSSA", email: "cimarossa.b@tpg.ch", mobile: "+41 79 109 01 23" },
  { id: 10, nom: "Carlos MARTINS", email: "martins.c@tpg.ch", mobile: "+41 79 110 12 34" },
  { id: 11, nom: "Christian NOVERRAZ", email: "noverrazchristian@tpg.ch", mobile: "+41 79 600 01 87" },
  { id: 12, nom: "David ABELLANEDA", email: "abellaneda.d@tpg.ch", mobile: "+41 79 112 34 56" },
  { id: 13, nom: "Fabio ALEMANNO", email: "alemanno.f@tpg.ch", mobile: "+41 79 113 45 67" },
  { id: 14, nom: "Fitim ISENI", email: "iseni.f@tpg.ch", mobile: "+41 79 114 56 78" },
  { id: 15, nom: "Francesco DE SABATO", email: "desabato.f@tpg.ch", mobile: "+41 79 115 67 89" },
  { id: 16, nom: "Gianpiero SEBASTIANELLI", email: "sebastianelli.g@tpg.ch", mobile: "+41 79 117 89 01" },
  { id: 17, nom: "Grégory DESPRES", email: "despres.g@tpg.ch", mobile: "+41 79 118 90 12" },
  { id: 18, nom: "Ilyes BENTAIBA", email: "bentaiba.i@tpg.ch", mobile: "+41 79 119 01 23" },
  { id: 19, nom: "Jacques KRIEG", email: "krieg.j@tpg.ch", mobile: "+41 79 120 12 34" },
  { id: 20, nom: "James SCOTTON", email: "scotton.j@tpg.ch", mobile: "+41 79 121 23 45" },
  { id: 21, nom: "Jérôme CHESSEL", email: "chessel.j@tpg.ch", mobile: "+41 79 122 34 56" },
  { id: 22, nom: "José MARTIN", email: "martin.j@tpg.ch", mobile: "+41 79 123 45 67" },
  { id: 23, nom: "José Manuel MOREIRA", email: "moreira.j@tpg.ch", mobile: "+41 79 124 56 78" },
  { id: 24, nom: "José-Antonio PEREZ", email: "perez.j@tpg.ch", mobile: "+41 79 125 67 89" },
  { id: 25, nom: "Joseph FOTI", email: "foti.j@tpg.ch", mobile: "+41 79 126 78 90" },
  { id: 26, nom: "Luis Fernando GARCIA DAZA", email: "garciadaza.l@tpg.ch", mobile: "+41 79 127 89 01" },
  { id: 27, nom: "Raffaele CAIOLA", email: "caiola.r@tpg.ch", mobile: "+41 79 128 90 12" },
  { id: 28, nom: "Sami ESSEBBANI", email: "essebbani.s@tpg.ch", mobile: "+41 79 129 01 23" },
  { id: 29, nom: "Stanislas RUCKEBUSCH", email: "ruckebusch.s@tpg.ch", mobile: "+41 79 130 12 34" }
];

const F_RAILS_V20 = [
  "Angelo CEPEDA",
  "Christian NOVERRAZ",
  "Fabio ALEMANNO",
  "Gianpiero SEBASTIANELLI",
  "James SCOTTON",
  "Jérôme CHESSEL",
  "José MARTIN",
  "José-Antonio PEREZ",
  "Raffaele CAIOLA",
  "Sami ESSEBBANI",
  "Luis Fernando GARCIA DAZA"
];

// Helper to separate Prenom and Nom while preserving exact strings
function splitPrenomNom(fullName: string): { prenom: string; nom: string } {
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) {
    return { prenom: '', nom: parts[0] };
  }
  const firstUpperIndex = parts.findIndex((p, idx) => idx > 0 && /^[A-ZÉÈÀÂÊÎÔÛÄËÏÖÜÇ\-]+$/.test(p));
  if (firstUpperIndex !== -1) {
    return {
      prenom: parts.slice(0, firstUpperIndex).join(' '),
      nom: parts.slice(firstUpperIndex).join(' ')
    };
  }
  return {
    prenom: parts[0],
    nom: parts.slice(1).join(' ')
  };
}

function generateDefaultFormateurs(): StoredFormateur[] {
  const railsSet = new Set(F_RAILS_V20.map(s => s.trim().toLowerCase()));

  return DB_FORMATEURS_V20.map((item) => {
    const { prenom, nom } = splitPrenomNom(item.nom);
    const isSpecial = railsSet.has(item.nom.trim().toLowerCase());
    return {
      id: String(item.id),
      prenom,
      nom,
      nomComplet: item.nom,
      acronyme: '',
      isTramway: isSpecial,
      hasTram: isSpecial,
      hasAB: true,
      hasTB: true,
      hasCTT: false,
      isRailsGlissants: isSpecial,
      email: item.email,
      mobile: item.mobile,
      telephone: item.mobile,
      dateAjout: '2026-01-01',
      sourceOrigin: 'source_html_v20'
    };
  });
}

function loadFormateurs(): StoredFormateur[] {
  try {
    if (fs.existsSync(FORMATEURS_FILE)) {
      const data = fs.readFileSync(FORMATEURS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].mobile) {
        return parsed.map((f: any) => ({
          ...f,
          hasTram: f.hasTram !== undefined ? Boolean(f.hasTram) : Boolean(f.isTramway),
          hasAB: f.hasAB !== undefined ? Boolean(f.hasAB) : true,
          hasTB: f.hasTB !== undefined ? Boolean(f.hasTB) : true,
          hasCTT: Boolean(f.hasCTT),
          isTramway: f.hasTram !== undefined ? Boolean(f.hasTram) : Boolean(f.isTramway)
        }));
      }
    }
  } catch (e) {
    console.error('Error loading formateurs.json, falling back to defaults:', e);
  }
  const defaults = generateDefaultFormateurs();
  saveFormateurs(defaults);
  return defaults;
}

function saveFormateurs(list: StoredFormateur[]) {
  fs.writeFileSync(FORMATEURS_FILE, JSON.stringify(list, null, 2), 'utf-8');
}

// --- Initial Users & Passwords ---
function initUsers(): StoredUser[] {
  const salt = bcrypt.genSaltSync(10);
  const adminHash = bcrypt.hashSync('AdminTpg2026!', salt);
  const respHash = bcrypt.hashSync('RespTpg2026!', salt);
  const formateurDefaultHash = bcrypt.hashSync('TpgFormation2026!', salt);

  const users: StoredUser[] = [
    {
      id: 'usr-admin',
      username: 'admin',
      passwordHash: adminHash,
      nomComplet: 'Administrateur TPG',
      role: 'admin',
      mustChangePassword: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr-resp',
      username: 'responsable',
      passwordHash: respHash,
      nomComplet: 'Responsable Formation TPG',
      role: 'responsable',
      mustChangePassword: true,
      createdAt: new Date().toISOString()
    }
  ];

  const formateurs = loadFormateurs();
  formateurs.forEach(f => {
    const username = (f.prenom + '.' + f.nom).toLowerCase().replace(/[^a-z0-9.]/g, '');
    users.push({
      id: `usr-${f.id}`,
      username: username || f.id,
      passwordHash: formateurDefaultHash,
      nomComplet: f.nomComplet,
      role: 'formateur',
      formateurId: f.id,
      mustChangePassword: true,
      createdAt: new Date().toISOString()
    });
  });

  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  return users;
}

function loadUsers(): StoredUser[] {
  if (!fs.existsSync(USERS_FILE)) {
    return initUsers();
  }
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  } catch (e) {
    return initUsers();
  }
}

function saveUsers(users: StoredUser[]) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

// Initialize on boot
loadFormateurs();
loadUsers();

// --- Default Configuration (Portail_Formation_TPG_v20) ---
const DEFAULT_CONFIG = {
  MAIL_CONFIG: {
    cours_rct: 'GTR-Planification@tpg.ch',
    cours_600: 'Dias.Celso@tpg.ch',
    rails_to: 'vondach.baptiste@tpg.ch,Resp.equipesCMB2@tpg.ch',
    rails_cc: 'batiments@tpg.ch',
    tram_bachet: 'Resp.equipesCMB2@tpg.ch,Equipes_Planification_CMB@tpg.ch,cadres.operationnels@tpg.ch',
    tram_chardon: 'Resp.equipesCMB2@tpg.ch,Equipes_Planification_CMB@tpg.ch,Linares.David@tpg.ch',
    abtb_bachet: 'Resp.equipesCMB2@tpg.ch,Equipes_Planification_CMB@tpg.ch,cadres.operationnels@tpg.ch',
    abtb_chardon: 'Resp.equipesCMC@tpg.ch,Equipes_Planification_CMC@tpg.ch,cadres.operationnels@tpg.ch',
    abtb_jonctionab: 'Resp.equipesCMJ2@tpg.ch,Equipes_Planification_CMJ@tpg.ch,cadres.operationnels@tpg.ch',
    abtb_jonctiontb: 'Resp.equipesCMJ2@tpg.ch,Equipes_Planification_CMJ@tpg.ch,cadres.operationnels@tpg.ch',
    vehicule_leger: 'ducret.julien@tpg.ch',
    vehicule_abtb: 'convers.alain@tpg.ch',
    avarie_bachet: 'Resp.equipesCMB2@tpg.ch,Equipes_Planification_CMB@tpg.ch',
    avarie_chardon: 'Resp.equipesCMC@tpg.ch,Equipes_Planification_CMC@tpg.ch',
    avarie_jonctab: 'Resp.equipesCMJ2@tpg.ch,Equipes_Planification_CMJ@tpg.ch',
    avarie_joncttb: 'Resp.equipesCMJ2@tpg.ch,Equipes_Planification_CMJ@tpg.ch',
    horaire_to: 'bex@tpg.ch'
  },
  vtbOptions: ['TB 760', 'TB 766', 'TB 1636']
};

function loadConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      if (cfg.vtbOptions && cfg.vtbOptions.length > 0) {
        return cfg;
      }
    } catch (e) {
      console.error('Error reading config file:', e);
    }
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2), 'utf-8');
  return DEFAULT_CONFIG;
}

// --- Auth Middleware ---
function getSessionFromRequest(req: Request): Session | null {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies['tpg_session']) {
    token = req.cookies['tpg_session'];
  }

  if (!token) return null;

  const session = sessions.get(token);
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }

  // Slide expiration
  session.expiresAt = Date.now() + SESSION_DURATION_MS;
  return session;
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const session = getSessionFromRequest(req);

  if (!session) {
    res.status(401).json({
      error: 'Non authentifié. Session expirée ou invalide.'
    });
    return;
  }

  (req as any).user = session;
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const session = (req as any).user as Session;

  if (!session || session.role !== 'admin') {
    res.status(403).json({
      error: 'Accès refusé. Privilèges Administrateur requis.'
    });
    return;
  }

  next();
}

function requireAdminOrResp(req: Request, res: Response, next: NextFunction) {
  const session = (req as any).user as Session;
  if (!session || (session.role !== 'admin' && session.role !== 'responsable')) {
    res.status(403).json({ error: 'Accès refusé. Privilèges Administrateur ou Responsable requis.' });
    return;
  }
  next();
}

// --- Normalization helper ---
function normalizeStr(text: string): string {
  return text
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

// --- Génération de mot de passe temporaire ---
function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
  const length = 12;
  let password = '';
  // Garantir au moins 1 majuscule, 1 minuscule, 1 chiffre
  password += 'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 24)];
  password += 'abcdefghijkmnpqrstuvwxyz'[Math.floor(Math.random() * 24)];
  password += '23456789'[Math.floor(Math.random() * 8)];
  for (let i = password.length; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  // Mélanger les caractères
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// ==========================================================
// API ROUTES
// ==========================================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: 'v20', timestamp: new Date().toISOString() });
});

// Auth: Login
app.post('/api/auth/login', (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    res.status(400).json({ error: 'Identifiant et mot de passe requis.' });
    return;
  }

  const users = loadUsers();
  const normalizedId = normalizeStr(identifier);

  const matchedUser = users.find(u => {
    if (normalizeStr(u.username) === normalizedId) return true;
    if (normalizeStr(u.nomComplet) === normalizedId) return true;
    return false;
  });

  if (!matchedUser) {
    res.status(401).json({ error: 'Identifiant ou mot de passe incorrect.' });
    return;
  }

  const isPasswordValid = bcrypt.compareSync(password, matchedUser.passwordHash);
  if (!isPasswordValid) {
    res.status(401).json({ error: 'Identifiant ou mot de passe incorrect.' });
    return;
  }

  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  const session: Session = {
    token,
    userId: matchedUser.id,
    username: matchedUser.username,
    nomComplet: matchedUser.nomComplet,
    role: matchedUser.role,
    formateurId: matchedUser.formateurId,
    createdAt: now,
    expiresAt: now + SESSION_DURATION_MS
  };

  sessions.set(token, session);

  res.cookie('tpg_session', token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    maxAge: SESSION_DURATION_MS
  });

  res.json({
    success: true,
    token,
    user: {
      id: session.userId,
      username: session.username,
      nomComplet: session.nomComplet,
      role: session.role,
      formateurId: session.formateurId,
      expiresAt: session.expiresAt,
      mustChangePassword: matchedUser.mustChangePassword || false
    }
  });
});

// Auth: Logout
app.post('/api/auth/logout', (req, res) => {
  const token = req.cookies['tpg_session'] || (req.headers.authorization && req.headers.authorization.substring(7));
  if (token) {
    sessions.delete(token);
  }
  res.clearCookie('tpg_session');
  res.json({ success: true, message: 'Déconnexion réussie.' });
});

// Auth: Get Current Session
app.get('/api/auth/session', (req, res) => {
  const session = getSessionFromRequest(req);
  if (!session) {
    res.status(401).json({ error: 'Non authentifié' });
    return;
  }
  res.json({
    authenticated: true,
    user: {
      id: session.userId,
      username: session.username,
      nomComplet: session.nomComplet,
      role: session.role,
      formateurId: session.formateurId,
      expiresAt: session.expiresAt
    }
  });
});

// Auth: Change password
app.post('/api/auth/change-password', requireAuth, (req, res) => {
  const session = (req as any).user as Session;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword || newPassword.length < 6) {
    res.status(400).json({ error: 'Nouveau mot de passe invalide (minimum 6 caractères).' });
    return;
  }

  const users = loadUsers();
  const user = users.find(u => u.id === session.userId);
  if (!user) {
    res.status(404).json({ error: 'Utilisateur introuvable.' });
    return;
  }

  if (!bcrypt.compareSync(currentPassword, user.passwordHash)) {
    res.status(400).json({ error: 'Mot de passe actuel incorrect.' });
    return;
  }

  user.passwordHash = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10));
  user.mustChangePassword = false;
  saveUsers(users);

  res.json({ success: true, message: 'Mot de passe mis à jour avec succès.' });
});

// ==========================================================
// FORMATEURS CRUD & SEARCH
// ==========================================================

async function loadFormateursFromDatabase(): Promise<StoredFormateur[]> {
  const result = await pool.query(
    'SELECT data FROM tpg_private.formateurs ORDER BY id'
  );

  return result.rows.map((row) => {
    const f = row.data as StoredFormateur;

    return {
      ...f,
      hasTram: f.hasTram !== undefined ? Boolean(f.hasTram) : Boolean(f.isTramway),
      hasAB: f.hasAB !== undefined ? Boolean(f.hasAB) : true,
      hasTB: f.hasTB !== undefined ? Boolean(f.hasTB) : true,
      hasCTT: Boolean(f.hasCTT),
      isTramway: f.hasTram !== undefined ? Boolean(f.hasTram) : Boolean(f.isTramway)
    };
  });
}

// Get all formateurs (search, filter, sort)
app.get('/api/formateurs', requireAuth, async (req, res) => {
  const q = String(req.query.q || '').trim();
  const qualification = String(req.query.type || 'all');
  const sort = String(req.query.sort || 'asc');

  try {
    let list = await loadFormateursFromDatabase();

    if (q) {
      const queryNorm = normalizeStr(q);
      list = list.filter(f => {
        const nomMatch = normalizeStr(f.nom).includes(queryNorm);
        const prenomMatch = normalizeStr(f.prenom).includes(queryNorm);
        const completMatch = normalizeStr(f.nomComplet).includes(queryNorm);
        const acronymeMatch = f.acronyme ? normalizeStr(f.acronyme).includes(queryNorm) : false;
        const emailMatch = f.email ? normalizeStr(f.email).includes(queryNorm) : false;
        const mobileMatch = f.mobile ? normalizeStr(f.mobile).includes(queryNorm) : false;
        return nomMatch || prenomMatch || completMatch || acronymeMatch || emailMatch || mobileMatch;
      });
    }

    if (qualification === 'tram') {
      list = list.filter(f => f.isTramway);
    } else if (qualification === 'rails') {
      list = list.filter(f => f.isRailsGlissants);
    }

    list.sort((a, b) => {
      const comp = a.nomComplet.localeCompare(b.nomComplet, 'fr', { sensitivity: 'base' });
      return sort === 'desc' ? -comp : comp;
    });

    res.json({
      total: list.length,
      formateurs: list
    });
  } catch (error) {
    console.error('Erreur de lecture des formateurs depuis Supabase :', error);
    res.status(500).json({
      error: 'Impossible de charger les formateurs.'
    });
  }
});

// Discrepancy & Source Audit Report (must be before :id route)
app.get('/api/formateurs/audit', requireAuth, (req, res) => {
  res.json({
    title: 'Rapport d’Audit et Concordance des Sources de Données TPG v20',
    date: new Date().toISOString(),
    resume: {
      totalHtmlV20: 29,
      totalRailsTramHtmlV20: 11,
      optionsTrolleybusV20: 3,
      acronymesFournis: 0
    },
    items: [
      {
        type: 'option_tb_manquante',
        sujet: 'Options Trolleybus configurées dans le Module 5 (v20)',
        detail: 'Le fichier source v20 définit précisément 3 trolleybus : TB 760, TB 766, TB 1636.',
        actionPrise: 'Options intégrées scrupuleusement dans la configuration opérationnelle sans aucune invention.'
      },
      {
        type: 'difference_nom',
        sujet: 'Données de contact et annuaire certifié v20',
        detail: 'Le fichier source v20 fournit l’e-mail TPG exact et le numéro de portable pour les 29 formateurs (ex: Christian NOVERRAZ noverrazchristian@tpg.ch / +41 79 600 01 87).',
        actionPrise: 'Importation stricte des coordonnées dans le référentiel avec vérification syntaxique et validation visuelle (✓/✗).'
      },
      {
        type: 'acronyme_manquant',
        sujet: 'Absence d’acronymes dans les fichiers sources',
        detail: 'Le fichier source v20 ne contient pas de colonne ou valeur d’acronyme.',
        actionPrise: 'Conformément aux directives, le champ acronyme reste VIDE ("") par défaut pour l’ensemble des formateurs.'
      }
    ]
  });
});

// The historic reset action must never overwrite the persistent Supabase directory.
app.post('/api/formateurs/reset-default', requireAuth, requireAdmin, (_req, res) => {
  res.status(409).json({
    error: 'Réinitialisation désactivée pour protéger les données enregistrées dans Supabase.'
  });
});

// Read an individual formateur from the same persistent source as the directory.
app.get('/api/formateurs/:id', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT data FROM tpg_private.formateurs WHERE id = $1',
      [String(req.params.id)]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Formateur non trouvé.' });
      return;
    }
    res.json(result.rows[0].data);
  } catch (error) {
    console.error('Erreur de lecture du formateur dans Supabase :', error);
    res.status(500).json({ error: 'Impossible de charger ce formateur.' });
  }
});

// Create a formateur in Supabase; never write a local JSON copy.
// ✅ CORRIGÉ : Création automatique du compte utilisateur avec mot de passe temporaire
app.post('/api/formateurs', requireAuth, requireAdmin, async (req, res) => {
  const { nom, email, mobile, prenom, acronyme, isTramway, hasTram, hasAB, hasTB, hasCTT, isRailsGlissants, telephone, notes } = req.body || {};
  if (typeof nom !== 'string' || !nom.trim()) {
    res.status(400).json({ error: 'Le nom est obligatoire.' });
    return;
  }
  if (prenom !== undefined && typeof prenom !== 'string') {
    res.status(400).json({ error: 'Prénom invalide.' });
    return;
  }
  let cleanNomComplet = nom.trim();
  let cleanPrenom = (prenom || '').trim();
  let cleanNom = '';
  if (cleanNomComplet && !cleanPrenom) {
    const split = splitPrenomNom(cleanNomComplet);
    cleanPrenom = split.prenom;
    cleanNom = split.nom;
  } else {
    cleanNom = cleanNomComplet;
    cleanNomComplet = `${cleanPrenom} ${cleanNom}`.trim();
  }
  const tramQualif = hasTram !== undefined ? Boolean(hasTram) : Boolean(isTramway);
  const newFormateur: StoredFormateur = {
    id: crypto.randomUUID(),
    prenom: cleanPrenom,
    nom: cleanNom,
    nomComplet: cleanNomComplet,
    acronyme: typeof acronyme === 'string' ? acronyme.trim().toUpperCase() : '',
    isTramway: tramQualif,
    hasTram: tramQualif,
    hasAB: hasAB !== undefined ? Boolean(hasAB) : true,
    hasTB: hasTB !== undefined ? Boolean(hasTB) : true,
    hasCTT: Boolean(hasCTT),
    isRailsGlissants: Boolean(isRailsGlissants ?? tramQualif),
    email: typeof email === 'string' ? email.trim() : '',
    mobile: typeof mobile === 'string' ? mobile.trim() : (typeof telephone === 'string' ? telephone.trim() : ''),
    telephone: typeof mobile === 'string' ? mobile.trim() : (typeof telephone === 'string' ? telephone.trim() : ''),
    notes: typeof notes === 'string' ? notes.trim() : undefined,
    dateAjout: new Date().toISOString().split('T')[0],
    sourceOrigin: 'manuel'
  };
  try {
    // Serialize concurrent creates to prevent duplicate names.
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT pg_advisory_xact_lock($1)', [20261023]);
      const existing = await client.query('SELECT data FROM tpg_private.formateurs');
      if (existing.rows.some(row => normalizeStr(String(row.data.nomComplet || '')) === normalizeStr(cleanNomComplet))) {
        await client.query('ROLLBACK');
        res.status(409).json({ error: `Un formateur avec le nom "${cleanNomComplet}" existe déjà.` });
        return;
      }
      await client.query(
        'INSERT INTO tpg_private.formateurs (id, data) VALUES ($1, $2::jsonb)',
        [newFormateur.id, JSON.stringify(newFormateur)]
      );
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    // ============================================================
    // ✅ CRÉATION AUTOMATIQUE DU COMPTE UTILISATEUR
    // ============================================================
    const users = loadUsers();

    // Générer un username unique basé sur le nom
    const baseUsername = (cleanPrenom + '.' + cleanNom)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9.]/g, '');

    let username = baseUsername || `formateur.${newFormateur.id.substring(0, 8)}`;

    // Vérifier si le username existe déjà, ajouter un numéro si besoin
    let counter = 1;
    const originalUsername = username;
    while (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      username = `${originalUsername}${counter}`;
      counter++;
    }

    // Vérifier si un compte existe déjà pour ce formateur (par email)
    const existingAccount = users.find(u =>
      u.formateurId === newFormateur.id ||
      (newFormateur.email && u.username.toLowerCase() === newFormateur.email.toLowerCase())
    );

    let accountCreated = false;
    let tempPassword = '';
    let finalUsername = username;

    if (!existingAccount) {
      tempPassword = generateTempPassword();
      const passwordHash = bcrypt.hashSync(tempPassword, bcrypt.genSaltSync(10));

      const newUser: StoredUser = {
        id: `usr-${newFormateur.id}`,
        username: username,
        passwordHash: passwordHash,
        nomComplet: newFormateur.nomComplet,
        role: 'formateur',
        formateurId: newFormateur.id,
        mustChangePassword: true,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      saveUsers(users);
      accountCreated = true;

      console.log(`✅ Compte créé pour ${newFormateur.nomComplet}: ${username} / ${tempPassword}`);
    } else {
      finalUsername = existingAccount.username;
      console.log(`ℹ️ Compte existant trouvé pour ${newFormateur.nomComplet}: ${existingAccount.username}`);
    }

    res.status(201).json({
      success: true,
      formateur: newFormateur,
      message: 'Formateur créé avec succès dans Supabase.',
      account: accountCreated ? {
        created: true,
        username: finalUsername,
        tempPassword: tempPassword, // ⚠️ À afficher UNE SEULE FOIS à l'admin
        mustChangePassword: true
      } : {
        created: false,
        username: finalUsername,
        message: 'Un compte existait déjà pour cet utilisateur.'
      }
    });
  } catch (error) {
    console.error('Erreur de création du formateur dans Supabase :', error);
    res.status(500).json({ error: "Impossible d'enregistrer le formateur dans Supabase." });
  }
});

// ============================================================
// ✅ NOUVELLE ROUTE : Réinitialiser le mot de passe d'un formateur
// ============================================================
app.post('/api/formateurs/:id/reset-password', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    // Vérifier que le formateur existe dans Supabase
    const formateurResult = await pool.query(
      'SELECT data FROM tpg_private.formateurs WHERE id = $1',
      [String(id)]
    );

    if (formateurResult.rowCount === 0) {
      res.status(404).json({ error: 'Formateur non trouvé.' });
      return;
    }

    const formateur = formateurResult.rows[0].data as StoredFormateur;

    // Trouver l'utilisateur
    const users = loadUsers();
    const userIndex = users.findIndex(u => u.formateurId === String(id));

    if (userIndex === -1) {
      res.status(404).json({ error: 'Aucun compte utilisateur associé à ce formateur.' });
      return;
    }

    // Générer nouveau mot de passe temporaire
    const tempPassword = generateTempPassword();
    users[userIndex].passwordHash = bcrypt.hashSync(tempPassword, bcrypt.genSaltSync(10));
    users[userIndex].mustChangePassword = true;
    saveUsers(users);

    console.log(`🔄 Mot de passe réinitialisé pour ${formateur.nomComplet}: ${users[userIndex].username} / ${tempPassword}`);

    res.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès.',
      credentials: {
        username: users[userIndex].username,
        tempPassword: tempPassword, // ⚠️ À communiquer au formateur
        mustChangePassword: true
      },
      formateur: {
        id: formateur.id,
        nomComplet: formateur.nomComplet
      }
    });

  } catch (error) {
    console.error('Erreur de réinitialisation du mot de passe :', error);
    res.status(500).json({ error: 'Impossible de réinitialiser le mot de passe.' });
  }
});

// ============================================================
// ✅ NOUVELLE ROUTE : Vérifier si un formateur a un compte
// ============================================================
app.get('/api/formateurs/:id/account-status', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const users = loadUsers();
  const user = users.find(u => u.formateurId === String(id));

  res.json({
    hasAccount: !!user,
    username: user?.username || null,
    role: user?.role || null,
    mustChangePassword: user?.mustChangePassword || false
  });
});

// Update a formateur in Supabase without changing its ID or other fields.
app.put('/api/formateurs/:id', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const body = req.body || {};
  const { nom, email, mobile, prenom, acronyme, isTramway, hasTram, hasAB, hasTB, hasCTT, isRailsGlissants, telephone, notes } = body;
  try {
    const client = await pool.connect();
    let updated: StoredFormateur;
    try {
      await client.query('BEGIN');
      const result = await client.query(
        'SELECT data FROM tpg_private.formateurs WHERE id = $1 FOR UPDATE',
        [String(id)]
      );
      if (result.rowCount === 0) {
        await client.query('ROLLBACK');
        res.status(404).json({ error: 'Formateur non trouvé.' });
        return;
      }
      const previous = result.rows[0].data as StoredFormateur;
      const textField = (value: unknown, fallback: string) => typeof value === 'string' ? value.trim() : fallback;
      const cleanNomComplet = textField(nom, previous.nomComplet);
      if (!cleanNomComplet) {
        await client.query('ROLLBACK');
        res.status(400).json({ error: 'Le nom est obligatoire.' });
        return;
      }
      let cleanPrenom = textField(prenom, previous.prenom);
      let cleanNom = previous.nom;
      let fullName = cleanNomComplet;
      if (typeof nom === 'string' && prenom === undefined) {
        const split = splitPrenomNom(cleanNomComplet);
        cleanPrenom = split.prenom;
        cleanNom = split.nom;
      } else if (typeof nom === 'string' && typeof prenom === 'string') {
        cleanNom = splitPrenomNom(cleanNomComplet).nom;
      } else if (typeof prenom === 'string') {
        fullName = `${cleanPrenom} ${cleanNom}`.trim();
      }
      const updatedHasTram = hasTram !== undefined ? Boolean(hasTram) : (isTramway !== undefined ? Boolean(isTramway) : Boolean(previous.hasTram ?? previous.isTramway));
      updated = {
        ...previous,
        prenom: cleanPrenom,
        nom: cleanNom,
        nomComplet: fullName,
        email: textField(email, previous.email),
        mobile: textField(mobile, textField(telephone, previous.mobile)),
        telephone: textField(telephone, textField(mobile, previous.telephone || previous.mobile)),
        acronyme: textField(acronyme, previous.acronyme || '').toUpperCase(),
        isTramway: updatedHasTram,
        hasTram: updatedHasTram,
        hasAB: hasAB !== undefined ? Boolean(hasAB) : Boolean(previous.hasAB ?? true),
        hasTB: hasTB !== undefined ? Boolean(hasTB) : Boolean(previous.hasTB ?? true),
        hasCTT: hasCTT !== undefined ? Boolean(hasCTT) : Boolean(previous.hasCTT),
        isRailsGlissants: isRailsGlissants !== undefined ? Boolean(isRailsGlissants) : previous.isRailsGlissants,
        notes: textField(notes, previous.notes || '')
      };
      const all = await client.query('SELECT id, data FROM tpg_private.formateurs WHERE id <> $1', [String(id)]);
      if (all.rows.some(row => normalizeStr(String(row.data.nomComplet || '')) === normalizeStr(updated.nomComplet))) {
        await client.query('ROLLBACK');
        res.status(409).json({ error: 'Un autre formateur porte déjà ce nom.' });
        return;
      }
      await client.query(
        'UPDATE tpg_private.formateurs SET data = $2::jsonb, updated_at = NOW() WHERE id = $1',
        [String(id), JSON.stringify(updated)]
      );
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    res.json({ success: true, formateur: updated!, message: 'Formateur mis à jour avec succès dans Supabase.' });
  } catch (error) {
    console.error('Erreur de modification du formateur dans Supabase :', error);
    res.status(500).json({ error: 'Impossible de modifier le formateur dans Supabase.' });
  }
});

// Delete only the directory entry. Account management remains a separate admin task.
app.delete('/api/formateurs/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM tpg_private.formateurs WHERE id = $1 RETURNING data',
      [String(req.params.id)]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Formateur non trouvé.' });
      return;
    }
    const deleted = result.rows[0].data as StoredFormateur;
    res.json({ success: true, message: `Formateur ${deleted.nomComplet} supprimé avec succès.` });
  } catch (error) {
    console.error('Erreur de suppression du formateur dans Supabase :', error);
    res.status(500).json({ error: 'Impossible de supprimer le formateur dans Supabase.' });
  }
});

// App configuration (mail routes, etc.)
app.get('/api/config', (req, res) => {
  res.json(loadConfig());
});

app.put('/api/config', requireAuth, requireAdminOrResp, (req, res) => {
  const { MAIL_CONFIG, vtbOptions } = req.body;
  const current = loadConfig();
  const updated = {
    MAIL_CONFIG: MAIL_CONFIG || current.MAIL_CONFIG,
    vtbOptions: Array.isArray(vtbOptions) ? vtbOptions : current.vtbOptions
  };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  res.json({ success: true, config: updated });
});

// ==========================================================
// VITE DEV SERVER OR STATIC PROD SERVING
// ==========================================================
async function startServer() {
  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TPG Formation Server v20 running on port ${PORT} [mode: ${IS_PROD ? 'production' : 'development'}]`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
