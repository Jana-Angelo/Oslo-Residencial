import { Notice, Recommendation, PendingPayment, FinanceSummary, UserProfile } from './types';

export const INITIAL_NOTICES: Notice[] = [];

export const INITIAL_RECOMMENDATIONS: Recommendation[] = [];

export const INITIAL_PAYMENTS: PendingPayment[] = [
  {
    id: 'p1',
    unit: 'Apt 22 - Torre A',
    dueDate: '10 Mai, 2024',
    amount: 1250.00,
    status: 'Pendente'
  },
  {
    id: 'p2',
    unit: 'Apt 104 - Torre B',
    dueDate: '15 Mai, 2024',
    amount: 1250.00,
    status: 'Pendente'
  },
  {
    id: 'p3',
    unit: 'Cobertura 01',
    dueDate: '10 Mai, 2024',
    amount: 3840.00,
    status: 'Pendente'
  },
  {
    id: 'p4',
    unit: 'Apt 54 - Torre A',
    dueDate: '10 Mai, 2024',
    amount: 1250.00,
    status: 'Pendente'
  },
  {
    id: 'p5',
    unit: 'Apt 82 - Torre B',
    dueDate: '12 Mai, 2024',
    amount: 1250.00,
    status: 'Pendente'
  },
  {
    id: 'p6',
    unit: 'Apt 12 - Torre A',
    dueDate: '10 Mai, 2024',
    amount: 1250.00,
    status: 'Pendente'
  },
  {
    id: 'p7',
    unit: 'Apt 91 - Torre A',
    dueDate: '10 Mai, 2024',
    amount: 1250.00,
    status: 'Pendente'
  },
  {
    id: 'p8',
    unit: 'Apt 105 - Torre B',
    dueDate: '15 Mai, 2024',
    amount: 1350.00,
    status: 'Pendente'
  }
];

export const INITIAL_FINANCIAL_SUMMARY: FinanceSummary = {
  balance: 142580.00,
  pendingTotal: 12440.00,
  pendingCount: 8,
  monthlyFlow: [
    { month: 'JAN', income: 72000, expense: 58000 },
    { month: 'FEV', income: 85000, expense: 55000 },
    { month: 'MAR', income: 79000, expense: 62000 },
    { month: 'ABR', income: 94000, expense: 60000 },
    { month: 'MAI', income: 91000, expense: 68000 },
  ],
  expensesByCategory: [
    { category: 'Manutenção', percentage: 45, amount: 30600 },
    { category: 'Funcionários', percentage: 30, amount: 20400 },
    { category: 'Contas Fixas', percentage: 15, amount: 10200 },
    { category: 'Segurança', percentage: 10, amount: 6800 },
  ]
};

export const INITIAL_PROFILE: UserProfile = {
  fullName: '',
  apartmentNumber: '',
  role: 'Morador',
  avatar: '',
  twoFactorEnabled: false,
  visibleToOthers: true,
  isAdmin: false,
};

export const APARTMENT_OPTIONS = [
  'Apartamento 01',
  'Apartamento 02',
  'Apartamento 03',
  'Apartamento 04',
  'Apartamento 05',
  'Apartamento 06',
  'Apartamento 07',
  'Apartamento 08',
  'Apartamento 09',
  'Apartamento 10',
  'Apartamento 11',
  'Apartamento 12',
  'Apartamento 13',
  'Apartamento 14'
];
