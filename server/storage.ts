import { db } from "@db";
import { 
  users, 
  User, 
  InsertUser,
  agents,
  campaigns,
  scripts,
  leads,
  calls,
  agentCampaigns,
  agentStatus
} from "@shared/schema";
import { eq, and, like, or, desc, sql } from "drizzle-orm";
import { type SessionStore } from "express-session";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { pool } from "@db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User authentication
  getUserByUsername(username: string): Promise<User | undefined>;
  getUser(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Agent management
  getAgents(page: number, limit: number, search: string): Promise<{ agents: any[], total: number }>;
  getAgent(id: number): Promise<any | undefined>;
  createAgent(agent: any): Promise<any>;
  updateAgent(id: number, agent: any): Promise<any>;
  getAgentsStatus(): Promise<{ agents: any[], counts: any }>;
  updateAgentStatus(agentId: number, status: string): Promise<void>;
  
  // Campaign management
  getCampaigns(page: number, limit: number, search: string, status: string): Promise<{ campaigns: any[], total: number }>;
  getCampaignsList(): Promise<any[]>;
  getCampaign(id: number): Promise<any | undefined>;
  createCampaign(campaign: any): Promise<any>;
  
  // Script management
  getScripts(page: number, limit: number, search: string): Promise<{ scripts: any[], total: number }>;
  getScriptsList(): Promise<any[]>;
  getScript(id: number): Promise<any | undefined>;
  createScript(script: any): Promise<any>;
  updateScript(id: number, script: any): Promise<any>;
  deleteScript(id: number): Promise<void>;
  duplicateScript(id: number): Promise<any>;
  
  // Call history
  getRecentCalls(page: number, limit: number): Promise<{ calls: any[], total: number }>;
  getCallHistory(
    page: number, 
    limit: number, 
    search: string, 
    result?: string, 
    campaign?: string, 
    agent?: string, 
    dateFrom?: string, 
    dateTo?: string
  ): Promise<{ calls: any[], total: number }>;
  getCallFilterOptions(): Promise<any>;
  
  // Statistics
  getDashboardStats(): Promise<any>;
  
  // Supervision
  getSupervisionData(): Promise<any>;
  
  // Settings
  getSettings(): Promise<any>;
  updateGeneralSettings(settings: any): Promise<any>;
  updateVoipSettings(settings: any): Promise<any>;
  updateNotificationSettings(settings: any): Promise<any>;
  
  // Express session store
  sessionStore: SessionStore;
}

