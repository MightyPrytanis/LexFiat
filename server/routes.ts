import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { GmailService } from "./services/gmail";
import { ClioService } from "./services/clio";
import { AnthropicService } from "./services/anthropic";
import { ObjectStorageService } from "./objectStorage";
import { insertDocumentSchema, insertRedFlagSchema } from "@shared/schema";
// @CYRANO_REUSABLE: Component Management Services
import { ComponentScannerService } from './services/component-scanner.js';
import { ComponentDocumentationService } from './services/component-documentation.js';
import { ComponentExportService } from './services/component-export.js';
import { db } from './db.js';
import { reusableComponents, componentScanReports, componentExports, eq } from '../shared/schema.js';

export async function registerRoutes(app: Express): Promise<Server> {
  const anthropicService = new AnthropicService();

  // Attorney profile endpoints
  app.get("/api/attorneys/profile", async (req, res) => {
    try {
      const attorney = await storage.getCurrentAttorney();
      if (!attorney) {
        return res.status(404).json({ message: "Attorney profile not found" });
      }
      res.json(attorney);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Get current attorney (alias for profile)
  app.get("/api/attorneys/current", async (req, res) => {
    try {
      const attorney = await storage.getCurrentAttorney();
      if (!attorney) {
        return res.status(404).json({ message: "No attorney found" });
      }
      res.json(attorney);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Update attorney
  app.patch("/api/attorneys/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const attorney = await storage.updateAttorney(id, req.body);
      if (!attorney) {
        return res.status(404).json({ message: "Attorney not found" });
      }
      res.json(attorney);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Legal cases endpoints
  app.get("/api/cases", async (req, res) => {
    try {
      const cases = await storage.getLegalCases();
      res.json(cases);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/cases/:id", async (req, res) => {
    try {
      const legalCase = await storage.getLegalCase(req.params.id);
      if (!legalCase) {
        return res.status(404).json({ message: "Case not found" });
      }
      res.json(legalCase);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Documents endpoints
  app.get("/api/documents", async (req, res) => {
    try {
      const documents = await storage.getDocuments();
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/documents/:id", async (req, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Red flags endpoints
  app.get("/api/red-flags", async (req, res) => {
    try {
      const redFlags = await storage.getRedFlags();
      res.json(redFlags);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/cases/:caseId/red-flags", async (req, res) => {
    try {
      const redFlags = await storage.getRedFlagsByCase(req.params.caseId);
      res.json(redFlags);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Gmail integration endpoints
  app.post("/api/gmail/sync", async (req, res) => {
    try {
      const attorney = await storage.getCurrentAttorney();
      if (!attorney?.gmailCredentials) {
        return res.status(400).json({ message: "Gmail credentials not configured" });
      }

      const gmailService = new GmailService(attorney.gmailCredentials);
      const messages = await gmailService.getRecentMessages(20);

      const processedDocuments = [];

      for (const message of messages) {
        // Classify the document
        const classification = gmailService.classifyDocument(message);
        
        // Create document record
        const documentData = {
          title: message.subject,
          type: classification.type,
          content: message.body,
          source: 'gmail' as const,
          sourceId: message.id,
          urgencyLevel: classification.urgency,
          caseId: undefined, // Will be determined by matching logic
          attorneyId: attorney.id,
        };

        const validatedData = insertDocumentSchema.parse(documentData);
        const document = await storage.createDocument(validatedData);

        // Analyze document with AI
        const analysis = await anthropicService.analyzeDocument(
          message.body,
          classification.type,
          { classification, urgency: classification.urgency }
        );

        // Create red flags
        for (const redFlag of analysis.redFlags) {
          const redFlagData = {
            documentId: document.id,
            caseId: document.caseId,
            type: redFlag.type,
            description: redFlag.description,
            severity: redFlag.severity,
          };
          
          const validatedRedFlag = insertRedFlagSchema.parse(redFlagData);
          await storage.createRedFlag(validatedRedFlag);
        }

        processedDocuments.push({
          document,
          analysis,
          classification,
        });
      }

      res.json({
        processed: processedDocuments.length,
        documents: processedDocuments,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Document analysis endpoint
  app.post("/api/documents/:id/analyze", async (req, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      const analysis = await anthropicService.analyzeDocument(
        document.content || '',
        document.type,
        { documentId: document.id }
      );

      // Update document as analyzed
      await storage.updateDocument(document.id, { analyzed: true });

      // Create/update red flags
      for (const redFlag of analysis.redFlags) {
        const redFlagData = {
          documentId: document.id,
          caseId: document.caseId,
          type: redFlag.type,
          description: redFlag.description,
          severity: redFlag.severity,
        };
        
        const validatedRedFlag = insertRedFlagSchema.parse(redFlagData);
        await storage.createRedFlag(validatedRedFlag);
      }

      res.json(analysis);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Generate response endpoint
  app.post("/api/documents/:id/generate-response", async (req, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      const redFlags = await storage.getRedFlagsByDocument(document.id);
      
      const response = await anthropicService.generateResponse(
        document.content || '',
        document.type,
        redFlags,
        { documentId: document.id, caseId: document.caseId }
      );

      res.json(response);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Workflow modules endpoints
  app.get("/api/workflow-modules", async (req, res) => {
    try {
      const modules = await storage.getWorkflowModules();
      res.json(modules);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Dashboard stats endpoint
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Demo mode endpoints
  app.post("/api/demo/load", async (req, res) => {
    try {
      const { scenario } = req.body;
      const result = await storage.loadDemoData(scenario);
      res.json(result);
    } catch (error) {
      console.error("Error loading demo data:", error);
      res.status(500).json({ message: "Failed to load demo data" });
    }
  });

  app.post("/api/demo/clear", async (req, res) => {
    try {
      await storage.clearDemoData();
      res.json({ message: "Demo data cleared successfully" });
    } catch (error) {
      console.error("Error clearing demo data:", error);
      res.status(500).json({ message: "Failed to clear demo data" });
    }
  });

  // Object Storage Routes
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/objects/upload", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // AI Providers Routes
  app.get("/api/ai-providers", async (req, res) => {
    try {
      const providers = await storage.getAiProviders();
      res.json(providers);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.post("/api/ai-providers", async (req, res) => {
    try {
      const provider = await storage.createAiProvider(req.body);
      res.status(201).json(provider);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.patch("/api/ai-providers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const provider = await storage.updateAiProvider(id, req.body);
      if (!provider) {
        return res.status(404).json({ message: "AI provider not found" });
      }
      res.json(provider);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Feedback Routes
  app.get("/api/feedback", async (req, res) => {
    try {
      const feedback = await storage.getFeedback();
      res.json(feedback);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.post("/api/feedback", async (req, res) => {
    try {
      const feedback = await storage.createFeedback(req.body);
      res.status(201).json(feedback);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Cross-check analysis
  app.post("/api/documents/:id/cross-check", async (req, res) => {
    try {
      const { id } = req.params;
      const { provider, primaryAnalysisId } = req.body;
      
      // This would integrate with the selected AI provider
      // For now, return a mock response
      const crossCheckResult = {
        confidenceMatch: Math.floor(Math.random() * 30) + 70, // 70-100%
        summary: `Cross-check completed using ${provider}. Analysis shows good alignment with primary findings.`,
        conflicts: Math.random() > 0.7 ? ["Minor discrepancy in urgency assessment"] : [],
      };

      res.json({ success: true, result: crossCheckResult });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Clio integration endpoints
  app.post("/api/clio/sync-matters", async (req, res) => {
    try {
      const attorney = await storage.getCurrentAttorney();
      if (!attorney?.clioApiKey) {
        return res.status(400).json({ message: "Clio API key not configured" });
      }

      const clioService = new ClioService(attorney.clioApiKey);
      const matters = await clioService.getMatters();

      const syncedCases = [];
      for (const matter of matters) {
        const caseData = {
          title: matter.description,
          caseNumber: matter.display_number,
          clientName: matter.client.name,
          court: '',
          caseType: matter.practice_area || 'general',
          attorneyId: attorney.id,
          clioMatterId: matter.id,
          balanceDue: Math.round(matter.outstanding_balance * 100), // Convert to cents
          unbilledHours: Math.round(matter.billable_hours * 100), // Convert to minutes * 100
        };

        const existingCase = await storage.getLegalCaseByClio(matter.id);
        if (!existingCase) {
          const newCase = await storage.createLegalCase(caseData);
          syncedCases.push(newCase);
        }
      }

      res.json({
        synced: syncedCases.length,
        total: matters.length,
        cases: syncedCases,
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // @CYRANO_REUSABLE: Component Management Routes
  // List all reusable components
  app.get("/api/components/reusable", async (req, res) => {
    try {
      const components = await db.select().from(reusableComponents);
      res.json(components);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Get specific reusable component
  app.get("/api/components/reusable/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const component = await db
        .select()
        .from(reusableComponents)
        .where(eq(reusableComponents.id, id))
        .limit(1);
      
      if (component.length === 0) {
        return res.status(404).json({ message: "Component not found" });
      }
      
      res.json(component[0]);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Scan for reusable components
  app.post("/api/components/scan", async (req, res) => {
    try {
      const { scanType = 'full_scan' } = req.body;
      const scanner = new ComponentScannerService();
      const scanId = await scanner.scanForReusableComponents(scanType);
      
      res.json({ 
        success: true, 
        scanId, 
        message: "Component scan initiated" 
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Get scan reports
  app.get("/api/components/scan-reports", async (req, res) => {
    try {
      const reports = await db.select().from(componentScanReports);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Generate documentation for components
  app.post("/api/components/generate-docs", async (req, res) => {
    try {
      const docService = new ComponentDocumentationService();
      const documentationPaths = await docService.generateAllDocumentation();
      
      res.json({ 
        success: true, 
        generatedDocs: documentationPaths.length,
        paths: documentationPaths 
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Generate documentation for specific component
  app.post("/api/components/:id/generate-docs", async (req, res) => {
    try {
      const { id } = req.params;
      const docService = new ComponentDocumentationService();
      const documentationPath = await docService.generateComponentDocumentation(id);
      
      res.json({ 
        success: true, 
        documentationPath 
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Export component for Cyrano MCP
  app.post("/api/components/:id/export", async (req, res) => {
    try {
      const { id } = req.params;
      const exportOptions = req.body;
      const exportService = new ComponentExportService();
      const result = await exportService.exportComponent(id, exportOptions);
      
      res.json({ 
        success: true, 
        result 
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Batch export components
  app.post("/api/components/export-batch", async (req, res) => {
    try {
      const { componentIds, exportOptions } = req.body;
      const exportService = new ComponentExportService();
      const results = await exportService.exportBatch(componentIds, exportOptions);
      
      res.json({ 
        success: true, 
        results 
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Get export history
  app.get("/api/components/exports", async (req, res) => {
    try {
      const exports = await db.select().from(componentExports);
      res.json(exports);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Perform security scan on component
  app.post("/api/components/:id/security-scan", async (req, res) => {
    try {
      const { id } = req.params;
      const scanner = new ComponentScannerService();
      const result = await scanner.performSecurityScan(id);
      
      res.json({ 
        success: true, 
        securityScanResult: result 
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Update component manually (for flagging/tagging)
  app.patch("/api/components/reusable/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const result = await db
        .update(reusableComponents)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(eq(reusableComponents.id, id))
        .returning();
      
      if (result.length === 0) {
        return res.status(404).json({ message: "Component not found" });
      }
      
      res.json(result[0]);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
