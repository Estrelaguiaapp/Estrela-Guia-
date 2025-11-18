
import React, { useState, useEffect, useMemo } from 'react';
import type { DashboardData, Quote, QuoteStatus } from '../types';
import { HomeIcon, UsersIcon, FileTextIcon, BriefcaseIcon, ClipboardListIcon, CashIcon } from './icons';

// --- DATA PERSISTENCE SERVICE ---
const dateFields = ['createdAt', 'validity', 'entryDate', 'startDate', 'deadline', 'date'];

const dataReviver = (key: string, value: any) => {
    if (dateFields.includes(key) && typeof value === 'string') {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
            return date;
        }
    }
    return value;
};

const getInitialData = (): DashboardData => {
    return {
        leads: [],
        quotes: [
            { id: '#ORC-2024-11111', title: 'Reforma Cozinha', clientName: 'Ana Silva', total: 7500, status: 'Negociação', probability: 75, createdAt: new Date('2024-07-20T10:00:00Z'), validity: new Date('2024-08-10T23:59:59Z'), items: [], providerName: '', providerContact: '', clientContact: '' },
            { id: '#ORC-2024-22222', title: 'Instalação Elétrica', clientName: 'Construções XYZ', total: 12800, status: 'Enviado', probability: 50, createdAt: new Date('2024-07-22T14:30:00Z'), validity: new Date('2024-07-29T23:59:59Z'), items: [], providerName: '', providerContact: '', clientContact: '' },
            { id: '#ORC-2024-33333', title: 'Muro de Contenção', clientName: 'Carlos Pereira', total: 25000, status: 'Ganhou', probability: 100, createdAt: new Date('2024-07-15T09:00:00Z'), validity: new Date('2024-07-22T23:59:59Z'), items: [], providerName: '', providerContact: '', clientContact: '' },
             { id: '#ORC-2024-44444', title: 'Pintura Fachada', clientName: 'Condomínio Sol', total: 9500, status: 'Perdeu', probability: 0, createdAt: new Date('2024-07-18T11:00:00Z'), validity: new Date('2024-07-25T23:59:59Z'), items: [], providerName: '', providerContact: '', clientContact: '' },
        ],
        clients: [],
        tasks: [],
        financials: [],
    };
};

const storageService = {
    getDashboardData: (): DashboardData => {
        try {
            const data = localStorage.getItem('dashboardData');
            if (data) {
                return JSON.parse(data, dataReviver);
            }
            // If no data, initialize with mock data
            const initialData = getInitialData();
            localStorage.setItem('dashboardData', JSON.stringify(initialData));
            return initialData;
        } catch (error) {
            console.error("Failed to parse dashboard data from localStorage", error);
            return getInitialData();
        }
    },
    saveDashboardData: (data: DashboardData) => {
        try {
            const stringifiedData = JSON.stringify(data);
            localStorage.setItem('dashboardData', stringifiedData);
        } catch (error) {
            console.error("Failed to save dashboard data to localStorage", error);
        }
    }
};

// --- HELPER COMPONENTS ---

const KPI_CARD_STYLES = "bg-card border border-primary/40 rounded-md p-6 flex flex-col justify-between";

const KPICard: React.FC<{ title: string; value: string; description: string }> = ({ title, value, description }) => (
    <div className={KPI_CARD_STYLES}>
        <div>
            <p className="text-sm font-medium text-text-subtle">{title}</p>
            <p className="text-4xl font-bold text-text-title my-2">{value}</p>
        </div>
        <p className="text-xs text-text-subtle">{description}</p>
    </div>
);

const Placeholder: React.FC<{ title: string }> = ({ title }) => (
    <div className="w-full h-full flex items-center justify-center bg-card border border-border rounded-md p-8">
        <div className="text-center">
            <h2 className="text-2xl font-heading text-text-title">{title}</h2>
            <p className="text-text-subtle mt-2">Esta funcionalidade estará disponível em breve!</p>
        </div>
    </div>
);


// --- PAGE COMPONENTS ---

const DashboardHome: React.FC<{ data: DashboardData; setView: (view: 'generator' | 'dashboard') => void; }> = ({ data, setView }) => {
    const { quotes } = data;

    const kpis = useMemo(() => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const quotesSentLast7Days = quotes.filter(q => ['Enviado', 'Negociação', 'Ganhou', 'Perdeu'].includes(q.status) && new Date(q.createdAt) >= oneWeekAgo).length;

        const wonQuotes = quotes.filter(q => q.status === 'Ganhou').length;
        const lostQuotes = quotes.filter(q => q.status === 'Perdeu').length;
        const closedQuotes = wonQuotes + lostQuotes;
        const winRate = closedQuotes > 0 ? ((wonQuotes / closedQuotes) * 100).toFixed(0) : '0';

        const pipelineValue = quotes
            .filter(q => ['Enviado', 'Negociação'].includes(q.status))
            .reduce((sum, q) => sum + (q.total * (q.probability / 100)), 0);

        return {
            quotesSentLast7Days,
            winRate,
            pipelineValue
        };
    }, [quotes]);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-heading text-text-title tracking-wider">Painel de Controle</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <KPICard title="Orçamentos Enviados" value={kpis.quotesSentLast7Days.toString()} description="Nos últimos 7 dias" />
                <KPICard title="Taxa de Ganho" value={`${kpis.winRate}%`} description="De todos os orçamentos finalizados" />
                <KPICard title="Pipeline Ponderado" value={kpis.pipelineValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} description="Valor estimado de propostas ativas" />
            </div>
             <div>
                <h2 className="text-2xl font-heading text-text-title mb-4">Acesso Rápido</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="bg-primary text-bg-profundo font-bold py-3 px-4 rounded-md hover:bg-primary-hover">Novo Lead</button>
                    <button onClick={() => setView('generator')} className="bg-primary text-bg-profundo font-bold py-3 px-4 rounded-md hover:bg-primary-hover">Nova Proposta</button>
                    <button className="bg-primary text-bg-profundo font-bold py-3 px-4 rounded-md hover:bg-primary-hover">Nova Tarefa</button>
                </div>
            </div>
        </div>
    );
};

