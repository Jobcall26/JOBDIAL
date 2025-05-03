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
  
  // Contact/Lead Management API
  app.get("/api/contacts", isAuthenticated, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || "";
      const campaignId = req.query.campaignId ? parseInt(req.query.campaignId as string) : undefined;
      const status = req.query.status as string;
      
      const { contacts, total } = await storage.getContacts(page, limit, search, campaignId, status);
      res.json({ contacts, total, limit });
    } catch (error) {
      console.error("Error in /api/contacts:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des contacts" });
    }
  });
  
  app.get("/api/contacts/:id", isAuthenticated, async (req, res) => {
    try {
      const contactId = parseInt(req.params.id);
      const contact = await storage.getContact(contactId);
      
      if (!contact) {
        return res.status(404).json({ message: "Contact non trouvé" });
      }
      
      res.json(contact);
    } catch (error) {
      console.error("Error in /api/contacts/:id:", error);
      res.status(500).json({ message: "Erreur lors de la récupération du contact" });
    }
  });
  
  app.post("/api/contacts", isAuthenticated, async (req, res) => {
    try {
      const contact = await storage.createContact(req.body);
      res.status(201).json(contact);
    } catch (error) {
      console.error("Error in POST /api/contacts:", error);
      res.status(500).json({ message: "Erreur lors de la création du contact" });
    }
  });
  
  app.put("/api/contacts/:id", isAuthenticated, async (req, res) => {
    try {
      const contactId = parseInt(req.params.id);
      const contact = await storage.updateContact(contactId, req.body);
      
      if (!contact) {
        return res.status(404).json({ message: "Contact non trouvé" });
      }
      
      res.json(contact);
    } catch (error) {
      console.error("Error in PUT /api/contacts/:id:", error);
      res.status(500).json({ message: "Erreur lors de la mise à jour du contact" });
    }
  });
  
  app.get("/api/contacts/filter-options", isAuthenticated, async (req, res) => {
    try {
      const options = await storage.getContactFilterOptions();
      res.json(options);
    } catch (error) {
      console.error("Error in /api/contacts/filter-options:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des options de filtre" });
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
      console.error("Error in /api/stats/overview:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des statistiques" });
    }
  });
  
  // Reports API
  app.get("/api/reports/performance", isAuthenticated, async (req, res) => {
    try {
      const period = req.query.period as string || "week";
      const agentId = req.query.agentId ? parseInt(req.query.agentId as string) : undefined;
      const campaignId = req.query.campaignId ? parseInt(req.query.campaignId as string) : undefined;
      
      const data = await storage.getPerformanceReport(period, agentId, campaignId);
      res.json(data);
    } catch (error) {
      console.error("Error in /api/reports/performance:", error);
      res.status(500).json({ message: "Erreur lors de la récupération du rapport de performance" });
    }
  });
  
  app.get("/api/reports/campaigns", isAuthenticated, async (req, res) => {
    try {
      const period = req.query.period as string || "month";
      const data = await storage.getCampaignsReport(period);
      res.json(data);
    } catch (error) {
      console.error("Error in /api/reports/campaigns:", error);
      res.status(500).json({ message: "Erreur lors de la récupération du rapport des campagnes" });
    }
  });
  
  app.get("/api/reports/conversion", isAuthenticated, async (req, res) => {
    try {
      const period = req.query.period as string || "month";
      const agentId = req.query.agentId ? parseInt(req.query.agentId as string) : undefined;
      const campaignId = req.query.campaignId ? parseInt(req.query.campaignId as string) : undefined;
      
      const data = await storage.getConversionReport(period, agentId, campaignId);
      res.json(data);
    } catch (error) {
      console.error("Error in /api/reports/conversion:", error);
      res.status(500).json({ message: "Erreur lors de la récupération du rapport de conversion" });
    }
  });
  
  app.get("/api/reports/activity", isAuthenticated, async (req, res) => {
    try {
      const dateFrom = req.query.dateFrom as string;
      const dateTo = req.query.dateTo as string;
      const agentId = req.query.agentId ? parseInt(req.query.agentId as string) : undefined;
      
      const data = await storage.getActivityReport(dateFrom, dateTo, agentId);
      res.json(data);
    } catch (error) {
      console.error("Error in /api/reports/activity:", error);
      res.status(500).json({ message: "Erreur lors de la récupération du rapport d'activité" });
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

  // Agent-specific routes
  // Agent dashboard stats
  app.get("/api/agent/stats", isAuthenticated, async (req, res) => {
    try {
      // Get agent's ID from the authenticated user
      const agentId = req.user.id;
      
      // In a real implementation, this would fetch actual data from the database
      // For now, return mock data
      res.json({
        dailyCalls: 24,
        totalCalls: 128,
        avgCallDuration: "3:15",
        conversionRate: "32%",
        callsRemaining: 26,
        upcomingCallbacks: [
          { contactName: "Jean Dupont", time: "14:30", phone: "+33 6 12 34 56 78" },
          { contactName: "Marie Martin", time: "Demain 10:15", phone: "+33 6 98 76 54 32" }
        ],
        campaigns: [
          { id: 1, name: "Assurance Santé Q3", leads: 150, progress: 45 },
          { id: 5, name: "Satisfaction Client Q2", leads: 200, progress: 18 }
        ]
      });
    } catch (error) {
      console.error("Error in /api/agent/stats:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des statistiques de l'agent" });
    }
  });

  // Agent campaigns with next leads
  app.get("/api/agent/campaigns", isAuthenticated, async (req, res) => {
    try {
      // Get agent's ID from the authenticated user
      const agentId = req.user.id;
      
      // In a real implementation, this would fetch the agent's assigned campaigns with next leads
      res.json([
        {
          id: 1,
          name: "Assurance Santé Q3",
          leadsRemaining: 74,
          nextLead: {
            id: 134,
            name: "Pierre Durand",
            phone: "+33 6 23 45 67 89",
            company: "Entreprise XYZ",
            lastContact: null
          }
        },
        {
          id: 5,
          name: "Satisfaction Client Q2",
          leadsRemaining: 182,
          nextLead: {
            id: 256,
            name: "Sylvie Moreau",
            phone: "+33 6 34 56 78 90",
            company: "Société ABC",
            lastContact: "2025-04-15"
          }
        }
      ]);
    } catch (error) {
      console.error("Error in /api/agent/campaigns:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des campagnes de l'agent" });
    }
  });

  // Agent scripts list
  app.get("/api/agent/scripts/list", isAuthenticated, async (req, res) => {
    try {
      // Get agent's ID from the authenticated user
      const agentId = req.user.id;
      
      // In a real implementation, this would fetch the scripts assigned to the agent
      res.json({
        assigned: [
          {
            id: 1,
            name: "Script Assurance Santé",
            campaignName: "Assurance Santé Q3",
            lastUsed: "2025-05-01 14:23",
            isFavorite: true
          },
          {
            id: 5,
            name: "Enquête Satisfaction",
            campaignName: "Satisfaction Client Q2",
            lastUsed: "2025-04-28 10:45",
            isFavorite: false
          }
        ],
        all: [
          {
            id: 1,
            name: "Script Assurance Santé",
            campaignName: "Assurance Santé Q3",
            lastUsed: "2025-05-01 14:23",
            isFavorite: true
          },
          {
            id: 2,
            name: "Script Renouvellement Internet",
            campaignName: "Renouvellement Internet",
            lastUsed: null,
            isFavorite: false
          },
          {
            id: 5,
            name: "Enquête Satisfaction",
            campaignName: "Satisfaction Client Q2",
            lastUsed: "2025-04-28 10:45",
            isFavorite: false
          }
        ]
      });
    } catch (error) {
      console.error("Error in /api/agent/scripts/list:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des scripts de l'agent" });
    }
  });

  // Agent script details
  app.get("/api/agent/scripts", isAuthenticated, async (req, res) => {
    try {
      const scriptId = req.query.scriptId ? parseInt(req.query.scriptId as string) : undefined;
      const campaignId = req.query.campaignId ? parseInt(req.query.campaignId as string) : undefined;
      
      if (!scriptId && !campaignId) {
        return res.status(400).json({ message: "ID du script ou de la campagne requis" });
      }
      
      // In a real implementation, this would fetch the script details
      // For now, return mock data
      res.json({
        id: scriptId || 1,
        name: scriptId === 5 ? "Enquête Satisfaction" : "Script Assurance Santé",
        content: "<p>Bonjour, je suis <strong>[nom de l'agent]</strong> de JOBDIAL. Suis-je bien en ligne avec {{contact_name}} ?</p><p>Nous réalisons actuellement une étude sur les besoins en assurance santé et je souhaiterais vous poser quelques questions si vous avez 5 minutes à m'accorder.</p>",
        variables: [
          { name: "contact_name", value: "M. Pierre Durand" },
          { name: "agent_name", value: req.user.username }
        ],
        sections: [
          {
            title: "Qualification du besoin",
            content: "<p>Tout d'abord, disposez-vous actuellement d'une complémentaire santé ?</p><p>Quelle est votre situation professionnelle actuelle ?</p><p>Combien de personnes composent votre foyer ?</p>"
          },
          {
            title: "Présentation de l'offre",
            content: "<p>En fonction de vos réponses, je peux vous proposer notre formule XYZ qui comprend :</p><ul><li>Remboursement à 100% des frais médicaux</li><li>Couverture hospitalisation complète</li><li>Option optique et dentaire premium</li></ul><p>Le tarif pour cette formule serait de 45€ par mois.</p>"
          },
          {
            title: "Conclusion et prise de rendez-vous",
            content: "<p>Cette offre semble-t-elle correspondre à vos attentes ?</p><p>Souhaiteriez-vous être recontacté par un de nos conseillers pour plus d'informations ou pour procéder à une souscription ?</p><p>Quel serait le meilleur moment pour vous joindre ?</p>"
          }
        ],
        objections: [
          {
            objection: "Je n'ai pas le temps actuellement",
            response: "Je comprends parfaitement. Quand serait-il préférable de vous rappeler ? Nous pouvons convenir d'un rendez-vous téléphonique à votre convenance."
          },
          {
            objection: "Je suis déjà couvert par une assurance santé",
            response: "C'est une bonne chose d'être déjà couvert. Pourriez-vous me préciser quand votre contrat arrive à échéance ? Nous pourrions vous proposer une étude comparative gratuite pour vous assurer que vous bénéficiez de la meilleure couverture possible."
          },
          {
            objection: "C'est trop cher",
            response: "Je comprends votre préoccupation concernant le tarif. Nous avons plusieurs formules adaptées à différents budgets. Pourriez-vous me préciser quel serait le tarif mensuel idéal pour vous ? Cela me permettrait de vous proposer la solution la plus adaptée."
          }
        ]
      });
    } catch (error) {
      console.error("Error in /api/agent/scripts:", error);
      res.status(500).json({ message: "Erreur lors de la récupération du script" });
    }
  });

  // Agent call history
  app.get("/api/agent/calls/history", isAuthenticated, async (req, res) => {
    try {
      // Get agent's ID from the authenticated user
      const agentId = req.user.id;
      const period = req.query.period as string || "today";
      const result = req.query.result as string;
      const campaign = req.query.campaign as string;
      const search = req.query.search as string;
      
      // In a real implementation, this would fetch the agent's call history from the database
      res.json({
        calls: [
          {
            id: 1,
            contact: {
              name: "Pierre Durand",
              phone: "+33 6 23 45 67 89"
            },
            campaign: {
              id: 1,
              name: "Assurance Santé Q3"
            },
            duration: "3:24",
            timestamp: "2025-05-01T14:23:45",
            date: "01/05/2025",
            time: "14:23",
            result: "interested",
            notes: "Client intéressé par la formule Famille Premium. À rappeler pour finalisation.",
            recordingUrl: "/recordings/call_1.mp3"
          },
          {
            id: 2,
            contact: {
              name: "Sophie Martin",
              phone: "+33 6 34 56 78 90"
            },
            campaign: {
              id: 1,
              name: "Assurance Santé Q3"
            },
            duration: "1:12",
            timestamp: "2025-05-01T15:45:12",
            date: "01/05/2025",
            time: "15:45",
            result: "refused",
            notes: "Cliente déjà engagée avec un concurrent pour 18 mois."
          },
          {
            id: 3,
            contact: {
              name: "Jean Lefebvre",
              phone: "+33 6 12 34 56 78"
            },
            campaign: {
              id: 5,
              name: "Satisfaction Client Q2"
            },
            duration: "4:56",
            timestamp: "2025-05-01T16:30:00",
            date: "01/05/2025",
            time: "16:30",
            result: "callback",
            notes: "Client demande à être rappelé demain à 10h. Intéressé pour comparer les offres."
          }
        ],
        summary: {
          total: 24,
          interested: 7,
          refused: 11,
          callback: 4,
          absent: 2,
          avgDuration: "3:05"
        }
      });
    } catch (error) {
      console.error("Error in /api/agent/calls/history:", error);
      res.status(500).json({ message: "Erreur lors de la récupération de l'historique des appels" });
    }
  });

  // Agent call filter options
  app.get("/api/agent/calls/filter-options", isAuthenticated, async (req, res) => {
    try {
      // In a real implementation, this would fetch the available filter options for the agent
      res.json({
        results: [
          { value: "interested", label: "Intéressé" },
          { value: "refused", label: "Refusé" },
          { value: "callback", label: "Rappel" },
          { value: "absent", label: "Absent" }
        ],
        campaigns: [
          { value: "1", label: "Assurance Santé Q3" },
          { value: "5", label: "Satisfaction Client Q2" }
        ]
      });
    } catch (error) {
      console.error("Error in /api/agent/calls/filter-options:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des options de filtre" });
    }
  });

  // Call connect and disconnect routes
  app.post("/api/calls/connect", isAuthenticated, async (req, res) => {
    try {
      // In a real implementation, this would connect to Twilio or another VoIP provider
      // and initiate a call
      
      // Update agent status to on-call
      await storage.updateAgentStatus(req.user.id, "on_call");
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error in /api/calls/connect:", error);
      res.status(500).json({ message: "Erreur lors de la connexion à la téléphonie" });
    }
  });

  app.post("/api/calls/disconnect", isAuthenticated, async (req, res) => {
    try {
      // In a real implementation, this would disconnect from Twilio or another VoIP provider
      
      // Update agent status to available
      await storage.updateAgentStatus(req.user.id, "available");
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error in /api/calls/disconnect:", error);
      res.status(500).json({ message: "Erreur lors de la déconnexion de la téléphonie" });
    }
  });

  // Set up VoIP routes
  setupVoipRoutes(app);

  return httpServer;
}
