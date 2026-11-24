import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import axios from "axios";
import type { User } from "../types/forum";
import { TOKEN_KEY, UNAUTHORIZED_EVENT } from "./config";
import { getCurrentUser } from "./authApi";

interface AuthContextType {
  token: string | null;
  /** The logged-in user's profile, once loaded from the backend. */
  user: User | null;
  login: (token: string, user?: User | null) => void;
  logout: () => void;
  /** Re-fetches the profile (e.g. to update the reputation score). */
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((newToken: string, newUser?: User | null) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(newUser ?? null);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    getCurrentUser()
      .then(setUser)
      .catch((error) => {
        // Only a rejected token logs the user out - not e.g. the server being offline
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          logout();
        }
      });
  }, [logout]);

  // Load the profile whenever we have a token but no user yet (page refresh, login without user data)
  useEffect(() => {
    if (token && !user) refreshUser();
  }, [token, user, refreshUser]);

  // The API client fires this when the backend rejects our token
  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, logout);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, logout);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
