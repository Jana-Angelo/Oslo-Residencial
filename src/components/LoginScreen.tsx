import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  ChevronRight, 
  X, 
  Mail, 
  User, 
  CheckCircle2, 
  Loader2,
  ArrowRight,
  Building2
} from 'lucide-react';
import { APARTMENT_OPTIONS } from '../data';
import { authService } from '../lib/database';

interface LoginScreenProps {
  onLogin: () => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('oslo_remembered_credentials');
      if (saved) {
        const creds = JSON.parse(saved);
        setEmail(creds.email || '');
        setRememberMe(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [regEmail, setRegEmail] = useState('');
  const [regApartment, setRegApartment] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [regError, setRegError] = useState('');
  const [isRegDropdownOpen, setIsRegDropdownOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Por favor, informe o seu e-mail.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Por favor, insira um e-mail válido.');
      return;
    }
    if (!password) {
      setError('Por favor, digite sua senha.');
      return;
    }

    if (rememberMe) {
      try {
        localStorage.setItem('oslo_remembered_credentials', JSON.stringify({ email }));
      } catch (e) {
        console.error(e);
      }
    } else {
      try {
        localStorage.removeItem('oslo_remembered_credentials');
      } catch (e) {
        console.error(e);
      }
    }

    try {
      await authService.signIn(email, password);
      onLogin();
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('Invalid login credentials')) {
        setError('E-mail ou senha incorretos.');
      } else {
        setError('Erro ao acessar. Tente novamente.');
      }
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regEmail) {
      setRegError('Por favor, informe o seu e-mail.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) {
      setRegError('Por favor, insira um e-mail válido.');
      return;
    }
    if (!regApartment) {
      setRegError('Selecione o seu apartamento.');
      return;
    }
    if (!regPassword) {
      setRegError('Por favor, crie uma senha de acesso.');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('Sua senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('As senhas digitadas não são iguais.');
      return;
    }

    setRegLoading(true);
    try {
      await authService.signUp(regEmail, regPassword, regEmail, regApartment);
      setRegLoading(false);
      setRegSuccess(true);
    } catch (err: any) {
      setRegLoading(false);
      const msg = err?.message || '';
      if (msg.includes('already registered') || msg.includes('already been registered')) {
        setRegError('Este e-mail já está cadastrado.');
      } else {
        setRegError('Erro ao cadastrar. Tente novamente.');
      }
    }
  };

  return (
    <div 
      className="relative min-h-screen flex items-center justify-center p-4 bg-cover bg-center overflow-x-hidden"
      style={{ 
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.55)), url('/images/oslo_facade.jpg')`
      }}
    >
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md bg-[#FBF9F6]/95 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20 flex flex-col items-center"
      >
        {/* Header / Logo */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 bg-[#8C7364] text-white rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-bold text-[#3E342F] tracking-tight font-display">
            Oslo Residencial
          </h1>
          <p className="text-[#8C7364] font-semibold text-xs tracking-widest uppercase mt-1">
            Bem-vindo ao seu lar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium text-center border border-red-100">
              {error}
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-[#8C7364] text-[10px] font-bold tracking-widest uppercase block">
              E-mail
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7364]">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="email"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className="w-full pl-11 pr-4 py-3.5 bg-[#F5F2EB] border border-[#E5DFD5] rounded-xl text-[#3E342F] font-medium placeholder-[#C1B5A9] focus:outline-none focus:ring-2 focus:ring-[#8C7364]/20 focus:border-[#8C7364] transition-all text-sm"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-[#8C7364] text-[10px] font-bold tracking-widest uppercase block">
              Senha
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7364]">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full pl-11 pr-11 py-3.5 bg-[#F5F2EB] border border-[#E5DFD5] rounded-xl text-[#3E342F] font-medium placeholder-[#C1B5A9] focus:outline-none focus:ring-2 focus:ring-[#8C7364]/20 focus:border-[#8C7364] transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C7364] hover:text-[#3E342F] focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              role="checkbox"
              aria-checked={rememberMe}
              onClick={() => setRememberMe(!rememberMe)}
              className={`w-[18px] h-[18px] rounded-md border-2 flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
                rememberMe
                  ? 'bg-[#8C7364] border-[#8C7364]'
                  : 'bg-[#F5F2EB] border-[#E5DFD5] hover:border-[#8C7364]/50'
              }`}
            >
              {rememberMe && (
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              )}
            </button>
            <label 
              onClick={() => setRememberMe(!rememberMe)}
              className="text-[#8C7364] text-xs font-semibold cursor-pointer select-none"
            >
              Lembrar minha senha
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 bg-[#8C7364] hover:bg-[#7A6355] active:bg-[#685346] text-white font-bold tracking-wider rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer uppercase text-xs mt-2"
          >
            Acessar Portal
            <ChevronRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer links */}
        <div className="w-full flex items-center justify-end mt-6 text-xs font-semibold text-[#8C7364]">
          <button 
            type="button"
            onClick={() => {
              setIsRegisterOpen(true);
              setRegSuccess(false);
              setRegEmail('');
              setRegApartment('');
              setRegPassword('');
              setRegConfirmPassword('');
              setRegError('');
            }}
            className="hover:underline hover:text-[#3E342F] cursor-pointer focus:outline-none"
          >
            Primeiro Cadastro?
          </button>
        </div>

        <div className="w-full border-t border-[#E5DFD5] mt-8 pt-6 text-center">
          <p className="text-[10px] text-[#A6978A] font-semibold tracking-wider uppercase">
            Administrado por Oslo © 2026
          </p>
        </div>
      </motion.div>

      {/* Register Modal */}
      <AnimatePresence>
        {isRegisterOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md bg-[#FBF9F6] rounded-2xl p-8 shadow-2xl border border-white/20 relative my-8"
            >
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="absolute right-4 top-4 p-1.5 text-[#8C7364] hover:text-[#3E342F] rounded-full hover:bg-[#F5F2EB] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {!regSuccess ? (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#8C7364]/10 rounded-full flex items-center justify-center text-[#8C7364]">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#3E342F]">Primeiro Cadastro</h3>
                      <p className="text-xs text-[#8C7364]">Preencha as informações para se cadastrar.</p>
                    </div>
                  </div>

                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    {regError && (
                      <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium text-center border border-red-100">
                        {regError}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-[#8C7364] text-[10px] font-bold tracking-widest uppercase block">
                        Seu E-mail
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7364]">
                          <Mail className="w-5 h-5" />
                        </span>
                        <input
                          type="email"
                          placeholder="seuemail@exemplo.com"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="w-full pl-11 pr-4 py-3.5 bg-[#F5F2EB] border border-[#E5DFD5] rounded-xl text-[#3E342F] font-medium placeholder-[#C1B5A9] focus:outline-none focus:ring-2 focus:ring-[#8C7364]/20 focus:border-[#8C7364] transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[#8C7364] text-[10px] font-bold tracking-widest uppercase block">
                        Seu Apartamento
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsRegDropdownOpen(!isRegDropdownOpen)}
                          className="w-full pl-11 pr-10 py-3.5 bg-[#F5F2EB] border border-[#E5DFD5] rounded-xl text-[#3E342F] font-medium focus:outline-none focus:ring-2 focus:ring-[#8C7364]/20 focus:border-[#8C7364] transition-all text-sm text-left flex items-center justify-between cursor-pointer"
                        >
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7364] z-10">
                            <Building2 className="w-5 h-5" />
                          </span>
                          <span>{regApartment || 'Selecione o Apartamento...'}</span>
                          <span className="text-[#8C7364] text-[10px] font-bold transition-transform duration-200" style={{ transform: isRegDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                            ▼
                          </span>
                        </button>

                        <AnimatePresence>
                          {isRegDropdownOpen && (
                            <>
                              <div className="fixed inset-0 z-30" onClick={() => setIsRegDropdownOpen(false)} />
                              
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.15 }}
                                className="absolute left-0 right-0 mt-1.5 bg-[#FBF9F6] border border-[#E5DFD5] rounded-xl shadow-xl z-40 max-h-48 overflow-y-auto divide-y divide-[#E5DFD5]/30 scrollbar-thin scrollbar-thumb-[#8C7364]/30 scrollbar-track-transparent"
                              >
                                {APARTMENT_OPTIONS.map((opt) => (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => {
                                      setRegApartment(opt);
                                      setIsRegDropdownOpen(false);
                                      setRegError('');
                                    }}
                                    className={`w-full text-left px-4 py-3.5 text-sm transition-colors cursor-pointer hover:bg-[#8C7364]/10 ${
                                      regApartment === opt 
                                        ? 'bg-[#8C7364] text-white hover:bg-[#8C7364]' 
                                        : 'text-[#3E342F]'
                                    }`}
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[#8C7364] text-[10px] font-bold tracking-widest uppercase block">
                          Criar Senha
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7364]">
                            <Lock className="w-5 h-5" />
                          </span>
                          <input
                            type="password"
                            placeholder="••••••••"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-[#F5F2EB] border border-[#E5DFD5] rounded-xl text-[#3E342F] font-medium placeholder-[#C1B5A9] focus:outline-none focus:ring-2 focus:ring-[#8C7364]/20 focus:border-[#8C7364] transition-all text-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[#8C7364] text-[10px] font-bold tracking-widest uppercase block">
                          Confirmar Senha
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7364]">
                            <Lock className="w-5 h-5" />
                          </span>
                          <input
                            type="password"
                            placeholder="••••••••"
                            value={regConfirmPassword}
                            onChange={(e) => setRegConfirmPassword(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-[#F5F2EB] border border-[#E5DFD5] rounded-xl text-[#3E342F] font-medium placeholder-[#C1B5A9] focus:outline-none focus:ring-2 focus:ring-[#8C7364]/20 focus:border-[#8C7364] transition-all text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={regLoading}
                      className="w-full py-3.5 bg-[#8C7364] hover:bg-[#7A6355] disabled:bg-[#8C7364]/50 text-white font-bold tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer uppercase text-xs"
                    >
                      {regLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          Processando...
                        </>
                      ) : (
                        <>
                          Confirmar Cadastro
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center py-4">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4 border border-emerald-100">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-[#3E342F] mb-2">Cadastro Realizado!</h3>
                  <p className="text-sm text-[#8C7364] max-w-sm mb-6 leading-relaxed">
                    Seu cadastro para o <strong className="text-[#3E342F]">{regApartment}</strong> foi concluído com sucesso. Agora você já pode acessar o portal utilizando sua nova senha!
                  </p>
                  <button
                    onClick={() => {
                      setEmail(regEmail);
                      setIsRegisterOpen(false);
                    }}
                    className="w-full py-3 bg-[#8C7364] hover:bg-[#7A6355] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Voltar ao Login
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}