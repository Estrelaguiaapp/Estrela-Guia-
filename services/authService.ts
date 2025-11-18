
import type { AuthUser } from '../types';

const AUTH_USER_KEY = 'estrelaGuiaAuthUser';

// Simulação de um banco de dados de usuários
const MOCK_USERS: AuthUser[] = [
  {
    uid: 'uid123',
    email: 'carlos@exemplo.com',
    providerName: 'Carlos Silva Reformas',
    providerContact: '(11) 91234-5678',
    providerLogo: '', // pode ser uma URL de um logo padrão
  },
  {
    uid: 'uid456',
    email: 'ana@exemplo.com',
    providerName: 'Ana Souza - Jardinagem',
    providerContact: '(21) 98765-4321',
    providerLogo: '',
  }
];

const login = async (email: string, password_unused: string): Promise<AuthUser> => {
  // Em uma aplicação real, aqui você faria uma chamada para o seu backend (ex: Firebase)
  // Para esta simulação, vamos apenas encontrar o usuário pelo email
  console.log(`Tentando login com: ${email}`);
  
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (user) {
        console.log("Usuário encontrado:", user);
        try {
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
          resolve(user);
        } catch (error) {
          console.error("Erro ao salvar no localStorage:", error);
          reject(new Error("Não foi possível iniciar a sessão."));
        }
      } else {
        console.log("Usuário não encontrado.");
        reject(new Error("Credenciais inválidas. Tente 'carlos@exemplo.com'"));
      }
    }, 500); // Simula uma pequena latência de rede
  });
};

const logout = (): void => {
  try {
    localStorage.removeItem(AUTH_USER_KEY);
  } catch (error) {
    console.error("Erro ao remover do localStorage:", error);
  }
};

const getCurrentUser = (): AuthUser | null => {
  try {
    const data = localStorage.getItem(AUTH_USER_KEY);
    if (data) {
      return JSON.parse(data) as AuthUser;
    }
    return null;
  } catch (error) {
    console.error("Erro ao carregar usuário do localStorage:", error);
    return null;
  }
};

export const authService = {
  login,
  logout,
  getCurrentUser,
};
