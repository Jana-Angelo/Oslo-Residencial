export interface Notice {
  id: string;
  category: 'Manutenção' | 'Reuniões' | 'Segurança' | 'Social';
  categoryLabel: string;
  title: string;
  description: string;
  date: string;
  author: string;
  authorRole?: string;
  isCritical?: boolean;
  image?: string;
  details?: string;
  time?: string;
}

export interface Recommendation {
  id: string;
  apartment: string;
  authorName?: string;
  authorAvatar?: string;
  providerName: string;
  category: 'MARCENARIA' | 'ELÉTRICA' | 'PAISAGISMO' | 'OUTROS' | string;
  comment: string;
  rating: number;
  image?: string;
  images?: string[];
  link?: string;
  linkText?: string;
  phone?: string;
  date: string;
}

export interface PendingPayment {
  id: string;
  unit: string;
  dueDate: string;
  amount: number;
  status: 'Pendente' | 'Pago';
}

export interface FinanceSummary {
  balance: number;
  pendingTotal: number;
  pendingCount: number;
  monthlyFlow: {
    month: string;
    income: number;
    expense: number;
  }[];
  expensesByCategory: {
    category: string;
    percentage: number;
    amount: number;
  }[];
}

export interface UserProfile {
  fullName: string;
  email?: string;
  apartmentNumber: string;
  role: 'Morador' | 'Síndico' | 'Administrador';
  avatar: string;
  twoFactorEnabled: boolean;
  visibleToOthers: boolean;
  isAdmin?: boolean;
}
