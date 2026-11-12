
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  getCurrentUser,
  type AuthenticatedUser,
} from "../services/authService";

interface AuthContextType {
  user: AuthenticatedUser | null;
  loading: boolean;
  refreshUser: () => Promise<AuthenticatedUser | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Đọc lại tài khoản hiện tại từ SQLite
  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();

      setUser(currentUser);

      return currentUser;
    } catch (error) {
      console.log("Cannot refresh authentication:", error);

      setUser(null);

      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Kiểm tra phiên đăng nhập khi mở ứng dụng
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook để các component sử dụng trạng thái đăng nhập
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth phải được sử dụng bên trong AuthProvider.");
  }

  return context;
}
