export interface Profile {
  id: string;
  apartment_number: string;
  full_name: string;
  email: string | null;
  password_hash: string | null;
  role: 'Morador' | 'Síndico' | 'Administrador';
  avatar_url: string | null;
  two_factor_enabled: boolean;
  visible_to_others: boolean;
  is_admin: boolean;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notice {
  id: string;
  category: string;
  category_label: string;
  title: string;
  description: string;
  date: string | null;
  time: string | null;
  author: string;
  author_role: string | null;
  is_critical: boolean;
  image_url: string | null;
  details: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface RecommendationComment {
  id: string;
  authorName: string;
  apartment: string;
  avatar: string;
  comment: string;
  createdAt: string;
}

export interface Recommendation {
  id: string;
  apartment: string;
  author_name: string | null;
  author_avatar: string | null;
  author_role: string | null;
  provider_name: string;
  category: string;
  comment: string;
  rating: number;
  image_url: string | null;
  images: string[];
  link: string | null;
  link_text: string | null;
  phone: string | null;
  likes: number;
  liked_by: string[];
  comments: RecommendationComment[];
  views: number;
  viewed_by: string[];
  hidden_by: string[];
  saved_by: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  unit: string;
  due_date: string;
  amount: number;
  status: 'Pendente' | 'Pago';
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FinancialSummary {
  id: string;
  balance: number;
  pending_total: number;
  pending_count: number;
  updated_at: string;
}

export interface MonthlyFlow {
  id: string;
  month: string;
  income: number;
  expense: number;
  year: number;
  created_at: string;
}

export interface ExpenseCategory {
  id: string;
  category: string;
  percentage: number;
  amount: number;
  created_at: string;
}

export interface SyndicProfile {
  id: string;
  name: string;
  period: string | null;
  quote: string | null;
  avatar_url: string | null;
  whatsapp: string | null;
  updated_at: string;
}

export interface Ocorrencia {
  id: string;
  description: string;
  category: string;
  status: string;
  author_name: string;
  apartment: string;
  avatar_url: string | null;
  images: string[];
  likes: number;
  liked_by: string[];
  views: number;
  viewed_by: string[];
  comments: any[];
  pinned: boolean;
  highlighted: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface RegisteredUser {
  id: string;
  apartment_number: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      notices: {
        Row: Notice;
        Insert: Omit<Notice, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Notice, 'id' | 'created_at' | 'updated_at'>>;
      };
      recommendations: {
        Row: Recommendation;
        Insert: Omit<Recommendation, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Recommendation, 'id' | 'created_at' | 'updated_at'>>;
      };
      payments: {
        Row: Payment;
        Insert: Omit<Payment, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Payment, 'id' | 'created_at' | 'updated_at'>>;
      };
      financial_summary: {
        Row: FinancialSummary;
        Insert: Omit<FinancialSummary, 'id' | 'updated_at'>;
        Update: Partial<Omit<FinancialSummary, 'id' | 'updated_at'>>;
      };
      monthly_flow: {
        Row: MonthlyFlow;
        Insert: Omit<MonthlyFlow, 'id' | 'created_at'>;
        Update: Partial<Omit<MonthlyFlow, 'id' | 'created_at'>>;
      };
      expense_categories: {
        Row: ExpenseCategory;
        Insert: Omit<ExpenseCategory, 'id' | 'created_at'>;
        Update: Partial<Omit<ExpenseCategory, 'id' | 'created_at'>>;
      };
      syndic_profile: {
        Row: SyndicProfile;
        Insert: Omit<SyndicProfile, 'id' | 'updated_at'>;
        Update: Partial<Omit<SyndicProfile, 'id' | 'updated_at'>>;
      };
      ocorrencias: {
        Row: Ocorrencia;
        Insert: Omit<Ocorrencia, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Ocorrencia, 'id' | 'created_at' | 'updated_at'>>;
      };
      registered_users: {
        Row: RegisteredUser;
        Insert: Omit<RegisteredUser, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<RegisteredUser, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}
