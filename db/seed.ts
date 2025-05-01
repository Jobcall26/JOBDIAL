import { db } from "./index";
import * as schema from "@shared/schema";
import { hashPassword } from "../server/auth";

async function seed() {
  try {
    console.log("Starting database seed...");

    // Create admin user
    const adminExists = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, "admin")
    });

    if (!adminExists) {
      const hashedPassword = await hashPassword("admin123");
      await db.insert(schema.users).values({
        username: "admin",
        password: hashedPassword,
        role: "admin",
        email: "admin@jobdial.com"
      });
      console.log("Admin user created");
    } else {
      console.log("Admin user already exists");
    }

    // Create agent users
    const agentNames = [
      { username: "emilie.laurent", displayName: "Emilie Laurent" },
      { username: "thomas.moreau", displayName: "Thomas Moreau" },
      { username: "sophie.martin", displayName: "Sophie Martin" },
      { username: "jean.dupont", displayName: "Jean Dupont" },
      { username: "marie.dubois", displayName: "Marie Dubois" }
    ];

    for (const agent of agentNames) {
      const agentExists = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.username, agent.username)
      });

      if (!agentExists) {
        const hashedPassword = await hashPassword("password123");
        const [user] = await db.insert(schema.users).values({
          username: agent.username,
          password: hashedPassword,
          role: "agent",
          email: `${agent.username}@jobdial.com`
        }).returning();

        // Create agent record
        await db.insert(schema.agents).values({
          userId: user.id,
          status: "offline"
        });

        console.log(`Agent ${agent.displayName} created`);
      } else {
        console.log(`Agent ${agent.displayName} already exists`);
      }
    }

    // Create scripts
    const scriptContents = [
      {
        name: "Script Assurance Santé",
        content: "Bonjour, je m'appelle [Agent]. Je vous appelle de la part de JOBDIAL concernant notre nouvelle offre d'assurance santé. Comment allez-vous aujourd'hui [Client] ?\n\nNotre offre exclusive inclut une couverture complète pour toute votre famille avec des tarifs préférentiels. Seriez-vous intéressé(e) par plus d'informations ?\n\nSi oui : Super ! Je vais vous expliquer les détails de notre formule. Elle comprend...\n\nSi non : Puis-je savoir quelle est votre assurance actuelle ? Peut-être pourrions-nous vous proposer une offre plus avantageuse."
      },
      {
        name: "Script Renouvellement",
        content: "Bonjour [Client], c'est [Agent] de JOBDIAL. Je vous contacte au sujet du renouvellement de votre contrat internet qui arrive à échéance prochainement. Avez-vous quelques minutes pour en discuter ?\n\nNous souhaitons vous proposer notre nouvelle offre fibre à 1Gb/s avec un tarif spécial renouvellement à seulement 29,99€ par mois pendant 12 mois, puis 39,99€. C'est une économie de 10€ par mois par rapport à votre forfait actuel.\n\nQu'en pensez-vous ?"
      },
      {
        name: "Script Étude de Marché",
        content: "Bonjour, je suis [Agent] de l'institut JOBDIAL. Nous réalisons actuellement une étude de marché sur les produits technologiques et votre avis nous intéresse. Cela ne prendra que 5 minutes de votre temps. Êtes-vous disponible ?\n\nQuestions :\n1. Possédez-vous un smartphone ? Si oui, quelle marque ?\n2. À quelle fréquence changez-vous de téléphone ?\n3. Quel budget consacrez-vous à l'achat d'un nouveau téléphone ?\n4. Quelles sont les fonctionnalités les plus importantes pour vous ?\n\nMerci beaucoup pour votre participation !"
      },
      {
        name: "Script 5G",
        content: "Bonjour [Client], c'est [Agent] de JOBDIAL. Nous lançons une nouvelle offre mobile 5G avec des tarifs exclusifs pour nos clients fidèles comme vous. Puis-je vous présenter cette offre ?\n\nNotre offre 5G inclut des données illimitées, des appels et SMS illimités, ainsi que 20 Go de data en Europe pour seulement 24,99€ par mois avec engagement de 12 mois.\n\nCela vous intéresserait-il ?"
      },
      {
        name: "Script Satisfaction",
        content: "Bonjour [Client], je suis [Agent] du service qualité de JOBDIAL. Nous souhaitons recueillir votre niveau de satisfaction concernant nos services. Avez-vous quelques minutes pour répondre à notre enquête ?\n\nSur une échelle de 1 à 5, comment évalueriez-vous :\n1. La qualité de nos produits/services ?\n2. Notre service client ?\n3. Le rapport qualité-prix ?\n\nAvez-vous des suggestions pour nous aider à améliorer notre service ?\n\nMerci pour votre temps et vos précieux retours !"
      }
    ];

    for (const script of scriptContents) {
      const scriptExists = await db.query.scripts.findFirst({
        where: (scripts, { eq }) => eq(scripts.name, script.name)
      });

      if (!scriptExists) {
        await db.insert(schema.scripts).values({
          name: script.name,
          content: script.content,
          createdBy: 1, // admin user
        });
        console.log(`Script ${script.name} created`);
      } else {
        console.log(`Script ${script.name} already exists`);
      }
    }

    // Create campaigns
    const campaignData = [
      {
        name: "Assurance Santé Q3",
        description: "Campagne pour les nouveaux produits d'assurance santé",
        scriptName: "Script Assurance Santé",
        status: "active"
      },
      {
        name: "Renouvellement Internet",
        description: "Campagne de renouvellement des contrats internet",
        scriptName: "Script Renouvellement",
        status: "active"
      },
      {
        name: "Étude de marché",
        description: "Sondage pour étude de marché produits tech",
        scriptName: "Script Étude de Marché",
        status: "paused"
      },
      {
        name: "Lancement Mobile 5G",
        description: "Lancement de nouvelles offres mobiles 5G",
        scriptName: "Script 5G",
        status: "completed"
      },
      {
        name: "Satisfaction Client Q2",
        description: "Enquête de satisfaction des clients du second trimestre",
        scriptName: "Script Satisfaction",
        status: "active"
      }
    ];

    for (const campaign of campaignData) {
      const campaignExists = await db.query.campaigns.findFirst({
        where: (campaigns, { eq }) => eq(campaigns.name, campaign.name)
      });

      if (!campaignExists) {
        // Get script ID
        const script = await db.query.scripts.findFirst({
          where: (scripts, { eq }) => eq(scripts.name, campaign.scriptName)
        });

        if (script) {
          await db.insert(schema.campaigns).values({
            name: campaign.name,
            description: campaign.description,
            scriptId: script.id,
            status: campaign.status as "active" | "paused" | "completed",
            createdBy: 1, // admin user
          });
          console.log(`Campaign ${campaign.name} created`);
        } else {
          console.log(`Script ${campaign.scriptName} not found for campaign ${campaign.name}`);
        }
      } else {
        console.log(`Campaign ${campaign.name} already exists`);
      }
    }

    // Assign agents to campaigns
    const agentAssignments = [
      { agentName: "emilie.laurent", campaignName: "Assurance Santé Q3" },
      { agentName: "emilie.laurent", campaignName: "Satisfaction Client Q2" },
      { agentName: "thomas.moreau", campaignName: "Renouvellement Internet" },
      { agentName: "thomas.moreau", campaignName: "Lancement Mobile 5G" },
      { agentName: "sophie.martin", campaignName: "Étude de marché" },
      { agentName: "sophie.martin", campaignName: "Satisfaction Client Q2" },
      { agentName: "jean.dupont", campaignName: "Assurance Santé Q3" },
      { agentName: "jean.dupont", campaignName: "Renouvellement Internet" },
      { agentName: "marie.dubois", campaignName: "Assurance Santé Q3" }
    ];

    for (const assignment of agentAssignments) {
      // Get agent ID
      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.username, assignment.agentName)
      });

      if (!user) {
        console.log(`User ${assignment.agentName} not found`);
        continue;
      }

      const agent = await db.query.agents.findFirst({
        where: (agents, { eq }) => eq(agents.userId, user.id)
      });

      if (!agent) {
        console.log(`Agent record for ${assignment.agentName} not found`);
        continue;
      }

      // Get campaign ID
      const campaign = await db.query.campaigns.findFirst({
        where: (campaigns, { eq }) => eq(campaigns.name, assignment.campaignName)
      });

      if (!campaign) {
        console.log(`Campaign ${assignment.campaignName} not found`);
        continue;
      }

      // Check if assignment already exists
      const assignmentExists = await db.query.agentCampaigns.findFirst({
        where: (ac, { and, eq }) => and(
          eq(ac.agentId, agent.id),
          eq(ac.campaignId, campaign.id)
        )
      });

      if (!assignmentExists) {
        await db.insert(schema.agentCampaigns).values({
          agentId: agent.id,
          campaignId: campaign.id,
          assignedBy: 1, // admin user
        });
        console.log(`Assigned ${assignment.agentName} to ${assignment.campaignName}`);
      } else {
        console.log(`Assignment of ${assignment.agentName} to ${assignment.campaignName} already exists`);
      }
    }

    // Create sample leads
    const sampleLeadNames = [
      "Martin Bernard", "Catherine Petit", "Jacques Leroy", "Isabelle Marchand",
      "Pierre Dupont", "Anne Lefebvre", "Michel Dubois", "Françoise Moreau",
      "Philippe Lambert", "Marie Rousseau", "Jean Martin", "Sophie Fournier"
    ];

    // Get campaign IDs
    const campaigns = await db.query.campaigns.findMany();

    // Create 10 leads for each campaign
    for (const campaign of campaigns) {
      const leadsCount = await db.query.leads.findMany({
        where: (leads, { eq }) => eq(leads.campaignId, campaign.id)
      });

      if (leadsCount.length < 10) {
        for (let i = 0; i < 10; i++) {
          const randomName = sampleLeadNames[Math.floor(Math.random() * sampleLeadNames.length)];
          const firstName = randomName.split(' ')[0];
          const lastName = randomName.split(' ')[1];

          await db.insert(schema.leads).values({
            campaignId: campaign.id,
            firstName,
            lastName,
            fullName: randomName,
            phone: `0${Math.floor(Math.random() * 900000000) + 100000000}`, // Random French format mobile number
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
            company: Math.random() > 0.5 ? "ACME Inc." : undefined,
            status: "pending"
          });
        }
        console.log(`Created 10 leads for campaign ${campaign.name}`);
      } else {
        console.log(`Campaign ${campaign.name} already has leads`);
      }
    }

    // Create some sample calls
    const agents = await db.query.agents.findMany({
      with: {
        user: true
      }
    });

    const callResults = ["interested", "refused", "callback", "absent"];

    // Create a few calls for each agent
    for (const agent of agents) {
      const callsCount = await db.query.calls.findMany({
        where: (calls, { eq }) => eq(calls.agentId, agent.id)
      });

      if (callsCount.length < 5) {
        // Get agent's campaigns
        const agentCampaignsData = await db.query.agentCampaigns.findMany({
          where: (ac, { eq }) => eq(ac.agentId, agent.id),
          with: {
            campaign: true
          }
        });

        if (agentCampaignsData.length > 0) {
          for (let i = 0; i < 5; i++) {
            // Pick a random campaign assigned to this agent
            const randomCampaign = agentCampaignsData[Math.floor(Math.random() * agentCampaignsData.length)].campaign;

            // Get a random lead for this campaign
            const leads = await db.query.leads.findMany({
              where: (leads, { eq }) => eq(leads.campaignId, randomCampaign.id)
            });

            if (leads.length > 0) {
              const randomLead = leads[Math.floor(Math.random() * leads.length)];
              
              // Create random call start and end time
              const startTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Last 7 days
              const durationSeconds = Math.floor(Math.random() * 600) + 60; // 1-10 minutes
              const endTime = new Date(startTime.getTime() + durationSeconds * 1000);
              
              // Random call result
              const result = callResults[Math.floor(Math.random() * callResults.length)];
              
              await db.insert(schema.calls).values({
                agentId: agent.id,
                leadId: randomLead.id,
                campaignId: randomCampaign.id,
                startTime,
                endTime,
                duration: durationSeconds,
                result: result as "interested" | "refused" | "callback" | "absent",
                notes: result === "interested" ? "Client intéressé par l'offre. Rappeler pour finaliser." : 
                      result === "callback" ? "Client occupé. Rappeler plus tard." : 
                      result === "refused" ? "Client pas intéressé." : 
                      "Client absent, messagerie."
              });
            }
          }
          console.log(`Created 5 sample calls for agent ${agent.user.username}`);
        }
      } else {
        console.log(`Agent ${agent.user.username} already has calls`);
      }
    }

    // Create settings
    const settingsData = [
      { category: 'general', key: 'companyName', value: 'JOBDIAL' },
      { category: 'general', key: 'timezone', value: 'Europe/Paris' },
      { category: 'general', key: 'dateFormat', value: 'DD/MM/YYYY' },
      { category: 'general', key: 'language', value: 'fr' },
      { category: 'voip', key: 'useWebRTC', value: 'true' },
      { category: 'voip', key: 'recordCalls', value: 'false' },
      { category: 'notifications', key: 'desktopNotifications', value: 'true' },
      { category: 'notifications', key: 'emailNotifications', value: 'false' },
      { category: 'notifications', key: 'notifyOnQueueThreshold', value: 'true' },
      { category: 'notifications', key: 'queueThreshold', value: '5' },
      { category: 'notifications', key: 'notifyOnAgentInactive', value: 'true' },
      { category: 'notifications', key: 'inactivityThreshold', value: '15' }
    ];

    for (const setting of settingsData) {
      const settingExists = await db.query.settings.findFirst({
        where: (settings, { and, eq }) => and(
          eq(settings.category, setting.category),
          eq(settings.key, setting.key)
        )
      });

      if (!settingExists) {
        await db.insert(schema.settings).values({
          category: setting.category,
          key: setting.key,
          value: setting.value
        });
        console.log(`Created setting ${setting.category}.${setting.key}`);
      } else {
        console.log(`Setting ${setting.category}.${setting.key} already exists`);
      }
    }

    console.log("Database seed completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
