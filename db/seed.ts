import { db } from "./index";
import * as schema from "@shared/schema";
import { hashPassword } from "../server/auth";

async function seed() {
  try {
    console.log("Initialisation de la base de données...");

    // Créer uniquement l'utilisateur admin
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
      console.log("Compte administrateur créé");
    } else {
      console.log("Le compte administrateur existe déjà");
    }

    console.log("Initialisation terminée avec succès");
  } catch (error) {
    console.error("Erreur lors de l'initialisation:", error);
  }
}

seed();