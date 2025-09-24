import { 
  type Attorney, 
  type LegalCase, 
  type Document, 
  type RedFlag, 
  type WorkflowModule,
  type MaeWorkflow,
  type MaeWorkflowStep,
  type MaeWorkflowExecution,
  type InsertAttorney,
  type InsertLegalCase,
  type InsertDocument,
  type InsertRedFlag,
  type InsertMaeWorkflow,
  type InsertMaeWorkflowStep,
  type InsertMaeWorkflowExecution
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
  
  // MAE Workflows methods
  getMaeWorkflows(): Promise<MaeWorkflow[]>;
  getMaeWorkflow(id: string): Promise<MaeWorkflow | undefined>;
  createMaeWorkflow(workflow: InsertMaeWorkflow): Promise<MaeWorkflow>;
  updateMaeWorkflow(id: string, updates: Partial<MaeWorkflow>): Promise<MaeWorkflow | undefined>;
  deleteMaeWorkflow(id: string): Promise<boolean>;
  
  // MAE Workflow Steps methods
  getMaeWorkflowSteps(workflowId: string): Promise<MaeWorkflowStep[]>;
  createMaeWorkflowStep(step: InsertMaeWorkflowStep): Promise<MaeWorkflowStep>;
  updateMaeWorkflowStep(id: string, updates: Partial<MaeWorkflowStep>): Promise<MaeWorkflowStep | undefined>;
  
  // MAE Workflow Executions methods
  getMaeWorkflowExecutions(): Promise<MaeWorkflowExecution[]>;
  getMaeWorkflowExecution(id: string): Promise<MaeWorkflowExecution | undefined>;
  getMaeWorkflowExecutionsByCase(caseId: string): Promise<MaeWorkflowExecution[]>;
  createMaeWorkflowExecution(execution: InsertMaeWorkflowExecution): Promise<MaeWorkflowExecution>;
  updateMaeWorkflowExecution(id: string, updates: Partial<MaeWorkflowExecution>): Promise<MaeWorkflowExecution | undefined>;
  
  // AI Providers methods
  getAiProviders(): Promise<any[]>;
  createAiProvider(provider: any): Promise<any>;
  updateAiProvider(id: string, updates: any): Promise<any>;
  
  // Feedback methods
  getFeedback(): Promise<any[]>;
  createFeedback(feedback: any): Promise<any>;
  
  // Dashboard stats
  getDashboardStats(): Promise<any>;

  // Demo Mode
  loadDemoData(scenario: string): Promise<{ casesLoaded: number; documentsLoaded: number; redFlagsLoaded: number }>;
  clearDemoData(): Promise<void>;
}

export class MemStorage implements IStorage {
  private attorneys: Map<string, Attorney>;
  private legalCases: Map<string, LegalCase>;
  private documents: Map<string, Document>;
  private redFlags: Map<string, RedFlag>;
  private workflowModules: Map<string, WorkflowModule>;
  private aiProviders: Map<string, any>;
  private feedback: Map<string, any>;
  private maeWorkflows: Map<string, MaeWorkflow>;
  private maeWorkflowSteps: Map<string, MaeWorkflowStep>;
  private maeWorkflowExecutions: Map<string, MaeWorkflowExecution>;

