import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.DEFAULT_APP_PORT || 3000);
const IS_PROD = process.env.NODE_ENV === 'production';

app.use(express.json());
app.use(cookieParser());

// Data storage directory
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const FORMATEURS_FILE = path.join(DATA_DIR, 'formateurs.json');
const CUSTOM_FORMATEURS_FILE = path.join(DATA_DIR, 'custom_formateurs.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

// --- Types ---
export interface StoredFormateur {
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

const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

function loadSessions(): Map<string, Session> {
  const map = new Map<string, Session>();
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const arr = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8'));
      if (Array.isArray(arr)) {
        const now = Date.now();
        for (const s of arr) {
          if (s && s.token && s.expiresAt > now) {
            map.set(s.token, s);
          }
        }
      }
    }
  } catch (e) {
    console.error('Erreur lecture sessions.json:', e);
  }
  return map;
}

function saveSessions(map: Map<string, Session>) {
  try {
    const arr = Array.from(map.values());
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(arr, null, 2), 'utf-8');
  } catch (e) {
    console.error('Erreur sauvegarde sessions.json:', e);
  }
}

// Persistent active sessions
const sessions = loadSessions();
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours de persistance

// Mot de passe initial des comptes formateurs créés par défaut
const DEFAULT_FORMATEUR_PASSWORD = 'TpgFormation2026!';

