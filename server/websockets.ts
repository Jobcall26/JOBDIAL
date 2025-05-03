import { WebSocket } from "ws";
import { storage } from "./storage";

// Maintain a map of connected clients
const clients = new Map<number, WebSocket>();

export function handleWebSocketConnection(ws: WebSocket) {
  let userId: number | null = null;
  
  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message.toString());
      
      // Handle different message types
      switch (data.type) {
        case "authenticate":
          // Authenticate the websocket connection
          userId = data.data.userId;
          
          if (userId) {
            // Associate this websocket with the user ID
            clients.set(userId, ws);
            
            // Send confirmation
            sendMessage(ws, {
              type: "auth_success",
              data: { userId }
            });
            
            // Log the connection
            console.log(`WebSocket authenticated for user ${userId}`);
          } else {
            // Authentication failed
            sendMessage(ws, {
              type: "auth_failed",
              data: { error: "Invalid user ID" }
            });
          }
          break;
          
        case "agent_status":
          // Update agent status
          if (userId) {
            const status = data.data.status;
            await storage.updateAgentStatus(userId, status);
            
            // Broadcast status change to admin/supervisor clients
            broadcastToAdmins({
              type: "agent_status_change",
              data: {
                agentId: userId,
                status,
                timestamp: new Date().toISOString()
              }
            });
          }
          break;
          
        default:
          console.log(`Unknown message type: ${data.type}`);
      }
    } catch (error) {
      console.error("Error processing WebSocket message:", error);
    }
  });
  
  ws.on("close", () => {
    if (userId) {
      // Remove client from map
      clients.delete(userId);
      
      // Log the disconnection
      console.log(`WebSocket disconnected for user ${userId}`);
      
      // Update agent status to offline if they were an agent
      storage.updateAgentStatus(userId, "offline")
        .catch(err => console.error("Error updating agent status on disconnect:", err));
      
      // Notify admins
      broadcastToAdmins({
        type: "agent_disconnected",
        data: {
          agentId: userId,
          timestamp: new Date().toISOString()
        }
      });
    }
  });
  
  // Send initial connection confirmation
  sendMessage(ws, {
    type: "connection_established",
    data: { timestamp: new Date().toISOString() }
  });
}

// Helper function to safely send a message to a websocket
function sendMessage(ws: WebSocket, message: any) {
  try {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    } else {
      console.log(`Cannot send message to client. WebSocket is not in OPEN state. Current state: ${ws.readyState}`);
    }
  } catch (error) {
    console.error("Error sending WebSocket message:", error);
  }
}

// Helper function to broadcast a message to all admin clients
async function broadcastToAdmins(message: any) {
  try {
    // In a real implementation, this would query the database for admin users
    // For now, we'll just broadcast to all clients
    clients.forEach((ws, clientId) => {
      sendMessage(ws, message);
    });
  } catch (error) {
    console.error("Error broadcasting to admins:", error);
  }
}

// Supervisor notifications
export function notifySupervisors(message: any) {
  try {
    broadcastToAdmins({
      type: "supervision_alert",
      data: {
        alert: {
          id: Date.now(),
          ...message
        }
      }
    });
  } catch (error) {
    console.error("Error sending supervisor notification:", error);
  }
}

// Call event notifications
export function notifyCallEvent(agentId: number, event: string, callData: any) {
  try {
    const ws = clients.get(agentId);
    
    if (ws) {
      sendMessage(ws, {
        type: "call_event",
        data: {
          event,
          call: callData
        }
      });
    }
  } catch (error) {
    console.error("Error sending call event notification:", error);
  }
}