  constructor() {
    this.attorneys = new Map();
    this.legalCases = new Map();
    this.documents = new Map();
    this.redFlags = new Map();
    this.workflowModules = new Map();
    this.aiProviders = new Map();
    this.feedback = new Map();
    this.maeWorkflows = new Map();
    this.maeWorkflowSteps = new Map();
    this.maeWorkflowExecutions = new Map();
    
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

    // Initialize AI providers
    const aiProviderData = [
      {
        provider: 'perplexity',
        name: 'Perplexity',
        enabled: true,
        models: ['llama-3.1-sonar-large-128k-online', 'llama-3.1-sonar-small-128k-online', 'llama-3.1-8b-instruct'],
        currentModel: 'llama-3.1-sonar-large-128k-online',
        priority: 1,
        description: 'Research-focused AI with real-time web access'
      },
      {
        provider: 'anthropic',
        name: 'Claude (Anthropic)',
        enabled: false,
        models: ['claude-sonnet-4-20250514', 'claude-3-7-sonnet-20250219', 'claude-3-5-sonnet-20241022'],
        currentModel: 'claude-sonnet-4-20250514',
        priority: 2,
        description: 'Advanced reasoning and analysis capabilities'
      },
      {
        provider: 'openai',
        name: 'OpenAI GPT',
        enabled: false,
        models: ['gpt-4o', 'gpt-4', 'gpt-3.5-turbo'],
        currentModel: 'gpt-4o',
        priority: 3,
        description: 'General-purpose language model with broad knowledge'
      },
      {
        provider: 'gemini',
        name: 'Gemini (Google)',
        enabled: false,
        models: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash-preview'],
        currentModel: 'gemini-2.5-flash',
        priority: 4,
        description: 'Multimodal AI with document and image analysis'
      },
      {
        provider: 'grok',
        name: 'Grok (xAI)',
        enabled: false,
        models: ['grok-2', 'grok-2-mini', 'grok-1.5'],
        currentModel: 'grok-2',
        priority: 5,
        description: 'xAI\'s conversational AI with real-time information'
      },
      {
        provider: 'deepseek',
        name: 'DeepSeek',
        enabled: false,
        models: ['deepseek-chat', 'deepseek-coder', 'deepseek-math'],
        currentModel: 'deepseek-chat',
        priority: 6,
        description: 'Advanced AI models for reasoning and coding'
      },
      {
        provider: 'mapleai',
        name: 'MapleAI',
        enabled: false,
        models: ['maple-chat', 'maple-reasoning'],
        currentModel: 'maple-chat',
        priority: 7,
        description: 'Canadian-developed AI with focus on reasoning'
      }
    ];

    aiProviderData.forEach(provider => {
      const id = randomUUID();
      const aiProvider = {
        ...provider,
        id,
        attorneyId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.aiProviders.set(id, aiProvider);
    });
  }

  // MAE Workflows methods
  async getMaeWorkflows(): Promise<MaeWorkflow[]> {
    return Array.from(this.maeWorkflows.values());
  }

  async getMaeWorkflow(id: string): Promise<MaeWorkflow | undefined> {
    return this.maeWorkflows.get(id);
  }

  async createMaeWorkflow(insertWorkflow: InsertMaeWorkflow): Promise<MaeWorkflow> {
    const id = randomUUID();
    const workflow: MaeWorkflow = {
      ...insertWorkflow,
      id,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.maeWorkflows.set(id, workflow);
    return workflow;
  }

  async updateMaeWorkflow(id: string, updates: Partial<MaeWorkflow>): Promise<MaeWorkflow | undefined> {
    const workflow = this.maeWorkflows.get(id);
    if (!workflow) return undefined;
    
    const updatedWorkflow = { ...workflow, ...updates, updatedAt: new Date() };
    this.maeWorkflows.set(id, updatedWorkflow);
    return updatedWorkflow;
  }

  async deleteMaeWorkflow(id: string): Promise<boolean> {
    return this.maeWorkflows.delete(id);
  }

  // MAE Workflow Steps methods
  async getMaeWorkflowSteps(workflowId: string): Promise<MaeWorkflowStep[]> {
    return Array.from(this.maeWorkflowSteps.values())
      .filter(step => step.workflowId === workflowId)
      .sort((a, b) => a.stepOrder - b.stepOrder);
  }

  async createMaeWorkflowStep(insertStep: InsertMaeWorkflowStep): Promise<MaeWorkflowStep> {
    const id = randomUUID();
    const step: MaeWorkflowStep = {
      ...insertStep,
      id,
      isCompleted: false,
      createdAt: new Date()
    };
    this.maeWorkflowSteps.set(id, step);
    return step;
  }

  async updateMaeWorkflowStep(id: string, updates: Partial<MaeWorkflowStep>): Promise<MaeWorkflowStep | undefined> {
    const step = this.maeWorkflowSteps.get(id);
    if (!step) return undefined;
    
    const updatedStep = { ...step, ...updates };
    this.maeWorkflowSteps.set(id, updatedStep);
    return updatedStep;
  }

  // MAE Workflow Executions methods
  async getMaeWorkflowExecutions(): Promise<MaeWorkflowExecution[]> {
    return Array.from(this.maeWorkflowExecutions.values());
  }

  async getMaeWorkflowExecution(id: string): Promise<MaeWorkflowExecution | undefined> {
    return this.maeWorkflowExecutions.get(id);
  }

  async getMaeWorkflowExecutionsByCase(caseId: string): Promise<MaeWorkflowExecution[]> {
    return Array.from(this.maeWorkflowExecutions.values())
      .filter(execution => execution.caseId === caseId);
  }

  async createMaeWorkflowExecution(insertExecution: InsertMaeWorkflowExecution): Promise<MaeWorkflowExecution> {
    const id = randomUUID();
    const execution: MaeWorkflowExecution = {
      ...insertExecution,
      id,
      startedAt: new Date(),
      completedAt: null,
      createdAt: new Date()
    };
    this.maeWorkflowExecutions.set(id, execution);
    return execution;
  }

  async updateMaeWorkflowExecution(id: string, updates: Partial<MaeWorkflowExecution>): Promise<MaeWorkflowExecution | undefined> {
    const execution = this.maeWorkflowExecutions.get(id);
    if (!execution) return undefined;
    
    const updatedExecution = { ...execution, ...updates };
    if (updates.status === 'completed' && !updatedExecution.completedAt) {
      updatedExecution.completedAt = new Date();
    }
    this.maeWorkflowExecutions.set(id, updatedExecution);
    return updatedExecution;
  }

  // Demo Mode Methods
  async loadDemoData(scenario: string): Promise<{ casesLoaded: number; documentsLoaded: number; redFlagsLoaded: number }> {
    // Clear existing demo data first
    await this.clearDemoData();

    const demoData = this.generateDemoDataForScenario(scenario);
    
    // Track loaded items and link them properly
    const loadedCases: LegalCase[] = [];
    const loadedDocuments: Document[] = [];
    
    // Load demo cases
    for (const demoCase of demoData.cases) {
      const createdCase = await this.createLegalCase(demoCase);
      loadedCases.push(createdCase);
    }

    // Load demo documents and link to cases
    for (let i = 0; i < demoData.documents.length; i++) {
      const demoDoc = demoData.documents[i];
      const linkedCase = loadedCases[Math.min(i, loadedCases.length - 1)];
      
      const documentWithCase = {
        ...demoDoc,
        caseId: linkedCase.id,
        attorneyId: linkedCase.attorneyId
      };
      
      const createdDocument = await this.createDocument(documentWithCase);
      loadedDocuments.push(createdDocument);
    }

    // Load demo red flags and link to cases/documents
    for (let i = 0; i < demoData.redFlags.length; i++) {
      const demoFlag = demoData.redFlags[i];
      const linkedCase = loadedCases[Math.min(i % loadedCases.length, loadedCases.length - 1)];
      const linkedDocument = loadedDocuments[Math.min(i % loadedDocuments.length, loadedDocuments.length - 1)];
      
      const redFlagWithLinks = {
        ...demoFlag,
        caseId: linkedCase?.id || null,
        documentId: i < loadedDocuments.length ? linkedDocument?.id || null : null
      };
      
      await this.createRedFlag(redFlagWithLinks);
    }

    return {
      casesLoaded: demoData.cases.length,
      documentsLoaded: demoData.documents.length,
      redFlagsLoaded: demoData.redFlags.length,
    };
  }

  async clearDemoData(): Promise<void> {
    // Clear all existing data (keeping the structure for a fresh demo)
    this.legalCases.clear();
    this.documents.clear();
    this.redFlags.clear();
    
    // Reinitialize with minimal sample data
    this.initializeSampleData();
  }

  private generateDemoDataForScenario(scenario: string) {
    const baseId = () => randomUUID();
    const now = new Date();
    
    switch (scenario) {
      case "family-law-crisis":
        return {
          cases: [
            {
              title: "Johnson v. Johnson - Emergency Custody Modification",
              description: "Urgent custody modification due to concerning behavioral patterns and missed visitations",
              caseType: "Family Law",
              status: "active",
              priority: "high",
              clientName: "Sarah Johnson",
              clientEmail: "sarah.johnson@email.com",
              deadlineDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
              balanceDue: 2850,
              unbilledHours: 12.5
            }
          ],
          documents: [
            {
              title: "Frantic Email from Sarah Johnson",
              content: "Attorney Miller, I'm EXTREMELY worried about my children. John missed another pickup yesterday and when he did show up Sunday, Emma came home with bruises on her arm. She won't talk about what happened but she's been having nightmares. I've documented everything with photos. We need to file for emergency custody modification IMMEDIATELY. The court hearing is in 3 days and I'm terrified for my kids' safety. Please call me as soon as you get this!",
              type: "email",
              source: "gmail",
              analyzed: true,
              priority: "critical",
              receivedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
            }
          ],
          redFlags: [
            {
              type: "deadline_critical",
              description: "Emergency custody hearing in 3 days - immediate action required",
              severity: "critical",
              caseId: null,
              documentId: null
            },
            {
              type: "child_safety",
              description: "Documented physical injuries to minor child with unexplained bruising patterns",
              severity: "critical",
              caseId: null,
              documentId: null
            },
            {
              type: "client_emotional_state",
              description: "Client displaying extreme distress requiring immediate support",
              severity: "high",
              caseId: null,
              documentId: null
            }
          ]
        };

      case "probate-complexity":
        return {
          cases: [
            {
              title: "Estate of Margaret Hartley - Contested Probate",
              description: "Complex estate administration with contested will, multiple beneficiaries, and significant real estate holdings",
              caseType: "Probate",
              status: "active", 
              priority: "high",
              clientName: "Robert Hartley (Personal Representative)",
              clientEmail: "robert.hartley@email.com",
              deadlineDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
              balanceDue: 15750,
              unbilledHours: 28.5
            }
          ],
          documents: [
            {
              title: "Will Contest Filing - Patricia Hartley vs Estate",
              content: "Notice of Contest to Will filed by Patricia Hartley, daughter of deceased. Contesting validity of 2023 will amendment that reduces her inheritance from 40% to 15% of estate. Claims undue influence by brother Robert Hartley who became primary beneficiary. Estate valued at $2.3M including prime commercial real estate.",
              type: "court_filing",
              source: "court_system",
              analyzed: true,
              priority: "high",
              receivedAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
            }
          ],
          redFlags: [
            {
              type: "will_contest",
              description: "Active will contest filed by beneficiary claiming undue influence",
              severity: "high",
              caseId: null,
              documentId: null
            },
            {
              type: "asset_valuation",
              description: "Significant estate assets requiring professional valuations and court approvals",
              severity: "medium",
              caseId: null,
              documentId: null
            },
            {
              type: "family_conflict",
              description: "Hostile family dynamics between siblings affecting estate administration",
              severity: "medium",
              caseId: null,
              documentId: null
            }
          ]
        };

      case "comprehensive-workflow":
        return {
          cases: [
            {
              title: "Johnson v. Johnson - Emergency Custody", 
              description: "Urgent custody modification due to concerning behavioral patterns",
              caseType: "Family Law",
              status: "active",
              priority: "critical",
              clientName: "Sarah Johnson",
              clientEmail: "sarah.johnson@email.com",
              deadlineDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
              balanceDue: 2850,
              unbilledHours: 12.5
            },
            {
              title: "Estate of Margaret Hartley",
              description: "Complex estate administration with contested will",
              caseType: "Probate", 
              status: "active",
              priority: "high",
              clientName: "Robert Hartley",
              clientEmail: "robert.hartley@email.com", 
              deadlineDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
              balanceDue: 15750,
              unbilledHours: 28.5
            },
            {
              title: "Towne v. Michigan Department of Transportation",
              description: "Personal injury claim from highway construction zone accident",
              caseType: "Personal Injury",
              status: "active",
              priority: "medium", 
              clientName: "Michael Towne",
              clientEmail: "michael.towne@email.com",
              deadlineDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
              balanceDue: 0,
              unbilledHours: 15.25
            }
          ],
          documents: [
            {
              title: "Urgent Client Email - Sarah Johnson",
              content: "Attorney Miller, John missed another pickup and Emma has bruises. Need emergency custody modification filed immediately. Court hearing in 3 days!",
              type: "email",
              source: "gmail", 
              analyzed: true,
              priority: "critical",
              receivedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
            },
            {
              title: "Will Contest Filing - Hartley Estate",
              content: "Notice of Contest filed by Patricia Hartley challenging will validity due to alleged undue influence. Estate valued at $2.3M.",
              type: "court_filing",
              source: "court_system",
              analyzed: true, 
              priority: "high",
              receivedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
          ],
          redFlags: [
            {
              type: "deadline_critical",
              description: "Emergency custody hearing in 3 days requires immediate filing",
              severity: "critical",
              caseId: null,
              documentId: null
            },
            {
              type: "child_safety",
              description: "Documented injuries to minor child requiring immediate action",
              severity: "critical",
              caseId: null,
              documentId: null
            },
            {
              type: "will_contest",
              description: "Active probate contest may significantly delay estate settlement",
              severity: "high",
              caseId: null,
              documentId: null
            },
            {
              type: "discovery_deadline",
              description: "Outstanding discovery requests require responses within statutory timeframes",
              severity: "medium",
              caseId: null,
              documentId: null
            },
            {
              type: "medical_documentation",
              description: "Critical medical records supporting personal injury claim",
              severity: "medium",
              caseId: null,
              documentId: null
            }
          ]
        };

      default:
        return { cases: [], documents: [], redFlags: [] };
    }
  }
}

export const storage = new MemStorage();