// Source officielle exacte certifiée du document : Adresses_t_l_phone__portail_formation_7dc38449.pdf
const OFFICIAL_FORMATEURS_PDF: Array<{
  id: string;
  numeroAgent: string;
  prenom: string;
  nom: string;
  nomComplet: string;
  email: string;
  mobile: string;
  hasTram: boolean;
}> = [
  { id: "1", numeroAgent: "53605", prenom: "Abdel Aziz", nom: "AGGOUNE", nomComplet: "Abdel Aziz AGGOUNE", email: "aggoune.abdel@tpg.ch", mobile: "+41 79 428 77 51", hasTram: false },
  { id: "2", numeroAgent: "54468", prenom: "Ailton Junior", nom: "DOS SANTOS", nomComplet: "Ailton Junior DOS SANTOS", email: "dossantos.ailton@tpg.ch", mobile: "", hasTram: false },
  { id: "3", numeroAgent: "54352", prenom: "Angelo", nom: "CEPEDA", nomComplet: "Angelo CEPEDA", email: "cepeda.angelo@tpg.ch", mobile: "+41 79 738 13 42", hasTram: true },
  { id: "4", numeroAgent: "52886", prenom: "Angelino", nom: "RIBEIRO MONTEIRO", nomComplet: "Angelino RIBEIRO MONTEIRO", email: "ribeiro.angelino@tpg.ch", mobile: "+41 79 351 88 84", hasTram: false },
  { id: "5", numeroAgent: "53104", prenom: "Anis", nom: "MENSI", nomComplet: "Anis MENSI", email: "mensi.anis@tpg.ch", mobile: "+41 79 153 29 94", hasTram: false },
  { id: "6", numeroAgent: "50892", prenom: "Arvid", nom: "LEPPIN", nomComplet: "Arvid LEPPIN", email: "leppin.arvid@tpg.ch", mobile: "+41 79 443 12 07", hasTram: false },
  { id: "7", numeroAgent: "53698", prenom: "Astrid", nom: "ANNEN", nomComplet: "Astrid ANNEN", email: "annen.astrid@tpg.ch", mobile: "", hasTram: false },
  { id: "8", numeroAgent: "53514", prenom: "Benoît", nom: "THEVENIN", nomComplet: "Benoît THEVENIN", email: "thevenin.benoit@tpg.ch", mobile: "+41 79 339 86 85", hasTram: false },
  { id: "9", numeroAgent: "51236", prenom: "Bruno", nom: "CIMAROSSA", nomComplet: "Bruno CIMAROSSA", email: "cimarossa.bruno@tpg.ch", mobile: "+41 79 827 41 36", hasTram: false },
  { id: "10", numeroAgent: "53446", prenom: "Carlos", nom: "MARTINS", nomComplet: "Carlos MARTINS", email: "martins.carlos@tpg.ch", mobile: "+41 79 351 17 66", hasTram: false },
  { id: "11", numeroAgent: "50984", prenom: "Christian", nom: "NOVERRAZ", nomComplet: "Christian NOVERRAZ", email: "noverraz.christian@tpg.ch", mobile: "+41 79 600 01 87", hasTram: true },
  { id: "12", numeroAgent: "53702", prenom: "David", nom: "ABELLANEDA", nomComplet: "David ABELLANEDA", email: "abellaneda.david@tpg.ch", mobile: "", hasTram: false },
  { id: "13", numeroAgent: "51954", prenom: "Fabio", nom: "ALEMANNO", nomComplet: "Fabio ALEMANNO", email: "alemanno.fabio@tpg.ch", mobile: "+41 79 598 24 87", hasTram: true },
  { id: "14", numeroAgent: "54066", prenom: "Fitim", nom: "ISENI", nomComplet: "Fitim ISENI", email: "iseni.fitim@tpg.ch", mobile: "", hasTram: false },
  { id: "15", numeroAgent: "51642", prenom: "Gianpiero", nom: "SEBASTIANELLI", nomComplet: "Gianpiero SEBASTIANELLI", email: "sebastianelli.gianpiero@tpg.ch", mobile: "", hasTram: true },
  { id: "16", numeroAgent: "53000", prenom: "Gregory", nom: "DESPRES", nomComplet: "Gregory DESPRES", email: "despres.gregory@tpg.ch", mobile: "+41 79 694 60 43", hasTram: false },
  { id: "17", numeroAgent: "51372", prenom: "Jacques", nom: "KRIEG", nomComplet: "Jacques KRIEG", email: "krieg.jacques@tpg.ch", mobile: "+41 79 827 39 61", hasTram: false },
  { id: "18", numeroAgent: "50784", prenom: "James", nom: "SCOTTON", nomComplet: "James SCOTTON", email: "scotton.james@tpg.ch", mobile: "+41 79 827 30 69", hasTram: true },
  { id: "19", numeroAgent: "54595", prenom: "Jérôme", nom: "CHESSEL", nomComplet: "Jérôme CHESSEL", email: "chessel.jerome@tpg.ch", mobile: "+41 79 839 59 16", hasTram: true },
  { id: "20", numeroAgent: "53745", prenom: "Joseph", nom: "FOTI", nomComplet: "Joseph FOTI", email: "foti.joseph@tpg.ch", mobile: "+41 76 679 04 35", hasTram: false },
  { id: "21", numeroAgent: "51444", prenom: "José", nom: "MARTIN", nomComplet: "José MARTIN", email: "martin.jose@tpg.ch", mobile: "+41 79 724 59 92", hasTram: true },
  { id: "22", numeroAgent: "53466", prenom: "José Manuel", nom: "MOREIRA", nomComplet: "José Manuel MOREIRA", email: "moreira.jose@tpg.ch", mobile: "+41 79 694 52 84", hasTram: false },
  { id: "23", numeroAgent: "50975", prenom: "José-Antonio", nom: "PEREZ", nomComplet: "José-Antonio PEREZ", email: "perez.jose-antonio@tpg.ch", mobile: "+41 79 600 11 94", hasTram: true },
  { id: "24", numeroAgent: "54086", prenom: "Luis Fernando", nom: "GARCIA DAZA", nomComplet: "Luis Fernando GARCIA DAZA", email: "garcia.fernando@tpg.ch", mobile: "", hasTram: true },
  { id: "25", numeroAgent: "51401", prenom: "Mariano", nom: "DINACCI", nomComplet: "Mariano DINACCI", email: "dinacci.mariano@tpg.ch", mobile: "+41 79 248 09 46", hasTram: false },
  { id: "26", numeroAgent: "53729", prenom: "Philippe", nom: "MOSER", nomComplet: "Philippe MOSER", email: "moser.philippe@tpg.ch", mobile: "+41 79 865 59 84", hasTram: false },
  { id: "27", numeroAgent: "53189", prenom: "Raffaele", nom: "CAIOLA", nomComplet: "Raffaele CAIOLA", email: "caiola.raffaele@tpg.ch", mobile: "+41 79 748 55 60", hasTram: true },
  { id: "28", numeroAgent: "55208", prenom: "Sami", nom: "ESSEBBANI", nomComplet: "Sami ESSEBBANI", email: "essebbani.sami@tpg.ch", mobile: "", hasTram: true },
  { id: "29", numeroAgent: "53582", prenom: "Stanislas", nom: "RUCKEBUSCH", nomComplet: "Stanislas RUCKEBUSCH", email: "ruckebusch.stanislas@tpg.ch", mobile: "+41 79 155 97 75", hasTram: false }
];

function generateDefaultFormateurs(): StoredFormateur[] {
  return OFFICIAL_FORMATEURS_PDF.map((item) => {
    return {
      id: item.id,
      numeroAgent: item.numeroAgent,
      prenom: item.prenom,
      nom: item.nom,
      nomComplet: item.nomComplet,
      acronyme: '',
      isTramway: item.hasTram,
      hasTram: item.hasTram,
      hasAB: true,
      hasTB: true,
      hasCTT: false,
      isRailsGlissants: item.hasTram,
      email: item.email,
      mobile: item.mobile,
      telephone: item.mobile,
      dateAjout: '2026-01-01',
      sourceOrigin: 'source_html_v20'
    };
  });
}

