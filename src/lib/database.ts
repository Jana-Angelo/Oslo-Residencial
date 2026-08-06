import { supabase } from './supabaseClient';
import type {
  Notice,
  Recommendation,
  Payment,
  FinancialSummary,
  MonthlyFlow,
  ExpenseCategory,
  SyndicProfile,
  Ocorrencia,
} from './types';

// =====================================================
// SERVIÇO: Avisos
// =====================================================
export const noticesService = {
  async getAll(): Promise<Notice[]> {
    const { data, error } = await supabase
      .from('avisos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar avisos:', error);
      return [];
    }
    return data || [];
  },

  async getById(id: string): Promise<Notice | null> {
    const { data, error } = await supabase
      .from('avisos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar aviso:', error);
      return null;
    }
    return data;
  },

  async create(notice: Omit<Notice, 'id' | 'created_at' | 'updated_at'>): Promise<Notice | null> {
    const { data, error } = await supabase
      .from('avisos')
      .insert(notice)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar aviso:', error);
      return null;
    }
    return data;
  },

  async update(id: string, updates: Partial<Notice>): Promise<Notice | null> {
    const { data, error } = await supabase
      .from('avisos')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar aviso:', error);
      return null;
    }
    return data;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('avisos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar aviso:', error);
      return false;
    }
    return true;
  },
};

// =====================================================
// SERVIÇO: Recomendações (IndicaApt)
// =====================================================
export const recommendationsService = {
  async getAll(): Promise<Recommendation[]> {
    const { data, error } = await supabase
      .from('recomendacoes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar recomendações:', error);
      return [];
    }
    return data || [];
  },

  async getById(id: string): Promise<Recommendation | null> {
    const { data, error } = await supabase
      .from('recomendacoes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar recomendação:', error);
      return null;
    }
    return data;
  },

  async create(recommendation: Omit<Recommendation, 'id' | 'created_at' | 'updated_at'>): Promise<Recommendation | null> {
    const { data, error } = await supabase
      .from('recomendacoes')
      .insert(recommendation)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar recomendação:', error);
      return null;
    }
    return data;
  },

  async update(id: string, updates: Partial<Recommendation>): Promise<Recommendation | null> {
    const { data, error } = await supabase
      .from('recomendacoes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar recomendação:', error);
      return null;
    }
    return data;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('recomendacoes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar recomendação:', error);
      return false;
    }
    return true;
  },
};

// =====================================================
// SERVIÇO: Payments (Pagamentos)
// =====================================================
export const paymentsService = {
  async getAll(): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('pagamentos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar pagamentos:', error);
      return [];
    }
    return data || [];
  },

  async getPending(): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('pagamentos')
      .select('*')
      .eq('status', 'Pendente')
      .order('due_date');

    if (error) {
      console.error('Erro ao buscar pagamentos pendentes:', error);
      return [];
    }
    return data || [];
  },

  async getById(id: string): Promise<Payment | null> {
    const { data, error } = await supabase
      .from('pagamentos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar pagamento:', error);
      return null;
    }
    return data;
  },

  async create(payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>): Promise<Payment | null> {
    const { data, error } = await supabase
      .from('pagamentos')
      .insert(payment)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar pagamento:', error);
      return null;
    }
    return data;
  },

  async update(id: string, updates: Partial<Payment>): Promise<Payment | null> {
    const { data, error } = await supabase
      .from('pagamentos')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar pagamento:', error);
      return null;
    }
    return data;
  },

  async markAsPaid(id: string): Promise<Payment | null> {
    const { data, error } = await supabase
      .from('pagamentos')
      .update({
        status: 'Pago',
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao marcar pagamento como pago:', error);
      return null;
    }
    return data;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('pagamentos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar pagamento:', error);
      return false;
    }
    return true;
  },

  async getPendingTotal(): Promise<{ total: number; count: number }> {
    const { data, error } = await supabase
      .from('pagamentos')
      .select('amount')
      .eq('status', 'Pendente');

    if (error) {
      console.error('Erro ao buscar total pendente:', error);
      return { total: 0, count: 0 };
    }

    const total = data?.reduce((sum, p) => sum + p.amount, 0) || 0;
    const count = data?.length || 0;
    return { total, count };
  },
};

