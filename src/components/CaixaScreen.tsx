import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Search, 
  Pencil,
  Trash2,
  X,
  Check,
  Save,
  CreditCard,
} from 'lucide-react';
import { Sidebar, MobileBottomNav, MobileHeader } from './shared';
import { FinanceSummary, PendingPayment, UserProfile } from '../types';

interface CaixaScreenProps {
  userProfile: UserProfile;
  financeSummary: FinanceSummary;
  pendingPayments: PendingPayment[];
  onNavigate: (screen: 'login' | 'caixa' | 'avisos' | 'ocorrencias' | 'dashboard' | 'indica_apt' | 'perfil', transition: 'none' | 'push') => void;
  onEditPayment: (payment: PendingPayment) => void;
  onDeletePayment: (id: string) => void;
  onUpdateFinanceSummary: (updated: Partial<FinanceSummary>) => void;
  onUpdateExpenseCategory: (index: number, updated: { category: string; percentage: number; amount: number }) => void;
  onDeleteExpenseCategory: (index: number) => void;
  onUpdateMonthlyFlow: (index: number, updated: { month: string; income: number; expense: number }) => void;
  onDeleteMonthlyFlow: (index: number) => void;
  onAddMonthlyFlow: (newItem: { month: string; income: number; expense: number }) => void;
  onAddPayment: (newPayment: PendingPayment) => void;
  onMarkAsPaid: (id: string) => void;
}