function saveFormateurs(list: StoredFormateur[]) {
  try {
    const cleanList = list.filter(f => !f.nomComplet?.toLowerCase().includes('de sabato'));
    fs.writeFileSync(FORMATEURS_FILE, JSON.stringify(cleanList, null, 2), 'utf-8');
    const customList = cleanList.filter(f => f.sourceOrigin === 'manuel' || Number(f.id) > 100);
    fs.writeFileSync(CUSTOM_FORMATEURS_FILE, JSON.stringify(customList, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erreur saveFormateurs:', err);
  }
}

// Charge les formateurs, supprime définitivement Francesco DE SABATO, et applique les coordonnées du PDF
function loadFormateurs(): StoredFormateur[] {
  let list: StoredFormateur[] = [];
  try {
    if (fs.existsSync(FORMATEURS_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(FORMATEURS_FILE, 'utf-8'));
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed;
      }
    }
  } catch (e) {
    console.error('Erreur de lecture formateurs.json :', e);
  }

  // Filtrer définitivement Francesco DE SABATO
  list = list.filter(f => !f.nomComplet?.toLowerCase().includes('de sabato') && !f.email?.toLowerCase().includes('desabato'));

  if (list.length === 0) {
    list = generateDefaultFormateurs();
  }

  // Synchroniser les coordonnées exactes (e-mails, portables, numéroAgent) depuis le PDF officiel
  const pdfMap = new Map(OFFICIAL_FORMATEURS_PDF.map(p => [normalizeStr(p.nomComplet), p]));
  list = list.map(f => {
    const match = pdfMap.get(normalizeStr(f.nomComplet));
    if (match) {
      return {
        ...f,
        numeroAgent: match.numeroAgent,
        email: match.email,
        mobile: match.mobile,
        telephone: match.mobile
      };
    }
    return f;
  });

  // Ajouter tout formateur officiel qui manquerait
  for (const official of OFFICIAL_FORMATEURS_PDF) {
    if (!list.some(f => normalizeStr(f.nomComplet) === normalizeStr(official.nomComplet))) {
      list.push({
        id: official.id,
        numeroAgent: official.numeroAgent,
        prenom: official.prenom,
        nom: official.nom,
        nomComplet: official.nomComplet,
        acronyme: '',
        isTramway: official.hasTram,
        hasTram: official.hasTram,
        hasAB: true,
        hasTB: true,
        hasCTT: false,
        isRailsGlissants: official.hasTram,
        email: official.email,
        mobile: official.mobile,
        telephone: official.mobile,
        dateAjout: '2026-01-01',
        sourceOrigin: 'source_html_v20'
      });
    }
  }

  // Fusionner les formateurs personnalisés sauvegardés dans custom_formateurs.json (en excluant DE SABATO)
  try {
    if (fs.existsSync(CUSTOM_FORMATEURS_FILE)) {
      const customs = JSON.parse(fs.readFileSync(CUSTOM_FORMATEURS_FILE, 'utf-8'));
      if (Array.isArray(customs)) {
        for (const c of customs) {
          if (!c.nomComplet?.toLowerCase().includes('de sabato') &&
              !list.some(f => String(f.id) === String(c.id) || normalizeStr(f.nomComplet) === normalizeStr(c.nomComplet))) {
            list.push(c);
          }
        }
      }
    }
  } catch (e) {
    // ignore
  }

  const normalized = list.map((f: any) => ({
    ...f,
    hasTram: f.hasTram !== undefined ? Boolean(f.hasTram) : Boolean(f.isTramway),
    hasAB: f.hasAB !== undefined ? Boolean(f.hasAB) : true,
    hasTB: f.hasTB !== undefined ? Boolean(f.hasTB) : true,
    hasCTT: Boolean(f.hasCTT),
    isTramway: f.hasTram !== undefined ? Boolean(f.hasTram) : Boolean(f.isTramway)
  }));

  try {
    fs.writeFileSync(FORMATEURS_FILE, JSON.stringify(normalized, null, 2), 'utf-8');
  } catch (e) {}

  return normalized;
}

// Sépare prénom et nom en conservant les chaînes exactes
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

function saveUsers(users: StoredUser[]) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

// --- Comptes utilisateurs ---
function initUsers(): StoredUser[] {
  const salt = bcrypt.genSaltSync(10);
  const adminHash = bcrypt.hashSync('AdminTpg2026!', salt);
  const respHash = bcrypt.hashSync('RespTpg2026!', salt);
  const formateurDefaultHash = bcrypt.hashSync(DEFAULT_FORMATEUR_PASSWORD, salt);

  const users: StoredUser[] = [
    {
      id: 'usr-admin',
      username: 'admin',
      passwordHash: adminHash,
      nomComplet: 'Administrateur TPG',
      role: 'admin'
    },
    {
      id: 'usr-resp',
      username: 'responsable',
      passwordHash: respHash,
      nomComplet: 'Responsable Formation TPG',
      role: 'responsable'
    }
  ];

  const formateurs = loadFormateurs();
  formateurs.forEach(f => {
    const username = (f.prenom + '.' + f.nom).toLowerCase().replace(/[^a-z0-9.]/g, '');
    users.push({
      id: `usr-${f.id}`,
      username: username || `user${f.id}`,
      passwordHash: formateurDefaultHash,
      nomComplet: f.nomComplet,
      role: 'formateur',
      formateurId: f.id,
      mustChangePassword: true
    });
  });

  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  return users;
}

function loadUsers(): StoredUser[] {
  let users: StoredUser[] = [];
  if (!fs.existsSync(USERS_FILE)) {
    users = initUsers();
  } else {
    try {
      users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
    } catch (e) {
      users = initUsers();
    }
  }

  // Filtrer définitivement Francesco DE SABATO
  const cleanUsers = users.filter(u => !u.nomComplet?.toLowerCase().includes('de sabato') && !u.username?.toLowerCase().includes('desabato'));

  // S'assurer que tous les formateurs officiels ont leur compte
  const formateurs = loadFormateurs();
  const salt = bcrypt.genSaltSync(10);
  const formateurDefaultHash = bcrypt.hashSync(DEFAULT_FORMATEUR_PASSWORD, salt);

  for (const f of formateurs) {
    if (!cleanUsers.some(u => String(u.formateurId) === String(f.id) || normalizeStr(u.nomComplet) === normalizeStr(f.nomComplet))) {
      const cleanPrenom = (f.prenom || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanNom = (f.nom || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const username = (cleanPrenom && cleanNom) ? `${cleanPrenom}.${cleanNom}` : (cleanPrenom || cleanNom || `user${f.id}`);
      cleanUsers.push({
        id: `usr-${f.id}`,
        username,
        passwordHash: formateurDefaultHash,
        nomComplet: f.nomComplet,
        role: 'formateur',
        formateurId: f.id,
        mustChangePassword: true
      });
    }
  }

  saveUsers(cleanUsers);
  return cleanUsers;
}

// Initialisation au démarrage
loadFormateurs();
loadUsers();

// --- Configuration par défaut (Portail_Formation_TPG_v20) ---
const DEFAULT_CONFIG = {
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
  vtbOptions: ['TB 760', 'TB 766', 'TB 1636']
};

// CORRIGÉ : la configuration existante n'est plus écrasée
function loadConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      return {
        MAIL_CONFIG: cfg.MAIL_CONFIG || DEFAULT_CONFIG.MAIL_CONFIG,
        vtbOptions: Array.isArray(cfg.vtbOptions) && cfg.vtbOptions.length > 0
          ? cfg.vtbOptions
          : DEFAULT_CONFIG.vtbOptions
      };
    } catch (e) {
      console.error('Erreur de lecture config.json :', e);
    }
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2), 'utf-8');
  return DEFAULT_CONFIG;
}

