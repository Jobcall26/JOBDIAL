import { createContext, ReactNode, useContext, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
};

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  password: string;
  role: "agent";
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  console.log("AuthProvider initializing");
  
  useEffect(() => {
    console.log("AuthProvider mounted");
  }, []);
  
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    onSuccess: (data) => {
      console.log("Auth query success:", data);
    },
    onError: (err) => {
      console.error("Auth query error:", err);
    }
  });

  // Log auth state changes
  useEffect(() => {
    console.log("Auth state updated:", { user, isLoading, error });
  }, [user, isLoading, error]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      console.log("Attempting login with:", credentials.username);
      try {
        const res = await apiRequest("POST", "/api/auth/login", credentials);
        console.log("Login response status:", res.status);
        return await res.json();
      } catch (err) {
        console.error("Login request failed:", err);
        throw err;
      }
    },
    onSuccess: (user: User) => {
      console.log("Login successful for:", user.username);
      queryClient.setQueryData(["/api/auth/me"], user);
      toast({
        title: "Connexion réussie",
        description: `Bienvenue, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      console.error("Login error:", error);
      toast({
        title: "Échec de la connexion",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      console.log("Attempting registration for:", credentials.username);
      try {
        const res = await apiRequest("POST", "/api/auth/register", credentials);
        console.log("Registration response status:", res.status);
        return await res.json();
      } catch (err) {
        console.error("Registration request failed:", err);
        throw err;
      }
    },
    onSuccess: (user: User) => {
      console.log("Registration successful for:", user.username);
      queryClient.setQueryData(["/api/auth/me"], user);
      toast({
        title: "Inscription réussie",
        description: `Bienvenue, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      console.error("Registration error:", error);
      toast({
        title: "Échec de l'inscription",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      console.log("Attempting logout");
      try {
        await apiRequest("POST", "/api/auth/logout");
      } catch (err) {
        console.error("Logout request failed:", err);
        throw err;
      }
    },
    onSuccess: () => {
      console.log("Logout successful");
      queryClient.setQueryData(["/api/auth/me"], null);
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès.",
      });
    },
    onError: (error: Error) => {
      console.error("Logout error:", error);
      toast({
        title: "Échec de la déconnexion",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    console.error("useAuth hook used outside of AuthProvider");
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
