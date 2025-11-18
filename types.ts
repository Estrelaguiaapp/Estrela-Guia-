
export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export type QuoteStatus = 'Rascunho' | 'Enviado' | 'Negociação' | 'Ganhou' | 'Perdeu';
export type LeadStatus = 'Novo' | 'Qualificado' | 'Perdido' | 'Convertido';
export type TaskStatus = 'A Fazer' | 'Em Progresso' | 'Bloqueado' | 'Concluído';

export interface Quote {
  id: string;
  title: string;
  createdAt: Date;
  validity: Date;
  providerName: string;
  providerLogo?: string;
  providerContact: string;
  clientName: string;
  clientContact: string;
  items: QuoteItem[];
  total: number;
  status: QuoteStatus;
  probability: number; // 0-100
}

export interface Lead {
  id: string;
  companyName: string;
  contact: string;
  email: string;
  phone: string;
  source: string;
  status: LeadStatus;
  entryDate: Date;
  estimatedTicket: number;
}

export interface Client {
  id: string;
  name: string;
  cnpj: string;
  segment: string;
  region: string;
  poc: string;
  estimatedCLV: number;
  startDate: Date;
  active: boolean;
}

export interface Task {
  id: string;
  title: string;
  relatedTo: string; // ID of Quote or Client
  assignee: string;
  priority: 'Baixa' | 'Média' | 'Alta';
  status: TaskStatus;
  deadline: Date;
  type: 'Follow-up' | 'Ajuste de proposta' | 'Reunião' | 'Outro';
}

export interface FinancialRecord {
  id: string;
  type: 'Receita' | 'Custo';
  description: string;
  relatedTo: string; // ID of Quote or Client
  value: number;
  date: Date;
  category: string;
  paid: boolean;
}

export interface DashboardData {
    leads: Lead[];
    quotes: Quote[];
    clients: Client[];
    tasks: Task[];
    financials: FinancialRecord[];
}

export interface AuthUser {
  uid: string;
  email: string;
  providerName: string;
  providerContact: string;
  providerLogo?: string;
}


// --- Tipos para Geração com IA ---

// Para a geração via formulário
export interface AISuggestionResponse {
  intro_mensagens: string[];
  quoteDetails: {
    description: string;
    price: number;
  };
  mensagem_final: string;
}