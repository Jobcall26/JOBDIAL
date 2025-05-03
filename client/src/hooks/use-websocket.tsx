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
        
        // Gestion spéciale pour les messages de type "pong"
        if (message.type === "pong") {
          const latency = Date.now() - (message.data.echo || 0);
          console.log(`WebSocketProvider: Pong received. Latency: ${latency}ms`);
          // Ne pas propager les pongs dans le state pour éviter du bruit
          return;
        }
        
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
      console.log("WebSocket disconnected", { 
        code: event.code, 
        reason: event.reason, 
        wasClean: event.wasClean 
      });
      setIsConnected(false);
      
      // Ne pas essayer de se reconnecter si c'était une fermeture normale ou une déconnexion volontaire
      // Les codes 1000 (Normal Closure) et 1001 (Going Away) sont des fermetures normales
      if (event.code !== 1000 && event.code !== 1001 && user) {
        console.log("WebSocketProvider: Connection closed unexpectedly. Will attempt reconnection in 3 seconds");
        
        // Try to reconnect after a delay
        const reconnectTimeout = setTimeout(() => {
          if (user) {
            console.log("WebSocketProvider: Attempting reconnection...");
            connectWebSocket();
          } else {
            console.log("WebSocketProvider: User logged out, cancelling reconnection");
          }
        }, 3000);
        
        // Retourner une fonction de nettoyage pour annuler la reconnexion si nécessaire
        return () => {
          console.log("WebSocketProvider: Clearing reconnection timeout");
          clearTimeout(reconnectTimeout);
        };
      } else {
        console.log("WebSocketProvider: Normal closure, no reconnection needed");
      }
    };

    socket.onerror = (event) => {
      console.error("WebSocketProvider: WebSocket error:", event);
      
      // Notifier l'utilisateur de l'erreur
      toast({
        title: "Erreur de connexion",
        description: "La connexion au serveur a été perdue. Tentative de reconnexion...",
        variant: "destructive"
      });
      
      // Fermer la connexion avec un code d'erreur
      // Le code 1006 indique une fermeture anormale
      try {
        socket.close(1006, "WebSocket error occurred");
      } catch (closeError) {
        console.error("WebSocketProvider: Error closing socket after error:", closeError);
      }
    };

    return () => {
      socket.close();
    };
  }, [user, toast]);

  // Ping/pong pour vérifier l'état de la connexion
  useEffect(() => {
    let pingInterval: NodeJS.Timeout | null = null;
    
    if (isConnected && user) {
      console.log("WebSocketProvider: Setting up ping interval");
      
      // Envoyer un ping toutes les 30 secondes pour vérifier que la connexion est toujours active
      pingInterval = setInterval(() => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          console.log("WebSocketProvider: Sending ping");
          try {
            socketRef.current.send(JSON.stringify({ type: "ping", data: { timestamp: Date.now() } }));
          } catch (error) {
            console.error("WebSocketProvider: Error sending ping:", error);
            // Si on ne peut pas envoyer un ping, la connexion est probablement morte
            if (socketRef.current) {
              socketRef.current.close(1006, "Ping failed");
            }
          }
        }
      }, 30000);
    }
    
    return () => {
      if (pingInterval) {
        console.log("WebSocketProvider: Clearing ping interval");
        clearInterval(pingInterval);
      }
    };
  }, [isConnected, user]);

  // Connect and disconnect on auth changes
  useEffect(() => {
    console.log("WebSocketProvider: Auth state changed", { userPresent: !!user });
    
    if (user) {
      console.log("WebSocketProvider: User authenticated, connecting WebSocket");
      connectWebSocket();
    } else {
      // Close connection when logged out
      console.log("WebSocketProvider: User logged out, closing WebSocket");
      if (socketRef.current) {
        // Fermer proprement avec le code 1000 (fermeture normale)
        socketRef.current.close(1000, "User logged out");
        setIsConnected(false);
      }
    }
    
    // Cleanup function pour assurer la fermeture lors du démontage du composant
    return () => {
      console.log("WebSocketProvider: Component unmounting, cleaning up connection");
      if (socketRef.current) {
        socketRef.current.close(1000, "Component unmounting");
      }
    };
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
    console.log("WebSocketProvider: Manual disconnect called");
    
    if (socketRef.current) {
      // Envoyer un message de déconnexion avant de fermer
      if (socketRef.current.readyState === WebSocket.OPEN) {
        console.log("WebSocketProvider: Sending disconnect message");
        try {
          socketRef.current.send(JSON.stringify({
            type: "disconnect",
            data: { reason: "user_logout" }
          }));
        } catch (err) {
          console.error("WebSocketProvider: Error sending disconnect message", err);
        }
      } else {
        console.log("WebSocketProvider: Socket not open, ready state:", socketRef.current.readyState);
      }
      
      // Fermer la connexion avec le code 1000 (fermeture normale)
      console.log("WebSocketProvider: Closing WebSocket connection");
      socketRef.current.close(1000, "User logout");
      setIsConnected(false);
    } else {
      console.log("WebSocketProvider: No socket ref to disconnect");
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
