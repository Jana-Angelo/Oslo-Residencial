import { Notice, Recommendation, PendingPayment, FinanceSummary, UserProfile } from './types';

export const INITIAL_NOTICES: Notice[] = [
  {
    id: 'n1',
    category: 'Manutenção',
    categoryLabel: 'MANUTENÇÃO CRÍTICA',
    title: 'Interrupção Programada no Abastecimento de Água',
    description: 'Informamos que haverá uma manutenção preventiva no sistema de bombas da Torre A na próxima quarta-feira (25/10), das 13h às 17h. Recomendamos que os moradores se programem adequadamente.',
    date: '25 Out, 13:00 - 17:00',
    time: 'Hoje, 09:30',
    author: 'Administração Oslo',
    authorRole: 'Engenharia Predial',
    isCritical: true,
  },
  {
    id: 'n2',
    category: 'Reuniões',
    categoryLabel: 'ASSEMBLEIA',
    title: 'Reunião Extraordinária: Novo Paisagismo',
    description: 'Discussão sobre a revitalização das áreas comuns e jardins laterais do condomínio.',
    date: '30 Out, 19:30',
    time: '2 dias atrás',
    author: 'Roberto Mendes',
    authorRole: 'Síndico (Gestão 2023-2025)',
    details: 'A pauta principal será a aprovação do orçamento para o novo projeto paisagístico da entrada e da área da piscina.',
  },
  {
    id: 'n3',
    category: 'Social',
    categoryLabel: 'SOCIAL',
    title: 'Evento de Halloween Kids',
    description: 'Inscrições abertas para a festa de Halloween das crianças que ocorrerá no salão de festas no dia 31/10.',
    date: '31 Out, 18:00',
    time: 'Ontem',
    author: 'Comissão de Eventos',
    authorRole: 'Moradores Voluntários',
  },
  {
    id: 'n4',
    category: 'Segurança',
    categoryLabel: 'SEGURANÇA',
    title: 'Atualização de Segurança',
    description: 'Novas regras para acesso de prestadores de serviços e entregadores na portaria do Residencial Oslo.',
    date: 'Imediato',
    time: '3 dias atrás',
    author: 'Segurança Oslo',
    authorRole: 'Portaria Blindada',
  },
  {
    id: 'n5',
    category: 'Social',
    categoryLabel: 'SOCIAL',
    title: 'Nova Horta Comunitária',
    description: 'O projeto de sustentabilidade do Oslo está expandindo. Venha conhecer o novo espaço no terraço.',
    date: '20 Out',
    time: 'Publicado em 20 Out',
    author: 'Comissão Verde',
    authorRole: 'Sustentabilidade',
    image: '/images/community_garden.jpg',
  }
];

export const INITIAL_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'r1',
    apartment: 'Apartamento 42',
    authorName: 'Thiago Souza',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    providerName: 'Marceneiro Silva',
    category: 'MARCENARIA',
    comment: 'Recomendo fortemente o serviço do Marceneiro Silva. Ele fez os armários da cozinha do meu apartamento e o acabamento ficou impecável. Pontual e muito cuidadoso com a limpeza.',
    rating: 5,
    image: '/images/kitchen_marcenaria.jpg',
    link: '#',
    linkText: 'Ver Perfil',
    phone: '+55 11 99999-8888',
    date: 'Postado há 2 horas'
  },
  {
    id: 'r2',
    apartment: 'Seu Apartamento (14)',
    authorName: 'Elena Vardalos',
    authorAvatar: '/images/profile_elena.jpg',
    providerName: 'SmartHome Automação',
    category: 'ELÉTRICA',
    comment: 'Instalação de automação de luzes feita pelo pessoal da SmartHome. Trabalho rápido, limpo e explicaram tudo sobre o aplicativo. Recomendo para quem quer modernizar o apê.',
    rating: 4,
    image: '/images/light_automation.jpg',
    phone: '+55 11 98888-7777',
    date: 'Postado ontem'
  },
  {
    id: 'r3',
    apartment: 'Apartamento 102',
    authorName: 'Camila Lima',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    providerName: 'Jardim Secreto',
    category: 'PAISAGISMO',
    comment: 'Contratei o Jardim Secreto para revitalizar minhas plantas da varanda. São especialistas e me deram dicas ótimas de rega e iluminação. O ambiente mudou completamente!',
    rating: 5,
    image: '/images/balcony_garden.jpg',
    link: '#',
    linkText: 'Site Oficial',
    phone: '+55 11 97777-6666',
    date: 'Postado há 2 dias'
  }
];

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
  fullName: 'Elena Vardalos',
  apartmentNumber: 'Apartamento 04',
  role: 'Morador',
  avatar: '/images/profile_elena.jpg',
  twoFactorEnabled: true,
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
