import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, User, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(identifier.trim(), password);
    } catch (err: any) {
      setError(err.message || 'Identifiant ou mot de passe non reconnu.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setIdentifier(u);
    setPassword(p);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Top header bar in TPG Orange */}
        <div className="bg-[#FD5312] p-6 text-white text-center">
          <div className="flex items-center justify-center mb-3">
            <img
              src="/assets/aistudio/Logo_tpg_blanc-removebg-preview_c2267cb4.png"
              alt="Logo TPG"
              className="h-11 w-auto object-contain"
            />
          </div>
          <h1 className="text-xl font-bold uppercase tracking-tight font-tpg">
            PORTAIL FORMATION TPG
          </h1>
          <p className="text-xs uppercase font-bold tracking-widest text-orange-100 mt-1 font-tpg">
            Authentification Sécurisée Côté Serveur
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-1.5">
                Identifiant ou Nom complet <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Ex: admin ou Christian NOVERRAZ"
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:border-[#FD5312] focus:ring-2 focus:ring-[#FD5312]/20 transition outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-gray-700 tracking-wider mb-1.5">
                Mot de passe sécurisé <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:border-[#FD5312] focus:ring-2 focus:ring-[#FD5312]/20 transition outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 bg-[#FD5312] hover:bg-[#e04508] active:translate-y-0.5 text-white font-black uppercase text-sm tracking-wider rounded-lg shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Vérification...</span>
                </>
              ) : (
                <span>Connexion au Portail</span>
              )}
            </button>
          </form>

          {/* Quick test accounts helper */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-[11px] font-bold uppercase text-gray-500 tracking-wider mb-2">
              Comptes de test & validation rapide :
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('admin', 'AdminTpg2026!')}
                className="p-2 bg-gray-50 hover:bg-orange-50 hover:border-orange-200 border border-gray-200 rounded text-left transition cursor-pointer"
              >
                <div className="font-black text-[#FD5312]">Administrateur</div>
                <div className="text-[10px] text-gray-500">CRUD complet & audit</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('Christian NOVERRAZ', 'TpgFormation2026!')}
                className="p-2 bg-gray-50 hover:bg-orange-50 hover:border-orange-200 border border-gray-200 rounded text-left transition cursor-pointer"
              >
                <div className="font-black text-gray-800">Formateur Tram</div>
                <div className="text-[10px] text-gray-500">Ch. NOVERRAZ</div>
              </button>
            </div>
            <p className="mt-2 text-[10px] text-gray-400 text-center">
              Chiffrement Bcrypt 10 rounds • Sessions chiffrées sécurisées • Protection des routes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