const QuotesPipeline: React.FC<{ quotes: Quote[]; onUpdate: (updatedQuote: Quote) => void; }> = ({ quotes, onUpdate }) => {
    const statuses: QuoteStatus[] = ['Rascunho', 'Enviado', 'Negociação', 'Ganhou', 'Perdeu'];
    const statusColors: Record<QuoteStatus, string> = {
        'Rascunho': 'bg-gray-500',
        'Enviado': 'bg-blue-500',
        'Negociação': 'bg-yellow-500',
        'Ganhou': 'bg-green-500',
        'Perdeu': 'bg-red-500',
    };
    
    const quotesByStatus = useMemo(() => {
        return statuses.reduce((acc, status) => {
            acc[status] = quotes.filter(q => q.status === status);
            return acc;
        }, {} as Record<QuoteStatus, Quote[]>);
    }, [quotes]);

    const handleStatusChange = (quoteId: string, newStatus: QuoteStatus) => {
        const quoteToUpdate = quotes.find(q => q.id === quoteId);
        if(quoteToUpdate) {
            onUpdate({ ...quoteToUpdate, status: newStatus });
        }
    };

    return (
        <div>
             <h1 className="text-3xl font-heading text-text-title tracking-wider mb-6">Pipeline de Orçamentos</h1>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
                 {statuses.map(status => (
                     <div key={status} className="bg-card rounded-md p-3">
                         <h3 className="font-semibold text-text-title mb-4 flex items-center">
                            <span className={`w-3 h-3 rounded-full mr-2 ${statusColors[status]}`}></span>
                            {status} ({quotesByStatus[status].length})
                         </h3>
                         <div className="space-y-3 h-[60vh] overflow-y-auto pr-1">
                             {quotesByStatus[status].map(quote => (
                                 <div key={quote.id} className="bg-background border border-primary/30 p-4 rounded-md shadow-sm">
                                     <p className="font-bold text-text-base">{quote.title}</p>
                                     <p className="text-sm text-text-subtle">{quote.clientName}</p>
                                     <p className="text-lg font-semibold my-2">{quote.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                     <select 
                                        value={quote.status} 
                                        onChange={(e) => handleStatusChange(quote.id, e.target.value as QuoteStatus)}
                                        className="w-full bg-border border-border/50 rounded-md p-1 mt-2 text-xs focus:ring-primary focus:outline-none"
                                     >
                                         {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                     </select>
                                 </div>
                             ))}
                         </div>
                     </div>
                 ))}
             </div>
        </div>
    )
};


// --- MAIN DASHBOARD COMPONENT ---

type Page = 'home' | 'leads' | 'quotes' | 'clients' | 'tasks' | 'financials';

interface DashboardProps {
    setView: (view: 'generator' | 'dashboard') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  const [activePage, setActivePage] = useState<Page>('home');
  const [data, setData] = useState<DashboardData>(() => storageService.getDashboardData());

  useEffect(() => {
    // This effect can be used to listen to storage changes from other tabs in the future
    const handleStorageChange = () => {
        setData(storageService.getDashboardData());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  const handleUpdateQuote = (updatedQuote: Quote) => {
      const updatedQuotes = data.quotes.map(q => q.id === updatedQuote.id ? updatedQuote : q);
      const newData = { ...data, quotes: updatedQuotes };
      setData(newData);
      storageService.saveDashboardData(newData);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <DashboardHome data={data} setView={setView} />;
      case 'quotes':
        return <QuotesPipeline quotes={data.quotes} onUpdate={handleUpdateQuote} />;
      case 'leads':
        return <Placeholder title="Gestão de Leads" />;
      case 'clients':
        return <Placeholder title="Gestão de Clientes" />;
      case 'tasks':
        return <Placeholder title="Gestão de Tarefas" />;
      case 'financials':
        return <Placeholder title="Controle Financeiro" />;
      default:
        return <DashboardHome data={data} setView={setView} />;
    }
  };
  
  const menuItems = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'leads', label: 'Leads', icon: UsersIcon },
    { id: 'quotes', label: 'Orçamentos', icon: FileTextIcon },
    { id: 'clients', label: 'Clientes', icon: BriefcaseIcon },
    { id: 'tasks', label: 'Tarefas', icon: ClipboardListIcon },
    { id: 'financials', label: 'Financeiro', icon: CashIcon },
  ];

  return (
    <div className="flex flex-grow container mx-auto p-4 md:p-8">
      <aside className="w-16 md:w-64 -ml-4 md:-ml-8 pt-4">
        <nav className="flex flex-col space-y-2">
            {menuItems.map(item => (
                 <button 
                    key={item.id}
                    onClick={() => setActivePage(item.id as Page)}
                    className={`flex items-center p-3 rounded-md text-sm font-medium transition-colors ${activePage === item.id ? 'bg-primary text-bg-profundo' : 'text-text-subtle hover:bg-card'}`}
                 >
                     <item.icon className="h-5 w-5" />
                     <span className="ml-4 hidden md:block">{item.label}</span>
                 </button>
            ))}
        </nav>
      </aside>
      <main className="flex-grow ml-4 md:ml-8">
        {renderPage()}
      </main>
    </div>
  );
};