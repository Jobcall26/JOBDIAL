import { db } from "./index";
import { users, agents, campaigns, leads, calls, scripts, agentStatus, agentCampaigns } from "@shared/schema";
import { sql } from "drizzle-orm";

async function cleanDatabase() {
  console.log("Nettoyage de la base de données en cours...");
  
  try {
    // Supprimer les données des tables dans le bon ordre pour respecter les contraintes de clé étrangère
    console.log("Suppression des appels...");
    await db.delete(calls).execute();
    
    console.log("Suppression des affectations agent-campagne...");
    await db.delete(agentCampaigns).execute();
    
    console.log("Suppression des statuts des agents...");
    await db.delete(agentStatus).execute();
    
    console.log("Suppression des leads/contacts...");
    await db.delete(leads).execute();
    
    console.log("Suppression des campagnes...");
    await db.delete(campaigns).execute();
    
    console.log("Suppression des scripts...");
    await db.delete(scripts).execute();
    
    console.log("Suppression des agents...");
    await db.delete(agents).execute();
    
    // Supprimer tous les utilisateurs sauf l'admin (id=1)
    console.log("Suppression des utilisateurs (sauf admin)...");
    await db.delete(users).where(sql`id != 1`).execute();
    
    console.log("Nettoyage terminé avec succès. Seul le compte administrateur a été conservé.");
    console.log("Vous pouvez maintenant vous connecter avec les identifiants admin/admin123");
  } catch (error) {
    console.error("Erreur lors du nettoyage de la base de données:", error);
  }
}

cleanDatabase();