// =====================================================
// SERVIÇO: Financial Summary (Resumo Financeiro)
// =====================================================
export const financialSummaryService = {
  async get(): Promise<FinancialSummary | null> {
    const { data, error } = await supabase
      .from('resumo_financeiro')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Erro ao buscar resumo financeiro:', error);
      return null;
    }
    return data;
  },

  async update(id: string, updates: Partial<FinancialSummary>): Promise<FinancialSummary | null> {
    const { data, error } = await supabase
      .from('resumo_financeiro')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar resumo financeiro:', error);
      return null;
    }
    return data;
  },
};

// =====================================================
// SERVIÇO: Monthly Flow (Fluxo Mensal)
// =====================================================
export const monthlyFlowService = {
  async getAll(): Promise<MonthlyFlow[]> {
    const { data, error } = await supabase
      .from('fluxo_mensal')
      .select('*')
      .order('year', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar fluxo mensal:', error);
      return [];
    }
    return data || [];
  },

  async create(flow: Omit<MonthlyFlow, 'id' | 'created_at'>): Promise<MonthlyFlow | null> {
    const { data, error } = await supabase
      .from('fluxo_mensal')
      .insert(flow)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar fluxo mensal:', error);
      return null;
    }
    return data;
  },

  async update(id: string, updates: Partial<MonthlyFlow>): Promise<MonthlyFlow | null> {
    const { data, error } = await supabase
      .from('fluxo_mensal')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar fluxo mensal:', error);
      return null;
    }
    return data;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('fluxo_mensal')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar fluxo mensal:', error);
      return false;
    }
    return true;
  },
};

// =====================================================
// SERVIÇO: Expense Categories (Categorias de Despesa)
// =====================================================
export const expenseCategoriesService = {
  async getAll(): Promise<ExpenseCategory[]> {
    const { data, error } = await supabase
      .from('categorias_despesa')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar categorias de despesa:', error);
      return [];
    }
    return data || [];
  },

  async create(category: Omit<ExpenseCategory, 'id' | 'created_at'>): Promise<ExpenseCategory | null> {
    const { data, error } = await supabase
      .from('categorias_despesa')
      .insert(category)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar categoria de despesa:', error);
      return null;
    }
    return data;
  },

  async update(id: string, updates: Partial<ExpenseCategory>): Promise<ExpenseCategory | null> {
    const { data, error } = await supabase
      .from('categorias_despesa')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar categoria de despesa:', error);
      return null;
    }
    return data;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('categorias_despesa')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar categoria de despesa:', error);
      return false;
    }
    return true;
  },
};

// =====================================================
// SERVIÇO: Syndic Profile (Perfil do Síndico)
// =====================================================
export const syndicProfileService = {
  async get(): Promise<SyndicProfile | null> {
    const { data, error } = await supabase
      .from('perfil_sindico')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Erro ao buscar perfil do síndico:', error);
      return null;
    }
    return data;
  },

  async update(id: string, updates: Partial<SyndicProfile>): Promise<SyndicProfile | null> {
    const { data, error } = await supabase
      .from('perfil_sindico')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar perfil do síndico:', error);
      return null;
    }
    return data;
  },

  async create(profile: Omit<SyndicProfile, 'id' | 'updated_at'>): Promise<SyndicProfile | null> {
    const { data, error } = await supabase
      .from('perfil_sindico')
      .insert(profile)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar perfil do síndico:', error);
      return null;
    }
    return data;
  },
};

// =====================================================
// SERVIÇO: Ocorrências
// =====================================================
export const ocorrenciasService = {
  async getAll(): Promise<Ocorrencia[]> {
    const { data, error } = await supabase
      .from('ocorrencias')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar ocorrências:', error);
      return [];
    }
    return data || [];
  },

  async getById(id: string): Promise<Ocorrencia | null> {
    const { data, error } = await supabase
      .from('ocorrencias')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar ocorrência:', error);
      return null;
    }
    return data;
  },

  async create(ocorrencia: Omit<Ocorrencia, 'id' | 'created_at' | 'updated_at'>): Promise<Ocorrencia | null> {
    const { data, error } = await supabase
      .from('ocorrencias')
      .insert(ocorrencia)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar ocorrência:', error);
      return null;
    }
    return data;
  },

  async update(id: string, updates: Partial<Ocorrencia>): Promise<Ocorrencia | null> {
    const { data, error } = await supabase
      .from('ocorrencias')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar ocorrência:', error);
      return null;
    }
    return data;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('ocorrencias')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar ocorrência:', error);
      return false;
    }
    return true;
  },
};

