import type { LucideIcon } from 'lucide-react';
import {
  Home,
  Building2,
  FileText,
  Megaphone,
  CreditCard,
  User,
  ThumbsUp,
} from 'lucide-react';

export interface FeatureDef {
  id: string;
  anchor: string;
  label: string;
  tooltip: string;
  role: 'resident' | 'admin' | 'both';
  priority?: number;
}

export interface ModuleMeta {
  label: string;
  icon: LucideIcon;
  color: string;
}

export const MODULE_META: Record<string, ModuleMeta> = {
  dashboard: { label: 'Início', icon: Home, color: 'bg-[#8C7364]' },
  avisos: { label: 'Avisos', icon: FileText, color: 'bg-amber-600' },
  ocorrencias: { label: 'Ocorrências', icon: Megaphone, color: 'bg-orange-600' },
  indica_apt: { label: 'IndicaApt', icon: ThumbsUp, color: 'bg-[#A480CF]' },
  caixa: { label: 'Caixa do Prédio', icon: CreditCard, color: 'bg-emerald-600' },
  perfil: { label: 'Perfil', icon: User, color: 'bg-slate-600' },
};

export const MODULE_FEATURES: Record<string, FeatureDef[]> = {
  dashboard: [
    {
      id: 'sindico_card',
      anchor: 'dashboard:sindico_card',
      label: 'Perfil do Síndico',
      tooltip: 'Aqui você conhece o síndico da gestão atual, o período e o compromisso dele com o condomínio.',
      role: 'both',
      priority: 1,
    },
    {
      id: 'falar_sindico',
      anchor: 'dashboard:falar_sindico',
      label: 'Falar com o Síndico',
      tooltip: 'Abre o WhatsApp do síndico — envie sua mensagem direto pelo portal.',
      role: 'both',
      priority: 2,
    },
    {
      id: 'avisos_hoje',
      anchor: 'dashboard:avisos_hoje',
      label: 'Avisos Hoje',
      tooltip: 'Mostra quantos comunicados foram publicados hoje. Clique para abrir o quadro de Avisos.',
      role: 'both',
      priority: 3,
    },
    {
      id: 'avisos_recentes',
      anchor: 'dashboard:avisos_recentes',
      label: 'Avisos Recentes',
      tooltip: "Os comunicados mais novos, direto no Início. 'Ver todos' abre o módulo Avisos.",
      role: 'both',
      priority: 4,
    },
    {
      id: 'indicaapt_card',
      anchor: 'dashboard:indicaapt_card',
      label: 'IndicaApt',
      tooltip: 'Atalho para as recomendações dos vizinhos: prestadores, comércios e serviços indicados por quem mora no prédio.',
      role: 'both',
      priority: 5,
    },
    {
      id: 'editar_sindico',
      anchor: 'dashboard:editar_sindico',
      label: 'Editar Perfil do Síndico',
      tooltip: 'Você (síndico) pode editar foto, nome, período e a frase de compromisso — as alterações valem para todos.',
      role: 'admin',
      priority: 6,
    },
    {
      id: 'caixa_atalho',
      anchor: 'dashboard:caixa_atalho',
      label: 'Caixa do Prédio',
      tooltip: 'Abre o painel financeiro: saldo, fluxo mensal e pagamentos (visível apenas para o síndico).',
      role: 'admin',
      priority: 7,
    },
  ],

  avisos: [
    {
      id: 'contador',
      anchor: 'avisos:contador',
      label: 'Mural de comunicados',
      tooltip: 'Total de comunicados publicados no quadro. Fique por dentro de manutenção, reuniões, eventos e segurança.',
      role: 'both',
      priority: 1,
    },
    {
      id: 'filtros',
      anchor: 'avisos:filtros',
      label: 'Filtros por categoria',
      tooltip: 'Filtre o mural por tipo: manutenção, reuniões, social, segurança ou categorias personalizadas.',
      role: 'both',
      priority: 2,
    },
    {
      id: 'busca',
      anchor: 'avisos:busca',
      label: 'Busca',
      tooltip: 'Procure por título, descrição, categoria ou autor do comunicado.',
      role: 'both',
      priority: 3,
    },
    {
      id: 'ver_detalhes',
      anchor: 'avisos:ver_detalhes',
      label: 'Ver Detalhes',
      tooltip: 'Expande o conteúdo completo do comunicado dentro do próprio card.',
      role: 'both',
      priority: 4,
    },
    {
      id: 'aviso_critico',
      anchor: 'avisos:aviso_critico',
      label: 'Comunicado urgente',
      tooltip: 'Comunicados urgentes aparecem com destaque âmbar para chamar sua atenção.',
      role: 'resident',
      priority: 5,
    },
    {
      id: 'novo',
      anchor: 'avisos:novo',
      label: 'Novo Comunicado',
      tooltip: 'Publique um comunicado: título, categoria (ou crie uma nova), autor, mensagem e o marcador de urgência.',
      role: 'admin',
      priority: 6,
    },
    {
      id: 'editar_excluir',
      anchor: 'avisos:editar_excluir',
      label: 'Editar e excluir',
      tooltip: 'Use o lápis para alterar um comunicado já publicado; a lixeira remove com confirmação.',
      role: 'admin',
      priority: 7,
    },
  ],

  ocorrencias: [
    {
      id: 'nova',
      anchor: 'ocorrencias:nova',
      label: 'Nova publicação',
      tooltip: 'Registre um problema: descreva a ocorrência, anexe até 5 fotos e escolha a categoria antes de publicar.',
      role: 'both',
      priority: 1,
    },
    {
      id: 'filtros',
      anchor: 'ocorrencias:filtros',
      label: 'Filtros',
      tooltip: 'Filtre o feed por andamento (abertas / resolvidas) ou por categoria do problema.',
      role: 'both',
      priority: 2,
    },
    {
      id: 'busca',
      anchor: 'ocorrencias:busca',
      label: 'Busca',
      tooltip: 'Localize ocorrências por descrição, apartamento, autor ou categoria.',
      role: 'both',
      priority: 3,
    },
    {
      id: 'ordenacao',
      anchor: 'ocorrencias:ordenacao',
      label: 'Ordenação',
      tooltip: 'Reordene o feed: mais recentes, mais antigas, nome do morador, apartamento ou categoria.',
      role: 'both',
      priority: 4,
    },
    {
      id: 'status_badge',
      anchor: 'ocorrencias:status_badge',
      label: 'Status da ocorrência',
      tooltip: 'Acompanhe o andamento: Aberta, Em análise ou Resolvida.',
      role: 'both',
      priority: 5,
    },
    {
      id: 'curtir',
      anchor: 'ocorrencias:curtir',
      label: 'Curtir',
      tooltip: "'Concordo, também vivo esse problema' — apoie publicações de vizinhos.",
      role: 'both',
      priority: 6,
    },
    {
      id: 'comentar',
      anchor: 'ocorrencias:comentar',
      label: 'Comentários',
      tooltip: 'Leia comentários de vizinhos ou deixe o seu — dúvida, informação ou apoio.',
      role: 'both',
      priority: 7,
    },
    {
      id: 'editar_propria',
      anchor: 'ocorrencias:editar_propria',
      label: 'Editar a própria publicação',
      tooltip: 'Só o autor pode editar/excluir a própria publicação dentro de 3 minutos. Depois disso, apenas o síndico.',
      role: 'resident',
      priority: 8,
    },
    {
      id: 'resumo_feed',
      anchor: 'ocorrencias:resumo_feed',
      label: 'Resumo do Feed',
      tooltip: 'Visão geral por status (abertas, em análise, resolvidas). Clique para listar cada grupo.',
      role: 'admin',
      priority: 9,
    },
    {
      id: 'categorias',
      anchor: 'ocorrencias:categorias',
      label: 'Categorias mais relatadas',
      tooltip: 'Os problemas mais recorrentes do condomínio — clique para abrir o resumo da categoria.',
      role: 'admin',
      priority: 10,
    },
  ],

  indica_apt: [
    {
      id: 'busca',
      anchor: 'indica_apt:busca',
      label: 'Busca inteligente',
      tooltip: 'Procure por prestador ou tipo — por exemplo: eletricista, pizza, pet shop, restaurante.',
      role: 'both',
      priority: 1,
    },
    {
      id: 'filtros',
      anchor: 'indica_apt:filtros',
      label: 'Filtros',
      tooltip: 'Filtre por tipo de indicação, ou veja apenas as suas "Salvas" e "Minhas".',
      role: 'both',
      priority: 2,
    },
    {
      id: 'nova',
      anchor: 'indica_apt:nova',
      label: 'Fazer uma indicação',
      tooltip: 'Indique um prestador que você usou e aprovou: tipo, avaliação, fotos e link opcional.',
      role: 'both',
      priority: 3,
    },
    {
      id: 'curtir',
      anchor: 'indica_apt:curtir',
      label: 'Também recomendo',
      tooltip: "'Já usei e aprovo' — apoie a indicação do vizinho com seu endosso.",
      role: 'both',
      priority: 4,
    },
    {
      id: 'comentar',
      anchor: 'indica_apt:comentar',
      label: 'Comentar',
      tooltip: 'Pergunte algo ou acrescente detalhes para quem está lendo a indicação.',
      role: 'both',
      priority: 5,
    },
    {
      id: 'salvar',
      anchor: 'indica_apt:salvar',
      label: 'Salvar',
      tooltip: 'Guarde a indicação para depois — você a encontra no filtro "Salvas".',
      role: 'both',
      priority: 6,
    },
    {
      id: 'em_alta',
      anchor: 'indica_apt:em_alta',
      label: 'Em alta no condomínio',
      tooltip: 'As indicações mais curtidas pelos vizinhos. Clique para buscar o prestador.',
      role: 'both',
      priority: 7,
    },
    {
      id: 'rede_confianca',
      anchor: 'indica_apt:rede_confianca',
      label: 'Rede de confiança',
      tooltip: 'Acompanhe suas contribuições e faça a primeira indicação — quanto mais vizinhos indicam, mais confiável fica a rede.',
      role: 'both',
      priority: 8,
    },
  ],

  caixa: [
    {
      id: 'saldo',
      anchor: 'caixa:saldo',
      label: 'Saldo em Conta',
      tooltip: 'Saldo atual do condomínio. Clique no lápis para atualizar ao vivo (Cancelar/Salvar).',
      role: 'admin',
      priority: 1,
    },
    {
      id: 'total_aberto',
      anchor: 'caixa:total_aberto',
      label: 'Total em Aberto',
      tooltip: 'Soma e quantidade de boletos pendentes. Edite direto pelo lápis.',
      role: 'admin',
      priority: 2,
    },
    {
      id: 'fluxo_mensal',
      anchor: 'caixa:fluxo_mensal',
      label: 'Fluxo Mensal',
      tooltip: 'Receitas (verde) x despesas (cinza) por mês. Passe o mouse na barra para ver os valores; "+ Adicionar" cria um mês novo.',
      role: 'admin',
      priority: 3,
    },
    {
      id: 'despesas_categoria',
      anchor: 'caixa:despesas_categoria',
      label: 'Despesas por Categoria',
      tooltip: 'Percentual e valor de cada categoria de despesa. Edite ou remova item a item.',
      role: 'admin',
      priority: 4,
    },
    {
      id: 'pagamentos',
      anchor: 'caixa:pagamentos',
      label: 'Pagamentos Pendentes',
      tooltip: 'Boletos em aberto por unidade. "+ Adicionar" lança um novo pagamento com unidade, vencimento e valor.',
      role: 'admin',
      priority: 5,
    },
    {
      id: 'pag_pago',
      anchor: 'caixa:pag_pago',
      label: 'Marcar como Pago',
      tooltip: 'Quita o boleto: ele sai da lista e o "Total em Aberto" é atualizado na hora.',
      role: 'admin',
      priority: 6,
    },
  ],

  perfil: [
    {
      id: 'avatar',
      anchor: 'perfil:avatar',
      label: 'Foto de perfil',
      tooltip: 'Sua foto ajuda os vizinhos a te reconhecerem no feed. Dá para enviar ou excluir.',
      role: 'both',
      priority: 1,
    },
    {
      id: 'privilegios',
      anchor: 'perfil:privilegios',
      label: 'Privilégios de Acesso',
      tooltip: 'Mostra se seu acesso é total (síndico) ou limitado, e quais áreas do portal você pode usar.',
      role: 'both',
      priority: 2,
    },
    {
      id: 'nome_email',
      anchor: 'perfil:nome_email',
      label: 'Dados da conta',
      tooltip: 'Seus dados públicos no portal. Alterar o e-mail também atualiza seus dados de login.',
      role: 'both',
      priority: 3,
    },
    {
      id: 'apartamento',
      anchor: 'perfil:apartamento',
      label: 'Apartamento',
      tooltip: 'Informe sua unidade — ela é usada em publicações, curtidas e comentários.',
      role: 'both',
      priority: 4,
    },
    {
      id: 'redefinir_senha',
      anchor: 'perfil:redefinir_senha',
      label: 'Redefinir Senha',
      tooltip: 'Troque sua senha atual (mínimo de 6 caracteres).',
      role: 'both',
      priority: 5,
    },
    {
      id: 'salvar',
      anchor: 'perfil:salvar',
      label: 'Salvar alterações',
      tooltip: 'Grava tudo no portal e você recebe uma confirmação.',
      role: 'both',
      priority: 6,
    },
    {
      id: 'toggle_admin',
      anchor: 'perfil:toggle_admin',
      label: 'Modo ADMIN',
      tooltip: 'Habilita o acesso total ao portal. É bloqueado se já existir outro síndico cadastrado.',
      role: 'admin',
      priority: 7,
    },
  ],
};

export function featuresForModule(moduleId: string, isAdmin: boolean): FeatureDef[] {
  const all = MODULE_FEATURES[moduleId] || [];
  return all.filter(d => d.role === 'both' || d.role === (isAdmin ? 'admin' : 'resident'));
}