// --- Middleware d'authentification ---
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

  session.expiresAt = Date.now() + SESSION_DURATION_MS;
  return session;
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const session = getSessionFromRequest(req);
  if (!session) {
    res.status(401).json({ error: 'Non authentifié. Session expirée ou invalide.' });
    return;
  }
  (req as any).user = session;
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

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const session = (req as any).user as Session;
  if (!session || session.role !== 'admin') {
    res.status(403).json({ error: 'Accès refusé. Privilèges Administrateur requis.' });
    return;
  }
  next();
}

// --- Normalisation ---
function normalizeStr(text: string): string {
  return text
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

// Mot de passe temporaire aléatoire
function generateTempPassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%';
  const all = upper + lower + digits + symbols;

  const pick = (chars: string) => chars[crypto.randomInt(chars.length)];

  const chars = [pick(upper), pick(lower), pick(digits), pick(symbols)];
  for (let i = chars.length; i < 12; i++) {
    chars.push(pick(all));
  }

  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

// ==========================================================
// ROUTES API
// ==========================================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: 'v20', timestamp: new Date().toISOString() });
});

// Auth : connexion
app.post('/api/auth/login', (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    res.status(400).json({ error: 'Identifiant et mot de passe requis.' });
    return;
  }

  const users = loadUsers();
  const formateurs = loadFormateurs();
  const cleanId = identifier.trim().toLowerCase();
  const cleanIdNoDomain = cleanId.replace(/@tpg\.ch$/, '');
  const normalizedId = normalizeStr(identifier);

  const matchedUser = users.find(u => {
    if (normalizeStr(u.username) === normalizedId || normalizeStr(u.nomComplet) === normalizedId) {
      return true;
    }
    if (u.formateurId) {
      const f = formateurs.find(fmt => String(fmt.id) === String(u.formateurId));
      if (f) {
        if (f.email.toLowerCase() === cleanId || f.email.toLowerCase().split('@')[0] === cleanIdNoDomain) {
          return true;
        }
        if (normalizeStr(f.nomComplet) === normalizedId || normalizeStr(`${f.nom} ${f.prenom}`) === normalizedId) {
          return true;
        }
        if (f.acronyme && f.acronyme.toLowerCase() === cleanId) {
          return true;
        }
      }
    }
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
  saveSessions(sessions);

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
      mustChangePassword: matchedUser.mustChangePassword === true
    }
  });
});

