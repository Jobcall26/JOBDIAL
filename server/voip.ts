import type { Express } from "express";
import { isAuthenticated, isAdmin } from "./auth";
import { storage } from "./storage";
import { notifySupervisors } from "./websockets";

export function setupVoipRoutes(app: Express) {
  // Connect to Twilio/WebRTC
  app.post("/api/calls/connect", isAuthenticated, async (req, res) => {
    try {
      // In a real implementation, this would:
      // 1. Initialize Twilio client with credentials from settings
      // 2. Set up the agent device
      
      // Update agent status
      await storage.updateAgentStatus(req.user.id, "available");
      
      // Return success
      res.json({ success: true });
    } catch (error) {
      console.error("Error connecting to VoIP service:", error);
      res.status(500).json({ message: "Erreur lors de la connexion au service téléphonique" });
    }
  });
  
  // Disconnect from Twilio/WebRTC
  app.post("/api/calls/disconnect", isAuthenticated, async (req, res) => {
    try {
      // In a real implementation, this would:
      // 1. Disconnect from Twilio client
      // 2. Clean up any active connections
      
      // Update agent status
      await storage.updateAgentStatus(req.user.id, "offline");
      
      // Return success
      res.json({ success: true });
    } catch (error) {
      console.error("Error disconnecting from VoIP service:", error);
      res.status(500).json({ message: "Erreur lors de la déconnexion du service téléphonique" });
    }
  });
  
  // Make a call
  app.post("/api/calls/make", isAuthenticated, async (req, res) => {
    try {
      const { campaignId } = req.body;
      
      if (!campaignId) {
        return res.status(400).json({ message: "ID de campagne requis" });
      }
      
      // In a real implementation, this would:
      // 1. Get the next lead to call from the campaign
      // 2. Initiate a call using Twilio/WebRTC
      // 3. Update agent status and create call record in database
      
      // Mock response
      res.json({
        success: true,
        call: {
          id: `call-${Date.now()}`,
          contactId: 123,
          campaignId,
          startTime: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error("Error making call:", error);
      res.status(500).json({ message: "Erreur lors de l'appel" });
    }
  });
  
  // End a call
  app.post("/api/calls/:callId/end", isAuthenticated, async (req, res) => {
    try {
      const { callId } = req.params;
      const { result } = req.body;
      
      if (!callId) {
        return res.status(400).json({ message: "ID d'appel requis" });
      }
      
      if (!result) {
        return res.status(400).json({ message: "Résultat de l'appel requis" });
      }
      
      // In a real implementation, this would:
      // 1. End the call using Twilio/WebRTC
      // 2. Update call record in database with result
      // 3. Update agent status
      
      // Return success
      res.json({ success: true });
    } catch (error) {
      console.error("Error ending call:", error);
      res.status(500).json({ message: "Erreur lors de la fin de l'appel" });
    }
  });
  
  // Get current call information
  app.get("/api/calls/current/:callId", isAuthenticated, async (req, res) => {
    try {
      const { callId } = req.params;
      
      if (!callId) {
        return res.status(400).json({ message: "ID d'appel requis" });
      }
      
      // In a real implementation, this would:
      // 1. Get call record from database
      // 2. Include contact, campaign, and script information
      
      // Mock response
      res.json({
        id: callId,
        duration: "1:45",
        contact: {
          id: 123,
          name: "Jean Martin",
          phone: "06 12 34 56 78",
          email: "jean.martin@example.com",
          company: "ABC Corp"
        },
        campaign: {
          id: 1,
          name: "Assurance Santé Q3"
        },
        script: {
          id: 1,
          name: "Script Assurance Santé",
          content: "Bonjour, je m'appelle [Agent]. Je vous appelle de la part de JOBDIAL concernant notre nouvelle offre d'assurance santé. Comment allez-vous aujourd'hui [Client] ?\n\nNotre offre exclusive inclut une couverture complète pour toute votre famille avec des tarifs préférentiels. Seriez-vous intéressé(e) par plus d'informations ?\n\nSi oui : Super ! Je vais vous expliquer les détails de notre formule. Elle comprend...\n\nSi non : Puis-je savoir quelle est votre assurance actuelle ? Peut-être pourrions-nous vous proposer une offre plus avantageuse."
        }
      });
    } catch (error) {
      console.error("Error getting call information:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des informations d'appel" });
    }
  });
  
  // Get agent's assigned campaigns
  app.get("/api/agents/campaigns", isAuthenticated, async (req, res) => {
    try {
      // In a real implementation, this would fetch the agent's assigned campaigns
      
      // Mock response
      res.json([
        {
          id: 1,
          name: "Assurance Santé Q3",
          scriptId: 1
        },
        {
          id: 2,
          name: "Renouvellement Internet",
          scriptId: 2
        }
      ]);
    } catch (error) {
      console.error("Error getting agent campaigns:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des campagnes de l'agent" });
    }
  });
  
  // Fonctionnalité d'écoute en temps réel (spy) - Réservée aux administrateurs
  app.post("/api/calls/:callId/spy", isAdmin, async (req, res) => {
    try {
      const { callId } = req.params;
      
      if (!callId) {
        return res.status(400).json({ message: "ID d'appel requis" });
      }
      
      // Dans une vraie implémentation, cela devrait :
      // 1. Vérifier si l'appel existe et est actif
      // 2. Initialiser la connexion Twilio/WebRTC en mode écoute sans émission (mode spy)
      
      // Notification du superviseur qui écoute maintenant l'appel
      notifySupervisors({
        type: "spy_started",
        data: {
          callId,
          supervisorId: req.user.id,
          supervisorName: req.user.username,
          timestamp: new Date().toISOString()
        }
      });
      
      res.json({ 
        success: true,
        message: "Écoute démarrée" 
      });
    } catch (error) {
      console.error("Error starting spy mode:", error);
      res.status(500).json({ message: "Erreur lors du démarrage de l'écoute" });
    }
  });
  
  // Arrêter l'écoute en temps réel
  app.post("/api/calls/:callId/spy/stop", isAdmin, async (req, res) => {
    try {
      const { callId } = req.params;
      
      if (!callId) {
        return res.status(400).json({ message: "ID d'appel requis" });
      }
      
      // Dans une vraie implémentation, cela devrait :
      // 1. Terminer la connexion d'écoute Twilio/WebRTC
      
      // Notification de fin d'écoute
      notifySupervisors({
        type: "spy_stopped",
        data: {
          callId,
          supervisorId: req.user.id,
          supervisorName: req.user.username,
          timestamp: new Date().toISOString()
        }
      });
      
      res.json({ 
        success: true,
        message: "Écoute terminée" 
      });
    } catch (error) {
      console.error("Error stopping spy mode:", error);
      res.status(500).json({ message: "Erreur lors de l'arrêt de l'écoute" });
    }
  });
  
  // Obtenir la liste des appels actifs pour l'écoute
  app.get("/api/calls/active", isAdmin, async (req, res) => {
    try {
      // Dans une vraie implémentation, cela devrait :
      // 1. Récupérer tous les appels actuellement actifs dans la base de données
      
      // Réponse simulée
      res.json([
        {
          id: "call-123456",
          agent: {
            id: 2,
            username: "Emilie Laurent"
          },
          contact: {
            name: "Martin Bernard",
            phone: "06 12 34 56 78"
          },
          campaign: {
            id: 1,
            name: "Assurance Santé Q3"
          },
          startTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
          duration: "5:03",
          status: "in-progress"
        },
        {
          id: "call-789012",
          agent: {
            id: 3,
            username: "Thomas Moreau"
          },
          contact: {
            name: "Catherine Petit",
            phone: "07 98 76 54 32"
          },
          campaign: {
            id: 2,
            name: "Renouvellement Internet"
          },
          startTime: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
          duration: "2:14",
          status: "in-progress"
        }
      ]);
    } catch (error) {
      console.error("Error getting active calls:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des appels actifs" });
    }
  });
}
