import { createContext, useContext } from 'react';
import { User } from '@shared/schema';

export interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  isLoading: true,
  login: async () => false,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);
