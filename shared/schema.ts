import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, json, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const attorneys = pgTable("attorneys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  specialization: text("specialization"),
  profilePhotoUrl: text("profile_photo_url"),
  clioApiKey: text("clio_api_key"),
  gmailCredentials: json("gmail_credentials"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const legalCases = pgTable("legal_cases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  caseNumber: text("case_number"),
  clientName: text("client_name").notNull(),
  court: text("court"),
  caseType: text("case_type").notNull(), // 'family', 'civil', 'criminal', etc.
  status: text("status").notNull().default('active'), // 'active', 'closed', 'pending'
  attorneyId: varchar("attorney_id").references(() => attorneys.id),
  clioMatterId: text("clio_matter_id"),
  balanceDue: integer("balance_due").default(0),
  unbilledHours: integer("unbilled_hours").default(0),
  procedurePosture: text("procedure_posture"),
  keyFacts: text("key_facts"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  type: text("type").notNull(), // 'motion', 'pleading', 'discovery', 'order', etc.
  content: text("content"),
  source: text("source").notNull(), // 'gmail', 'upload', 'generated'
  sourceId: text("source_id"), // Gmail message ID, etc.
  caseId: varchar("case_id").references(() => legalCases.id),
  attorneyId: varchar("attorney_id").references(() => attorneys.id),
  analyzed: boolean("analyzed").default(false),
  urgencyLevel: text("urgency_level").default('normal'), // 'low', 'normal', 'high', 'critical'
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const redFlags = pgTable("red_flags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").references(() => documents.id),
  caseId: varchar("case_id").references(() => legalCases.id),
  type: text("type").notNull(), // 'allegation', 'deadline', 'disclosure', 'risk'
  description: text("description").notNull(),
  severity: text("severity").notNull(), // 'low', 'medium', 'high', 'critical'
  addressed: boolean("addressed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workflowModules = pgTable("workflow_modules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'document_intelligence', 'emergency_response', etc.
  active: boolean("active").default(true),
  attorneyId: varchar("attorney_id").references(() => attorneys.id),
  config: json("config"),
  lastActivity: timestamp("last_activity"),
});

export const aiAnalyses = pgTable("ai_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").references(() => documents.id),
  analysisType: text("analysis_type").notNull(), // 'red_flags', 'response_draft', 'summary'
  result: json("result"),
  confidence: integer("confidence"), // 0-100
  workflowModuleId: varchar("workflow_module_id").references(() => workflowModules.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAttorneySchema = createInsertSchema(attorneys).pick({
  name: true,
  email: true,
  specialization: true,
  profilePhotoUrl: true,
});

export const insertLegalCaseSchema = createInsertSchema(legalCases).pick({
  title: true,
  caseNumber: true,
  clientName: true,
  court: true,
  caseType: true,
  attorneyId: true,
  clioMatterId: true,
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  title: true,
  type: true,
  content: true,
  source: true,
  sourceId: true,
  caseId: true,
  urgencyLevel: true,
});

export const insertRedFlagSchema = createInsertSchema(redFlags).pick({
  documentId: true,
  caseId: true,
  type: true,
  description: true,
  severity: true,
});

export type InsertAttorney = z.infer<typeof insertAttorneySchema>;
export type InsertLegalCase = z.infer<typeof insertLegalCaseSchema>;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type InsertRedFlag = z.infer<typeof insertRedFlagSchema>;

export type Attorney = typeof attorneys.$inferSelect;
export type LegalCase = typeof legalCases.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type RedFlag = typeof redFlags.$inferSelect;
export type WorkflowModule = typeof workflowModules.$inferSelect;
export type AiAnalysis = typeof aiAnalyses.$inferSelect;
