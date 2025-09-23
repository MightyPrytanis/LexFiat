// @CYRANO_REUSABLE: Component Scanner Service for identifying reusable code components
import { readdir, readFile, stat } from 'fs/promises';
import { join, extname, relative } from 'path';
import { db } from '../db.js';
import { reusableComponents, componentScanReports } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

export interface ComponentAnalysis {
  name: string;
  filePath: string;
  componentType: 'service' | 'component' | 'utility' | 'workflow' | 'parser' | 'validator';
  description: string;
  reusabilityScore: number;
  dependencies: string[];
  apiSurface: {
    exports: string[];
    functions: string[];
    classes: string[];
    interfaces: string[];
  };
  cypherPattern: string;
  cypherCompatibility: number;
  tags: string[];
}

export interface SecurityScanResult {
  vulnerabilities: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    line?: number;
  }>;
  status: 'approved' | 'rejected' | 'needs_review' | 'pending';
}

export class ComponentScannerService {
  private readonly projectRoot: string;
  private readonly excludePatterns: RegExp[];

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
    this.excludePatterns = [
      /node_modules/,
      /\.git/,
      /dist/,
      /build/,
      /coverage/,
      /\.next/,
      /\.vscode/,
      /\.DS_Store/,
      /tmp/,
      /temp/
    ];
  }

  /**
   * @CYRANO_REUSABLE: Main scanning method - identifies all reusable components
   */
  async scanForReusableComponents(scanType: 'full_scan' | 'incremental' | 'security_scan' = 'full_scan'): Promise<string> {
    const startTime = Date.now();
    const scanId = await this.createScanReport(scanType);
    
    try {
      const components: ComponentAnalysis[] = [];
      
      // Scan different directories for different types of components
      const scanTargets = [
        { path: 'server/services', type: 'service' as const },
        { path: 'client/src/components', type: 'component' as const },
        { path: 'client/src/lib', type: 'utility' as const },
        { path: 'shared', type: 'utility' as const },
        { path: 'server', type: 'workflow' as const }
      ];

      for (const target of scanTargets) {
        const targetPath = join(this.projectRoot, target.path);
        try {
          const foundComponents = await this.scanDirectory(targetPath, target.type);
          components.push(...foundComponents);
        } catch (error) {
          console.warn(`Could not scan ${target.path}:`, error);
        }
      }

      // Update database with findings
      let componentsFound = 0;
      let componentsUpdated = 0;
      let cypherCandidates = 0;

      for (const component of components) {
        const existing = await db
          .select()
          .from(reusableComponents)
          .where(eq(reusableComponents.filePath, component.filePath))
          .limit(1);

        if (existing.length > 0) {
          // Update existing component
          await db
            .update(reusableComponents)
            .set({
              ...component,
              lastScanned: new Date(),
              updatedAt: new Date()
            })
            .where(eq(reusableComponents.id, existing[0].id));
          componentsUpdated++;
        } else {
          // Insert new component
          await db.insert(reusableComponents).values({
            ...component,
            flaggedBy: 'auto_scanner',
            lastScanned: new Date()
          });
          componentsFound++;
        }

        if (component.cypherCompatibility >= 70) {
          cypherCandidates++;
        }
      }

      const scanDuration = Date.now() - startTime;
      
      // Update scan report
      await db
        .update(componentScanReports)
        .set({
          status: 'completed',
          componentsFound,
          componentsUpdated,
          cypherCandidates,
          scanDuration,
          results: { totalComponents: components.length, scanTargets }
        })
        .where(eq(componentScanReports.id, scanId));

      return scanId;
    } catch (error) {
      // Update scan report with error
      await db
        .update(componentScanReports)
        .set({
          status: 'failed',
          errors: [{ message: (error as Error).message, timestamp: new Date() }]
        })
        .where(eq(componentScanReports.id, scanId));
      
      throw error;
    }
  }

  /**
   * @CYRANO_REUSABLE: Scans a directory for reusable components
   */
  private async scanDirectory(dirPath: string, defaultType: ComponentAnalysis['componentType']): Promise<ComponentAnalysis[]> {
    const components: ComponentAnalysis[] = [];
    
    try {
      const entries = await readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);
        
        if (this.shouldExclude(fullPath)) {
          continue;
        }

        if (entry.isDirectory()) {
          const subComponents = await this.scanDirectory(fullPath, defaultType);
          components.push(...subComponents);
        } else if (this.isSourceFile(entry.name)) {
          const component = await this.analyzeFile(fullPath, defaultType);
          if (component) {
            components.push(component);
          }
        }
      }
    } catch (error) {
      // Directory might not exist, which is fine
    }
    
    return components;
  }

  /**
   * @CYRANO_REUSABLE: Analyzes a single file for reusability
   */
  private async analyzeFile(filePath: string, defaultType: ComponentAnalysis['componentType']): Promise<ComponentAnalysis | null> {
    try {
      const content = await readFile(filePath, 'utf-8');
      const relativePath = relative(this.projectRoot, filePath);
      
      // Skip files that are too small to be meaningful components
      if (content.length < 200) {
        return null;
      }

      const analysis = this.analyzeCode(content, relativePath, defaultType);
      
      // Only flag components with reasonable reusability scores
      if (analysis.reusabilityScore < 30) {
        return null;
      }

      return analysis;
    } catch (error) {
      console.warn(`Could not analyze file ${filePath}:`, error);
      return null;
    }
  }

  /**
   * @CYRANO_REUSABLE: Analyzes code content for reusability patterns
   */
  private analyzeCode(content: string, filePath: string, defaultType: ComponentAnalysis['componentType']): ComponentAnalysis {
    const lines = content.split('\n');
    let reusabilityScore = 0;
    let cypherCompatibility = 0;
    const dependencies: string[] = [];
    const apiSurface = {
      exports: [] as string[],
      functions: [] as string[],
      classes: [] as string[],
      interfaces: [] as string[]
    };
    const tags: string[] = [];

    // Extract imports/dependencies
    const importRegex = /import.*from\s+['"`]([^'"`]+)['"`]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      dependencies.push(match[1]);
    }

    // Find exports, functions, classes, interfaces
    const exportRegex = /export\s+(?:const|let|var|function|class|interface|type|default)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    while ((match = exportRegex.exec(content)) !== null) {
      apiSurface.exports.push(match[1]);
    }

    const functionRegex = /(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    while ((match = functionRegex.exec(content)) !== null) {
      apiSurface.functions.push(match[1]);
    }

    const classRegex = /(?:export\s+)?class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    while ((match = classRegex.exec(content)) !== null) {
      apiSurface.classes.push(match[1]);
    }

    const interfaceRegex = /(?:export\s+)?interface\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    while ((match = interfaceRegex.exec(content)) !== null) {
      apiSurface.interfaces.push(match[1]);
    }

    // Calculate reusability score based on various factors
    if (apiSurface.exports.length > 0) reusabilityScore += 20;
    if (apiSurface.functions.length > 0) reusabilityScore += 15;
    if (apiSurface.classes.length > 0) reusabilityScore += 15;
    if (apiSurface.interfaces.length > 0) reusabilityScore += 10;
    
    // Penalize for too many dependencies
    if (dependencies.length < 5) reusabilityScore += 10;
    else if (dependencies.length > 10) reusabilityScore -= 10;

    // Look for reusability indicators
    const reusabilityKeywords = [
      'util', 'helper', 'service', 'parser', 'validator', 'transformer',
      'processor', 'handler', 'manager', 'factory', 'builder'
    ];
    
    const fileName = filePath.toLowerCase();
    for (const keyword of reusabilityKeywords) {
      if (fileName.includes(keyword)) {
        reusabilityScore += 15;
        tags.push(keyword);
        break;
      }
    }

    // Check for MCP/Cyrano compatibility patterns
    const mcpPatterns = [
      /async.*function.*\(/g,  // Async functions
      /interface.*\{/g,        // Well-defined interfaces
      /export.*class/g,        // Exportable classes
      /\.json\(/g,             // JSON handling
      /fetch\(/g,              // HTTP requests
      /Promise</g              // Promise handling
    ];

    for (const pattern of mcpPatterns) {
      if (pattern.test(content)) {
        cypherCompatibility += 15;
      }
    }

    // Determine component type based on file path and content
    let componentType = defaultType;
    if (filePath.includes('service')) componentType = 'service';
    else if (filePath.includes('util') || filePath.includes('lib')) componentType = 'utility';
    else if (filePath.includes('component')) componentType = 'component';
    else if (filePath.includes('parser')) componentType = 'parser';
    else if (filePath.includes('validat')) componentType = 'validator';
    else if (filePath.includes('workflow')) componentType = 'workflow';

    // Generate Cypher pattern based on component type
    let cypherPattern = '';
    switch (componentType) {
      case 'service':
        cypherPattern = 'mcp-server-module';
        break;
      case 'utility':
        cypherPattern = 'mcp-utility-function';
        break;
      case 'parser':
        cypherPattern = 'mcp-data-processor';
        cypherCompatibility += 20;
        break;
      case 'validator':
        cypherPattern = 'mcp-input-validator';
        cypherCompatibility += 15;
        break;
      default:
        cypherPattern = 'mcp-generic-module';
    }

    // Extract description from comments
    let description = '';
    const commentMatch = content.match(/\/\*\*?\s*(.*?)\s*\*\//s);
    if (commentMatch) {
      description = commentMatch[1]
        .replace(/\*/g, '')
        .replace(/\n/g, ' ')
        .trim()
        .substring(0, 200);
    }

    if (!description) {
      // Generate description based on filename and exports
      const baseName = filePath.split('/').pop()?.replace(/\.(ts|tsx|js|jsx)$/, '') || 'component';
      description = `${componentType} module containing ${apiSurface.exports.length} exports`;
    }

    return {
      name: filePath.split('/').pop()?.replace(/\.(ts|tsx|js|jsx)$/, '') || 'unknown',
      filePath,
      componentType,
      description,
      reusabilityScore: Math.min(100, reusabilityScore),
      dependencies,
      apiSurface,
      cypherPattern,
      cypherCompatibility: Math.min(100, cypherCompatibility),
      tags
    };
  }

  /**
   * @CYRANO_REUSABLE: Performs security scanning on flagged components
   */
  async performSecurityScan(componentId: string): Promise<SecurityScanResult> {
    const component = await db
      .select()
      .from(reusableComponents)
      .where(eq(reusableComponents.id, componentId))
      .limit(1);

    if (component.length === 0) {
      throw new Error('Component not found');
    }

    const filePath = join(this.projectRoot, component[0].filePath);
    const content = await readFile(filePath, 'utf-8');
    
    const vulnerabilities = this.scanForVulnerabilities(content);
    
    let status: SecurityScanResult['status'] = 'approved';
    if (vulnerabilities.some(v => v.severity === 'critical' || v.severity === 'high')) {
      status = 'needs_review';
    }

    // Update component with security scan results
    await db
      .update(reusableComponents)
      .set({
        securityStatus: status,
        vulnerabilities,
        updatedAt: new Date()
      })
      .where(eq(reusableComponents.id, componentId));

    return { vulnerabilities, status };
  }

  /**
   * @CYRANO_REUSABLE: Scans code for potential security vulnerabilities
   */
  private scanForVulnerabilities(content: string): SecurityScanResult['vulnerabilities'] {
    const vulnerabilities: SecurityScanResult['vulnerabilities'] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      
      // Check for common security issues
      if (/eval\s*\(/.test(line)) {
        vulnerabilities.push({
          type: 'code_injection',
          severity: 'high',
          description: 'Use of eval() can lead to code injection vulnerabilities',
          line: lineNumber
        });
      }

      if (/innerHTML\s*=/.test(line) && !/\.textContent/.test(line)) {
        vulnerabilities.push({
          type: 'xss',
          severity: 'medium',
          description: 'Direct innerHTML assignment may lead to XSS vulnerabilities',
          line: lineNumber
        });
      }

      if (/process\.env\.\w+/.test(line) && !/ANTHROPIC_API_KEY|NODE_ENV/.test(line)) {
        vulnerabilities.push({
          type: 'information_disclosure',
          severity: 'low',
          description: 'Environment variable usage should be reviewed for sensitive data',
          line: lineNumber
        });
      }

      if (/apiKey|password|secret|token/i.test(line) && !/\*\*\*/.test(line)) {
        vulnerabilities.push({
          type: 'hardcoded_secrets',
          severity: 'critical',
          description: 'Potential hardcoded secret or credential',
          line: lineNumber
        });
      }
    });

    return vulnerabilities;
  }

  /**
   * @CYRANO_REUSABLE: Creates a new scan report record
   */
  private async createScanReport(scanType: string): Promise<string> {
    const result = await db.insert(componentScanReports).values({
      scanType,
      status: 'running'
    }).returning({ id: componentScanReports.id });
    
    return result[0].id;
  }

  private shouldExclude(path: string): boolean {
    return this.excludePatterns.some(pattern => pattern.test(path));
  }

  private isSourceFile(fileName: string): boolean {
    const ext = extname(fileName).toLowerCase();
    return ['.ts', '.tsx', '.js', '.jsx'].includes(ext);
  }
}