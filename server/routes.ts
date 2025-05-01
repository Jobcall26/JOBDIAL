import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { setupAuth, isAuthenticated, isAdmin } from "./auth";
import { storage } from "./storage";
import { setupVoipRoutes } from "./voip";
import { handleWebSocketConnection } from "./websockets";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);

  // Set up WebSocket server on a specific path
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  wss.on('connection', handleWebSocketConnection);

  // Set up authentication routes and middleware
  setupAuth(app);

  // User management API (admin only)
  app.get("/api/agents", isAuthenticated, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const search = req.query.search as string || "";
      const limit = 10;
      const offset = (page - 1) * limit;

      const { agents, total } = await storage.getAgents(page, limit, search);
      res.json({ agents, total, limit });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des agents" });
    }
  });

  app.get("/api/agents/:id", isAuthenticated, async (req, res) => {
    try {
      const agentId = parseInt(req.params.id);
      const agent = await storage.getAgent(agentId);
      
      if (!agent) {
        return res.status(404).json({ message: "Agent non trouvé" });
      }
      
      res.json(agent);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération de l'agent" });
    }
  });

  app.post("/api/agents", isAdmin, async (req, res) => {
    try {
      const agent = await storage.createAgent(req.body);
      res.status(201).json(agent);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la création de l'agent" });
    }
  });

  app.put("/api/agents/:id", isAdmin, async (req, res) => {
    try {
      const agentId = parseInt(req.params.id);
      const agent = await storage.updateAgent(agentId, req.body);
      res.json(agent);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la mise à jour de l'agent" });
    }
  });

  // Agent campaigns API
  app.get("/api/agents/campaigns", isAuthenticated, async (req, res) => {
    try {
      const agentId = req.query.agentId ? parseInt(req.query.agentId as string) : undefined;
      
      // Mocking response for demonstration
      const campaigns = [
        {
          id: 1,
          name: "Assurance Santé Q3",
          description: "Campagne pour les nouveaux produits d'assurance santé",
          scriptId: 1,
          progress: 34,
          status: "active"
        },
        {
          id: 2,
          name: "Renouvellement Internet",
          description: "Campagne de renouvellement des contrats internet",
          scriptId: 2,
          progress: 67,
          status: "active"
        },
        {
          id: 5,
          name: "Satisfaction Client Q2",
          description: "Enquête de satisfaction des clients du second trimestre",
          scriptId: 5,
          progress: 12,
          status: "active"
        }
      ];
      
      res.json(campaigns);
    } catch (error) {
      console.error("Error in /api/agents/campaigns:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des campagnes des agents" });
    }
  });
  
  // Agent status API
  app.get("/api/agents/status", isAuthenticated, async (req, res) => {
    try {
      const agentsStatus = await storage.getAgentsStatus();
      res.json(agentsStatus);
    } catch (error) {
      console.error("Error in /api/agents/status:", error);
      res.status(500).json({ message: "Erreur lors de la récupération du statut des agents" });
    }
  });

  app.post("/api/agents/status", isAuthenticated, async (req, res) => {
    try {
      const { status } = req.body;
      await storage.updateAgentStatus(req.user.id, status);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la mise à jour du statut" });
    }
  });

  // Campaign management API
  app.get("/api/campaigns", isAuthenticated, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const search = req.query.search as string || "";
      const status = req.query.status as string || "all";
      const limit = 5;
      const offset = (page - 1) * limit;

      const { campaigns, total } = await storage.getCampaigns(page, limit, search, status);
      res.json({ campaigns, total, limit });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des campagnes" });
    }
  });

  app.get("/api/campaigns/list", isAuthenticated, async (req, res) => {
    try {
      const campaigns = await storage.getCampaignsList();
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération de la liste des campagnes" });
    }
  });

  app.post("/api/campaigns", isAdmin, async (req, res) => {
    try {
      const campaign = await storage.createCampaign(req.body);
      res.status(201).json(campaign);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la création de la campagne" });
    }
  });

  app.get("/api/campaigns/:id", isAuthenticated, async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campagne non trouvée" });
      }
      
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération de la campagne" });
    }
  });

  // Lead management API
  app.post("/api/leads/validate", isAuthenticated, async (req, res) => {
    try {
      // In a real implementation, this would process the uploaded CSV file
      // and validate its contents
      
      // Simulating file validation response
      res.json({
        valid: true,
        totalRows: 100,
        validRows: 98,
        invalidRows: 2,
        errorSamples: [
          "Ligne 12: Numéro de téléphone invalide",
          "Ligne 45: Email invalide"
        ]
      });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la validation du fichier" });
    }
  });

  app.post("/api/leads/import", isAuthenticated, async (req, res) => {
    try {
      const { campaignId } = req.body;
      
      // In a real implementation, this would process the uploaded CSV file
      // and import the leads into the database
      
      // Simulating import response
      res.json({
        success: true,
        imported: 98,
        skipped: 2
      });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de l'import des leads" });
    }
  });

  // Script management API
  app.get("/api/scripts", isAuthenticated, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const search = req.query.search as string || "";
      const limit = 10;
      const offset = (page - 1) * limit;

      const { scripts, total } = await storage.getScripts(page, limit, search);
      res.json({ scripts, total, limit });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des scripts" });
    }
  });

  app.get("/api/scripts/list", isAuthenticated, async (req, res) => {
    try {
      const scripts = await storage.getScriptsList();
      res.json(scripts);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération de la liste des scripts" });
    }
  });

  app.get("/api/scripts/:id", isAuthenticated, async (req, res) => {
    try {
      const scriptId = parseInt(req.params.id);
      const script = await storage.getScript(scriptId);
      
      if (!script) {
        return res.status(404).json({ message: "Script non trouvé" });
      }
      
      res.json(script);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération du script" });
    }
  });

  app.post("/api/scripts", isAdmin, async (req, res) => {
    try {
      const script = await storage.createScript(req.body);
      res.status(201).json(script);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la création du script" });
    }
  });

  app.put("/api/scripts/:id", isAdmin, async (req, res) => {
    try {
      const scriptId = parseInt(req.params.id);
      const script = await storage.updateScript(scriptId, req.body);
      res.json(script);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la mise à jour du script" });
    }
  });

  app.delete("/api/scripts/:id", isAdmin, async (req, res) => {
    try {
      const scriptId = parseInt(req.params.id);
      await storage.deleteScript(scriptId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la suppression du script" });
    }
  });

  app.post("/api/scripts/:id/duplicate", isAdmin, async (req, res) => {
    try {
      const scriptId = parseInt(req.params.id);
      const script = await storage.duplicateScript(scriptId);
      res.status(201).json(script);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la duplication du script" });
    }
  });

  // Call history API
  app.get("/api/calls/recent", isAuthenticated, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const { calls, total } = await storage.getRecentCalls(page, limit);
      res.json({ calls, total, limit });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des appels récents" });
    }
  });

  app.get("/api/calls/history", isAuthenticated, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const search = req.query.search as string || "";
      const result = req.query.result as string;
      const campaign = req.query.campaign as string;
      const agent = req.query.agent as string;
      const dateFrom = req.query.dateFrom as string;
      const dateTo = req.query.dateTo as string;
      const limit = 10;

      const { calls, total } = await storage.getCallHistory(
        page, 
        limit, 
        search, 
        result, 
        campaign, 
        agent, 
        dateFrom, 
        dateTo
      );
      
      res.json({ calls, total, limit });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération de l'historique des appels" });
    }
  });

  app.get("/api/calls/filter-options", isAuthenticated, async (req, res) => {
    try {
      const options = await storage.getCallFilterOptions();
      res.json(options);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des options de filtre" });
    }
  });

  // Dashboard statistics API
  app.get("/api/stats/overview", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des statistiques" });
    }
  });

  // Supervision API
  app.get("/api/supervision", isAuthenticated, async (req, res) => {
    try {
      const data = await storage.getSupervisionData();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des données de supervision" });
    }
  });

  // Settings API
  app.get("/api/settings", isAdmin, async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des paramètres" });
    }
  });

  app.put("/api/settings/general", isAdmin, async (req, res) => {
    try {
      const settings = await storage.updateGeneralSettings(req.body);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la mise à jour des paramètres généraux" });
    }
  });

  app.put("/api/settings/voip", isAdmin, async (req, res) => {
    try {
      const settings = await storage.updateVoipSettings(req.body);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la mise à jour des paramètres de téléphonie" });
    }
  });

  app.put("/api/settings/notifications", isAdmin, async (req, res) => {
    try {
      const settings = await storage.updateNotificationSettings(req.body);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la mise à jour des paramètres de notification" });
    }
  });

  // Set up VoIP routes
  setupVoipRoutes(app);

  return httpServer;
}