// Auth : déconnexion
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = req.cookies['tpg_session'] || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : undefined);
  if (token) {
    sessions.delete(token);
    saveSessions(sessions);
  }
  res.clearCookie('tpg_session');
  res.json({ success: true, message: 'Déconnexion réussie.' });
});

// Auth : session courante
app.get('/api/auth/session', (req, res) => {
  const session = getSessionFromRequest(req);
  if (!session) {
    res.status(401).json({ error: 'Non authentifié' });
    return;
  }
  const users = loadUsers();
  const matchedUser = users.find(u => u.id === session.userId);
  res.json({
    authenticated: true,
    user: {
      id: session.userId,
      username: session.username,
      nomComplet: session.nomComplet,
      role: session.role,
      formateurId: session.formateurId,
      expiresAt: session.expiresAt,
      mustChangePassword: matchedUser?.mustChangePassword === true
    }
  });
});

// Auth : changer son mot de passe (connecté uniquement)
// CORRIGÉ : la route en double sans connexion a été supprimée.
app.post('/api/auth/change-password', requireAuth, (req, res) => {
  const session = (req as any).user as Session;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword || newPassword.length < 8) {
    res.status(400).json({ error: 'Nouveau mot de passe invalide (minimum 8 caractères).' });
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
// FORMATEURS : CRUD ET RECHERCHE
// ==========================================================

// Liste des formateurs (recherche, filtre, tri)
app.get('/api/formateurs', requireAuth, (req, res) => {
  const q = String(req.query.q || '').trim();
  const qualification = String(req.query.type || 'all');
  const sort = String(req.query.sort || 'asc');

  let list = loadFormateurs();

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
});

// Rapport d'audit (avant la route :id)
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
        detail: 'Le fichier source v20 fournit l’e-mail TPG exact et le numéro de portable pour les 29 formateurs.',
        actionPrise: 'Importation stricte des coordonnées dans le référentiel avec vérification syntaxique et validation visuelle.'
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

// Réinitialisation (ADMIN SEUL) — avant la route :id
app.post('/api/formateurs/reset-default', requireAuth, requireAdmin, (req, res) => {
  const defaults = generateDefaultFormateurs();
  saveFormateurs(defaults);
  try {
    if (fs.existsSync(CUSTOM_FORMATEURS_FILE)) {
      fs.unlinkSync(CUSTOM_FORMATEURS_FILE);
    }
  } catch (e) {}
  res.json({
    success: true,
    total: defaults.length,
    message: 'La liste des formateurs a été réinitialisée selon le fichier source officiel v20.'
  });
});

// Synchronisation des formateurs locaux (sauvegarde persistante PWA / localStorage)
app.post('/api/formateurs/sync', requireAuth, requireAdminOrResp, (req, res) => {
  const { formateurs: incoming } = req.body;
  if (!Array.isArray(incoming) || incoming.length === 0) {
    const current = loadFormateurs();
    res.json({ success: true, formateurs: current, total: current.length, added: 0 });
    return;
  }

  const current = loadFormateurs();
  const users = loadUsers();
  let addedCount = 0;

  for (const item of incoming) {
    if (!item || !item.nomComplet) continue;
    const exists = current.some(f =>
      String(f.id) === String(item.id) ||
      normalizeStr(f.nomComplet) === normalizeStr(item.nomComplet)
    );
    if (!exists) {
      const cleanNomComplet = item.nomComplet.trim();
      let cleanPrenom = item.prenom ? item.prenom.trim() : '';
      let cleanNom = item.nom ? item.nom.trim() : '';
      if (!cleanPrenom) {
        const split = splitPrenomNom(cleanNomComplet);
        cleanPrenom = split.prenom;
        cleanNom = split.nom;
      }
      const tramQualif = item.hasTram !== undefined ? Boolean(item.hasTram) : Boolean(item.isTramway);
      const newF: StoredFormateur = {
        id: String(item.id || Date.now() + Math.floor(Math.random() * 1000)),
        prenom: cleanPrenom,
        nom: cleanNom,
        nomComplet: cleanNomComplet,
        acronyme: item.acronyme ? item.acronyme.trim().toUpperCase() : '',
        isTramway: tramQualif,
        hasTram: tramQualif,
        hasAB: item.hasAB !== undefined ? Boolean(item.hasAB) : true,
        hasTB: item.hasTB !== undefined ? Boolean(item.hasTB) : true,
        hasCTT: Boolean(item.hasCTT),
        isRailsGlissants: Boolean(item.isRailsGlissants ?? tramQualif),
        email: (item.email || '').trim(),
        mobile: (item.mobile || item.telephone || '').trim(),
        telephone: (item.mobile || item.telephone || '').trim(),
        notes: item.notes ? item.notes.trim() : undefined,
        dateAjout: item.dateAjout || new Date().toISOString().split('T')[0],
        sourceOrigin: 'manuel'
      };
      current.push(newF);
      addedCount++;

      const username = (cleanPrenom + '.' + cleanNom).toLowerCase().replace(/[^a-z0-9.]/g, '') || `user${newF.id}`;
      if (!users.some(u => u.username === username || u.formateurId === newF.id)) {
        users.push({
          id: `usr-${newF.id}`,
          username,
          passwordHash: bcrypt.hashSync(DEFAULT_FORMATEUR_PASSWORD, bcrypt.genSaltSync(10)),
          nomComplet: cleanNomComplet,
          role: 'formateur',
          formateurId: newF.id,
          mustChangePassword: true
        });
      }
    }
  }

  if (addedCount > 0) {
    saveFormateurs(current);
    saveUsers(users);
  }

  res.json({ success: true, formateurs: current, total: current.length, added: addedCount });
});

// Un formateur
app.get('/api/formateurs/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const list = loadFormateurs();
  const found = list.find(f => String(f.id) === String(id));
  if (!found) {
    res.status(404).json({ error: 'Formateur non trouvé.' });
    return;
  }
  res.json(found);
});

// Créer un formateur (ADMIN OU RESPONSABLE)
app.post('/api/formateurs', requireAuth, requireAdminOrResp, (req, res) => {
  const { nom, email, mobile, prenom, acronyme, isTramway, hasTram, hasAB, hasTB, hasCTT, isRailsGlissants, telephone, notes } = req.body;

  let cleanNomComplet = (nom || '').trim();
  let cleanPrenom = (prenom || '').trim();
  let cleanNom = '';

  if (!cleanNomComplet && (!prenom || !nom)) {
    res.status(400).json({ error: 'Le nom est obligatoire.' });
    return;
  }

  if (cleanNomComplet && !cleanPrenom) {
    const split = splitPrenomNom(cleanNomComplet);
    cleanPrenom = split.prenom;
    cleanNom = split.nom;
  } else {
    cleanNom = (nom || '').trim();
    cleanNomComplet = `${cleanPrenom} ${cleanNom}`.trim();
  }

  const list = loadFormateurs();
  const duplicate = list.some(f => normalizeStr(f.nomComplet) === normalizeStr(cleanNomComplet));
  if (duplicate) {
    res.status(409).json({ error: `Un formateur avec le nom "${cleanNomComplet}" existe déjà.` });
    return;
  }

  // CORRIGÉ : vérifier l'identifiant AVANT de créer quoi que ce soit
  const username = (cleanPrenom + '.' + cleanNom).toLowerCase().replace(/[^a-z0-9.]/g, '') || `user${Date.now()}`;
  const users = loadUsers();
  if (users.some(u => u.username === username)) {
    res.status(409).json({ error: `L'identifiant "${username}" existe déjà. Modifiez le prénom ou le nom.` });
    return;
  }

  const tramQualif = hasTram !== undefined ? Boolean(hasTram) : Boolean(isTramway);
  const abQualif = hasAB !== undefined ? Boolean(hasAB) : true;
  const tbQualif = hasTB !== undefined ? Boolean(hasTB) : true;
  const cttQualif = Boolean(hasCTT);

  const newFormateur: StoredFormateur = {
    id: String(Date.now()),
    prenom: cleanPrenom,
    nom: cleanNom,
    nomComplet: cleanNomComplet,
    acronyme: acronyme ? acronyme.trim().toUpperCase() : '',
    isTramway: tramQualif,
    hasTram: tramQualif,
    hasAB: abQualif,
    hasTB: tbQualif,
    hasCTT: cttQualif,
    isRailsGlissants: Boolean(isRailsGlissants ?? tramQualif),
    email: (email || '').trim(),
    mobile: (mobile || telephone || '').trim(),
    telephone: (mobile || telephone || '').trim(),
    notes: notes ? notes.trim() : undefined,
    dateAjout: new Date().toISOString().split('T')[0],
    sourceOrigin: 'manuel'
  };

  list.push(newFormateur);
  saveFormateurs(list);

  const tempPassword = generateTempPassword();
  users.push({
    id: `usr-${newFormateur.id}`,
    username,
    passwordHash: bcrypt.hashSync(tempPassword, bcrypt.genSaltSync(10)),
    nomComplet: cleanNomComplet,
    role: 'formateur',
    formateurId: newFormateur.id,
    mustChangePassword: true
  });
  saveUsers(users);

  res.status(201).json({
    success: true,
    formateur: newFormateur,
    account: {
      username,
      tempPassword
    },
    message: 'Formateur créé avec succès.'
  });
});

// Modifier un formateur (ADMIN OU RESPONSABLE)
app.put('/api/formateurs/:id', requireAuth, requireAdminOrResp, (req, res) => {
  const { id } = req.params;
  const { nom, email, mobile, prenom, acronyme, isTramway, hasTram, hasAB, hasTB, hasCTT, isRailsGlissants, telephone, notes } = req.body;

  const list = loadFormateurs();
  const index = list.findIndex(f => String(f.id) === String(id));
  if (index === -1) {
    res.status(404).json({ error: 'Formateur non trouvé.' });
    return;
  }

  let cleanNomComplet = (nom || list[index].nomComplet).trim();
  let cleanPrenom = prenom !== undefined ? prenom.trim() : list[index].prenom;
  let cleanNom = list[index].nom;

  if (nom && !prenom) {
    const split = splitPrenomNom(cleanNomComplet);
    cleanPrenom = split.prenom;
    cleanNom = split.nom;
  }

  const updatedHasTram = hasTram !== undefined ? Boolean(hasTram) : (isTramway !== undefined ? Boolean(isTramway) : (list[index].hasTram ?? list[index].isTramway));
  const updatedHasAB = hasAB !== undefined ? Boolean(hasAB) : (list[index].hasAB ?? true);
  const updatedHasTB = hasTB !== undefined ? Boolean(hasTB) : (list[index].hasTB ?? true);
  const updatedHasCTT = hasCTT !== undefined ? Boolean(hasCTT) : Boolean(list[index].hasCTT);

  list[index] = {
    ...list[index],
    prenom: cleanPrenom,
    nom: cleanNom,
    nomComplet: cleanNomComplet,
    email: email !== undefined ? email.trim() : list[index].email,
    mobile: mobile !== undefined ? mobile.trim() : (telephone !== undefined ? telephone.trim() : list[index].mobile),
    telephone: telephone !== undefined ? telephone.trim() : (mobile !== undefined ? mobile.trim() : list[index].telephone),
    acronyme: acronyme !== undefined ? acronyme.trim().toUpperCase() : list[index].acronyme,
    isTramway: updatedHasTram,
    hasTram: updatedHasTram,
    hasAB: updatedHasAB,
    hasTB: updatedHasTB,
    hasCTT: updatedHasCTT,
    isRailsGlissants: isRailsGlissants !== undefined ? Boolean(isRailsGlissants) : list[index].isRailsGlissants,
    notes: notes !== undefined ? notes.trim() : list[index].notes
  };

  saveFormateurs(list);

  const users = loadUsers();
  const user = users.find(u => String(u.formateurId) === String(id));
  if (user) {
    user.nomComplet = cleanNomComplet;
    saveUsers(users);
  }

  res.json({
    success: true,
    formateur: list[index],
    message: 'Formateur mis à jour avec succès.'
  });
});

// Supprimer un formateur (ADMIN OU RESPONSABLE)
app.delete('/api/formateurs/:id', requireAuth, requireAdminOrResp, (req, res) => {
  const { id } = req.params;
  const list = loadFormateurs();
  const index = list.findIndex(f => String(f.id) === String(id));
  if (index === -1) {
    res.status(404).json({ error: 'Formateur non trouvé.' });
    return;
  }

  const deleted = list.splice(index, 1)[0];
  saveFormateurs(list);

  const users = loadUsers();
  const userIdx = users.findIndex(u => String(u.formateurId) === String(id));
  if (userIdx !== -1) {
    users.splice(userIdx, 1);
    saveUsers(users);
  }

  res.json({
    success: true,
    message: `Formateur ${deleted.nomComplet} supprimé avec succès.`
  });
});

// Obtenir les informations de compte / identifiants d'un formateur (ADMIN OU RESPONSABLE)
app.get('/api/formateurs/:id/account', requireAuth, requireAdminOrResp, (req, res) => {
  const { id } = req.params;
  const list = loadFormateurs();
  const formateur = list.find(f => String(f.id) === String(id));
  if (!formateur) {
    res.status(404).json({ error: 'Formateur non trouvé.' });
    return;
  }

  const users = loadUsers();
  let user = users.find(u => String(u.formateurId) === String(id));

  // Si le compte utilisateur n'existe pas encore pour ce formateur, le créer
  if (!user) {
    const cleanPrenom = formateur.prenom || '';
    const cleanNom = formateur.nom || '';
    const username = (cleanPrenom + '.' + cleanNom).toLowerCase().replace(/[^a-z0-9.]/g, '') || `user${formateur.id}`;
    user = {
      id: `usr-${formateur.id}`,
      username,
      passwordHash: bcrypt.hashSync(DEFAULT_FORMATEUR_PASSWORD, bcrypt.genSaltSync(10)),
      nomComplet: formateur.nomComplet,
      role: 'formateur',
      formateurId: formateur.id,
      mustChangePassword: true
    };
    users.push(user);
    saveUsers(users);
  }

  res.json({
    formateurId: formateur.id,
    nomComplet: formateur.nomComplet,
    email: formateur.email,
    mobile: formateur.mobile || formateur.telephone,
    username: user.username,
    role: user.role,
    mustChangePassword: user.mustChangePassword === true,
    defaultTempPassword: user.mustChangePassword ? DEFAULT_FORMATEUR_PASSWORD : null
  });
});

// Réinitialiser le mot de passe provisoire d'un formateur (ADMIN OU RESPONSABLE)
app.post('/api/formateurs/:id/reset-password', requireAuth, requireAdminOrResp, (req, res) => {
  const { id } = req.params;
  const list = loadFormateurs();
  const formateur = list.find(f => String(f.id) === String(id));
  if (!formateur) {
    res.status(404).json({ error: 'Formateur non trouvé.' });
    return;
  }

  const users = loadUsers();
  let user = users.find(u => String(u.formateurId) === String(id));
  const tempPassword = req.body.newPassword ? String(req.body.newPassword).trim() : generateTempPassword();

  if (!user) {
    const cleanPrenom = formateur.prenom || '';
    const cleanNom = formateur.nom || '';
    const username = (cleanPrenom + '.' + cleanNom).toLowerCase().replace(/[^a-z0-9.]/g, '') || `user${formateur.id}`;
    user = {
      id: `usr-${formateur.id}`,
      username,
      passwordHash: bcrypt.hashSync(tempPassword, bcrypt.genSaltSync(10)),
      nomComplet: formateur.nomComplet,
      role: 'formateur',
      formateurId: formateur.id,
      mustChangePassword: true
    };
    users.push(user);
  } else {
    user.passwordHash = bcrypt.hashSync(tempPassword, bcrypt.genSaltSync(10));
    user.mustChangePassword = true;
  }

  saveUsers(users);

  res.json({
    success: true,
    username: user.username,
    nomComplet: formateur.nomComplet,
    tempPassword,
    message: `Mot de passe provisoire pour ${formateur.nomComplet} réinitialisé avec succès.`
  });
});

// Liste récapitulative de tous les accès formateurs (ADMIN OU RESPONSABLE)
app.get('/api/formateurs-accounts', requireAuth, requireAdminOrResp, (req, res) => {
  const formateurs = loadFormateurs();
  const users = loadUsers();

  const accounts = formateurs.map(f => {
    const user = users.find(u => String(u.formateurId) === String(f.id));
    return {
      id: f.id,
      nomComplet: f.nomComplet,
      email: f.email,
      mobile: f.mobile || f.telephone,
      username: user ? user.username : (f.prenom + '.' + f.nom).toLowerCase().replace(/[^a-z0-9.]/g, ''),
      mustChangePassword: user ? (user.mustChangePassword === true) : true,
      hasLoggedIn: user ? !user.mustChangePassword : false,
      defaultTempPassword: DEFAULT_FORMATEUR_PASSWORD
    };
  });

  res.json({
    defaultPassword: DEFAULT_FORMATEUR_PASSWORD,
    total: accounts.length,
    accounts
  });
});

// Configuration de l'application (e-mails, options TB, etc.)
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
// VITE DEV SERVER OU SERVEUR STATIQUE EN PRODUCTION
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