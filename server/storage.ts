import { 
  type Attorney, 
  type LegalCase, 
  type Document, 
  type RedFlag, 
  type WorkflowModule,
  type InsertAttorney,
  type InsertLegalCase,
  type InsertDocument,
  type InsertRedFlag
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Attorney methods
  getCurrentAttorney(): Promise<Attorney | undefined>;
  createAttorney(attorney: any): Promise<Attorney>;
  updateAttorney(id: string, updates: Partial<Attorney>): Promise<Attorney | undefined>;
  
  // Legal cases methods
  getLegalCases(): Promise<LegalCase[]>;
  getLegalCase(id: string): Promise<LegalCase | undefined>;
  getLegalCaseByClio(clioMatterId: string): Promise<LegalCase | undefined>;
  createLegalCase(legalCase: any): Promise<LegalCase>;
  
  // Documents methods
  getDocuments(): Promise<Document[]>;
  getDocument(id: string): Promise<Document | undefined>;
  createDocument(document: any): Promise<Document>;
  updateDocument(id: string, updates: Partial<Document>): Promise<Document | undefined>;
  
  // Red flags methods
  getRedFlags(): Promise<RedFlag[]>;
  getRedFlagsByCase(caseId: string): Promise<RedFlag[]>;
  getRedFlagsByDocument(documentId: string): Promise<RedFlag[]>;
  createRedFlag(redFlag: InsertRedFlag): Promise<RedFlag>;
  
  // Workflow modules methods
  getWorkflowModules(): Promise<WorkflowModule[]>;
  
  // AI Providers methods
  getAiProviders(): Promise<any[]>;
  createAiProvider(provider: any): Promise<any>;
  updateAiProvider(id: string, updates: any): Promise<any>;
  
  // Feedback methods
  getFeedback(): Promise<any[]>;
  createFeedback(feedback: any): Promise<any>;
  
  // Dashboard stats
  getDashboardStats(): Promise<any>;
}

export class MemStorage implements IStorage {
  private attorneys: Map<string, Attorney>;
  private legalCases: Map<string, LegalCase>;
  private documents: Map<string, Document>;
  private redFlags: Map<string, RedFlag>;
  private workflowModules: Map<string, WorkflowModule>;
  private aiProviders: Map<string, any>;
  private feedback: Map<string, any>;

  constructor() {
    this.attorneys = new Map();
    this.legalCases = new Map();
    this.documents = new Map();
    this.redFlags = new Map();
    this.workflowModules = new Map();
    this.aiProviders = new Map();
    this.feedback = new Map();
    
    this.initializeSampleData();
  }

  // Attorney methods
  async getCurrentAttorney(): Promise<Attorney | undefined> {
    return Array.from(this.attorneys.values())[0];
  }

  async updateAttorney(id: string, updates: Partial<Attorney>): Promise<Attorney | undefined> {
    const attorney = this.attorneys.get(id);
    if (!attorney) return undefined;
    
    const updatedAttorney = { ...attorney, ...updates };
    this.attorneys.set(id, updatedAttorney);
    return updatedAttorney;
  }

  async createAttorney(insertAttorney: InsertAttorney): Promise<Attorney> {
    const id = randomUUID();
    const attorney: Attorney = { 
      ...insertAttorney, 
      id,
      clioApiKey: null,
      gmailCredentials: null,
      createdAt: new Date()
    };
    this.attorneys.set(id, attorney);
    return attorney;
  }

  // Legal cases methods
  async getLegalCases(): Promise<LegalCase[]> {
    return Array.from(this.legalCases.values());
  }

  async getLegalCase(id: string): Promise<LegalCase | undefined> {
    return this.legalCases.get(id);
  }

  async getLegalCaseByClio(clioMatterId: string): Promise<LegalCase | undefined> {
    return Array.from(this.legalCases.values()).find(
      (legalCase) => legalCase.clioMatterId === clioMatterId
    );
  }

  async createLegalCase(insertLegalCase: any): Promise<LegalCase> {
    const id = randomUUID();
    const legalCase: LegalCase = {
      ...insertLegalCase,
      id,
      status: insertLegalCase.status || 'active',
      balanceDue: insertLegalCase.balanceDue || 0,
      unbilledHours: insertLegalCase.unbilledHours || 0,
      procedurePosture: null,
      keyFacts: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.legalCases.set(id, legalCase);
    return legalCase;
  }

  // Documents methods
  async getDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }

  async getDocument(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const document: Document = {
      ...insertDocument,
      id,
      analyzed: false,
      urgencyLevel: insertDocument.urgencyLevel || 'normal',
      dueDate: null,
      createdAt: new Date()
    };
    this.documents.set(id, document);
    return document;
  }

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document | undefined> {
    const document = this.documents.get(id);
    if (!document) return undefined;
    
    const updated = { ...document, ...updates };
    this.documents.set(id, updated);
    return updated;
  }

