
import React, { useState, useEffect, useRef } from 'react';
import type { Quote, QuoteItem } from '../types';
import { generateQuoteDetails } from '../services/geminiService';
import { Loader } from './Loader';
import { AddIcon, DeleteIcon, MagicIcon, BuildingIcon, PhoneIcon, UserIcon, CalendarIcon, PercentIcon } from './icons';

interface QuoteFormProps {
  quote: Quote;
  onQuoteChange: (quote: Quote) => void;
}

const serviceCategories: Record<string, string[]> = {
  'Construção civil': ['Construção de muro', 'Reboco e acabamento', 'Colocação de piso', 'Pintura de parede', 'Assentamento de azulejo'],
  'Manutenção elétrica e hidráulica': ['Instalação de ponto elétrico', 'Troca de fiação', 'Reparo de vazamento', 'Instalação de chuveiro', 'Instalação de louças sanitárias'],
  'Mecânica e automotiva': ['Troca de óleo e filtros', 'Alinhamento e balanceamento', 'Revisão de freios', 'Funilaria e pintura', 'Troca de amortecedor'],
  'Marcenaria e serralheria': ['Fabricação de móveis sob medida', 'Instalação de portas', 'Montagem de armários', 'Fabricação de portão de ferro'],
  'Serviços residenciais': ['Jardinagem e paisagismo', 'Limpeza de piscina', 'Faxina geral', 'Montagem de móveis'],
  'Metalurgia e indústria': ['Serviço de tornearia', 'Soldagem de estrutura (MIG/TIG)', 'Corte e dobra de chapas metálicas'],
  'Informática e tecnologia': ['Formatação de computador e instalação de SO', 'Instalação e configuração de redes', 'Manutenção de hardware e limpeza'],
  'Outros serviços': ['Serviço personalizado', 'Manutenção geral']
};

const InputWithIcon: React.FC<{ icon: React.ReactNode; label: string; name: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder: string; type?: string; min?: number; max?: number }> = 
({ icon, label, ...props }) => (
  <div>
    <label htmlFor={props.name} className="block text-sm font-medium text-text-subtle mb-1">{label}</label>
    <div className="relative">
      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-subtle">{icon}</span>
      <input {...props} id={props.name} className="w-full bg-background border border-border rounded-md p-2 pl-10 text-text-base placeholder-text-subtle focus:ring-2 focus:ring-primary focus:outline-none" />
    </div>
  </div>
);

