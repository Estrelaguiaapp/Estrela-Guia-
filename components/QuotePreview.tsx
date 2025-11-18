import React, { useState } from 'react';
import { WhatsAppIcon, CopyIcon, FileTextIcon, SaveIcon } from './icons';
import type { Quote, DashboardData } from '../types';

interface QuotePreviewProps {
  quote: Quote;
  formattedQuote: string;
}

// Helper to get dashboard data from localStorage
const getDashboardData = (): DashboardData => {
  const data = localStorage.getItem('dashboardData');
  if (data) {
    return JSON.parse(data, (key, value) => {
       if (['createdAt', 'validity', 'entryDate', 'startDate', 'deadline'].includes(key) && value) {
        return new Date(value);
      }
      return value;
    });
  }
  // Return empty structure if nothing is in localStorage
  return { leads: [], quotes: [], clients: [], tasks: [], financials: [] };
};

// Helper to save dashboard data to localStorage
const saveDashboardData = (data: DashboardData) => {
  localStorage.setItem('dashboardData', JSON.stringify(data));
};


export const QuotePreview: React.FC<QuotePreviewProps> = ({ quote, formattedQuote }) => {
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleSendWhatsApp = () => {
    const phone = quote.clientContact.replace(/\D/g, '');
    if (!phone) {
      showNotification('❌ Insira o telefone do cliente.');
      return;
    }
    const updatedQuote = {...quote, status: 'Enviado' as const};
    handleSaveToDashboard(updatedQuote);
    
    const encodedText = encodeURIComponent(formattedQuote);
    const fullPhone = phone.length >= 10 ? `55${phone}` : phone;
    window.open(`https://wa.me/${fullPhone}?text=${encodedText}`, '_blank');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedQuote);
    showNotification('✅ Texto copiado para a área de transferência!');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveToDashboard = (quoteToSave: Quote = quote) => {
    if (!quoteToSave.clientName || quoteToSave.items.length === 0) {
      showNotification('❌ Preencha o nome do cliente e adicione itens.');
      return;
    }
    const data = getDashboardData();
    const existingQuoteIndex = data.quotes.findIndex(q => q.id === quoteToSave.id);

    if (existingQuoteIndex > -1) {
      data.quotes[existingQuoteIndex] = quoteToSave;
    } else {
      data.quotes.push(quoteToSave);
    }
    
    saveDashboardData(data);
    showNotification('💾 Orçamento salvo no painel!');
  };

  return (
    <div className="sticky top-24 no-print">
      {notification && (
        <div className="fixed bottom-5 right-5 bg-card border border-primary text-text-base p-3 rounded-md shadow-lg z-50 animate-fade-in-out">
          {notification}
        </div>
      )}
      <div className="bg-card p-6 rounded-md border border-border">
        <h2 className="text-xl font-heading text-primary tracking-wider border-b border-border pb-2 mb-4">Pré-visualização e Envio</h2>
        <div className="printable-area bg-texto-titulo text-bg-profundo rounded-md p-4 whitespace-pre-wrap h-96 overflow-y-auto text-sm border border-primary/30">
          {quote.providerLogo && <img src={quote.providerLogo} alt="Logo da Empresa" className="max-h-20 w-auto mb-6" />}
          {formattedQuote.split('\n').map((line, index) => (
            <React.Fragment key={index}>
              {line.startsWith('*') && line.endsWith('*') ? <strong>{line.slice(1, -1)}</strong> : line}
              <br />
            </React.Fragment>
          ))}
        </div>
        <div className="mt-6 space-y-3">
          <button 
            onClick={handleSendWhatsApp}
            className="w-full flex items-center justify-center bg-secondary text-white font-bold py-3 px-4 rounded-md hover:opacity-90 transition-opacity"
          >
            <WhatsAppIcon className="w-6 h-6 mr-2" />
            Salvar e Enviar via WhatsApp
          </button>
           <button 
              onClick={() => handleSaveToDashboard()}
              className="w-full flex items-center justify-center bg-primary text-bg-profundo font-bold py-3 px-4 rounded-md hover:bg-primary-hover transition-colors"
            >
              <SaveIcon className="w-5 h-5 mr-2" />
              Salvar no Painel
            </button>
          <div className="flex gap-3">
            <button 
              onClick={handleCopy}
              className="w-full flex items-center justify-center bg-border text-text-base font-bold py-3 px-4 rounded-md hover:bg-border/70 transition-colors"
            >
              <CopyIcon className="w-5 h-5 mr-2" />
              Copiar Texto
            </button>
            <button 
              onClick={handlePrint}
              className="w-full flex items-center justify-center bg-border text-text-base font-bold py-3 px-4 rounded-md hover:bg-border/70 transition-colors"
            >
              <FileTextIcon className="w-5 h-5 mr-2" />
              Salvar PDF / Imprimir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};