export default function CaixaScreen({ 
  userProfile,
  financeSummary, 
  pendingPayments, 
  onNavigate, 
  onEditPayment, 
  onDeletePayment, 
  onUpdateFinanceSummary, 
  onUpdateExpenseCategory, 
  onDeleteExpenseCategory,
  onUpdateMonthlyFlow,
  onDeleteMonthlyFlow,
  onAddMonthlyFlow,
  onAddPayment,
  onMarkAsPaid
}: CaixaScreenProps) {
  const [showAllPayments, setShowAllPayments] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Edit states
  const [editingBalance, setEditingBalance] = useState(false);
  const [editingPendingTotal, setEditingPendingTotal] = useState(false);
  const [editingExpenseIdx, setEditingExpenseIdx] = useState<number | null>(null);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteExpenseIdx, setDeleteExpenseIdx] = useState<number | null>(null);
  const [editingFlowIdx, setEditingFlowIdx] = useState<number | null>(null);
  const [deleteFlowIdx, setDeleteFlowIdx] = useState<number | null>(null);
  const [isAddingFlow, setIsAddingFlow] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);

  // Temporary edit values
  const [tempBalance, setTempBalance] = useState(financeSummary.balance.toString());
  const [tempPendingTotal, setTempPendingTotal] = useState(financeSummary.pendingTotal.toString());
  const [tempPendingCount, setTempPendingCount] = useState(financeSummary.pendingCount.toString());
  const [tempExpenseCategory, setTempExpenseCategory] = useState('');
  const [tempExpensePercentage, setTempExpensePercentage] = useState('');
  const [tempExpenseAmount, setTempExpenseAmount] = useState('');
  const [tempPaymentUnit, setTempPaymentUnit] = useState('');
  const [tempPaymentDueDate, setTempPaymentDueDate] = useState('');
  const [tempPaymentAmount, setTempPaymentAmount] = useState('');
  const [tempFlowMonth, setTempFlowMonth] = useState('');
  const [tempFlowIncome, setTempFlowIncome] = useState('');
  const [tempFlowExpense, setTempFlowExpense] = useState('');
  const [newPaymentUnit, setNewPaymentUnit] = useState('');
  const [newPaymentDueDate, setNewPaymentDueDate] = useState('');
  const [newPaymentAmount, setNewPaymentAmount] = useState('');

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const filteredPayments = pendingPayments.filter(pay => 
    pay.unit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedPayments = showAllPayments ? filteredPayments : filteredPayments.slice(0, 3);

  // Edit handlers
  const handleStartEditBalance = () => {
    setTempBalance(financeSummary.balance.toString());
    setEditingBalance(true);
  };

  const handleSaveBalance = () => {
    const value = parseFloat(tempBalance.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
    onUpdateFinanceSummary({ balance: value });
    setEditingBalance(false);
  };

  const handleCancelEditBalance = () => {
    setEditingBalance(false);
  };

  const handleStartEditPendingTotal = () => {
    setTempPendingTotal(financeSummary.pendingTotal.toString());
    setTempPendingCount(financeSummary.pendingCount.toString());
    setEditingPendingTotal(true);
  };

  const handleSavePendingTotal = () => {
    const total = parseFloat(tempPendingTotal.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
    const count = parseInt(tempPendingCount) || 0;
    onUpdateFinanceSummary({ pendingTotal: total, pendingCount: count });
    setEditingPendingTotal(false);
  };

  const handleCancelEditPendingTotal = () => {
    setEditingPendingTotal(false);
  };

  const handleStartEditExpense = (idx: number) => {
    const expense = financeSummary.expensesByCategory[idx];
    setTempExpenseCategory(expense.category);
    setTempExpensePercentage(expense.percentage.toString());
    setTempExpenseAmount(expense.amount.toString());
    setEditingExpenseIdx(idx);
  };

  const handleSaveExpense = () => {
    if (editingExpenseIdx === null) return;
    const percentage = parseFloat(tempExpensePercentage) || 0;
    const amount = parseFloat(tempExpenseAmount.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
    onUpdateExpenseCategory(editingExpenseIdx, {
      category: tempExpenseCategory,
      percentage,
      amount,
    });
    setEditingExpenseIdx(null);
  };

  const handleCancelEditExpense = () => {
    setEditingExpenseIdx(null);
  };

  const handleStartEditPayment = (payment: PendingPayment) => {
    setTempPaymentUnit(payment.unit);
    setTempPaymentDueDate(payment.dueDate);
    setTempPaymentAmount(payment.amount.toString());
    setEditingPaymentId(payment.id);
  };

  const handleSavePayment = (payment: PendingPayment) => {
    const amount = parseFloat(tempPaymentAmount.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
    onEditPayment({
      ...payment,
      unit: tempPaymentUnit,
      dueDate: tempPaymentDueDate,
      amount,
    });
    setEditingPaymentId(null);
  };

  const handleCancelEditPayment = () => {
    setEditingPaymentId(null);
  };

  const handleConfirmDeletePayment = (id: string) => {
    onDeletePayment(id);
    setDeleteConfirmId(null);
  };

  const handleConfirmDeleteExpense = () => {
    if (deleteExpenseIdx !== null) {
      onDeleteExpenseCategory(deleteExpenseIdx);
      setDeleteExpenseIdx(null);
    }
  };

  // Monthly Flow handlers
  const handleStartEditFlow = (idx: number) => {
    const flow = financeSummary.monthlyFlow[idx];
    setTempFlowMonth(flow.month);
    setTempFlowIncome(flow.income.toString());
    setTempFlowExpense(flow.expense.toString());
    setEditingFlowIdx(idx);
    setIsAddingFlow(false);
  };

  const handleSaveFlow = () => {
    if (editingFlowIdx === null) return;
    const income = parseFloat(tempFlowIncome.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
    const expense = parseFloat(tempFlowExpense.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
    onUpdateMonthlyFlow(editingFlowIdx, {
      month: tempFlowMonth.toUpperCase(),
      income,
      expense,
    });
    setEditingFlowIdx(null);
  };

  const handleCancelEditFlow = () => {
    setEditingFlowIdx(null);
    setIsAddingFlow(false);
  };

  const handleStartAddFlow = () => {
    setTempFlowMonth('');
    setTempFlowIncome('');
    setTempFlowExpense('');
    setIsAddingFlow(true);
    setEditingFlowIdx(null);
  };

  const handleSaveNewFlow = () => {
    const income = parseFloat(tempFlowIncome.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
    const expense = parseFloat(tempFlowExpense.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
    if (!tempFlowMonth.trim()) return;
    onAddMonthlyFlow({
      month: tempFlowMonth.toUpperCase(),
      income,
      expense,
    });
    setIsAddingFlow(false);
  };

  const handleConfirmDeleteFlow = () => {
    if (deleteFlowIdx !== null) {
      onDeleteMonthlyFlow(deleteFlowIdx);
      setDeleteFlowIdx(null);
    }
  };

  // Payment handlers
  const handleStartAddPayment = () => {
    setNewPaymentUnit('');
    setNewPaymentDueDate('');
    setNewPaymentAmount('');
    setIsAddingPayment(true);
  };

  const handleSaveNewPayment = () => {
    const amount = parseFloat(newPaymentAmount.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
    if (!newPaymentUnit.trim() || !newPaymentDueDate.trim() || amount <= 0) return;
    const newPayment: PendingPayment = {
      id: `p${Date.now()}`,
      unit: newPaymentUnit,
      dueDate: newPaymentDueDate,
      amount,
      status: 'Pendente',
    };
    onAddPayment(newPayment);
    setIsAddingPayment(false);
  };

  const handleCancelAddPayment = () => {
    setIsAddingPayment(false);
  };

  const handleMarkPaymentAsPaid = (id: string) => {
    onMarkAsPaid(id);
  };

  return (
    <div className="min-h-screen bg-[#FBF9F6] flex flex-col pb-20 md:pb-0 md:pl-64">
      
      <Sidebar activeScreen="caixa" isAdmin={true} onNavigate={onNavigate} brand="Oslo Admin" />
      <MobileHeader
        title="Caixa do Prédio"
        subtitle="Financeiro"
        userProfile={userProfile}
        onNavigate={onNavigate}
      />

      {/* Main content */}
      <main className="flex-1 p-3 sm:p-4 md:p-8 max-w-6xl mx-auto w-full space-y-4 md:space-y-6">
        
        {/* Title for mobile */}
        <div className="md:hidden">
          <p className="text-xs text-[#8C7364] font-semibold uppercase tracking-wider">Gestão Administrativa</p>
          <h2 className="text-2xl font-extrabold text-[#3E342F] tracking-tight font-display mt-0.5">
            Caixa do Prédio
          </h2>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Card 1: Saldo em Conta */}
          <div className="bg-emerald-50/30 border border-[#EAE3D5] border-l-4 border-l-emerald-500 rounded-2xl p-6 shadow-sm space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-widest text-[#8C7364] uppercase block">
                Saldo em Conta
              </span>
              {!editingBalance && (
                <button 
                  onClick={handleStartEditBalance}
                  className="p-1.5 text-[#8C7364] hover:bg-[#F5F2EB] rounded-lg transition-colors cursor-pointer"
                  title="Editar saldo"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {editingBalance ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={tempBalance}
                  onChange={(e) => setTempBalance(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E5DFD5] rounded-xl text-2xl font-extrabold text-[#3E342F] focus:outline-none focus:ring-1 focus:ring-[#8C7364] font-display"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button 
                    onClick={handleCancelEditBalance}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E5DFD5] hover:bg-[#F5F2EB] text-[#6E6157] rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                    Cancelar
                  </button>
                  <button 
                    onClick={handleSaveBalance}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#8C7364] hover:bg-[#7A6355] text-white rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                  >
                    <Save className="w-3 h-3" />
                    Salvar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-3xl md:text-4xl font-extrabold text-[#3E342F] tracking-tight font-display">
                  {formatCurrency(financeSummary.balance)}
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold pt-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>+4.2% em relação ao mês anterior</span>
                </div>
              </>
            )}
          </div>

          {/* Card 2: Total em Aberto */}
          <div className="bg-[#8C7364] text-white border border-[#8C7364] rounded-2xl p-6 shadow-md space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-widest text-white/80 uppercase block">
                Total em Aberto
              </span>
              {!editingPendingTotal && (
                <button 
                  onClick={handleStartEditPendingTotal}
                  className="p-1.5 text-white/80 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  title="Editar total em aberto"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {editingPendingTotal ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={tempPendingTotal}
                  onChange={(e) => setTempPendingTotal(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-2xl font-extrabold text-white focus:outline-none focus:ring-1 focus:ring-white/50 font-display placeholder-white/40"
                  placeholder="Total"
                  autoFocus
                />
                <input
                  type="number"
                  value={tempPendingCount}
                  onChange={(e) => setTempPendingCount(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-white/50 placeholder-white/40"
                  placeholder="Quantidade de boletos"
                />
                <div className="flex gap-2">
                  <button 
                    onClick={handleCancelEditPendingTotal}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-white/30 hover:bg-white/10 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                    Cancelar
                  </button>
                  <button 
                    onClick={handleSavePendingTotal}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-white/90 text-[#8C7364] rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                  >
                    <Save className="w-3 h-3" />
                    Salvar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-3xl md:text-4xl font-extrabold tracking-tight font-display">
                  {formatCurrency(financeSummary.pendingTotal)}
                </div>
                <p className="text-xs text-white/90 font-medium">
                  {financeSummary.pendingCount} boletos pendentes
                </p>
              </>
            )}
          </div>

        </div>

        {/* Monthly Flow Chart */}
        <div className="bg-white border border-[#EAE3D5] rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-extrabold text-sm text-[#3E342F] uppercase tracking-wider font-display">
              Fluxo Mensal
            </h3>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-4 text-xs font-bold text-[#6E6157]">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
                  <span>Receita</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-[#CBBFB7] rounded-full"></span>
                  <span>Despesas</span>
                </div>
              </div>
              {!isAddingFlow && editingFlowIdx === null && (
                <button 
                  onClick={handleStartAddFlow}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#8C7364] hover:bg-[#7A6355] text-white rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                >
                  + Adicionar
                </button>
              )}
            </div>
          </div>

          {/* Add new flow form */}
          {isAddingFlow && (
            <div className="bg-[#FBF9F6] border border-[#EAE3D5] rounded-xl p-4 space-y-3">
              <p className="text-[10px] font-bold text-[#8C7364] uppercase tracking-wider">Novo Mês</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#8C7364] uppercase tracking-wider block mb-1">Mês</label>
                  <input
                    type="text"
                    value={tempFlowMonth}
                    onChange={(e) => setTempFlowMonth(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E5DFD5] rounded-xl text-xs font-bold text-[#3E342F] focus:outline-none focus:ring-1 focus:ring-[#8C7364]"
                    placeholder="Ex: JUN"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#8C7364] uppercase tracking-wider block mb-1">Receita (R$)</label>
                  <input
                    type="text"
                    value={tempFlowIncome}
                    onChange={(e) => setTempFlowIncome(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E5DFD5] rounded-xl text-xs font-medium text-[#3E342F] focus:outline-none focus:ring-1 focus:ring-[#8C7364]"
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#8C7364] uppercase tracking-wider block mb-1">Despesa (R$)</label>
                  <input
                    type="text"
                    value={tempFlowExpense}
                    onChange={(e) => setTempFlowExpense(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E5DFD5] rounded-xl text-xs font-medium text-[#3E342F] focus:outline-none focus:ring-1 focus:ring-[#8C7364]"
                    placeholder="0,00"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button 
                  onClick={handleCancelEditFlow}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E5DFD5] hover:bg-[#F5F2EB] text-[#6E6157] rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveNewFlow}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#8C7364] hover:bg-[#7A6355] text-white rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                >
                  <Save className="w-3 h-3" />
                  Salvar
                </button>
              </div>
            </div>
          )}

          <div className="relative pt-4">
            <div className="flex justify-between items-end h-56 pt-2 border-b border-[#EAE3D5] px-4 md:px-8">
              {financeSummary.monthlyFlow.map((data, index, array) => {
                const maxAmount = Math.max(...array.flatMap(d => [d.income, d.expense]), 100);
                const incomeHeight = `${(data.income / maxAmount) * 100}%`;
                const expenseHeight = `${(data.expense / maxAmount) * 100}%`;

                return (
                  <div key={index} className="flex flex-col items-center gap-3 w-12 sm:w-16 group">
                    {editingFlowIdx === index ? (
                      <div className="bg-[#FBF9F6] border border-[#EAE3D5] rounded-xl p-2 space-y-1.5 shadow-lg z-10 w-28">
                        <input
                          type="text"
                          value={tempFlowMonth}
                          onChange={(e) => setTempFlowMonth(e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-[#E5DFD5] rounded-lg text-[10px] font-bold text-[#3E342F] focus:outline-none focus:ring-1 focus:ring-[#8C7364] text-center"
                          placeholder="Mês"
                          autoFocus
                        />
                        <input
                          type="text"
                          value={tempFlowIncome}
                          onChange={(e) => setTempFlowIncome(e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-[#E5DFD5] rounded-lg text-[10px] font-medium text-[#3E342F] focus:outline-none focus:ring-1 focus:ring-[#8C7364]"
                          placeholder="Receita"
                        />
                        <input
                          type="text"
                          value={tempFlowExpense}
                          onChange={(e) => setTempFlowExpense(e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-[#E5DFD5] rounded-lg text-[10px] font-medium text-[#3E342F] focus:outline-none focus:ring-1 focus:ring-[#8C7364]"
                          placeholder="Despesa"
                        />
                        <div className="flex gap-1 pt-0.5">
                          <button 
                            onClick={handleCancelEditFlow}
                            className="flex-1 flex items-center justify-center gap-1 py-1 border border-[#E5DFD5] hover:bg-[#F5F2EB] text-[#6E6157] rounded-lg text-[8px] font-bold uppercase tracking-wider cursor-pointer"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                          <button 
                            onClick={handleSaveFlow}
                            className="flex-1 flex items-center justify-center gap-1 py-1 bg-[#8C7364] hover:bg-[#7A6355] text-white rounded-lg text-[8px] font-bold uppercase tracking-wider cursor-pointer"
                          >
                            <Save className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-end gap-1.5 h-40 w-full justify-center">
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: incomeHeight }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                            className="w-4 sm:w-5 bg-emerald-500 rounded-t-xs hover:opacity-90 transition-opacity relative group"
                          >
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#3E342F] text-white text-[10px] px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                              Rec: {formatCurrency(data.income)}
                            </div>
                          </motion.div>

                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: expenseHeight }}
                            transition={{ duration: 0.8, delay: index * 0.1 + 0.05 }}
                            className="w-4 sm:w-5 bg-[#CBBFB7] rounded-t-xs hover:opacity-90 transition-opacity relative group"
                          >
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#3E342F] text-white text-[10px] px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                              Desp: {formatCurrency(data.expense)}
                            </div>
                          </motion.div>
                        </div>

                        <span className="text-[10px] font-bold text-[#8C7364] tracking-widest font-display">
                          {data.month}
                        </span>

                        {/* Edit/Delete buttons on hover */}
                        <div className="flex items-center gap-0.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleStartEditFlow(index)}
                            className="p-1 text-[#8C7364] hover:bg-[#F5F2EB] rounded-md transition-colors cursor-pointer"
                            title="Editar mês"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={() => setDeleteFlowIdx(index)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            title="Excluir mês"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Expenses by Category progress bars */}
        <div className="bg-white border border-[#EAE3D5] rounded-2xl p-6 shadow-sm space-y-5">
          <h3 className="font-extrabold text-sm text-[#3E342F] uppercase tracking-wider font-display">
            Despesas por Categoria
          </h3>

          <div className="space-y-4">
            {financeSummary.expensesByCategory.map((expense, idx) => (
              <div key={idx} className="space-y-1.5">
                {editingExpenseIdx === idx ? (
                  <div className="bg-[#FBF9F6] border border-[#EAE3D5] rounded-xl p-3 space-y-2">
                    <input
                      type="text"
                      value={tempExpenseCategory}
                      onChange={(e) => setTempExpenseCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E5DFD5] rounded-xl text-xs font-bold text-[#3E342F] focus:outline-none focus:ring-1 focus:ring-[#8C7364]"
                      placeholder="Categoria"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-[#8C7364] uppercase tracking-wider block mb-1">%</label>
                        <input
                          type="number"
                          value={tempExpensePercentage}
                          onChange={(e) => setTempExpensePercentage(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-[#E5DFD5] rounded-xl text-xs font-medium text-[#3E342F] focus:outline-none focus:ring-1 focus:ring-[#8C7364]"
                          placeholder="0"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-[#8C7364] uppercase tracking-wider block mb-1">Valor (R$)</label>
                        <input
                          type="text"
                          value={tempExpenseAmount}
                          onChange={(e) => setTempExpenseAmount(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-[#E5DFD5] rounded-xl text-xs font-medium text-[#3E342F] focus:outline-none focus:ring-1 focus:ring-[#8C7364]"
                          placeholder="0,00"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button 
                        onClick={handleCancelEditExpense}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E5DFD5] hover:bg-[#F5F2EB] text-[#6E6157] rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                        Cancelar
                      </button>
                      <button 
                        onClick={handleSaveExpense}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#8C7364] hover:bg-[#7A6355] text-white rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                      >
                        <Save className="w-3 h-3" />
                        Salvar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="group">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[#3E342F]">{expense.category}</span>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-[#8C7364]">{expense.percentage}%</span>
                        <button 
                          onClick={() => handleStartEditExpense(idx)}
                          className="p-1 text-[#8C7364] hover:bg-[#F5F2EB] rounded-lg transition-colors cursor-pointer md:opacity-0 md:group-hover:opacity-100"
                          title="Editar categoria"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => setDeleteExpenseIdx(idx)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer md:opacity-0 md:group-hover:opacity-100"
                          title="Excluir categoria"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="w-full h-2.5 bg-[#F5F2EB] rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${expense.percentage}%` }}
                        transition={{ duration: 1, delay: idx * 0.1 }}
                        className="h-full bg-[#8C7364] rounded-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pagamentos Pendentes Table */}
        <div className="bg-white border border-[#EAE3D5] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#F5F2EB] pb-3">
            <h3 className="font-extrabold text-sm text-[#3E342F] uppercase tracking-wider font-display">
              Pagamentos Pendentes
            </h3>
            <div className="flex items-center gap-3">
              {!isAddingPayment && (
                <button 
                  onClick={handleStartAddPayment}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#8C7364] hover:bg-[#7A6355] text-white rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                >
                  + Adicionar
                </button>
              )}
              <button 
                onClick={() => setShowAllPayments(!showAllPayments)}
                className="text-xs font-bold text-[#8C7364] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {showAllPayments ? 'Recolher' : 'Ver todos'}
              </button>
            </div>
          </div>

          {showAllPayments && (
            <div className="relative mb-3">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7364]">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Filtrar por unidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#FBF9F6] border border-[#E5DFD5] rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#8C7364] text-[#3E342F]"
              />
            </div>
          )}

          {displayedPayments.length === 0 && !isAddingPayment && (
            <div className="flex flex-col items-center text-center py-10 px-6">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
                <CreditCard className="w-7 h-7 text-emerald-600" />
              </div>
              <h4 className="text-sm font-extrabold text-[#3E342F] font-display mb-1">
                Nenhum pagamento registrado
              </h4>
              <p className="text-xs text-[#6E6157] font-medium max-w-xs leading-relaxed">
                Quando houver pagamentos e despesas, eles aparecerão nesta lista. Use os botões acima para adicionar o primeiro registro.
              </p>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[#8C7364] font-bold uppercase tracking-wider border-b border-[#F5F2EB]">
                  <th className="pb-3 pt-1">Unidade</th>
                  <th className="pb-3 pt-1">Vencimento</th>
                  <th className="pb-3 pt-1 text-right">Valor</th>
                  <th className="pb-3 pt-1 text-center w-20">Pago</th>
                  <th className="pb-3 pt-1 text-right w-20">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F2EB]">
                {/* Add new payment row */}
                {isAddingPayment && (
                  <tr className="bg-[#FBF9F6]">
                    <td className="py-2">
                      <input
                        type="text"
                        value={newPaymentUnit}
                        onChange={(e) => setNewPaymentUnit(e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-[#E5DFD5] rounded-lg text-xs font-bold text-[#3E342F] focus:outline-none focus:ring-1 focus:ring-[#8C7364]"
                        placeholder="Ex: Apt 10 - Torre A"
                        autoFocus
                      />
                    </td>
                    <td className="py-2">
                      <input
                        type="text"
                        value={newPaymentDueDate}
                        onChange={(e) => setNewPaymentDueDate(e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-[#E5DFD5] rounded-lg text-xs font-medium text-[#6E6157] focus:outline-none focus:ring-1 focus:ring-[#8C7364]"
                        placeholder="Ex: 10 Jun, 2024"
                      />
                    </td>
                    <td className="py-2 text-right">
                      <input
                        type="text"
                        value={newPaymentAmount}
                        onChange={(e) => setNewPaymentAmount(e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-[#E5DFD5] rounded-lg text-xs font-bold text-[#8C7364] text-right focus:outline-none focus:ring-1 focus:ring-[#8C7364]"
                        placeholder="0,00"
                      />
                    </td>
                    <td className="py-2 text-center">-</td>
                    <td className="py-2">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={handleCancelAddPayment}
                          className="p-1.5 text-[#6E6157] hover:bg-[#F5F2EB] rounded-lg transition-colors cursor-pointer"
                          title="Cancelar"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={handleSaveNewPayment}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Salvar"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {displayedPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-[#FBF9F6]/50 transition-colors">
                    {editingPaymentId === payment.id ? (
                      <>
                        <td className="py-2">
                          <input
                            type="text"
                            value={tempPaymentUnit}
                            onChange={(e) => setTempPaymentUnit(e.target.value)}
                            className="w-full px-2 py-1.5 bg-white border border-[#E5DFD5] rounded-lg text-xs font-bold text-[#3E342F] focus:outline-none focus:ring-1 focus:ring-[#8C7364]"
                            autoFocus
                          />
                        </td>
                        <td className="py-2">
                          <input
                            type="text"
                            value={tempPaymentDueDate}
                            onChange={(e) => setTempPaymentDueDate(e.target.value)}
                            className="w-full px-2 py-1.5 bg-white border border-[#E5DFD5] rounded-lg text-xs font-medium text-[#6E6157] focus:outline-none focus:ring-1 focus:ring-[#8C7364]"
                          />
                        </td>
                        <td className="py-2 text-right">
                          <input
                            type="text"
                            value={tempPaymentAmount}
                            onChange={(e) => setTempPaymentAmount(e.target.value)}
                            className="w-full px-2 py-1.5 bg-white border border-[#E5DFD5] rounded-lg text-xs font-bold text-[#8C7364] text-right focus:outline-none focus:ring-1 focus:ring-[#8C7364]"
                          />
                        </td>
                        <td className="py-2 text-center">-</td>
                        <td className="py-2">
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              onClick={handleCancelEditPayment}
                              className="p-1.5 text-[#6E6157] hover:bg-[#F5F2EB] rounded-lg transition-colors cursor-pointer"
                              title="Cancelar"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleSavePayment(payment)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Salvar"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3.5 font-bold text-[#3E342F]">{payment.unit}</td>
                        <td className="py-3.5 text-[#6E6157] font-medium">{payment.dueDate}</td>
                        <td className="py-3.5 text-right font-bold text-[#8C7364]">{formatCurrency(payment.amount)}</td>
                        <td className="py-3.5 text-center">
                          <button 
                            onClick={() => handleMarkPaymentAsPaid(payment.id)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors border border-emerald-200"
                            title="Marcar como pago"
                          >
                            Pago
                          </button>
                        </td>
                        <td className="py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              onClick={() => handleStartEditPayment(payment)}
                              className="p-1.5 text-[#8C7364] hover:bg-[#F5F2EB] rounded-lg transition-colors cursor-pointer"
                              title="Editar pagamento"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => setDeleteConfirmId(payment.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Excluir pagamento"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      <MobileBottomNav activeScreen="caixa" isAdmin={true} onNavigate={onNavigate} />

      {/* Delete Payment Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="absolute inset-0 bg-[#3E342F]/40 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-[#FBF9F6] border border-[#EAE3D5] rounded-2xl p-6 shadow-2xl w-full max-w-sm space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#EAE3D5] pb-3">
                <h3 className="font-extrabold text-base text-[#3E342F] font-display">Confirmar Exclusão</h3>
                <button 
                  onClick={() => setDeleteConfirmId(null)}
                  className="p-1 text-[#8C7364] hover:bg-[#F5F2EB] rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-col items-center text-center gap-3 py-2">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-500" />
                </div>
                <p className="text-sm text-[#3E342F] font-medium">
                  Tem certeza que deseja excluir este pagamento? Esta ação não pode ser desfeita.
                </p>
              </div>
              <div className="flex gap-2.5 pt-2">
                <button 
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-2.5 border border-[#E5DFD5] hover:bg-[#F5F2EB] text-[#6E6157] rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => handleConfirmDeletePayment(deleteConfirmId)}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm transition-all"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Expense Category Confirmation Modal */}
      <AnimatePresence>
        {deleteExpenseIdx !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteExpenseIdx(null)}
              className="absolute inset-0 bg-[#3E342F]/40 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-[#FBF9F6] border border-[#EAE3D5] rounded-2xl p-6 shadow-2xl w-full max-w-sm space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#EAE3D5] pb-3">
                <h3 className="font-extrabold text-base text-[#3E342F] font-display">Confirmar Exclusão</h3>
                <button 
                  onClick={() => setDeleteExpenseIdx(null)}
                  className="p-1 text-[#8C7364] hover:bg-[#F5F2EB] rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-col items-center text-center gap-3 py-2">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-500" />
                </div>
                <p className="text-sm text-[#3E342F] font-medium">
                  Tem certeza que deseja excluir a categoria <strong>{financeSummary.expensesByCategory[deleteExpenseIdx]?.category}</strong>? Esta ação não pode ser desfeita.
                </p>
              </div>
              <div className="flex gap-2.5 pt-2">
                <button 
                  onClick={() => setDeleteExpenseIdx(null)}
                  className="flex-1 py-2.5 border border-[#E5DFD5] hover:bg-[#F5F2EB] text-[#6E6157] rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleConfirmDeleteExpense}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm transition-all"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Monthly Flow Confirmation Modal */}
      <AnimatePresence>
        {deleteFlowIdx !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteFlowIdx(null)}
              className="absolute inset-0 bg-[#3E342F]/40 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-[#FBF9F6] border border-[#EAE3D5] rounded-2xl p-6 shadow-2xl w-full max-w-sm space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#EAE3D5] pb-3">
                <h3 className="font-extrabold text-base text-[#3E342F] font-display">Confirmar Exclusão</h3>
                <button 
                  onClick={() => setDeleteFlowIdx(null)}
                  className="p-1 text-[#8C7364] hover:bg-[#F5F2EB] rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-col items-center text-center gap-3 py-2">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-500" />
                </div>
                <p className="text-sm text-[#3E342F] font-medium">
                  Tem certeza que deseja excluir o mês <strong>{financeSummary.monthlyFlow[deleteFlowIdx]?.month}</strong> do fluxo mensal? Esta ação não pode ser desfeita.
                </p>
              </div>
              <div className="flex gap-2.5 pt-2">
                <button 
                  onClick={() => setDeleteFlowIdx(null)}
                  className="flex-1 py-2.5 border border-[#E5DFD5] hover:bg-[#F5F2EB] text-[#6E6157] rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleConfirmDeleteFlow}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm transition-all"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
