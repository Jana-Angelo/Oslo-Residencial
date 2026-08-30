import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  ShieldCheck, 
  Lock, 
  Mail,
  Eye, 
  EyeOff, 
  Save, 
  User,
  AlertTriangle,
  X,
} from 'lucide-react';
import { Sidebar, MobileBottomNav, MobileHeader } from './shared';
import { UserProfile } from '../types';
import { APARTMENT_OPTIONS } from '../data';
import { authService } from '../lib/database';
import { supabase } from '../lib/supabaseClient';
import { storageService } from '../lib/storage';

interface PerfilScreenProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onNavigate: (screen: 'login' | 'caixa' | 'avisos' | 'ocorrencias' | 'dashboard' | 'indica_apt' | 'perfil', transition: 'none' | 'push') => void;
}

export default function PerfilScreen({ userProfile, onUpdateProfile, onNavigate }: PerfilScreenProps) {
  const [fullName, setFullName] = useState(userProfile.fullName);
  const [email, setEmail] = useState(userProfile.email || '');
  const [apartmentNumber, setApartmentNumber] = useState(userProfile.apartmentNumber);
  
  // New Password Reset Popup States
  const [isResetPopupOpen, setIsResetPopupOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [popupError, setPopupError] = useState('');
  const [popupSuccess, setPopupSuccess] = useState('');

  // Admin Activation Confirmation Popup States
  const [isAdminConfirmOpen, setIsAdminConfirmOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminConfirmError, setAdminConfirmError] = useState('');

  const [twoFactor, setTwoFactor] = useState(userProfile.twoFactorEnabled);
  const [visibleToOthers, setVisibleToOthers] = useState(userProfile.visibleToOthers);
  const [avatar, setAvatar] = useState(userProfile.avatar);
  const [isAdmin, setIsAdmin] = useState(() => {
    if (userProfile.isAdmin !== undefined) return userProfile.isAdmin;
    return userProfile.role === 'Administrador' || userProfile.role === 'Síndico';
  });
  
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
          setEmail(session.user.email);
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  const getAdminApartments = (): string[] => {
    try {
      const saved = localStorage.getItem('oslo_admin_apartments');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  };

  const hasOtherSyndic = async (): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const { data } = await supabase
          .from('perfis')
          .select('id')
          .in('tipo_perfil', ['sindico', 'admin']);
        return (data || []).some((p) => p.id !== session.user.id);
      }
    } catch {
      // ignore
    }
    const admins = getAdminApartments();
    return admins.filter(apt => apt !== apartmentNumber).length > 0;
  };

  const handleToggleAdmin = async () => {
    const nextValue = !isAdmin;
    if (!nextValue) {
      setIsAdmin(false);
      return;
    }
    if (await hasOtherSyndic()) {
      setErrorMsg('Já existe sindico cadastrado.');
      return;
    }
    setAdminConfirmError('');
    setAdminPassword('');
    setIsAdminConfirmOpen(true);
  };

  const handleConfirmAdminPassword = async () => {
    if (!adminPassword) {
      setAdminConfirmError('Digite sua senha para confirmar.');
      return;
    }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) {
        setIsAdmin(true);
        setIsAdminConfirmOpen(false);
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({
        email: session.user.email,
        password: adminPassword,
      });
      if (error) {
        setAdminConfirmError('Senha incorreta. Tente novamente.');
        return;
      }
      setIsAdmin(true);
      setIsAdminConfirmOpen(false);
    } catch {
      setAdminConfirmError('Erro ao validar a senha. Tente novamente.');
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) throw new Error('Usuário não autenticado');

      const url = await storageService.uploadAvatar(userId, file);
      setAvatar(url);
      await authService.updateProfile(userId, { avatar_url: url });
      onUpdateProfile({
        ...userProfile,
        avatar: url
      });
      setSuccessMsg('Foto atualizada com sucesso!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      console.error('Erro ao fazer upload do avatar:', err);
      setErrorMsg(err?.message || 'Falha ao enviar imagem. Verifique se o bucket de storage está configurado no Supabase.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    setAvatar('');
    onUpdateProfile({
      ...userProfile,
      avatar: ''
    });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await authService.updateProfile(session.user.id, { avatar_url: null });
      }
    } catch (e) {
      console.error('Erro ao deletar avatar no Supabase:', e);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (isAdmin && (await hasOtherSyndic())) {
      setErrorMsg('Já existe sindico cadastrado.');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const userId = session.user.id;
        await authService.updateProfile(userId, {
          nome_completo: fullName,
          avatar_url: avatar || null,
          tipo_perfil: isAdmin ? 'sindico' : 'morador',
        });
        if (session.user.email && email !== session.user.email) {
          await authService.updateEmail(email);
        }
        if (session.user.user_metadata?.full_name !== fullName) {
          await supabase.auth.updateUser({ data: { full_name: fullName } });
        }
        await authService.updateApartment(userId, apartmentNumber);
      }
    } catch (err: any) {
      console.error('Erro ao salvar no Supabase:', err);
      setErrorMsg(err?.message || 'Erro ao salvar dados no servidor. Verifique sua conexão.');
      return;
    }

    onUpdateProfile({
      ...userProfile,
      fullName,
      email,
      apartmentNumber,
      avatar,
      twoFactorEnabled: twoFactor,
      visibleToOthers: visibleToOthers,
      isAdmin,
      role: isAdmin ? 'Administrador' : 'Morador'
    });

    setSuccessMsg('Alterações salvas com sucesso!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleResetPasswordClick = () => {
    setIsResetPopupOpen(true);
    setNewPassword('');
    setConfirmNewPassword('');
    setPopupError('');
    setPopupSuccess('');
  };

  const handleSaveResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPopupError('');
    setPopupSuccess('');

    if (!newPassword) {
      setPopupError('Por favor, digite a nova senha.');
      return;
    }
    if (newPassword.length < 6) {
      setPopupError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPopupError('As senhas não coincidem.');
      return;
    }

    try {
      await authService.updatePassword(newPassword);
      setPopupSuccess('Senha redefinida com sucesso!');
      
      setTimeout(() => {
        setIsResetPopupOpen(false);
        setNewPassword('');
        setConfirmNewPassword('');
        setPopupSuccess('');
      }, 1500);
    } catch (err) {
      console.error(err);
      setPopupError('Ocorreu um erro ao salvar a senha.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F6] flex flex-col pb-20 md:pb-0 md:pl-64">
      
      <Sidebar activeScreen="perfil" isAdmin={isAdmin} onNavigate={onNavigate} />
      <MobileHeader
        title="Meu Perfil"
        subtitle="Dados e Configurações"
        userProfile={userProfile}
        onNavigate={onNavigate}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-3 sm:p-4 md:p-8 max-w-2xl mx-auto w-full space-y-4 md:space-y-6">
        
        {successMsg && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-center font-bold text-xs border border-emerald-100 uppercase tracking-wide">
            {successMsg}
          </div>
        )}

        {!avatar && (
          <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800">
            <Camera className="w-5 h-5 shrink-0" />
            <p className="text-xs font-medium flex-1">
              Adicione uma foto ao seu perfil para que seus vizinhos possam te reconhecer.
            </p>
            <button
              type="button"
              onClick={handleUploadClick}
              className="shrink-0 px-3 py-1.5 bg-amber-200/60 hover:bg-amber-200 text-amber-900 font-bold text-[10px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
            >
              Adicionar foto
            </button>
          </div>
        )}

        {/* 1. User Identity Card */}
        <div data-onboarding="perfil:avatar" className="bg-white border border-[#EAE3D5] rounded-2xl p-6 shadow-sm flex flex-col items-center text-center space-y-5">
          <input 
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-3 border-[#8C7364] shadow-lg flex items-center justify-center bg-[#F5F2EB]">
              {avatar ? (
                <img 
                  src={avatar} 
                  alt={fullName} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="w-12 h-12 text-[#8C7364]" />
              )}
            </div>
            {/* Camera Overlay button */}
            <button 
              type="button"
              onClick={handleUploadClick}
              className="absolute bottom-0 right-0 p-2 bg-[#8C7364] text-white rounded-full hover:bg-[#7A6355] transition-colors shadow-md cursor-pointer"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="w-full grid grid-cols-2 gap-3">
            <button 
              type="button"
              onClick={handleUploadClick}
              disabled={uploading}
              className="py-2.5 px-4 bg-white hover:bg-[#F5F2EB] border border-[#E5DFD5] text-[#8C7364] font-bold text-xs rounded-xl tracking-wider uppercase cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-wait"
            >
              {uploading ? 'ENVIANDO...' : 'ENVIAR FOTO'}
            </button>
            <button 
              type="button"
              onClick={handleDeleteAvatar}
              disabled={uploading}
              className="py-2.5 px-4 bg-white hover:bg-red-50 border border-red-200 text-red-600 font-bold text-xs rounded-xl tracking-wider uppercase cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-wait"
            >
              EXCLUIR
            </button>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-widest text-[#A6978A] uppercase block">
              Identidade do Usuário
            </span>
            <h3 className="text-xl font-extrabold text-[#3E342F] font-display">
              {fullName}
            </h3>
            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-[9px] font-bold tracking-wider uppercase rounded-full border border-emerald-200">
              {isAdmin ? "ADMINISTRATOR / SÍNDICO" : "MORADOR"}
            </span>
          </div>
        </div>

        {/* 2. Access Privileges Card */}
        <div data-onboarding="perfil:privilegios" className="bg-white border border-[#EAE3D5] rounded-2xl p-6 shadow-sm space-y-4">
          <h4 className="text-[10px] font-bold tracking-widest text-[#8C7364] uppercase block border-l-2 border-[#CBBFB7] pl-2">
            Privilégios de Acesso
          </h4>
          
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl shrink-0 ${isAdmin ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h5 className="font-extrabold text-sm text-[#3E342F]">
                {isAdmin ? "Acesso Total ao Sistema" : "Acesso Limitado ao Sistema"}
              </h5>
              <p className="text-xs text-[#6E6157] leading-relaxed">
                {isAdmin 
                  ? "Permissões de administrador ativas. Você pode gerenciar o 'Caixa do Prédio', 'Avisos' e todos os perfis de moradores."
                  : "Permissões de morador ativas. Suas permissões são restritas a visualizações básicas."}
              </p>
            </div>
          </div>

          <div className="p-4 bg-[#F5F2EB]/60 rounded-xl border border-dashed border-[#CBBFB7] text-xs text-[#6E6157] leading-relaxed">
            {isAdmin 
              ? "Nota: Como administrador, você possui privilégios para visualizar relatórios financeiros."
              : "Nota: As contas de moradores são restritas ao 'Quadro de Avisos', 'IndicaApt' e ao seu próprio 'Perfil'."}
          </div>
        </div>

        {/* 3. Account Settings Form Card */}
        <div data-onboarding="perfil:nome_email" className="bg-white border border-[#EAE3D5] rounded-2xl p-6 shadow-sm space-y-5">
          <h4 className="text-[10px] font-bold tracking-widest text-[#8C7364] uppercase block border-l-2 border-[#CBBFB7] pl-2 border-b border-[#F5F2EB] pb-2">
            Configurações da Conta
          </h4>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8C7364] uppercase tracking-wider">Nome Completo</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F5F2EB] border border-[#E5DFD5] rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#8C7364] text-[#3E342F]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#8C7364] uppercase tracking-wider">E-mail</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7364]">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#F5F2EB] border border-[#E5DFD5] rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#8C7364] text-[#3E342F] placeholder-[#C1B5A9]"
                />
              </div>
            </div>

            <div data-onboarding="perfil:apartamento" className="space-y-1">
              <label className="text-[10px] font-bold text-[#8C7364] uppercase tracking-wider">Número do Apartamento</label>
              <select
                value={apartmentNumber}
                onChange={(e) => setApartmentNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F5F2EB] border border-[#E5DFD5] rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#8C7364] text-[#3E342F]"
              >
                {APARTMENT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Forget/Reset Link */}
            <div className="flex items-center justify-between text-xs font-semibold pt-1">
              <span className="text-[#8C7364]">Esqueceu a senha ou quer redefinir?</span>
              <button 
                type="button"
                data-onboarding="perfil:redefinir_senha"
                onClick={handleResetPasswordClick}
                className="text-[#8C7364] hover:underline uppercase tracking-wide cursor-pointer text-[11px]"
              >
                Redefinir Senha
              </button>
            </div>

            <button
              data-onboarding="perfil:salvar"
              type="submit"
              className="w-full py-3.5 bg-[#8C7364] hover:bg-[#7A6355] text-white font-bold rounded-xl text-xs uppercase tracking-wider mt-3 cursor-pointer shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar Alterações do Perfil
            </button>
          </form>
        </div>

        {/* 4. Permissões de Usuário */}
        <div className="bg-white border border-[#EAE3D5] rounded-2xl p-6 shadow-sm space-y-4">
          <h4 className="text-[10px] font-bold tracking-widest text-[#8C7364] uppercase block border-l-2 border-[#CBBFB7] pl-2 border-b border-[#F5F2EB] pb-2">
            Permissões de Usuário
          </h4>

          <div className="space-y-4">
            {/* Toggle ADMIN */}
            <div className="flex items-center justify-between pt-1">
              <div className="space-y-0.5">
                <p className="font-bold text-xs text-[#3E342F]">Usuário ADMIN</p>
                <p className="text-[10px] text-[#8C7364] font-medium">Habilitar acesso a todas as telas do portal (Início, Caixa do Prédio, Avisos, IndicaApt e Perfil)</p>
              </div>
              <button
                type="button"
                data-onboarding="perfil:toggle_admin"
                onClick={handleToggleAdmin}
                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  isAdmin ? 'bg-[#8C7364]' : 'bg-[#E5DFD5]'
                }`}
              >
                <motion.div 
                  layout
                  className="bg-white w-4 h-4 rounded-full shadow-md"
                  animate={{ x: isAdmin ? 20 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          </div>
        </div>

      </main>

      <MobileBottomNav activeScreen="perfil" isAdmin={isAdmin} onNavigate={onNavigate} />

      {/* Reset Password Modal */}
      <AnimatePresence>
        {isResetPopupOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md bg-[#FBF9F6] rounded-2xl p-8 shadow-2xl border border-[#EAE3D5] relative"
            >
              <button
                onClick={() => setIsResetPopupOpen(false)}
                className="absolute right-4 top-4 p-1.5 text-[#8C7364] hover:text-[#3E342F] rounded-full hover:bg-[#F5F2EB] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#8C7364]/10 rounded-full flex items-center justify-center text-[#8C7364]">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#3E342F] font-display">Redefinir Senha</h3>
                    <p className="text-xs text-[#8C7364]">Digite e confirme sua nova senha de acesso.</p>
                  </div>
                </div>

                <form onSubmit={handleSaveResetPassword} className="space-y-4">
                  {popupError && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium text-center border border-red-100">
                      {popupError}
                    </div>
                  )}

                  {popupSuccess && (
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-medium text-center border border-emerald-100">
                      {popupSuccess}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[#8C7364] text-[10px] font-bold tracking-widest uppercase block">
                      Nova Senha
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7364]">
                        <Lock className="w-5 h-5" />
                      </span>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Mínimo 6 caracteres"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setPopupError('');
                        }}
                        className="w-full pl-11 pr-11 py-3 bg-[#F5F2EB] border border-[#E5DFD5] rounded-xl text-[#3E342F] font-medium placeholder-[#C1B5A9] focus:outline-none focus:ring-2 focus:ring-[#8C7364]/20 focus:border-[#8C7364] transition-all text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C7364] hover:text-[#3E342F] focus:outline-none cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[#8C7364] text-[10px] font-bold tracking-widest uppercase block">
                      Confirmar Nova Senha
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7364]">
                        <Lock className="w-5 h-5" />
                      </span>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Confirme a nova senha"
                        value={confirmNewPassword}
                        onChange={(e) => {
                          setConfirmNewPassword(e.target.value);
                          setPopupError('');
                        }}
                        className="w-full pl-11 pr-11 py-3 bg-[#F5F2EB] border border-[#E5DFD5] rounded-xl text-[#3E342F] font-medium placeholder-[#C1B5A9] focus:outline-none focus:ring-2 focus:ring-[#8C7364]/20 focus:border-[#8C7364] transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsResetPopupOpen(false)}
                      className="py-3 bg-[#F5F2EB] hover:bg-[#E5DFD5] text-[#3E342F] font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer text-center"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="py-3 bg-[#8C7364] hover:bg-[#7A6355] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer text-center shadow-md"
                    >
                      Salvar
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Activation Confirmation Modal */}
      <AnimatePresence>
        {isAdminConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md bg-[#FBF9F6] rounded-2xl p-8 shadow-2xl border border-[#EAE3D5] relative"
            >
              <button
                onClick={() => setIsAdminConfirmOpen(false)}
                className="absolute right-4 top-4 p-1.5 text-[#8C7364] hover:text-[#3E342F] rounded-full hover:bg-[#F5F2EB] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#8C7364]/10 rounded-full flex items-center justify-center text-[#8C7364]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#3E342F] font-display">Ativar Usuário ADMIN</h3>
                    <p className="text-xs text-[#8C7364]">Digite sua senha para confirmar a ativação.</p>
                  </div>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleConfirmAdminPassword(); }} className="space-y-4">
                  {adminConfirmError && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium text-center border border-red-100">
                      {adminConfirmError}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[#8C7364] text-[10px] font-bold tracking-widest uppercase block">
                      Senha
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7364]">
                        <Lock className="w-5 h-5" />
                      </span>
                      <input
                        type="password"
                        placeholder="Digite sua senha atual"
                        value={adminPassword}
                        onChange={(e) => {
                          setAdminPassword(e.target.value);
                          setAdminConfirmError('');
                        }}
                        className="w-full pl-11 pr-11 py-3 bg-[#F5F2EB] border border-[#E5DFD5] rounded-xl text-[#3E342F] font-medium placeholder-[#C1B5A9] focus:outline-none focus:ring-2 focus:ring-[#8C7364]/20 focus:border-[#8C7364] transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAdminConfirmOpen(false)}
                      className="py-3 bg-[#F5F2EB] hover:bg-[#E5DFD5] text-[#3E342F] font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer text-center"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="py-3 bg-[#8C7364] hover:bg-[#7A6355] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer text-center shadow-md"
                    >
                      Confirmar
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Error Popup Modal */}
      <AnimatePresence>
        {errorMsg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm bg-[#FBF9F6] rounded-2xl p-6 shadow-2xl border border-red-200 relative text-center space-y-4"
            >
              <button
                onClick={() => setErrorMsg('')}
                className="absolute right-4 top-4 p-1.5 text-[#8C7364] hover:text-[#3E342F] rounded-full hover:bg-[#F5F2EB] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600 mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h3 className="font-extrabold text-base text-red-600 font-display tracking-wide">
                  {errorMsg}
                </h3>
                <p className="text-xs text-[#6E6157] leading-relaxed">
                  {errorMsg.toLowerCase().includes('sindico') || errorMsg.toLowerCase().includes('administrador')
                    ? 'Apenas um apartamento pode estar registrado como Síndico (Administrador) no condomínio.'
                    : 'Tente novamente ou verifique sua conexão.'}
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setErrorMsg('')}
                  className="w-full py-2.5 bg-[#8C7364] hover:bg-[#7A6355] text-white font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-colors shadow-md"
                >
                  Ok, Entendido
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