class DatabaseStorage implements IStorage {
  sessionStore: SessionStore;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      tableName: 'user_sessions',
      createTableIfMissing: true,
    });
  }
  
  // User authentication
  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.query.users.findFirst({
      where: eq(users.username, username)
    });
    return result;
  }
  
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.query.users.findFirst({
      where: eq(users.id, id)
    });
    return result;
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const [result] = await db.insert(users).values(user).returning();
    return result;
  }
  
  // Agent management
  async getAgents(page: number, limit: number, search: string): Promise<{ agents: any[], total: number }> {
    // Get agent information from database
    // In a real implementation, this would fetch from the database
    // Mocking the response for demonstration
    const offset = (page - 1) * limit;
    const searchFilter = search ? like(users.username, `%${search}%`) : undefined;
    
    const agentsQuery = await db.query.users.findMany({
      where: and(
        eq(users.role, "agent"),
        searchFilter
      ),
      limit: limit,
      offset: offset,
      orderBy: users.username
    });
    
    const totalCountResult = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(and(
        eq(users.role, "agent"),
        searchFilter
      ));
    
    const total = totalCountResult[0]?.count || 0;
    
    // Enrich with additional data
    const agents = agentsQuery.map(agent => {
      // In a real implementation, these would be fetched from the database
      return {
        id: agent.id,
        username: agent.username,
        email: agent.email || `${agent.username}@example.com`,
        role: agent.role,
        status: ["available", "on_call", "paused", "offline"][Math.floor(Math.random() * 4)],
        statusDuration: `${Math.floor(Math.random() * 60)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
        lastActivity: new Date(Date.now() - Math.random() * 86400000).toLocaleTimeString(),
        campaignsCount: Math.floor(Math.random() * 5),
        callsToday: Math.floor(Math.random() * 30)
      };
    });
    
    return { agents, total };
  }
  
  async getAgent(id: number): Promise<any | undefined> {
    const agent = await db.query.users.findFirst({
      where: and(
        eq(users.id, id),
        eq(users.role, "agent")
      )
    });
    
    if (!agent) return undefined;
    
    // In a real implementation, fetch agent's campaigns from agentCampaigns table
    const campaigns = [1, 2]; // Mock campaign IDs
    
    return {
      id: agent.id,
      username: agent.username,
      email: agent.email || `${agent.username}@example.com`,
      campaigns
    };
  }
  
  async createAgent(data: any): Promise<any> {
    // Create agent record in database
    const agent = {
      username: data.username,
      password: data.password,
      email: data.email,
      role: "agent"
    };
    
    const [result] = await db.insert(users).values(agent).returning();
    
    // Assign campaigns if specified
    if (data.campaigns && data.campaigns.length > 0) {
      // In a real implementation, insert campaign assignments
    }
    
    return {
      id: result.id,
      username: result.username,
      email: result.email,
      role: result.role
    };
  }
  
  async updateAgent(id: number, data: any): Promise<any> {
    // Update agent record in database
    const updateData: any = {
      username: data.username,
      email: data.email
    };
    
    // Only include password if provided (not empty)
    if (data.password) {
      updateData.password = data.password;
    }
    
    const [result] = await db.update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    
    // Update campaign assignments if specified
    if (data.campaigns) {
      // In a real implementation, update campaign assignments
    }
    
    return {
      id: result.id,
      username: result.username,
      email: result.email,
      role: result.role
    };
  }
  
  async getAgentsStatus(): Promise<{ agents: any[], counts: any }> {
    // Get agents with their current status
    // In a real implementation, this would fetch from the database
    
    // Mocking the response for demonstration
    const agentsList = await db.query.users.findMany({
      where: eq(users.role, "agent"),
      orderBy: users.username
    });
    
    const agents = agentsList.map(agent => {
      const status = ["available", "on_call", "paused", "offline"][Math.floor(Math.random() * 4)] as string;
      const statusDuration = `${Math.floor(Math.random() * 3)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
      
      const agent_data = {
        id: agent.id,
        username: agent.username,
        status,
        statusDuration
      };
      
      // Add call data if agent is on call
      if (status === "on_call") {
        return {
          ...agent_data,
          currentCall: {
            contactName: `Contact ${Math.floor(Math.random() * 100)}`,
            duration: `${Math.floor(Math.random() * 10)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`
          }
        };
      }
      
      return agent_data;
    });
    
    // Calculate counts for each status
    const counts = {
      available: agents.filter(a => a.status === "available").length,
      on_call: agents.filter(a => a.status === "on_call").length,
      offline: agents.filter(a => a.status === "offline" || a.status === "paused").length
    };
    
    return { agents, counts };
  }
  
  async updateAgentStatus(agentId: number, status: string): Promise<void> {
    // Update agent status in database
    // In a real implementation, this would update the database
    
    // For now, just log it
    console.log(`Agent ${agentId} status updated to ${status}`);
  }
  
  // Campaign management
  async getCampaigns(page: number, limit: number, search: string, status: string): Promise<{ campaigns: any[], total: number }> {
    // Get campaign information from database
    // In a real implementation, this would fetch from the database
    
    // Mocking the response for demonstration
    const mockCampaigns = [
      {
        id: 1,
        name: "Assurance Santé Q3",
        description: "Campagne pour les nouveaux produits d'assurance santé",
        scriptId: 1,
        scriptName: "Script Assurance Santé",
        startDate: "2023-06-15",
        agentCount: 6,
        progress: 68,
        conversion: 35.2,
        status: "active",
        leadsTotal: 500,
        leadsContacted: 340,
        leadsPending: 160
      },
      {
        id: 2,
        name: "Renouvellement Internet",
        description: "Campagne de renouvellement des contrats internet",
        scriptId: 2,
        scriptName: "Script Renouvellement",
        startDate: "2023-06-02",
        agentCount: 4,
        progress: 92,
        conversion: 28.5,
        status: "active",
        leadsTotal: 300,
        leadsContacted: 276,
        leadsPending: 24
      },
      {
        id: 3,
        name: "Étude de marché",
        description: "Sondage pour étude de marché produits tech",
        scriptId: 3,
        scriptName: "Script Étude de Marché",
        startDate: "2023-05-10",
        agentCount: 2,
        progress: 45,
        conversion: 16.8,
        status: "paused",
        leadsTotal: 200,
        leadsContacted: 90,
        leadsPending: 110
      },
      {
        id: 4,
        name: "Lancement Mobile 5G",
        description: "Lancement de nouvelles offres mobiles 5G",
        scriptId: 4,
        scriptName: "Script 5G",
        startDate: "2023-03-22",
        agentCount: 0,
        progress: 100,
        conversion: 42.3,
        status: "completed",
        leadsTotal: 450,
        leadsContacted: 450,
        leadsPending: 0
      },
      {
        id: 5,
        name: "Satisfaction Client Q2",
        description: "Enquête de satisfaction des clients du second trimestre",
        scriptId: 5,
        scriptName: "Script Satisfaction",
        startDate: "2023-04-05",
        agentCount: 3,
        progress: 78,
        conversion: 31.5,
        status: "active",
        leadsTotal: 600,
        leadsContacted: 468,
        leadsPending: 132
      }
    ];
    
    // Apply filters
    let filteredCampaigns = [...mockCampaigns];
    
    if (search) {
      filteredCampaigns = filteredCampaigns.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (status && status !== "all") {
      filteredCampaigns = filteredCampaigns.filter(c => c.status === status);
    }
    
    // Apply pagination
    const total = filteredCampaigns.length;
    const startIndex = (page - 1) * limit;
    const campaigns = filteredCampaigns.slice(startIndex, startIndex + limit);
    
    return { campaigns, total };
  }
  
  async getCampaignsList(): Promise<any[]> {
    // Get list of campaigns for dropdowns
    // In a real implementation, this would fetch from the database
    
    // Mocking the response for demonstration
    return [
      { id: 1, name: "Assurance Santé Q3" },
      { id: 2, name: "Renouvellement Internet" },
      { id: 3, name: "Étude de marché" },
      { id: 4, name: "Lancement Mobile 5G" },
      { id: 5, name: "Satisfaction Client Q2" }
    ];
  }
  
  async getCampaign(id: number): Promise<any | undefined> {
    // Get campaign details by ID
    // In a real implementation, this would fetch from the database
    
    // Mocking the response for demonstration
    const campaigns = [
      {
        id: 1,
        name: "Assurance Santé Q3",
        description: "Campagne pour les nouveaux produits d'assurance santé",
        scriptId: 1
      },
      {
        id: 2,
        name: "Renouvellement Internet",
        description: "Campagne de renouvellement des contrats internet",
        scriptId: 2
      },
      {
        id: 3,
        name: "Étude de marché",
        description: "Sondage pour étude de marché produits tech",
        scriptId: 3
      }
    ];
    
    return campaigns.find(c => c.id === id);
  }
  
  async createCampaign(campaign: any): Promise<any> {
    // Create campaign in database
    // In a real implementation, this would insert into the database
    
    // Mocking the response for demonstration
    return {
      id: Math.floor(Math.random() * 1000) + 10,
      name: campaign.name,
      description: campaign.description,
      scriptId: campaign.scriptId,
      startDate: new Date().toISOString().split('T')[0]
    };
  }
  
  // Script management
  async getScripts(page: number, limit: number, search: string): Promise<{ scripts: any[], total: number }> {
    // Get script information from database
    // In a real implementation, this would fetch from the database
    
    // Mocking the response for demonstration
    const mockScripts = [
      {
        id: 1,
        name: "Script Assurance Santé",
        content: "Bonjour, je m'appelle [Agent]. Je vous appelle de la part de JOBDIAL concernant notre nouvelle offre d'assurance santé. Comment allez-vous aujourd'hui [Client] ?",
        createdAt: "2023-05-10T09:30:00Z",
        updatedAt: "2023-06-15T14:20:00Z",
        campaignsCount: 2,
        wordCount: 168
      },
      {
        id: 2,
        name: "Script Renouvellement",
        content: "Bonjour [Client], c'est [Agent] de JOBDIAL. Je vous contacte au sujet du renouvellement de votre contrat internet qui arrive à échéance prochainement. Avez-vous quelques minutes pour en discuter ?",
        createdAt: "2023-04-22T11:15:00Z",
        updatedAt: "2023-05-30T10:05:00Z",
        campaignsCount: 1,
        wordCount: 142
      },
      {
        id: 3,
        name: "Script Étude de Marché",
        content: "Bonjour, je suis [Agent] de l'institut JOBDIAL. Nous réalisons actuellement une étude de marché sur les produits technologiques et votre avis nous intéresse. Cela ne prendra que 5 minutes de votre temps. Êtes-vous disponible ?",
        createdAt: "2023-03-15T08:45:00Z",
        updatedAt: "2023-04-10T16:30:00Z",
        campaignsCount: 1,
        wordCount: 192
      },
      {
        id: 4,
        name: "Script 5G",
        content: "Bonjour [Client], c'est [Agent] de JOBDIAL. Nous lançons une nouvelle offre mobile 5G avec des tarifs exclusifs pour nos clients fidèles comme vous. Puis-je vous présenter cette offre ?",
        createdAt: "2023-02-28T13:20:00Z",
        updatedAt: "2023-03-22T09:10:00Z",
        campaignsCount: 1,
        wordCount: 136
      },
      {
        id: 5,
        name: "Script Satisfaction",
        content: "Bonjour [Client], je suis [Agent] du service qualité de JOBDIAL. Nous souhaitons recueillir votre niveau de satisfaction concernant nos services. Avez-vous quelques minutes pour répondre à notre enquête ?",
        createdAt: "2023-01-18T10:00:00Z",
        updatedAt: "2023-04-05T11:45:00Z",
        campaignsCount: 1,
        wordCount: 154
      }
    ];
    
    // Apply search filter
    let filteredScripts = [...mockScripts];
    
    if (search) {
      filteredScripts = filteredScripts.filter(s => 
        s.name.toLowerCase().includes(search.toLowerCase()) || 
        s.content.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Apply pagination
    const total = filteredScripts.length;
    const startIndex = (page - 1) * limit;
    const scripts = filteredScripts.slice(startIndex, startIndex + limit);
    
    return { scripts, total };
  }
  
  async getScriptsList(): Promise<any[]> {
    // Get list of scripts for dropdowns
    // In a real implementation, this would fetch from the database
    
    // Mocking the response for demonstration
    return [
      { id: 1, name: "Script Assurance Santé" },
      { id: 2, name: "Script Renouvellement" },
      { id: 3, name: "Script Étude de Marché" },
      { id: 4, name: "Script 5G" },
      { id: 5, name: "Script Satisfaction" }
    ];
  }
  
  async getScript(id: number): Promise<any | undefined> {
    // Get script by ID
    // In a real implementation, this would fetch from the database
    
    // Mocking the response for demonstration
    const scripts = [
      {
        id: 1,
        name: "Script Assurance Santé",
        content: "Bonjour, je m'appelle [Agent]. Je vous appelle de la part de JOBDIAL concernant notre nouvelle offre d'assurance santé. Comment allez-vous aujourd'hui [Client] ?\n\nNotre offre exclusive inclut une couverture complète pour toute votre famille avec des tarifs préférentiels. Seriez-vous intéressé(e) par plus d'informations ?\n\nSi oui : Super ! Je vais vous expliquer les détails de notre formule. Elle comprend...\n\nSi non : Puis-je savoir quelle est votre assurance actuelle ? Peut-être pourrions-nous vous proposer une offre plus avantageuse."
      },
      {
        id: 2,
        name: "Script Renouvellement",
        content: "Bonjour [Client], c'est [Agent] de JOBDIAL. Je vous contacte au sujet du renouvellement de votre contrat internet qui arrive à échéance prochainement. Avez-vous quelques minutes pour en discuter ?\n\nNous souhaitons vous proposer notre nouvelle offre fibre à 1Gb/s avec un tarif spécial renouvellement à seulement 29,99€ par mois pendant 12 mois, puis 39,99€. C'est une économie de 10€ par mois par rapport à votre forfait actuel.\n\nQu'en pensez-vous ?"
      },
      {
        id: 3,
        name: "Script Étude de Marché",
        content: "Bonjour, je suis [Agent] de l'institut JOBDIAL. Nous réalisons actuellement une étude de marché sur les produits technologiques et votre avis nous intéresse. Cela ne prendra que 5 minutes de votre temps. Êtes-vous disponible ?\n\nQuestions :\n1. Possédez-vous un smartphone ? Si oui, quelle marque ?\n2. À quelle fréquence changez-vous de téléphone ?\n3. Quel budget consacrez-vous à l'achat d'un nouveau téléphone ?\n4. Quelles sont les fonctionnalités les plus importantes pour vous ?\n\nMerci beaucoup pour votre participation !"
      }
    ];
    
    return scripts.find(s => s.id === id);
  }
  
  async createScript(script: any): Promise<any> {
    // Create script in database
    // In a real implementation, this would insert into the database
    
    // Calculate word count
    const wordCount = script.content.split(/\s+/).length;
    
    // Mocking the response for demonstration
    return {
      id: Math.floor(Math.random() * 1000) + 10,
      name: script.name,
      content: script.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      campaignsCount: 0,
      wordCount
    };
  }
  
  async updateScript(id: number, script: any): Promise<any> {
    // Update script in database
    // In a real implementation, this would update the database
    
    // Calculate word count
    const wordCount = script.content.split(/\s+/).length;
    
    // Mocking the response for demonstration
    return {
      id,
      name: script.name,
      content: script.content,
      updatedAt: new Date().toISOString(),
      campaignsCount: 1,
      wordCount
    };
  }
  
  async deleteScript(id: number): Promise<void> {
    // Delete script from database
    // In a real implementation, this would delete from the database
    
    // For now, just log it
    console.log(`Script ${id} deleted`);
  }
  
  async duplicateScript(id: number): Promise<any> {
    // Duplicate script in database
    // In a real implementation, this would:
    // 1. Fetch the original script
    // 2. Create a new script with the same content but "(copie)" appended to the name
    
    const original = await this.getScript(id);
    
    if (!original) {
      throw new Error("Script not found");
    }
    
    // Mocking the response for demonstration
    return {
      id: Math.floor(Math.random() * 1000) + 10,
      name: `${original.name} (copie)`,
      content: original.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      campaignsCount: 0,
      wordCount: original.content.split(/\s+/).length
    };
  }
  
  // Call history
  async getRecentCalls(page: number, limit: number): Promise<{ calls: any[], total: number }> {
    // Get recent calls
    // In a real implementation, this would fetch from the database
    
    // Mocking the response for demonstration
    const mockCalls = [
      {
        id: 1,
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
        duration: "3:24",
        timestamp: "14:32",
        date: "Aujourd'hui",
        result: "interested"
      },
      {
        id: 2,
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
        duration: "4:15",
        timestamp: "13:45",
        date: "Aujourd'hui",
        result: "interested"
      },
      {
        id: 3,
        agent: {
          id: 4,
          username: "Sophie Martin"
        },
        contact: {
          name: "Jacques Leroy",
          phone: "01 23 45 67 89"
        },
        campaign: {
          id: 3,
          name: "Etude de marché"
        },
        duration: "1:47",
        timestamp: "11:23",
        date: "Aujourd'hui",
        result: "refused"
      },
      {
        id: 4,
        agent: {
          id: 5,
          username: "Jean Dupont"
        },
        contact: {
          name: "Isabelle Marchand",
          phone: "06 87 65 43 21"
        },
        campaign: {
          id: 2,
          name: "Renouvellement Internet"
        },
        duration: "2:38",
        timestamp: "10:15",
        date: "Aujourd'hui",
        result: "callback"
      }
    ];
    
    // Generate more mock data to fill the limit
    const totalReal = mockCalls.length;
    
    // Apply pagination
    const total = 120; // Mock total count
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, totalReal);
    const calls = mockCalls.slice(startIndex, endIndex);
    
    return { calls, total };
  }
  
  async getCallHistory(
    page: number, 
    limit: number, 
    search: string, 
    result?: string, 
    campaign?: string, 
    agent?: string, 
    dateFrom?: string, 
    dateTo?: string
  ): Promise<{ calls: any[], total: number }> {
    // Get call history with filters
    // In a real implementation, this would fetch from the database
    
    // Mocking the response for demonstration
    const mockCalls = [
      {
        id: 1,
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
        duration: "3:24",
        timestamp: "14:32",
        date: "03/07/2023",
        result: "interested",
        notes: "Client intéressé par l'offre famille. Rappeler pour finaliser le contrat.",
        recordingUrl: ""
      },
      {
        id: 2,
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
        duration: "4:15",
        timestamp: "13:45",
        date: "03/07/2023",
        result: "interested",
        notes: "Cliente a accepté l'offre de renouvellement à 29,99€. Documents envoyés par email.",
        recordingUrl: ""
      },
      {
        id: 3,
        agent: {
          id: 4,
          username: "Sophie Martin"
        },
        contact: {
          name: "Jacques Leroy",
          phone: "01 23 45 67 89"
        },
        campaign: {
          id: 3,
          name: "Etude de marché"
        },
        duration: "1:47",
        timestamp: "11:23",
        date: "03/07/2023",
        result: "refused",
        notes: "Contact pas intéressé par l'étude. Ne pas rappeler.",
        recordingUrl: ""
      },
      {
        id: 4,
        agent: {
          id: 5,
          username: "Jean Dupont"
        },
        contact: {
          name: "Isabelle Marchand",
          phone: "06 87 65 43 21"
        },
        campaign: {
          id: 2,
          name: "Renouvellement Internet"
        },
        duration: "2:38",
        timestamp: "10:15",
        date: "03/07/2023",
        result: "callback",
        notes: "Contact occupé. Rappeler demain entre 14h et 16h.",
        recordingUrl: ""
      }
    ];
    
    // Apply filters
    let filteredCalls = [...mockCalls];
    
    if (search) {
      filteredCalls = filteredCalls.filter(c => 
        c.contact.name.toLowerCase().includes(search.toLowerCase()) || 
        c.contact.phone.includes(search) ||
        c.agent.username.toLowerCase().includes(search.toLowerCase()) ||
        c.campaign.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (result && result !== "all") {
      filteredCalls = filteredCalls.filter(c => c.result === result);
    }
    
    if (campaign && campaign !== "all") {
      filteredCalls = filteredCalls.filter(c => c.campaign.id === parseInt(campaign));
    }
    
    if (agent && agent !== "all") {
      filteredCalls = filteredCalls.filter(c => c.agent.id === parseInt(agent));
    }
    
    // Skip date filtering for mock data
    
    // Apply pagination
    const total = filteredCalls.length;
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, total);
    const calls = filteredCalls.slice(startIndex, endIndex);
    
    return { calls, total };
  }
  
  async getCallFilterOptions(): Promise<any> {
    // Get filter options for call history
    // In a real implementation, this would fetch from the database
    
    // Mocking the response for demonstration
    return {
      campaigns: [
        { id: 1, name: "Assurance Santé Q3" },
        { id: 2, name: "Renouvellement Internet" },
        { id: 3, name: "Etude de marché" }
      ],
      agents: [
        { id: 2, username: "Emilie Laurent" },
        { id: 3, username: "Thomas Moreau" },
        { id: 4, username: "Sophie Martin" },
        { id: 5, username: "Jean Dupont" }
      ]
    };
  }
  
  // Statistics
  async getDashboardStats(): Promise<any> {
    // Get dashboard statistics
    // In a real implementation, this would fetch from the database
    
    // Mocking the response for demonstration
    return {
      connectedAgents: 12,
      totalAgents: 15,
      activeCallsCount: 8,
      conversionRate: "24.8%",
      avgCallTime: "3:24",
      changes: {
        calls: 12,
        conversion: -2.3,
        avgTime: "+0:18"
      }
    };
  }
  
  // Supervision
  async getSupervisionData(): Promise<any> {
    // Get supervision data
    // In a real implementation, this would fetch from the database
    
    // Mocking the response for demonstration
    return {
      agents: [
        {
          id: 2,
          username: "Emilie Laurent",
          status: "available",
          statusDuration: "3:45"
        },
        {
          id: 3,
          username: "Thomas Moreau",
          status: "on_call",
          statusDuration: "2:12",
          currentCall: {
            id: "call123",
            contactName: "Pierre Dupont",
            duration: "2:12",
            campaignName: "Assurance Santé Q3"
          }
        },
        {
          id: 4,
          username: "Sophie Martin",
          status: "available",
          statusDuration: "1:33"
        },
        {
          id: 5,
          username: "Jean Dupont",
          status: "paused",
          statusDuration: "4:48"
        },
        {
          id: 6,
          username: "Marie Dubois",
          status: "offline",
          statusDuration: "-"
        }
      ],
      queues: [
        {
          name: "Général",
          waitingCalls: 2,
          avgWaitTime: "0:45",
          serviceLevelPercent: 92
        },
        {
          name: "Support",
          waitingCalls: 0,
          avgWaitTime: "0:00",
          serviceLevelPercent: 100
        },
        {
          name: "Commercial",
          waitingCalls: 4,
          avgWaitTime: "1:15",
          serviceLevelPercent: 78
        }
      ],
      campaigns: [
        {
          id: 1,
          name: "Assurance Santé Q3",
          progress: 68,
          leadsTotal: 500,
          leadsContacted: 340,
          leadsPending: 160,
          activeAgents: 6
        },
        {
          id: 2,
          name: "Renouvellement Internet",
          progress: 92,
          leadsTotal: 300,
          leadsContacted: 276,
          leadsPending: 24,
          activeAgents: 4
        },
        {
          id: 3,
          name: "Étude de marché",
          progress: 45,
          leadsTotal: 200,
          leadsContacted: 90,
          leadsPending: 110,
          activeAgents: 2
        }
      ],
      alerts: [
        {
          id: 1,
          type: "error",
          message: "File d'attente Commercial: plus de 4 appels en attente",
          timestamp: "Il y a 5 minutes"
        },
        {
          id: 2,
          type: "warning",
          message: "Agent Marie Dubois déconnecté sans notification",
          timestamp: "Il y a 15 minutes"
        },
        {
          id: 3,
          type: "info",
          message: "Campagne 'Renouvellement Internet' presque terminée (92%)",
          timestamp: "Il y a 30 minutes"
        },
        {
          id: 4,
          type: "warning",
          message: "Agent Jean Dupont en pause depuis plus de 15 minutes",
          timestamp: "Il y a 33 minutes"
        }
      ]
    };
  }
  
  // Settings
  async getSettings(): Promise<any> {
    // Get application settings
    // In a real implementation, this would fetch from the database
    
    // Mocking the response for demonstration
    return {
      general: {
        companyName: "JOBDIAL",
        timezone: "Europe/Paris",
        dateFormat: "DD/MM/YYYY",
        language: "fr"
      },
      voip: {
        twilioAccountSid: "",
        twilioAuthToken: "",
        twilioPhoneNumber: "",
        useWebRTC: true,
        outboundPrefix: "",
        recordCalls: false
      },
      notifications: {
        emailNotifications: false,
        desktopNotifications: true,
        emailAddress: "",
        notifyOnQueueThreshold: true,
        queueThreshold: 5,
        notifyOnAgentInactive: true,
        inactivityThreshold: 15
      }
    };
  }
  
  async updateGeneralSettings(settings: any): Promise<any> {
    // Update general settings
    // In a real implementation, this would update the database
    
    // Mocking the response for demonstration
    return {
      companyName: settings.companyName,
      timezone: settings.timezone,
      dateFormat: settings.dateFormat,
      language: settings.language
    };
  }
  
  async updateVoipSettings(settings: any): Promise<any> {
    // Update VoIP settings
    // In a real implementation, this would update the database
    
    // Mocking the response for demonstration
    return {
      twilioAccountSid: settings.twilioAccountSid,
      twilioAuthToken: settings.twilioAuthToken,
      twilioPhoneNumber: settings.twilioPhoneNumber,
      useWebRTC: settings.useWebRTC,
      outboundPrefix: settings.outboundPrefix,
      recordCalls: settings.recordCalls
    };
  }
  
  async updateNotificationSettings(settings: any): Promise<any> {
    // Update notification settings
    // In a real implementation, this would update the database
    
    // Mocking the response for demonstration
    return {
      emailNotifications: settings.emailNotifications,
      desktopNotifications: settings.desktopNotifications,
      emailAddress: settings.emailAddress,
      notifyOnQueueThreshold: settings.notifyOnQueueThreshold,
      queueThreshold: settings.queueThreshold,
      notifyOnAgentInactive: settings.notifyOnAgentInactive,
      inactivityThreshold: settings.inactivityThreshold
    };
  }
}

export const storage = new DatabaseStorage();
