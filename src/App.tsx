import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { AnimatePresence, MotionConfig, motion, type Variants } from 'motion/react';
import { Notice, Recommendation, PendingPayment, UserProfile, FinanceSummary, Ocorrencia, OcorrenciaComment } from './types';
import { 
  INITIAL_NOTICES, 
  INITIAL_RECOMMENDATIONS, 
  INITIAL_PAYMENTS, 
  INITIAL_FINANCIAL_SUMMARY, 
  INITIAL_PROFILE,
  INITIAL_OCORRENCIAS,
} from './data';
import { supabase } from './lib/supabaseClient';
import {
  authService,
  noticesService,
  recommendationsService,
  paymentsService,
  financialSummaryService,
  monthlyFlowService,
  expenseCategoriesService,
  syndicProfileService,
  ocorrenciasService,
} from './lib/database';

import LoginScreen from './components/LoginScreen';
import DashboardScreen from './components/DashboardScreen';
import CaixaScreen from './components/CaixaScreen';
import AvisosScreen from './components/AvisosScreen';
import OcorrenciasScreen from './components/OcorrenciasScreen';
import IndicaAptScreen from './components/IndicaAptScreen';
import PerfilScreen from './components/PerfilScreen';
import WelcomeOverlay, { hasSeenWelcome, markWelcomeSeen } from './components/WelcomeOverlay';
import OnboardingProvider from './onboarding/OnboardingProvider';
import { completeOnboarding, isOnboardingDone, resetOnboarding } from './lib/onboarding';

