import { createContext, ReactNode, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";

type WebSocketMessage = {
  type: string;
  data: any;
};

type WebSocketContextType = {
  sendMessage: (message: WebSocketMessage) => void;
  lastMessage: WebSocketMessage | null;
  isConnected: boolean;
  disconnect: () => void; // Nouvelle méthode pour se déconnecter proprement
};

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // Function to establish WebSocket connection
  const connectWebSocket = useCallback(() => {
    // N'essayez de connecter que si un utilisateur est connecté
    if (!user) {
      console.log("No user, skipping WebSocket connection");
      return;
    }

    // Close any existing connection
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.close();
    }

    // Determine the correct WebSocket URL
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    // Create new WebSocket connection
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      
      // Send authentication message
      socket.send(JSON.stringify({
        type: "authenticate",
        data: { userId: user.id },
      }));
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        setLastMessage(message);
        
        // Handle specific message types
        if (message.type === "notification") {
          toast({
            title: message.data.title || "Notification",
            description: message.data.message,
          });
        }

        // Add other message type handlers as needed
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    socket.onclose = (event) => {
      console.log("WebSocket disconnected", event.code, event.reason);
      setIsConnected(false);
      
      // Ne pas essayer de se reconnecter si c'était une fermeture normale ou une déconnexion volontaire
      // Les codes 1000 (Normal Closure) et 1001 (Going Away) sont des fermetures normales
      if (event.code !== 1000 && event.code !== 1001 && user) {
        // Try to reconnect after a delay
        setTimeout(() => {
          if (user) connectWebSocket();
        }, 3000);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      socket.close();
    };

    return () => {
      socket.close();
    };
  }, [user, toast]);

  // Connect and disconnect on auth changes
  useEffect(() => {
    if (user) {
      connectWebSocket();
    } else {
      // Close connection when logged out
      if (socketRef.current) {
        socketRef.current.close();
        setIsConnected(false);
      }
    }
  }, [user, connectWebSocket]);

  // Send message function
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      console.error("WebSocket not connected. Cannot send message.");
    }
  }, []);
  
  // Disconnect function - ferme la connexion WebSocket proprement
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      // Envoyer un message de déconnexion avant de fermer
      if (socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          type: "disconnect",
          data: { reason: "user_logout" }
        }));
      }
      
      // Fermer la connexion avec le code 1000 (fermeture normale)
      socketRef.current.close(1000, "User logout");
      setIsConnected(false);
    }
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        sendMessage,
        lastMessage,
        isConnected,
        disconnect
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}