// =====================================================
// SERVIÇO: Autenticação (Supabase Auth)
// =====================================================
export const authService = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signUp(email: string, password: string, fullName: string, apartmentNumber: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          apartment_number: apartmentNumber,
        },
      },
    });
    if (error) throw error;

    if (data.user) {
      const { error: perfilErr } = await supabase
        .from('perfis')
        .insert({
          id: data.user.id,
          nome_completo: fullName,
          tipo_perfil: 'morador',
          avatar_url: null,
        });
      if (perfilErr) console.error('Erro ao criar perfil:', perfilErr);

      const numero = apartmentNumber.replace('Apartamento ', '');
      let unidadeId: string | null = null;

      const { data: unidadeExistente } = await supabase
        .from('unidades')
        .select('id')
        .eq('numero', numero)
        .single();

      if (unidadeExistente) {
        unidadeId = unidadeExistente.id;
      } else {
        const { data: novaUnidade } = await supabase
          .from('unidades')
          .insert({ numero })
          .select('id')
          .single();
        unidadeId = novaUnidade?.id ?? null;
      }

      if (unidadeId) {
        const { error: moradorErr } = await supabase
          .from('moradores')
          .insert({
            perfil_id: data.user.id,
            unidade_id: unidadeId,
            nome_completo: fullName || '',
          });
        if (moradorErr) console.error('Erro ao criar morador:', moradorErr);
      }
    }

    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async updateEmail(email: string) {
    const { data, error } = await supabase.auth.updateUser({ email });
    if (error) throw error;
    return data;
  },

  async updatePassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    return data;
  },

  async getSession() {
    return supabase.auth.getSession();
  },

  async updateProfile(userId: string, updates: { nome_completo?: string; avatar_url?: string | null; tipo_perfil?: string; apartment_number?: string }) {
    const { data, error } = await supabase
      .from('perfis')
      .update(updates)
      .eq('id', userId)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      const { error: insertError } = await supabase
        .from('perfis')
        .insert({ id: userId, ...updates, avatar_url: updates.avatar_url ?? null });
      if (insertError) throw insertError;
      return { id: userId, ...updates };
    }
    return data;
  },

  async updateApartment(userId: string, apartmentNumber: string) {
    const numero = apartmentNumber.replace('Apartamento ', '');

    const { error: perfilErr } = await supabase
      .from('perfis')
      .update({ apartment_number: numero })
      .eq('id', userId);
    if (perfilErr) {
      console.error('Erro ao atualizar apartment_number no perfil:', perfilErr);
      throw perfilErr;
    }

    const { data: morador } = await supabase
      .from('moradores')
      .select('*, unidades(*)')
      .eq('perfil_id', userId)
      .maybeSingle();

    const { data: existingUnit } = await supabase
      .from('unidades')
      .select('id')
      .eq('numero', numero)
      .single();

    let unitId = existingUnit?.id;
    if (!unitId) {
      const { data: newUnit, error: unitErr } = await supabase
        .from('unidades')
        .insert({ numero })
        .select('id')
        .single();
      if (unitErr) {
        console.error('Erro ao criar unidade:', unitErr);
        throw unitErr;
      }
      unitId = newUnit?.id;
    }

    if (unitId) {
      if (morador) {
        if (unitId !== morador.unidade_id) {
          const { error: updateErr } = await supabase
            .from('moradores')
            .update({ unidade_id: unitId })
            .eq('perfil_id', userId);
          if (updateErr) {
            console.error('Erro ao atualizar morador:', updateErr);
            throw updateErr;
          }
        }
      } else {
        const { data: perfil } = await supabase
          .from('perfis')
          .select('nome_completo')
          .eq('id', userId)
          .maybeSingle();

        const { error: insertErr } = await supabase
          .from('moradores')
          .insert({
            perfil_id: userId,
            unidade_id: unitId,
            nome_completo: perfil?.nome_completo || '',
          });
        if (insertErr) {
          console.error('Erro ao criar morador:', insertErr);
          throw insertErr;
        }
      }
    }
  },
};

// =====================================================
// EXPORTAÇÃO CENTRALIZADA
// =====================================================
export const db = {
  notices: noticesService,
  recommendations: recommendationsService,
  payments: paymentsService,
  financialSummary: financialSummaryService,
  monthlyFlow: monthlyFlowService,
  expenseCategories: expenseCategoriesService,
  syndicProfile: syndicProfileService,
  ocorrencias: ocorrenciasService,
  auth: authService,
};
