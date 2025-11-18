
import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { QuoteForm } from './components/QuoteForm';
import { QuotePreview } from './components/QuotePreview';
import { ContactCTA } from './components/ContactCTA';
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Login';
import type { Quote, AuthUser } from './types';
import { authService } from './services/authService';

const App: React.FC = () => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => authService.getCurrentUser());
  const [view, setView] = useState<'generator' | 'dashboard'>('generator');

  const [quote, setQuote] = useState<Quote>(() => {
    const creationDate = new Date();
    const validityDate = new Date();
    validityDate.setDate(creationDate.getDate() + 7);
    const uniqueId = `#ORC-${creationDate.getFullYear()}-${String(Date.now()).slice(-5)}`;
    
    return {
      id: uniqueId,
      title: 'Novo Orçamento',
      createdAt: creationDate,
      validity: validityDate,
      providerName: '',
      providerLogo: '',
      providerContact: '',
      clientName: '',
      clientContact: '',
      items: [],
      total: 0,
      status: 'Rascunho',
      probability: 50,
    };
  });

  useEffect(() => {
    if (authUser) {
      setQuote(prevQuote => ({
        ...prevQuote,
        providerName: authUser.providerName,
        providerContact: authUser.providerContact,
        providerLogo: authUser.providerLogo
      }));
    }
  }, [authUser]);

  const handleLogin = (user: AuthUser) => {
    setAuthUser(user);
  };

  const handleLogout = () => {
    authService.logout();
    setAuthUser(null);
  };

  const handleQuoteChange = (updatedQuote: Quote) => {
    const total = updatedQuote.items.reduce((acc, item) => {
      const price = typeof item.price === 'number' ? item.price : 0;
      const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
      return acc + (quantity * price);
    }, 0);
    setQuote({ 
      ...updatedQuote, 
      title: `Orçamento para ${updatedQuote.clientName || 'Novo Cliente'}`,
      total 
    });
  };
  
  const formattedQuote = useMemo(() => {
    const formattedValidityDate = new Date(quote.validity).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const formatCurrency = (value: number) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    const header = `*${quote.title} (${quote.id})*\n\n`;
    const providerInfo = `*De:* ${quote.providerName || 'Não informado'}\n*Contato:* ${quote.providerContact || 'Não informado'}\n\n`;
    const clientInfo = `*Para:* ${quote.clientName || 'Não informado'}\n\n`;
    const greeting = `Olá, ${quote.clientName || 'cliente'}! Segue o orçamento solicitado:\n\n---\n*Itens do Serviço:*\n\n`;
    
    const itemsText = quote.items.map((item, index) => {
        const price = typeof item.price === 'number' ? item.price : 0;
        const quantity = typeof item.quantity === 'number' ? item.quantity : 1;
        const subtotal = quantity * price;
        return `*${index + 1}. ${item.description}*\n   - Quantidade: ${quantity}\n   - Valor Unit.: ${formatCurrency(price)}\n   - Subtotal: ${formatCurrency(subtotal)}`;
    }).join('\n\n');

    const totalText = `\n\n---\n*Valor Total:* ${formatCurrency(quote.total)}\n\n`;
    const closing = `Qualquer dúvida, estou à disposição!`;

    const legalText = `\n\n---\n*Termos e Condições:*\n1. *Validade da Proposta:* Este orçamento é válido até ${formattedValidityDate}.\n2. *Alterações no Escopo:* Os valores referem-se aos serviços descritos. Alterações no escopo estão sujeitas a nova avaliação de custos.\n3. *Garantia e Conformidade:* Nossos serviços são executados com profissionalismo e em conformidade com o Código de Defesa do Consumidor (Lei nº 8.078/1990).\n4. *Cancelamento:* Em caso de cancelamento após a aprovação, custos de materiais já adquiridos ou etapas executadas poderão ser cobrados.`;

    return header + providerInfo + clientInfo + greeting + itemsText + totalText + closing + legalText;
  }, [quote]);

  if (!authUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background text-text-base font-sans flex flex-col">
      <Header view={view} setView={setView} onLogout={handleLogout} />
      {view === 'generator' ? (
        <>
          <main className="container mx-auto p-4 md:p-8 flex-grow">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <QuoteForm quote={quote} onQuoteChange={handleQuoteChange} />
              <QuotePreview quote={quote} formattedQuote={formattedQuote} />
            </div>
          </main>
          <ContactCTA />
        </>
      ) : (
        <Dashboard setView={setView} />
      )}
      <footer className="text-center p-4 text-text-subtle text-sm bg-card border-t border-border">
        <p>Desenvolvido por Estrela Guia &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default App;