  // Red flags methods
  async getRedFlags(): Promise<RedFlag[]> {
    return Array.from(this.redFlags.values());
  }

  async getRedFlagsByCase(caseId: string): Promise<RedFlag[]> {
    return Array.from(this.redFlags.values()).filter(
      (redFlag) => redFlag.caseId === caseId
    );
  }

  async getRedFlagsByDocument(documentId: string): Promise<RedFlag[]> {
    return Array.from(this.redFlags.values()).filter(
      (redFlag) => redFlag.documentId === documentId
    );
  }

  async createRedFlag(insertRedFlag: InsertRedFlag): Promise<RedFlag> {
    const id = randomUUID();
    const redFlag: RedFlag = {
      ...insertRedFlag,
      id,
      addressed: false,
      createdAt: new Date()
    };
    this.redFlags.set(id, redFlag);
    return redFlag;
  }

  // Workflow modules methods
  async getWorkflowModules(): Promise<WorkflowModule[]> {
    return Array.from(this.workflowModules.values());
  }

  // AI Providers methods
  async getAiProviders(): Promise<any[]> {
    return Array.from(this.aiProviders.values());
  }

  async createAiProvider(provider: any): Promise<any> {
    const id = randomUUID();
    const newProvider = { ...provider, id, createdAt: new Date(), updatedAt: new Date() };
    this.aiProviders.set(id, newProvider);
    return newProvider;
  }

  async updateAiProvider(id: string, updates: any): Promise<any> {
    const provider = this.aiProviders.get(id);
    if (!provider) return undefined;
    
    const updatedProvider = { ...provider, ...updates, updatedAt: new Date() };
    this.aiProviders.set(id, updatedProvider);
    return updatedProvider;
  }

  // Feedback methods
  async getFeedback(): Promise<any[]> {
    return Array.from(this.feedback.values());
  }

  async createFeedback(feedback: any): Promise<any> {
    const id = randomUUID();
    const newFeedback = { 
      ...feedback, 
      id, 
      attorneyId: Array.from(this.attorneys.keys())[0], // Use first attorney for demo
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.feedback.set(id, newFeedback);
    return newFeedback;
  }

  // Dashboard stats
  async getDashboardStats(): Promise<any> {
    const documents = await this.getDocuments();
    const redFlags = await this.getRedFlags();
    const cases = await this.getLegalCases();
    
    return {
      activeCases: cases.filter(c => c.status === 'active').length,
      documentsProcessed: documents.length,
      redFlagsFound: redFlags.length,
      responsesGenerated: 12,
      pendingRequests: 3,
      upcomingDeadlines: 2,
      newConsultations: 2,
      intakeForms: 1,
      monthlyRevenue: 15.3,
      averageResolutionTime: 142,
      lastSync: new Date().toLocaleTimeString()
    };
  }

  private initializeSampleData() {
    // Initialize sample attorney
    const attorneyId = randomUUID();
    const attorney: Attorney = {
      id: attorneyId,
      name: "Mekel S. Miller, Esq.",
      email: "mmiller@example.com",
      specialization: "Family Law Attorney",
      profilePhotoUrl: null,
      clioApiKey: null,
      gmailCredentials: null,
      createdAt: new Date()
    };
    this.attorneys.set(attorneyId, attorney);

    // Initialize sample case
    const caseId = randomUUID();
    const legalCase: LegalCase = {
      id: caseId,
      title: "Johnson v Johnson",
      caseNumber: "21-123456-DM",
      clientName: "Sarah Johnson",
      court: "Oakland County Circuit Court",
      caseType: "Family Law",
      status: "active",
      attorneyId,
      clioMatterId: null,
      balanceDue: 324750,
      unbilledHours: 420,
      procedurePosture: "Discovery phase, emergency motion filed",
      keyFacts: "Divorce proceeding with custody dispute and asset division issues",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.legalCases.set(caseId, legalCase);

    // Initialize sample red flags
    const redFlag1Id = randomUUID();
    const redFlag1: RedFlag = {
      id: redFlag1Id,
      documentId: null,
      caseId,
      type: "allegation",
      description: "New Domestic Violence Allegations: Previously undisclosed incidents mentioned in filing",
      severity: "critical",
      addressed: false,
      createdAt: new Date()
    };
    this.redFlags.set(redFlag1Id, redFlag1);

    const redFlag2Id = randomUUID();
    const redFlag2: RedFlag = {
      id: redFlag2Id,
      documentId: null,
      caseId,
      type: "deadline",
      description: "Emergency Custody Request: Seeking immediate removal of children",
      severity: "critical",
      addressed: false,
      createdAt: new Date()
    };
    this.redFlags.set(redFlag2Id, redFlag2);
  }
}

export const storage = new MemStorage();
