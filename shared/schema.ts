import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  role: text("role", { enum: ["admin", "agent"] }).notNull().default("agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login"),
});

export const insertUserSchema = createInsertSchema(users, {
  username: (schema) => schema.min(3, "Nom d'utilisateur doit avoir au moins 3 caractères"),
  password: (schema) => schema.min(6, "Mot de passe doit avoir au moins 6 caractères"),
  role: (schema) => schema.default("agent"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Agents table (extends users)
export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  status: text("status", { enum: ["available", "on_call", "paused", "offline"] }).default("offline"),
  statusSince: timestamp("status_since").defaultNow(),
  phoneExtension: text("phone_extension"),
});

export const agentStatus = pgTable("agent_status", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").references(() => agents.id).notNull(),
  status: text("status", { enum: ["available", "on_call", "paused", "offline"] }).notNull(),
  startTime: timestamp("start_time").defaultNow().notNull(),
  endTime: timestamp("end_time"),
});

// Campaigns table
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  scriptId: integer("script_id").references(() => scripts.id),
  status: text("status", { enum: ["active", "paused", "completed"] }).default("active"),
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: integer("created_by").references(() => users.id),
});

// Scripts table
export const scripts = pgTable("scripts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: integer("created_by").references(() => users.id),
});

// Leads/Contacts table
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => campaigns.id).notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  company: text("company"),
  status: text("status", { enum: ["pending", "contacted", "callback", "completed", "do_not_call"] }).default("pending"),
  notes: text("notes"),
  customFields: json("custom_fields"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Calls table
export const calls = pgTable("calls", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").references(() => agents.id).notNull(),
  leadId: integer("lead_id").references(() => leads.id).notNull(),
  campaignId: integer("campaign_id").references(() => campaigns.id).notNull(),
  startTime: timestamp("start_time").defaultNow().notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // in seconds
  result: text("result", { enum: ["interested", "refused", "callback", "absent"] }),
  notes: text("notes"),
  recordingUrl: text("recording_url"),
});

// Agent-Campaign assignments
export const agentCampaigns = pgTable("agent_campaigns", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").references(() => agents.id).notNull(),
  campaignId: integer("campaign_id").references(() => campaigns.id).notNull(),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  assignedBy: integer("assigned_by").references(() => users.id),
});

// Settings table
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // e.g., 'general', 'voip', 'notifications'
  key: text("key").notNull(),
  value: text("value"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define relationships
export const usersRelations = relations(users, ({ one, many }) => ({
  agent: one(agents, { fields: [users.id], references: [agents.userId] }),
  createdCampaigns: many(campaigns, { relationName: "campaignCreator" }),
  createdScripts: many(scripts, { relationName: "scriptCreator" }),
}));

export const agentsRelations = relations(agents, ({ one, many }) => ({
  user: one(users, { fields: [agents.userId], references: [users.id] }),
  statusHistory: many(agentStatus),
  calls: many(calls),
  campaigns: many(agentCampaigns, { relationName: "agentCampaigns" }),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  script: one(scripts, { fields: [campaigns.scriptId], references: [scripts.id] }),
  creator: one(users, { fields: [campaigns.createdBy], references: [users.id], relationName: "campaignCreator" }),
  leads: many(leads),
  calls: many(calls),
  agents: many(agentCampaigns, { relationName: "campaignAgents" }),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  campaign: one(campaigns, { fields: [leads.campaignId], references: [campaigns.id] }),
  calls: many(calls),
}));

export const callsRelations = relations(calls, ({ one }) => ({
  agent: one(agents, { fields: [calls.agentId], references: [agents.id] }),
  lead: one(leads, { fields: [calls.leadId], references: [leads.id] }),
  campaign: one(campaigns, { fields: [calls.campaignId], references: [campaigns.id] }),
}));

export const agentCampaignsRelations = relations(agentCampaigns, ({ one }) => ({
  agent: one(agents, { fields: [agentCampaigns.agentId], references: [agents.id], relationName: "agentCampaigns" }),
  campaign: one(campaigns, { fields: [agentCampaigns.campaignId], references: [campaigns.id], relationName: "campaignAgents" }),
  assigner: one(users, { fields: [agentCampaigns.assignedBy], references: [users.id] }),
}));

// Insert schemas
export const insertAgentSchema = createInsertSchema(agents);
export const insertCampaignSchema = createInsertSchema(campaigns);
export const insertScriptSchema = createInsertSchema(scripts);
export const insertLeadSchema = createInsertSchema(leads);
export const insertCallSchema = createInsertSchema(calls);
export const insertAgentCampaignSchema = createInsertSchema(agentCampaigns);
export const insertAgentStatusSchema = createInsertSchema(agentStatus);
export const insertSettingSchema = createInsertSchema(settings);

// Types
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type InsertScript = z.infer<typeof insertScriptSchema>;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type InsertCall = z.infer<typeof insertCallSchema>;
export type InsertAgentCampaign = z.infer<typeof insertAgentCampaignSchema>;
export type InsertAgentStatus = z.infer<typeof insertAgentStatusSchema>;
export type InsertSetting = z.infer<typeof insertSettingSchema>;

export type Agent = typeof agents.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;
export type Script = typeof scripts.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type Call = typeof calls.$inferSelect;
export type AgentCampaign = typeof agentCampaigns.$inferSelect;
export type AgentStatus = typeof agentStatus.$inferSelect;
export type Setting = typeof settings.$inferSelect;