export const QuoteForm: React.FC<QuoteFormProps> = ({ quote, onQuoteChange }) => {
  const [aiInput, setAiInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);

  const [aiStatusMessages, setAiStatusMessages] = useState<string[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  
  const [pendingTextItem, setPendingTextItem] = useState<{ description: string; price: number } | null>(null);

  const [typingItem, setTypingItem] = useState<{ id: string; fullText: string; currentIndex: number } | null>(null);

  useEffect(() => {
    if (selectedArea && serviceCategories[selectedArea]) {
      setServiceTypes(serviceCategories[selectedArea]);
      setSelectedService('');
    } else {
      setServiceTypes([]);
      setSelectedService('');
    }
  }, [selectedArea]);
  
  // Effect for showing "thinking" messages
  useEffect(() => {
    if (!isLoading || aiStatusMessages.length === 0) return;

    if (currentMessageIndex < aiStatusMessages.length) {
      const timer = setTimeout(() => {
        setCurrentMessageIndex(prev => prev + 1);
      }, 1800);

      return () => clearTimeout(timer);
    } else {
      // All messages have been displayed, now process the pending data
      const finalTimer = setTimeout(() => {
        setIsLoading(false);
        setAiStatusMessages([]);
        setCurrentMessageIndex(0);
        
        if (pendingTextItem) {
          const newItem: QuoteItem = {
            id: Date.now().toString(),
            description: '', // Start empty for typing effect
            quantity: 1,
            price: pendingTextItem.price,
          };
          onQuoteChange({ ...quote, items: [...quote.items, newItem] });
          setTypingItem({ id: newItem.id, fullText: pendingTextItem.description, currentIndex: 0 });
          setPendingTextItem(null);
        }
      }, 1500);

      return () => clearTimeout(finalTimer);
    }
  }, [isLoading, aiStatusMessages, currentMessageIndex, pendingTextItem, quote, onQuoteChange]);
  
  // Effect for the "typing" animation
  useEffect(() => {
    if (!typingItem) return;

    const { id, fullText, currentIndex } = typingItem;

    if (currentIndex >= fullText.length) {
      setTypingItem(null); // Finish typing
      return;
    }

    const timer = setTimeout(() => {
      const updatedItems = quote.items.map(item =>
        item.id === id
          ? { ...item, description: fullText.substring(0, currentIndex + 1) }
          : item
      );
      onQuoteChange({ ...quote, items: updatedItems });

      setTypingItem({ ...typingItem, currentIndex: currentIndex + 1 });
    }, 10);

    return () => clearTimeout(timer);
  }, [typingItem, quote, onQuoteChange]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
     if (type === 'date') {
      onQuoteChange({ ...quote, [name]: new Date(value) });
    } else {
      onQuoteChange({ ...quote, [name]: value });
    }
  };
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onQuoteChange({ ...quote, providerLogo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleItemChange = (id: string, field: keyof QuoteItem, value: string) => {
    const updatedItems = quote.items.map(item => {
      if (item.id === id) {
        if (field === 'price') {
            const numericValue = parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
            return { ...item, [field]: numericValue };
        }
        if (field === 'quantity') {
            return { ...item, [field]: parseInt(value, 10) || 1 };
        }
        return { ...item, [field]: value };
      }
      return item;
    });
    onQuoteChange({ ...quote, items: updatedItems });
  };
  
  const handlePriceInputChange = (id: string, value: string) => {
     const sanitizedValue = value.replace(/[^0-9,]/g, '');
     handleItemChange(id, 'price', sanitizedValue);
  }
  
  const formatCurrency = (value: number) => {
     if (isNaN(value)) return '';
     return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  const handleAddItem = () => {
    const newItem: QuoteItem = { id: Date.now().toString(), description: '', quantity: 1, price: 0 };
    onQuoteChange({ ...quote, items: [...quote.items, newItem] });
  };

  const handleRemoveItem = (id: string) => {
    onQuoteChange({ ...quote, items: quote.items.filter(item => item.id !== id) });
  };

  const handleAIGenerateText = async () => {
    if (!selectedArea || !selectedService) {
      setError("Por favor, selecione a área de atuação e o tipo de serviço.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAiStatusMessages([]);
    setCurrentMessageIndex(0);

    try {
      const result = await generateQuoteDetails(selectedArea, selectedService, aiInput);
      setAiStatusMessages([...result.intro_mensagens, result.mensagem_final]);
      setPendingTextItem(result.quoteDetails);
      setAiInput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro desconhecido.");
      setIsLoading(false);
    }
  };
  
  const getHtml5Date = (date: Date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return (
    <div className="space-y-6">
      <div className="bg-card p-6 rounded-md border border-border">
        <h3 className="text-lg font-heading text-primary tracking-wider mb-4">Seus Dados (Carregados da sua conta)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputWithIcon label="Seu nome ou empresa" name="providerName" value={quote.providerName} onChange={handleInputChange} placeholder="Ex: João da Silva Construções" icon={<BuildingIcon className="w-5 h-5"/>} />
          <InputWithIcon label="Seu contato" name="providerContact" value={quote.providerContact} onChange={handleInputChange} placeholder="Telefone ou e-mail" icon={<PhoneIcon className="w-5 h-5"/>} />
          <div className="md:col-span-2">
            <label htmlFor="logo-upload" className="block text-sm font-medium text-text-subtle mb-1">Seu Logo (Opcional)</label>
            {quote.providerLogo && <img src={quote.providerLogo} alt="Pré-visualização do logo" className="h-16 w-auto mb-2 rounded border border-border p-1"/>}
            <input 
              type="file" 
              id="logo-upload"
              accept="image/png, image/jpeg"
              onChange={handleLogoUpload}
              className="block w-full text-sm text-text-subtle file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
            />
          </div>
        </div>
      </div>

      <div className="bg-card p-6 rounded-md border border-border">
        <h3 className="text-lg font-heading text-primary tracking-wider mb-4">Dados do Cliente e Proposta</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputWithIcon label="Nome do cliente" name="clientName" value={quote.clientName} onChange={handleInputChange} placeholder="Ex: Maria Santos" icon={<UserIcon className="w-5 h-5"/>} />
          <InputWithIcon label="Telefone do cliente" name="clientContact" value={quote.clientContact} onChange={handleInputChange} placeholder="Ex: 11987654321" icon={<PhoneIcon className="w-5 h-5"/>} type="tel"/>
          <InputWithIcon label="Validade da proposta" name="validity" value={getHtml5Date(quote.validity)} onChange={handleInputChange} placeholder="DD/MM/AAAA" icon={<CalendarIcon className="w-5 h-5"/>} type="date"/>
          <InputWithIcon label="Probabilidade de Fechamento (%)" name="probability" value={quote.probability} onChange={handleInputChange} placeholder="50" icon={<PercentIcon className="w-5 h-5"/>} type="number" min={0} max={100}/>
        </div>
      </div>
      
      <div className="bg-card p-6 rounded-md border border-primary/50">
          <h3 className="text-lg font-heading text-primary tracking-wider flex items-center mb-4">Gerar Itens com IA (Estrela Guia)</h3>
          {!isLoading && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <select name="area" value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)} className="w-full bg-background border border-border rounded-md p-2 text-text-base focus:ring-2 focus:ring-primary focus:outline-none">
                    <option value="" disabled>Área de atuação</option>
                    {Object.keys(serviceCategories).map(area => <option key={area} value={area}>{area}</option>)}
                 </select>
                 <select name="service" value={selectedService} onChange={(e) => setSelectedService(e.target.value)} disabled={!selectedArea} className="w-full bg-background border border-border rounded-md p-2 text-text-base focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50">
                    <option value="" disabled>Tipo de serviço</option>
                    {serviceTypes.map(service => <option key={service} value={service}>{service}</option>)}
                 </select>
              </div>
              <div className="mt-4">
                <input type="text" value={aiInput} onChange={(e) => setAiInput(e.target.value)} placeholder="Descrição adicional para mais detalhes (opcional)..." className="w-full bg-background border border-border rounded-md p-2 text-text-base placeholder-text-subtle focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
            </>
          )}
          <div className="mt-4">
            {!isLoading ? (
                <button onClick={handleAIGenerateText} disabled={!selectedService || !!typingItem} className="w-full flex items-center justify-center bg-primary text-bg-profundo font-bold py-2.5 px-4 rounded-md hover:bg-primary-hover transition-all duration-300 disabled:bg-border disabled:cursor-not-allowed">
                  <MagicIcon className="w-5 h-5 mr-2" /> Gerar com Estrela Guia
                </button>
            ) : (
                <div className="text-center p-3 bg-background rounded-md border border-border transition-all duration-500 h-[52px] flex items-center justify-center">
                    <div className="flex items-center justify-center text-text-base">
                        <Loader />
                        <p key={currentMessageIndex} className="ml-3 animate-fade-in">{aiStatusMessages[currentMessageIndex] || aiStatusMessages[aiStatusMessages.length-1] || 'Aguarde um momento...'}</p>
                    </div>
                </div>
            )}
          </div>
          {error && <p className="text-red-400 mt-3 text-sm">{error}</p>}
      </div>

      <div className="bg-card p-6 rounded-md border border-border">
        <h3 className="text-lg font-heading text-primary tracking-wider mb-4">Itens do Orçamento</h3>
        {quote.items.length === 0 && <p className="text-text-subtle text-center py-4 bg-background rounded-md">Nenhum item adicionado.</p>}
        {quote.items.map((item, index) => (
          <div key={item.id} className="bg-background p-4 rounded-md space-y-3 mb-4 border border-border">
            <div className="flex justify-between items-start">
              <label className="text-text-base font-medium">Item {index + 1}</label>
              <button onClick={() => handleRemoveItem(item.id)} className="text-red-400 hover:text-red-300"><DeleteIcon className="w-5 h-5"/></button>
            </div>
            <textarea value={item.description} onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} placeholder="Descrição do serviço/produto" className="w-full h-24 bg-background border border-border rounded-md p-2 text-text-base placeholder-text-subtle focus:ring-2 focus:ring-primary focus:outline-none" />
            <div className="flex gap-4">
              <input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)} placeholder="Qtd." className="w-1/2 bg-background border border-border rounded-md p-2 text-text-base placeholder-text-subtle focus:ring-2 focus:ring-primary focus:outline-none" />
               <input type="text" value={formatCurrency(item.price)} onChange={(e) => handlePriceInputChange(item.id, e.target.value)} placeholder="Preço (R$)" className="w-1/2 bg-background border border-border rounded-md p-2 text-text-base placeholder-text-subtle focus:ring-2 focus:ring-primary focus:outline-none" />
            </div>
          </div>
        ))}
        <button onClick={handleAddItem} className="w-full flex items-center justify-center border-2 border-dashed border-border text-text-subtle font-bold py-2.5 px-4 rounded-md hover:bg-border hover:text-text-base transition-colors">
          <AddIcon className="w-5 h-5 mr-2"/> Adicionar Item Manualmente
        </button>
      </div>
    </div>
  );
};