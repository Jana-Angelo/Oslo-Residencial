/**
 * EXEMPLO DE USO - Integração com Supabase
 * 
 * Este arquivo demonstra como usar os serviços do banco de dados
 * nos componentes React do Oslo Residencial.
 * 
 * IMPORTANTE: Este é apenas um exemplo. Não substitui a lógica atual.
 * Use como referência ao migrar os componentes para usar o Supabase.
 */

import { db } from '../lib';

// =====================================================
// EXEMPLO 1: Buscar todos os avisos
// =====================================================
async function fetchNotices() {
  const notices = await db.notices.getAll();
  console.log('Avisos:', notices);
  return notices;
}

// =====================================================
// EXEMPLO 2: Criar um novo aviso
// =====================================================
async function createNotice() {
  const newNotice = await db.notices.create({
    category: 'Social',
    category_label: 'SOCIAL',
    title: 'Novo Evento',
    description: 'Descrição do evento',
    date: 'Hoje',
    time: 'Agora',
    author: 'Administrador',
    author_role: 'Síndico',
    is_critical: false,
    image_url: null,
    details: null,
    created_by: null,
  });
  console.log('Aviso criado:', newNotice);
  return newNotice;
}

// =====================================================
// EXEMPLO 3: Buscar perfil por apartamento
// =====================================================
async function fetchProfile(apartmentNumber: string) {
  const session = await db.auth.getSession();
  console.log('Sessão atual:', session.data.session?.user?.email);
  return session;
}

// =====================================================
// EXEMPLO 4: Criar pagamento pendente
// =====================================================
async function createPayment() {
  const newPayment = await db.payments.create({
    unit: 'Apt 10 - Torre A',
    due_date: '10 Jun, 2024',
    amount: 1250.00,
    status: 'Pendente',
    paid_at: null,
  });
  console.log('Pagamento criado:', newPayment);
  return newPayment;
}

// =====================================================
// EXEMPLO 5: Marcar pagamento como pago
// =====================================================
async function markPaymentAsPaid(paymentId: string) {
  const paidPayment = await db.payments.markAsPaid(paymentId);
  console.log('Pagamento marcado como pago:', paidPayment);
  return paidPayment;
}

// =====================================================
// EXEMPLO 6: Buscar resumo financeiro
// =====================================================
async function fetchFinancialSummary() {
  const summary = await db.financialSummary.get();
  console.log('Resumo financeiro:', summary);
  return summary;
}

// =====================================================
// EXEMPLO 7: Criar recomendação (IndicaApt)
// =====================================================
async function createRecommendation() {
  const newRec = await db.recommendations.create({
    apartment: 'Apartamento 04',
    author_name: 'Elena Vardalos',
    author_avatar: null,
    author_role: 'Morador',
    provider_name: 'Eletricista Silva',
    category: 'ELÉTRICA',
    comment: 'Excelente profissional, trabalhou rápido e limpo.',
    rating: 5,
    image_url: null,
    images: [],
    link: null,
    link_text: null,
    phone: '+55 11 99999-0000',
    likes: 0,
    liked_by: [],
    comments: [],
    views: 0,
    viewed_by: [],
    hidden_by: [],
    saved_by: [],
    created_by: null,
  });
  console.log('Recomendação criada:', newRec);
  return newRec;
}

// =====================================================
// EXEMPLO 8: Login do usuário
// =====================================================
async function login(apartmentNumber: string, password: string) {
  const result = await db.auth.signIn(apartmentNumber, password);
  if (result.user) {
    console.log('Login bem-sucedido:', result.user.user_metadata?.full_name);
  } else {
    console.log('Credenciais inválidas');
  }
  return result;
}

// =====================================================
// EXEMPLO 9: Cadastro de novo usuário
// =====================================================
async function register(apartmentNumber: string, password: string, fullName: string) {
  const profile = await db.auth.signUp(apartmentNumber, password, fullName, '');
  if (profile.user) {
    console.log('Cadastro realizado:', profile.user.user_metadata?.full_name);
  } else {
    console.log('Apartamento já cadastrado');
  }
  return profile;
}

// =====================================================
// EXEMPLO 10: Buscar perfil do síndico
// =====================================================
async function fetchSyndicProfile() {
  const syndic = await db.syndicProfile.get();
  console.log('Perfil do síndico:', syndic);
  return syndic;
}

// =====================================================
// EXEMPLO 11: Atualizar perfil do síndico
// =====================================================
async function updateSyndicProfile(syndicId: string) {
  const updated = await db.syndicProfile.update(syndicId, {
    name: 'Novo Síndico',
    period: 'Gestão 2024-2026',
    quote: 'Novo compromisso com os moradores.',
  });
  console.log('Perfil do síndico atualizado:', updated);
  return updated;
}

// =====================================================
// EXEMPLO 12: Buscar fluxo mensal
// =====================================================
async function fetchMonthlyFlow() {
  const flow = await db.monthlyFlow.getAll();
  console.log('Fluxo mensal:', flow);
  return flow;
}

// =====================================================
// EXEMPLO 13: Criar novo registro de fluxo mensal
// =====================================================
async function createMonthlyFlow() {
  const newFlow = await db.monthlyFlow.create({
    month: 'JUN',
    income: 85000,
    expense: 62000,
    year: 2024,
  });
  console.log('Fluxo mensal criado:', newFlow);
  return newFlow;
}

// =====================================================
// EXEMPLO 14: Buscar categorias de despesa
// =====================================================
async function fetchExpenseCategories() {
  const categories = await db.expenseCategories.getAll();
  console.log('Categorias de despesa:', categories);
  return categories;
}

// =====================================================
// EXEMPLO 15: Criar categoria de despesa
// =====================================================
async function createExpenseCategory() {
  const newCategory = await db.expenseCategories.create({
    category: 'Água',
    percentage: 12,
    amount: 8160,
  });
  console.log('Categoria criada:', newCategory);
  return newCategory;
}

export {
  fetchNotices,
  createNotice,
  fetchProfile,
  createPayment,
  markPaymentAsPaid,
  fetchFinancialSummary,
  createRecommendation,
  login,
  register,
  fetchSyndicProfile,
  updateSyndicProfile,
  fetchMonthlyFlow,
  createMonthlyFlow,
  fetchExpenseCategories,
  createExpenseCategory,
};
