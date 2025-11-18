
import React from 'react';
import { AppLogo } from './icons';

interface HeaderProps {
    view: 'generator' | 'dashboard';
    setView: (view: 'generator' | 'dashboard') => void;
    onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ view, setView, onLogout }) => {
  return (
    <header className="bg-background/80 backdrop-blur-md sticky top-0 z-10 border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <AppLogo className="h-12 w-12 text-primary" />
            <div className="ml-4">
              <h1 className="text-2xl font-heading text-text-title tracking-widest uppercase">
                Estrela Guia
              </h1>
              <p className="text-sm text-text-subtle">Monte e envie orçamentos profissionais com IA</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center space-x-4">
            <button
              onClick={() => setView(view === 'generator' ? 'dashboard' : 'generator')}
              className="flex items-center justify-center bg-card border border-border text-text-base font-bold py-2 px-4 rounded-md hover:bg-border transition-colors"
            >
              {view === 'generator' ? 'Acessar Painel 📊' : 'Gerador de Orçamentos 📝'}
            </button>
             <button
              onClick={onLogout}
              className="flex items-center justify-center bg-red-600/20 border border-red-500 text-red-400 font-bold py-2 px-4 rounded-md hover:bg-red-500 hover:text-white transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};