const WEEKDAYS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function formatRelativeTimeLabel(iso: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60_000) return 'Agora';

  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `há ${minutes} minuto${minutes === 1 ? '' : 's'}`;

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (date.getTime() >= startOfToday) return `há ${hours} hora${hours === 1 ? '' : 's'}`;
  if (date.getTime() >= startOfToday - 86_400_000) return 'Ontem';
  if (date.getTime() >= startOfToday - 6 * 86_400_000) return WEEKDAYS[date.getDay()];

  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'login' | 'caixa' | 'avisos' | 'dashboard' | 'indica_apt' | 'perfil' | 'ocorrencias'>(() => {
    try {
      const saved = localStorage.getItem('oslo_current_screen');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed !== 'login') return parsed;
      }
    } catch {}
    return 'login';
  });
  const [transitionType, setTransitionType] = useState<'none' | 'push'>('none');
  const [showWelcome, setShowWelcome] = useState(false);

  // Core global state for simulation
  const [notices, setNotices] = useState<Notice[]>(() => {
    try {
      const saved = localStorage.getItem('oslo_notices');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_NOTICES;
  });
  const [recommendations, setRecommendations] = useState<Recommendation[]>(() => {
    try {
      const saved = localStorage.getItem('oslo_recommendations');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_RECOMMENDATIONS;
  });
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>(INITIAL_PAYMENTS);
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>(() => {
    try {
      const saved = localStorage.getItem('oslo_ocorrencias');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_OCORRENCIAS;
  });
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('oslo_current_user_profile');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_PROFILE;
  });
  const [financialSummary, setFinancialSummary] = useState<FinanceSummary>(INITIAL_FINANCIAL_SUMMARY);
  const [syndicData, setSyndicData] = useState<{ name: string; period: string; quote: string; avatar: string }>(() => {
    try {
      const saved = localStorage.getItem('syndic_profile');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return { name: 'Roberto Mendes', period: 'Gestão 2023-2025', quote: 'Nosso compromisso é manter o Oslo como referência em convivência e...', avatar: '/images/syndic_roberto.jpg' };
  });
  const [syndicWhatsapp, setSyndicWhatsapp] = useState(() => localStorage.getItem('syndic_whatsapp') || '');
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState<string | null>(null);


  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey || supabaseUrl === 'YOUR_SUPABASE_PROJECT_URL') {
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user.id);
        fetchSharedData();
        fetchOcorrencias();
        fetchFinancialData();
        fetchSyndicData();
        let screen: typeof currentScreen = 'dashboard';
        try {
          const saved = localStorage.getItem('oslo_current_screen');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && parsed !== 'login') screen = parsed;
          }
        } catch {}
        setCurrentScreen(screen);
      }
    }).catch(() => {});

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user.id);
        fetchSharedData();
        fetchOcorrencias();
        fetchFinancialData();
        fetchSyndicData();
        let screen: typeof currentScreen = 'dashboard';
        try {
          const saved = localStorage.getItem('oslo_current_screen');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && parsed !== 'login') screen = parsed;
          }
        } catch {}
        setCurrentScreen(screen);
      } else {
        setCurrentScreen('login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data: perfilData } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (!perfilData) {
        const { error: insertErr } = await supabase
          .from('perfis')
          .insert({
            id: userId,
            nome_completo: session?.user?.user_metadata?.full_name || session?.user?.email || 'Sem Nome',
            tipo_perfil: 'morador',
            avatar_url: null,
          });
        if (insertErr) console.error('Error creating profile:', insertErr);
        setUserProfile({
          fullName: session?.user?.user_metadata?.full_name || session?.user?.email || 'Sem Nome',
          email: session?.user?.email || '',
          apartmentNumber: 'Desconhecido',
          role: 'Morador',
          avatar: '',
          twoFactorEnabled: false,
          visibleToOthers: true,
          isAdmin: false,
        });
        return;
      }

      const { data: moradorData } = await supabase
        .from('moradores')
        .select('*, unidades(*)')
        .eq('perfil_id', userId)
        .maybeSingle();

      const isAdmin = perfilData.tipo_perfil === 'admin' || perfilData.tipo_perfil === 'sindico';
      const aptNumber = moradorData?.unidades
        ? `Apartamento ${moradorData.unidades.numero}`
        : perfilData.apartment_number
          ? `Apartamento ${perfilData.apartment_number}`
          : 'Desconhecido';
      
      const profile: UserProfile = {
        fullName: perfilData.nome_completo || 'Sem Nome',
        email: session?.user?.email || '',
        apartmentNumber: aptNumber,
        role: isAdmin ? 'Administrador' : 'Morador',
        avatar: perfilData.avatar_url || '',
        twoFactorEnabled: false,
        visibleToOthers: true,
        isAdmin: isAdmin
      };
      setUserProfile(profile);
      localStorage.setItem('oslo_current_user_profile', JSON.stringify(profile));
    } catch (e) {
      console.error('Error fetching profile', e);
    }
  };

  const fetchSharedData = async () => {
    setRecommendationsLoading(true);
    setRecommendationsError(null);
    try {
      const [supabaseNotices, supabaseRecommendations] = await Promise.all([
        noticesService.getAll(),
        recommendationsService.getAll(),
      ]);
      const mappedNotices = supabaseNotices.map((n: any) => ({
        id: n.id,
        category: n.category,
        categoryLabel: n.category_label || '',
        title: n.title,
        description: n.description || '',
        date: n.date || '',
        time: n.time || '',
        author: n.author || '',
        authorRole: n.author_role || undefined,
        isCritical: n.is_critical || false,
        image: n.image_url || undefined,
        details: n.details || undefined,
      })) as Notice[];
      setNotices(mappedNotices);
      try {
        localStorage.setItem('oslo_notices', JSON.stringify(mappedNotices));
      } catch {}

      const mappedRecs = supabaseRecommendations.map((r: any) => ({
        id: r.id,
        apartment: r.apartment,
        authorName: r.author_name || undefined,
        authorAvatar: r.author_avatar || undefined,
        authorRole: r.author_role || undefined,
        providerName: r.provider_name || '',
        category: r.category || 'OUTROS',
        comment: r.comment || '',
        rating: r.rating || 5,
        image: r.image_url || undefined,
        images: r.images || undefined,
        link: r.link || undefined,
        linkText: r.link_text || undefined,
        phone: r.phone || undefined,
        date: r.created_at ? formatRelativeTimeLabel(r.created_at) : '',
        createdAt: r.created_at || undefined,
        likes: r.likes || 0,
        likedBy: r.liked_by || [],
        comments: Array.isArray(r.comments)
          ? r.comments.map((c: any) => ({
              id: c.id,
              authorName: c.authorName || c.author_name || 'Morador',
              apartment: c.apartment || '',
              avatar: c.avatar || '',
              comment: c.comment || '',
              createdAt: c.createdAt || c.created_at || new Date().toISOString(),
            }))
          : [],
        views: r.views || 0,
        viewedBy: r.viewed_by || [],
        savedBy: r.saved_by || [],
        hiddenBy: r.hidden_by || [],
      })) as Recommendation[];
      setRecommendations(mappedRecs);
      try {
        localStorage.setItem('oslo_recommendations', JSON.stringify(mappedRecs));
      } catch {}
    } catch (e) {
      console.error('Error fetching shared data', e);
      setRecommendationsError('Não conseguimos carregar as recomendações.');
    } finally {
      setRecommendationsLoading(false);
    }
  };

  const fetchOcorrencias = async () => {
    try {
      const dbOcorrencias = await ocorrenciasService.getAll();
      if (dbOcorrencias.length === 0) return;
      const mapped = dbOcorrencias.map((o: any) => ({
        id: o.id,
        description: o.description || '',
        category: o.category || 'Outros',
        status: o.status || 'Aberta',
        authorName: o.author_name || 'Morador',
        apartment: o.apartment || 'Apartamento Desconhecido',
        avatar: o.avatar_url || '',
        images: o.images || [],
        createdAt: o.created_at ? new Date(o.created_at).toISOString() : new Date().toISOString(),
        likes: o.likes || 0,
        likedBy: o.liked_by || [],
        views: o.views || 0,
        viewedBy: o.viewed_by || [],
        comments: Array.isArray(o.comments)
          ? o.comments.map((c: any) => ({
              id: c.id,
              authorName: c.authorName || c.author_name || 'Morador',
              apartment: c.apartment || '',
              avatar: c.avatar || '',
              comment: c.comment || '',
              createdAt: c.createdAt || c.created_at || new Date().toISOString(),
            }))
          : [],
        pinned: !!o.pinned,
        highlighted: !!o.highlighted,
        authorUserId: o.created_by || undefined,
      })) as Ocorrencia[];
      setOcorrencias(mapped);
      try {
        localStorage.setItem('oslo_ocorrencias', JSON.stringify(mapped));
      } catch {}
    } catch (e) {
      console.error('Error fetching ocorrências', e);
    }
  };

  const fetchFinancialData = async () => {
    try {
      const [dbPayments, dbSummary, dbFlow, dbCategories] = await Promise.all([
        paymentsService.getPending(),
        financialSummaryService.get(),
        monthlyFlowService.getAll(),
        expenseCategoriesService.getAll(),
      ]);

      if (dbPayments.length > 0) {
        const mapped = dbPayments.map((p: any) => ({
          id: p.id,
          unit: p.unit,
          dueDate: p.due_date,
          amount: p.amount,
          status: p.status,
        })) as PendingPayment[];
        setPendingPayments(mapped);
      }

      if (dbSummary) {
        const totalResult = await paymentsService.getPendingTotal();
        setFinancialSummary(prev => ({
          ...prev,
          balance: dbSummary.balance,
          pendingTotal: totalResult.total || dbSummary.pending_total,
          pendingCount: totalResult.count || dbSummary.pending_count,
        }));
      }

      if (dbFlow.length > 0) {
        const currentYear = new Date().getFullYear();
        const yearFlow = dbFlow.filter((f: any) => f.year === currentYear);
        const mappedFlow = yearFlow.map((f: any) => ({
          month: f.month,
          income: f.income,
          expense: f.expense,
        }));
        if (mappedFlow.length > 0) {
          setFinancialSummary(prev => ({
            ...prev,
            monthlyFlow: mappedFlow,
          }));
        }
      }

      if (dbCategories.length > 0) {
        const mappedCategories = dbCategories.map((c: any) => ({
          category: c.category,
          percentage: c.percentage,
          amount: c.amount,
        }));
        setFinancialSummary(prev => ({
          ...prev,
          expensesByCategory: mappedCategories,
        }));
      }
    } catch (e) {
      console.error('Error fetching financial data', e);
    }
  };

  const fetchSyndicData = async () => {
    try {
      const profile = await syndicProfileService.get();
      if (profile) {
        const data = {
          name: profile.name || 'Roberto Mendes',
          period: profile.period || 'Gestão 2023-2025',
          quote: profile.quote || '',
          avatar: profile.avatar_url || '/images/syndic_roberto.jpg',
        };
        setSyndicData(data);
        localStorage.setItem('syndic_profile', JSON.stringify(data));
        if (profile.whatsapp) {
          setSyndicWhatsapp(profile.whatsapp);
          localStorage.setItem('syndic_whatsapp', profile.whatsapp);
        }
      }
    } catch (e) {
      console.error('Error fetching syndic data', e);
    }
  };

  const loadProfileByApartment = (apartment: string) => {
    try {
      const savedProfiles = localStorage.getItem('oslo_user_profiles');
      if (savedProfiles) {
        const profiles = JSON.parse(savedProfiles) as Record<string, UserProfile>;
        if (profiles[apartment]) {
          return profiles[apartment];
        }
      }
    } catch {
      // ignore
    }

    let isAdmin = false;
    try {
      const savedAdmins = localStorage.getItem('oslo_admin_apartments');
      const admins: string[] = savedAdmins ? JSON.parse(savedAdmins) : [];
      isAdmin = admins.includes(apartment);
    } catch {
      // ignore
    }

    return {
      fullName: apartment,
      apartmentNumber: apartment,
      role: isAdmin ? 'Administrador' : 'Morador',
      avatar: '',
      twoFactorEnabled: false,
      visibleToOthers: true,
      isAdmin,
    };
  };

  const handleLogin = async () => {
    setTransitionType('push');
    setCurrentScreen('dashboard');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const onboardingTestEmail = session?.user?.email?.toLowerCase().trim() ?? '';
      const isOnboardingTestUser = onboardingTestEmail === 'jjana.angelo@gmail.com';
      const onboardingDone = session?.user?.email ? isOnboardingDone(session.user.email) : false;
      const previewOnboarding = !!(isOnboardingTestUser && session?.user?.email && !onboardingDone);
      if (previewOnboarding || !hasSeenWelcome()) {
        setShowWelcome(true);
      }
      if (session?.user?.id) {
        await fetchProfile(session.user.id);
      }
      if (isOnboardingTestUser && session?.user?.email && !onboardingDone) {
        resetOnboarding(session.user.email);
      }
    } catch (e) {
      console.error('Error loading profile after login', e);
    }
  };

  const isAdminUser = userProfile.isAdmin !== false && (userProfile.role === 'Administrador' || userProfile.role === 'Síndico' || userProfile.isAdmin === true);
  const isOnboardingTestUser = userProfile.email?.toLowerCase().trim() === 'jjana.angelo@gmail.com';
  const onboardingUserKey = userProfile.email || userProfile.apartmentNumber || userProfile.fullName || 'morador';

  const onboardingPreviewOrder = useMemo(() => {
    const order = ['dashboard', 'avisos', 'ocorrencias', 'indica_apt', 'perfil'];
    if (isAdminUser) order.splice(order.indexOf('perfil'), 0, 'caixa');
    return order;
  }, [isAdminUser]);

  // If not admin and on caixa, redirect to dashboard
  useEffect(() => {
    if (currentScreen === 'caixa' && !isAdminUser) {
      setCurrentScreen('dashboard');
    }
  }, [currentScreen, isAdminUser]);

  const handleNavigate = (
    screen: 'login' | 'caixa' | 'avisos' | 'dashboard' | 'indica_apt' | 'perfil' | 'ocorrencias',
    transition: 'none' | 'push' = 'none'
  ) => {
    if (screen === 'caixa' && !isAdminUser) {
      return;
    }

    if (screen === 'login') {
      try {
        localStorage.removeItem('oslo_current_user_profile');
        localStorage.removeItem('oslo_current_screen');
      } catch (e) {
        console.error(e);
      }
      authService.signOut().catch(() => {});
    }
    setTransitionType(transition);
    setCurrentScreen(screen);
    try {
      localStorage.setItem('oslo_current_screen', JSON.stringify(screen));
    } catch (e) {
      console.error(e);
    }
  };

  const handleNavigateRef = useRef<typeof handleNavigate>(handleNavigate);
  handleNavigateRef.current = handleNavigate;

  const handlePreviewNext = useCallback(() => {
    if (!isOnboardingTestUser) return;
    const i = onboardingPreviewOrder.indexOf(currentScreen);
    const next = onboardingPreviewOrder[i + 1];
    if (next) {
      window.setTimeout(
        () => handleNavigateRef.current(next as never, 'none'),
        600
      );
    }
  }, [isOnboardingTestUser, onboardingPreviewOrder, currentScreen]);

  const handleFinalizeOnboarding = useCallback(() => {
    completeOnboarding(onboardingUserKey);
    markWelcomeSeen();
  }, [onboardingUserKey]);

  // State modification handlers
  const handleAddNotice = (newNotice: Notice) => {
    const updated = [newNotice, ...notices];
    setNotices(updated);
    try {
      localStorage.setItem('oslo_notices', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    noticesService.create({
      category: newNotice.category,
      category_label: newNotice.categoryLabel,
      title: newNotice.title,
      description: newNotice.description,
      date: newNotice.date,
      time: newNotice.time,
      author: newNotice.author,
      author_role: newNotice.authorRole || null,
      is_critical: newNotice.isCritical || false,
      image_url: newNotice.image || null,
      details: newNotice.details || null,
      created_by: null,
    }).catch(console.error);
  };

  const handleEditNotice = (updatedNotice: Notice) => {
    const updated = notices.map(n => n.id === updatedNotice.id ? updatedNotice : n);
    setNotices(updated);
    try {
      localStorage.setItem('oslo_notices', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    noticesService.update(updatedNotice.id, {
      category: updatedNotice.category,
      category_label: updatedNotice.categoryLabel,
      title: updatedNotice.title,
      description: updatedNotice.description,
      date: updatedNotice.date,
      time: updatedNotice.time,
      author: updatedNotice.author,
      author_role: updatedNotice.authorRole || null,
      is_critical: updatedNotice.isCritical || false,
      image_url: updatedNotice.image || null,
      details: updatedNotice.details || null,
    }).catch(console.error);
  };

  const handleDeleteNotice = (id: string) => {
    const updated = notices.filter(n => n.id !== id);
    setNotices(updated);
    try {
      localStorage.setItem('oslo_notices', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    noticesService.delete(id).catch(console.error);
  };

  const handleAddRecommendation = (newRec: Recommendation) => {
    const updated = [newRec, ...recommendations];
    setRecommendations(updated);
    try {
      localStorage.setItem('oslo_recommendations', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    recommendationsService.create({
      apartment: newRec.apartment,
      author_name: newRec.authorName || null,
      author_avatar: newRec.authorAvatar || null,
      author_role: newRec.authorRole || null,
      provider_name: newRec.providerName,
      category: newRec.category,
      comment: newRec.comment,
      rating: newRec.rating,
      image_url: newRec.image || null,
      images: newRec.images || [],
      link: newRec.link || null,
      link_text: newRec.linkText || null,
      phone: newRec.phone || null,
      likes: newRec.likes || 0,
      liked_by: newRec.likedBy || [],
      comments: newRec.comments || [],
      views: newRec.views || 0,
      viewed_by: newRec.viewedBy || [],
      saved_by: newRec.savedBy || [],
      hidden_by: newRec.hiddenBy || [],
      created_by: null,
    }).catch(console.error);
  };

  const handleEditRecommendation = (updatedRec: Recommendation) => {
    const updated = recommendations.map(r => r.id === updatedRec.id ? updatedRec : r);
    setRecommendations(updated);
    try {
      localStorage.setItem('oslo_recommendations', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    recommendationsService.update(updatedRec.id, {
      apartment: updatedRec.apartment,
      author_name: updatedRec.authorName || null,
      author_avatar: updatedRec.authorAvatar || null,
      provider_name: updatedRec.providerName,
      category: updatedRec.category,
      comment: updatedRec.comment,
      rating: updatedRec.rating,
      image_url: updatedRec.image || null,
      images: updatedRec.images || [],
      link: updatedRec.link || null,
      link_text: updatedRec.linkText || null,
      phone: updatedRec.phone || null,
    }).catch(console.error);
  };

  const handleDeleteRecommendation = (id: string) => {
    const updated = recommendations.filter(r => r.id !== id);
    setRecommendations(updated);
    try {
      localStorage.setItem('oslo_recommendations', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    recommendationsService.delete(id).catch(console.error);
  };

  const handleToggleRecommendationLike = (id: string) => {
    const target = recommendations.find(r => r.id === id);
    if (!target) return;
    const userKey = userProfile.apartmentNumber || userProfile.fullName || 'morador';
    const already = (target.likedBy || []).includes(userKey);
    const newLikedBy = already
      ? (target.likedBy || []).filter(k => k !== userKey)
      : [...(target.likedBy || []), userKey];
    const newLikes = already ? Math.max(0, (target.likes || 0) - 1) : (target.likes || 0) + 1;
    const updated = recommendations.map(r => r.id === id ? { ...r, likedBy: newLikedBy, likes: newLikes } : r);
    setRecommendations(updated);
    try {
      localStorage.setItem('oslo_recommendations', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    recommendationsService.update(id, { likes: newLikes, liked_by: newLikedBy }).catch(console.error);
  };

  const handleAddRecommendationComment = (id: string, comment: OcorrenciaComment) => {
    const target = recommendations.find(r => r.id === id);
    if (!target) return;
    const newComments = [...(target.comments || []), comment];
    const updated = recommendations.map(r => r.id === id ? { ...r, comments: newComments } : r);
    setRecommendations(updated);
    try {
      localStorage.setItem('oslo_recommendations', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    recommendationsService.update(id, { comments: newComments }).catch(console.error);
  };

  const handleToggleRecommendationSave = (id: string) => {
    const target = recommendations.find(r => r.id === id);
    if (!target) return;
    const userKey = userProfile.apartmentNumber || userProfile.fullName || 'morador';
    const already = (target.savedBy || []).includes(userKey);
    const newSavedBy = already
      ? (target.savedBy || []).filter(k => k !== userKey)
      : [...(target.savedBy || []), userKey];
    const updated = recommendations.map(r => r.id === id ? { ...r, savedBy: newSavedBy } : r);
    setRecommendations(updated);
    try {
      localStorage.setItem('oslo_recommendations', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    recommendationsService.update(id, { saved_by: newSavedBy }).catch(console.error);
  };

  const handleToggleHideRecommendation = (id: string) => {
    const target = recommendations.find(r => r.id === id);
    if (!target) return;
    const userKey = userProfile.apartmentNumber || userProfile.fullName || 'morador';
    const already = (target.hiddenBy || []).includes(userKey);
    const newHiddenBy = already
      ? (target.hiddenBy || []).filter(k => k !== userKey)
      : [...(target.hiddenBy || []), userKey];
    const updated = recommendations.map(r => r.id === id ? { ...r, hiddenBy: newHiddenBy } : r);
    setRecommendations(updated);
    try {
      localStorage.setItem('oslo_recommendations', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    recommendationsService.update(id, { hidden_by: newHiddenBy }).catch(console.error);
  };

  const handleIncrementRecommendationViews = (ids: string[]) => {
    if (ids.length === 0) return;
    const userKey = userProfile.apartmentNumber || userProfile.fullName || 'morador';
    const idSet = new Set(ids);
    const updated = recommendations.map(r =>
      idSet.has(r.id) && !(r.viewedBy || []).includes(userKey)
        ? { ...r, viewedBy: [...(r.viewedBy || []), userKey], views: (r.views || 0) + 1 }
        : r
    );
    setRecommendations(updated);
    try {
      localStorage.setItem('oslo_recommendations', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    ids.forEach(id => {
      const prev = recommendations.find(r => r.id === id);
      const rec = updated.find(r => r.id === id);
      if (rec && prev && !(prev.viewedBy || []).includes(userKey) && (rec.viewedBy || []).includes(userKey)) {
        recommendationsService.update(id, { views: rec.views, viewed_by: rec.viewedBy }).catch(console.error);
      }
    });
  };

  const persistOcorrencias = (updated: Ocorrencia[]) => {
    setOcorrencias(updated);
    try {
      localStorage.setItem('oslo_ocorrencias', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddOcorrencia = (newOcc: Ocorrencia) => {
    const updated = [newOcc, ...ocorrencias];
    persistOcorrencias(updated);
    ocorrenciasService.create({
      description: newOcc.description,
      category: newOcc.category,
      status: newOcc.status,
      author_name: newOcc.authorName,
      apartment: newOcc.apartment,
      avatar_url: newOcc.avatar || null,
      images: newOcc.images || [],
      likes: newOcc.likes,
      liked_by: newOcc.likedBy || [],
      views: newOcc.views || 0,
      viewed_by: newOcc.viewedBy || [],
      comments: [],
      pinned: newOcc.pinned || false,
      highlighted: newOcc.highlighted || false,
      created_by: null,
    }).catch(console.error);
  };

  const handleEditOcorrencia = (updatedOcc: Ocorrencia) => {
    const updated = ocorrencias.map(o => o.id === updatedOcc.id ? updatedOcc : o);
    persistOcorrencias(updated);
    ocorrenciasService.update(updatedOcc.id, {
      description: updatedOcc.description,
      category: updatedOcc.category,
      status: updatedOcc.status,
      images: updatedOcc.images || [],
      pinned: updatedOcc.pinned,
      highlighted: updatedOcc.highlighted,
    }).catch(console.error);
  };

  const handleDeleteOcorrencia = (id: string) => {
    const updated = ocorrencias.filter(o => o.id !== id);
    persistOcorrencias(updated);
    ocorrenciasService.delete(id).catch(console.error);
  };

  const handleToggleOcorrenciaLike = (id: string) => {
    const target = ocorrencias.find(o => o.id === id);
    if (!target) return;
    const userKey = userProfile.apartmentNumber || userProfile.fullName || 'morador';
    const already = target.likedBy.includes(userKey);
    const newLikedBy = already
      ? target.likedBy.filter(k => k !== userKey)
      : [...target.likedBy, userKey];
    const newLikes = already ? Math.max(0, target.likes - 1) : target.likes + 1;
    persistOcorrencias(ocorrencias.map(o => o.id === id ? { ...o, likedBy: newLikedBy, likes: newLikes } : o));
    ocorrenciasService.update(id, { likes: newLikes, liked_by: newLikedBy }).catch(console.error);
  };

  const handleIncrementOcorrenciaViews = (ids: string[]) => {
    if (ids.length === 0) return;
    const userKey = userProfile.apartmentNumber || userProfile.fullName || 'morador';
    const idSet = new Set(ids);
    const updated = ocorrencias.map(o =>
      idSet.has(o.id) && !o.viewedBy.includes(userKey)
        ? { ...o, viewedBy: [...o.viewedBy, userKey], views: o.views + 1 }
        : o
    );
    persistOcorrencias(updated);
    ids.forEach(id => {
      const prev = ocorrencias.find(o => o.id === id);
      const occ = updated.find(o => o.id === id);
      if (occ && prev && !prev.viewedBy.includes(userKey) && occ.viewedBy.includes(userKey)) {
        ocorrenciasService.update(id, { views: occ.views, viewed_by: occ.viewedBy }).catch(console.error);
      }
    });
  };

  const handleAddOcorrenciaComment = (id: string, comment: OcorrenciaComment) => {
    const target = ocorrencias.find(o => o.id === id);
    if (!target) return;
    const newComments = [...target.comments, comment];
    persistOcorrencias(ocorrencias.map(o => o.id === id ? { ...o, comments: newComments } : o));
    ocorrenciasService.update(id, { comments: newComments }).catch(console.error);
  };

  // Caixa/Financeiro handlers
  const handleEditPayment = (updatedPayment: PendingPayment) => {
    const updated = pendingPayments.map(p => p.id === updatedPayment.id ? updatedPayment : p);
    setPendingPayments(updated);
    paymentsService.update(updatedPayment.id, {
      unit: updatedPayment.unit,
      due_date: updatedPayment.dueDate,
      amount: updatedPayment.amount,
      status: updatedPayment.status,
    }).catch(console.error);
  };

  const handleDeletePayment = (id: string) => {
    const payment = pendingPayments.find(p => p.id === id);
    const updated = pendingPayments.filter(p => p.id !== id);
    setPendingPayments(updated);
    setFinancialSummary(prev => ({
      ...prev,
      pendingTotal: prev.pendingTotal - (payment?.amount || 0),
      pendingCount: prev.pendingCount - 1,
    }));
    paymentsService.delete(id).catch(console.error);
    syncFinancialSummary();
  };

  const handleUpdateFinanceSummary = (updated: Partial<FinanceSummary>) => {
    setFinancialSummary(prev => ({ ...prev, ...updated }));
    syncFinancialSummary();
  };

  const handleUpdateExpenseCategory = (index: number, updated: { category: string; percentage: number; amount: number }) => {
    setFinancialSummary(prev => {
      const newSummary = {
        ...prev,
        expensesByCategory: prev.expensesByCategory.map((exp, i) => i === index ? updated : exp),
      };
      return newSummary;
    });
    syncExpenseCategories();
  };

  const handleDeleteExpenseCategory = (index: number) => {
    setFinancialSummary(prev => {
      const cat = prev.expensesByCategory[index];
      const newSummary = {
        ...prev,
        expensesByCategory: prev.expensesByCategory.filter((_, i) => i !== index),
      };
      if (cat) {
        expenseCategoriesService.delete((cat as any).id).catch(console.error);
      }
      return newSummary;
    });
  };

  const handleUpdateMonthlyFlow = (index: number, updated: { month: string; income: number; expense: number }) => {
    setFinancialSummary(prev => {
      const item = prev.monthlyFlow[index];
      const newSummary = {
        ...prev,
        monthlyFlow: prev.monthlyFlow.map((flow, i) => i === index ? updated : flow),
      };
      if ((item as any)?.id) {
        const currentYear = new Date().getFullYear();
        monthlyFlowService.update((item as any).id, {
          month: updated.month,
          income: updated.income,
          expense: updated.expense,
          year: currentYear,
        }).catch(console.error);
      }
      return newSummary;
    });
  };

  const handleDeleteMonthlyFlow = (index: number) => {
    setFinancialSummary(prev => {
      const item = prev.monthlyFlow[index];
      const newSummary = {
        ...prev,
        monthlyFlow: prev.monthlyFlow.filter((_, i) => i !== index),
      };
      if ((item as any)?.id) {
        monthlyFlowService.delete((item as any).id).catch(console.error);
      }
      return newSummary;
    });
  };

  const handleAddMonthlyFlow = (newItem: { month: string; income: number; expense: number }) => {
    const currentYear = new Date().getFullYear();
    monthlyFlowService.create({
      month: newItem.month,
      income: newItem.income,
      expense: newItem.expense,
      year: currentYear,
    }).catch(console.error);
    setFinancialSummary(prev => ({
      ...prev,
      monthlyFlow: [...prev.monthlyFlow, newItem],
    }));
  };

  const handleAddPayment = (newPayment: PendingPayment) => {
    paymentsService.create({
      unit: newPayment.unit,
      due_date: newPayment.dueDate,
      amount: newPayment.amount,
      status: 'Pendente',
      paid_at: null,
    }).catch(console.error);
    setPendingPayments(prev => [...prev, newPayment]);
    setFinancialSummary(prev => ({
      ...prev,
      pendingTotal: prev.pendingTotal + newPayment.amount,
      pendingCount: prev.pendingCount + 1,
    }));
    syncFinancialSummary();
  };

  const handleMarkAsPaid = (id: string) => {
    const payment = pendingPayments.find(p => p.id === id);
    if (payment) {
      setPendingPayments(prev => prev.filter(p => p.id !== id));
      setFinancialSummary(prev => ({
        ...prev,
        pendingTotal: prev.pendingTotal - payment.amount,
        pendingCount: prev.pendingCount - 1,
      }));
      paymentsService.markAsPaid(id).catch(console.error);
      syncFinancialSummary();
    }
  };

  const syncFinancialSummary = async () => {
    try {
      const { data: existing } = await supabase
        .from('resumo_financeiro')
        .select('id')
        .limit(1)
        .single();

      const totalResult = await paymentsService.getPendingTotal();
      const summary = financialSummary;
      const updates = {
        balance: summary.balance,
        pending_total: totalResult.total,
        pending_count: totalResult.count,
      };

      if (existing) {
        await financialSummaryService.update(existing.id, updates);
      }
    } catch (e) {
      console.error('Error syncing financial summary', e);
    }
  };

  const syncExpenseCategories = async () => {
    try {
      const { data: existing } = await supabase
        .from('categorias_despesa')
        .select('id');

      if (existing && existing.length > 0) {
        for (const cat of existing) {
          await expenseCategoriesService.delete(cat.id);
        }
      }

      const summary = financialSummary;
      for (const exp of summary.expensesByCategory) {
        await expenseCategoriesService.create({
          category: exp.category,
          percentage: exp.percentage,
          amount: exp.amount,
        });
      }
    } catch (e) {
      console.error('Error syncing expense categories', e);
    }
  };

  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    const prevApartment = userProfile.apartmentNumber;
    setUserProfile(updatedProfile);
    try {
      localStorage.setItem('oslo_current_user_profile', JSON.stringify(updatedProfile));
      
      const savedProfiles = localStorage.getItem('oslo_user_profiles');
      const profiles = savedProfiles ? JSON.parse(savedProfiles) : {};
      profiles[updatedProfile.apartmentNumber] = updatedProfile;
      
      try {
        localStorage.setItem('oslo_user_profiles', JSON.stringify(profiles));
      } catch (quotaError) {
        console.warn('LocalStorage quota exceeded. Stripping old avatars to recover space.', quotaError);
        // Strip avatars of other profiles to free up space
        const strippedProfiles: Record<string, UserProfile> = {};
        for (const [key, value] of Object.entries(profiles)) {
          if (key === updatedProfile.apartmentNumber) {
            strippedProfiles[key] = value as UserProfile;
          } else {
            strippedProfiles[key] = {
              ...(value as UserProfile),
              avatar: '' // Remove avatar from other saved profiles
            };
          }
        }
        try {
          localStorage.setItem('oslo_user_profiles', JSON.stringify(strippedProfiles));
        } catch (secondError) {
          console.error('Failed to save profiles even after stripping avatars. Storing only current.', secondError);
          // If still failing, keep only current profile to guarantee success
          const singleProfile = { [updatedProfile.apartmentNumber]: updatedProfile };
          try {
            localStorage.setItem('oslo_user_profiles', JSON.stringify(singleProfile));
          } catch (lastError) {
            console.error('Failed to write to localStorage.', lastError);
          }
        }
      }
      
      // Also sync admin list
      const savedAdmins = localStorage.getItem('oslo_admin_apartments');
      let admins: string[] = savedAdmins ? JSON.parse(savedAdmins) : [];
      if (updatedProfile.isAdmin) {
        if (prevApartment && prevApartment !== updatedProfile.apartmentNumber) {
          admins = admins.filter(apt => apt !== prevApartment);
        }
        if (!admins.includes(updatedProfile.apartmentNumber)) {
          admins.push(updatedProfile.apartmentNumber);
        }
      } else {
        admins = admins.filter(apt => apt !== updatedProfile.apartmentNumber);
      }
      localStorage.setItem('oslo_admin_apartments', JSON.stringify(admins));
    } catch (e) {
      console.error(e);
    }
  };

  // Animation variants
  const variants: Variants = {
    initial: (custom: 'none' | 'push') => ({
      opacity: 0,
      x: custom === 'push' ? '100%' : 0,
      scale: custom === 'push' ? 1 : 0.98,
    }),
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: transitionType === 'push' ? 0.45 : 0.2,
        ease: transitionType === 'push' ? [0.16, 1, 0.3, 1] : 'easeOut',
      }
    },
    exit: (custom: 'none' | 'push') => ({
      opacity: 0,
      x: custom === 'push' ? '-30%' : 0,
      scale: custom === 'push' ? 0.98 : 1,
      transition: {
        duration: transitionType === 'push' ? 0.4 : 0.15,
        ease: 'easeIn',
      }
    }),
  };

  return (
    <MotionConfig reducedMotion="user">
    <div className="relative min-h-screen overflow-x-hidden bg-[#FBF9F6]">
      {showWelcome && (
        <WelcomeOverlay onComplete={() => setShowWelcome(false)} />
      )}
      <OnboardingProvider
        key={currentScreen}
        moduleId={currentScreen}
        userKey={onboardingUserKey}
        isAdmin={isAdminUser}
        enabled={!showWelcome}
        forceShow={isOnboardingTestUser}
        isLastModule={currentScreen === onboardingPreviewOrder[onboardingPreviewOrder.length - 1]}
        onTourFinished={handlePreviewNext}
        onTourFinalized={handleFinalizeOnboarding}
      />
      <AnimatePresence mode="wait" custom={transitionType}>
        <motion.div
          key={currentScreen}
          custom={transitionType}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full min-h-screen"
        >
          {currentScreen === 'login' && (
            <LoginScreen 
              onLogin={() => {
                handleLogin();
              }} 
            />
          )}

          {currentScreen === 'dashboard' && (
            <DashboardScreen 
              userProfile={userProfile}
              notices={notices}
              onNavigate={handleNavigate}
              syndicData={syndicData}
              syndicWhatsapp={syndicWhatsapp}
              onUpdateSyndic={(data) => {
                setSyndicData(data);
                localStorage.setItem('syndic_profile', JSON.stringify(data));
              }}
              onUpdateWhatsapp={(num) => {
                setSyndicWhatsapp(num);
                localStorage.setItem('syndic_whatsapp', num);
              }}
            />
          )}

          {currentScreen === 'caixa' && (
            <CaixaScreen 
              userProfile={userProfile}
              financeSummary={financialSummary}
              pendingPayments={pendingPayments}
              onNavigate={handleNavigate}
              onEditPayment={handleEditPayment}
              onDeletePayment={handleDeletePayment}
              onUpdateFinanceSummary={handleUpdateFinanceSummary}
              onUpdateExpenseCategory={handleUpdateExpenseCategory}
              onDeleteExpenseCategory={handleDeleteExpenseCategory}
              onUpdateMonthlyFlow={handleUpdateMonthlyFlow}
              onDeleteMonthlyFlow={handleDeleteMonthlyFlow}
              onAddMonthlyFlow={handleAddMonthlyFlow}
              onAddPayment={handleAddPayment}
              onMarkAsPaid={handleMarkAsPaid}
            />
          )}

          {currentScreen === 'avisos' && (
            <AvisosScreen 
              userProfile={userProfile}
              notices={notices}
              onAddNotice={handleAddNotice}
              onEditNotice={handleEditNotice}
              onDeleteNotice={handleDeleteNotice}
              isAdmin={isAdminUser}
              onNavigate={handleNavigate}
            />
          )}

          {currentScreen === 'ocorrencias' && (
            <OcorrenciasScreen
              ocorrencias={ocorrencias}
              userProfile={userProfile}
              isAdmin={isAdminUser}
              onNavigate={handleNavigate}
              onAddOcorrencia={handleAddOcorrencia}
              onEditOcorrencia={handleEditOcorrencia}
              onDeleteOcorrencia={handleDeleteOcorrencia}
              onToggleLike={handleToggleOcorrenciaLike}
              onIncrementViews={handleIncrementOcorrenciaViews}
              onAddComment={handleAddOcorrenciaComment}
            />
          )}

          {currentScreen === 'indica_apt' && (
            <IndicaAptScreen 
              recommendations={recommendations}
              userProfile={userProfile}
              loading={recommendationsLoading}
              error={recommendationsError}
              onRetry={() => fetchSharedData()}
              onAddRecommendation={handleAddRecommendation}
              onEditRecommendation={handleEditRecommendation}
              onDeleteRecommendation={handleDeleteRecommendation}
              onToggleLike={handleToggleRecommendationLike}
              onAddComment={handleAddRecommendationComment}
              onToggleSave={handleToggleRecommendationSave}
              onToggleHide={handleToggleHideRecommendation}
              onIncrementViews={handleIncrementRecommendationViews}
              onNavigate={handleNavigate}
            />
          )}

          {currentScreen === 'perfil' && (
            <PerfilScreen 
              userProfile={userProfile}
              onUpdateProfile={handleUpdateProfile}
              onNavigate={handleNavigate}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
    </MotionConfig>
  );
}

