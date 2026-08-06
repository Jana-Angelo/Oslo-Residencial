import { Notice, Recommendation, PendingPayment, FinanceSummary, UserProfile, Ocorrencia } from './types';

export const INITIAL_NOTICES: Notice[] = [];

export const INITIAL_RECOMMENDATIONS: Recommendation[] = [];

export const INITIAL_PAYMENTS: PendingPayment[] = [];

export const INITIAL_FINANCIAL_SUMMARY: FinanceSummary = {
  balance: 0,
  pendingTotal: 0,
  pendingCount: 0,
  monthlyFlow: [],
  expensesByCategory: [],
};

export const INITIAL_OCORRENCIAS: Ocorrencia[] = [];

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
