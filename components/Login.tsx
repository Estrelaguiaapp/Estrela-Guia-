
import React, { useState } from 'react';
import { authService } from '../services/authService';
import type { AuthUser } from '../types';
import { AppLogo } from './icons';
import { Loader } from './Loader';

interface LoginProps {
  onLogin: (user: AuthUser) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const user = await authService.login(email, password);
      onLogin(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-base font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <AppLogo className="h-20 w-20 text-primary mx-auto" />
          <h1 className="text-4xl font-heading text-text-title tracking-wider uppercase mt-4">
            Estrela Guia
          </h1>
          <p className="text-md text-text-subtle">A luz da sua gestão.</p>
        </div>

        <div className="bg-card p-8 rounded-md border border-border shadow-2xl">
          <h2 className="text-2xl font-bold text-center text-text-title mb-6">Acessar sua conta</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-subtle mb-1">E-mail</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background border border-border rounded-md p-3 text-text-base placeholder-text-subtle focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="carlos@exemplo.com"
              />
            </div>
            <div>
              <label htmlFor="password"className="block text-sm font-medium text-text-subtle mb-1">Senha</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background border border-border rounded-md p-3 text-text-base placeholder-text-subtle focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center bg-primary text-bg-profundo font-bold py-3 px-4 rounded-md hover:bg-primary-hover transition-all duration-300 disabled:bg-border disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader /> : 'Entrar'}
              </button>
            </div>
          </form>
           <div className="mt-6 text-center">
                <p className="text-sm text-text-subtle">
                    Não tem uma conta?{' '}
                    <a href="#" className="font-medium text-primary hover:text-primary-hover">
                        Crie uma agora
                    </a>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};
