// @CYRANO_REUSABLE: Documentation Generator for reusable components
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { db } from '../db.js';
import { reusableComponents } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';
import type { ReusableComponent } from '../../shared/schema.js';

export interface ComponentDocumentation {
  component: ReusableComponent;
  documentation: string;
  examples: string[];
  mcpAdaptationGuide: string;
  dependencyAnalysis: {
    required: string[];
    optional: string[];
    conflicting: string[];
  };
}

export class ComponentDocumentationService {
  private readonly projectRoot: string;
  private readonly docsOutputPath: string;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
    this.docsOutputPath = join(projectRoot, 'docs', 'reusable-components');
  }

  /**
   * @CYRANO_REUSABLE: Generates documentation for all flagged components
   */
  async generateAllDocumentation(): Promise<string[]> {
    const components = await db
      .select()
      .from(reusableComponents)
      .where(eq(reusableComponents.exportStatus, 'identified'));

    const documentationPaths: string[] = [];

    for (const component of components) {
      try {
        const docPath = await this.generateComponentDocumentation(component.id);
        documentationPaths.push(docPath);
        
        // Update component status
        await db
          .update(reusableComponents)
          .set({
            exportStatus: 'documented',
            updatedAt: new Date()
          })
          .where(eq(reusableComponents.id, component.id));
      } catch (error) {
        console.error(`Failed to generate documentation for ${component.name}:`, error);
      }
    }

    // Generate master index
    await this.generateMasterIndex(components);

    return documentationPaths;
  }

  /**
   * @CYRANO_REUSABLE: Generates documentation for a specific component
   */
  async generateComponentDocumentation(componentId: string): Promise<string> {
    const component = await db
      .select()
      .from(reusableComponents)
      .where(eq(reusableComponents.id, componentId))
      .limit(1);

    if (component.length === 0) {
      throw new Error('Component not found');
    }

    const comp = component[0];
    const sourceCode = await this.readSourceCode(comp.filePath);
    const docData = await this.analyzeForDocumentation(comp, sourceCode);
    
    const documentation = this.generateMarkdown(docData);
    const outputPath = join(this.docsOutputPath, `${comp.name}.md`);
    
    // Ensure directory exists
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, documentation, 'utf-8');

    return outputPath;
  }

  /**
   * @CYRANO_REUSABLE: Reads and analyzes source code for documentation
   */
  private async analyzeForDocumentation(component: ReusableComponent, sourceCode: string): Promise<ComponentDocumentation> {
    const examples = this.extractCodeExamples(sourceCode);
    const mcpAdaptationGuide = this.generateMCPAdaptationGuide(component, sourceCode);
    const dependencyAnalysis = this.analyzeDependencies(component, sourceCode);

    return {
      component,
      documentation: sourceCode,
      examples,
      mcpAdaptationGuide,
      dependencyAnalysis
    };
  }

  /**
   * @CYRANO_REUSABLE: Extracts code examples from source
   */
  private extractCodeExamples(sourceCode: string): string[] {
    const examples: string[] = [];
    
    // Look for example comments or test patterns
    const exampleRegex = /\/\*\s*Example:?\s*([\s\S]*?)\*\//gi;
    let match;
    while ((match = exampleRegex.exec(sourceCode)) !== null) {
      examples.push(match[1].trim());
    }

    // Extract function usage patterns
    const functionRegex = /export\s+(?:async\s+)?function\s+(\w+)\s*\([^)]*\)/g;
    while ((match = functionRegex.exec(sourceCode)) !== null) {
      const functionName = match[1];
      const example = `// Usage example for ${functionName}\nconst result = await ${functionName}(/* parameters */);`;
      examples.push(example);
    }

    return examples;
  }

  /**
   * @CYRANO_REUSABLE: Generates MCP adaptation guide
   */
  private generateMCPAdaptationGuide(component: ReusableComponent, sourceCode: string): string {
    const guide = [];
    
    guide.push('## MCP Module Adaptation Guide\n');
    
    // Based on component type, provide specific guidance
    switch (component.componentType) {
      case 'service':
        guide.push('### Service Adaptation');
        guide.push('This service can be adapted as an MCP server module:');
        guide.push('1. Wrap the service class in an MCP server handler');
        guide.push('2. Define tool schemas for each public method');
        guide.push('3. Handle async operations with proper error handling');
        guide.push('4. Add input validation using the existing interfaces\n');
        break;
        
      case 'utility':
        guide.push('### Utility Function Adaptation');
        guide.push('This utility can be integrated as MCP tools:');
        guide.push('1. Export each function as a separate MCP tool');
        guide.push('2. Add parameter validation schemas');
        guide.push('3. Ensure functions are pure or handle side effects properly');
        guide.push('4. Add comprehensive error handling\n');
        break;
        
      case 'parser':
        guide.push('### Parser Adaptation');
        guide.push('This parser is highly suitable for MCP integration:');
        guide.push('1. Create MCP tools for different parsing operations');
        guide.push('2. Support streaming for large data processing');
        guide.push('3. Add format validation and error reporting');
        guide.push('4. Consider memory optimization for large files\n');
        break;
        
      case 'validator':
        guide.push('### Validator Adaptation');
        guide.push('This validator can enhance MCP input validation:');
        guide.push('1. Integrate with MCP parameter validation');
        guide.push('2. Provide detailed error messages');
        guide.push('3. Support schema evolution and versioning');
        guide.push('4. Add performance optimizations for bulk validation\n');
        break;
        
      default:
        guide.push('### General Adaptation');
        guide.push('This component can be adapted for MCP:');
        guide.push('1. Identify the core functionality to expose');
        guide.push('2. Define clear input/output schemas');
        guide.p
('3. Add proper error handling and logging');
        guide.push('4. Ensure compatibility with MCP standards\n');
    }
    
    // Add specific technical considerations
    guide.push('### Technical Considerations');
    guide.push(`- **Cypher Compatibility Score**: ${component.cypherCompatibility}/100`);
    guide.push(`- **Reusability Score**: ${component.reusabilityScore}/100`);
    guide.push(`- **Security Status**: ${component.securityStatus}`);
    
    if (component.dependencies && Array.isArray(component.dependencies)) {
      guide.push(`- **Dependencies**: ${component.dependencies.length} external dependencies`);
    }
    
    guide.push('\n### Recommended MCP Pattern');
    guide.push(`**Pattern**: ${component.cypherPattern}`);
    
    return guide.join('\n');
  }

  /**
   * @CYRANO_REUSABLE: Analyzes component dependencies
   */
  private analyzeDependencies(component: ReusableComponent, sourceCode: string): ComponentDocumentation['dependencyAnalysis'] {
    const dependencies = component.dependencies as string[] || [];
    
    const required: string[] = [];
    const optional: string[] = [];
    const conflicting: string[] = [];
    
    const mcpConflicts = ['react', 'react-dom', 'next', 'express'];
    const mcpOptional = ['zod', 'typescript', 'lodash', 'date-fns'];
    
    for (const dep of dependencies) {
      if (mcpConflicts.some(conflict => dep.includes(conflict))) {
        conflicting.push(dep);
      } else if (mcpOptional.some(opt => dep.includes(opt))) {
        optional.push(dep);
      } else {
        required.push(dep);
      }
    }
    
    return { required, optional, conflicting };
  }

  /**
   * @CYRANO_REUSABLE: Generates markdown documentation
   */
  private generateMarkdown(docData: ComponentDocumentation): string {
    const { component, examples, mcpAdaptationGuide, dependencyAnalysis } = docData;
    
    const md = [];
    
    // Header
    md.push(`# ${component.name}`);
    md.push(`**Type**: ${component.componentType}`);
    md.push(`**File**: ${component.filePath}`);
    md.push(`**Reusability Score**: ${component.reusabilityScore}/100`);
    md.push(`**Generated**: ${new Date().toISOString()}\n`);
    
    // Description
    md.push('## Description');
    md.push(component.description || 'No description available');
    md.push('');
    
    // API Surface
    if (component.apiSurface) {
      const apiSurface = component.apiSurface as any;
      md.push('## API Surface');
      
      if (apiSurface.exports?.length > 0) {
        md.push('### Exports');
        apiSurface.exports.forEach((exp: string) => md.push(`- \`${exp}\``));
        md.push('');
      }
      
      if (apiSurface.functions?.length > 0) {
        md.push('### Functions');
        apiSurface.functions.forEach((func: string) => md.push(`- \`${func}()\``));
        md.push('');
      }
      
      if (apiSurface.classes?.length > 0) {
        md.push('### Classes');
        apiSurface.classes.forEach((cls: string) => md.push(`- \`${cls}\``));
        md.push('');
      }
      
      if (apiSurface.interfaces?.length > 0) {
        md.push('### Interfaces');
        apiSurface.interfaces.forEach((iface: string) => md.push(`- \`${iface}\``));
        md.push('');
      }
    }
    
    // Examples
    if (examples.length > 0) {
      md.push('## Usage Examples');
      examples.forEach((example, index) => {
        md.push(`### Example ${index + 1}`);
        md.push('```typescript');
        md.push(example);
        md.push('```\n');
      });
    }
    
    // Dependencies
    md.push('## Dependencies');
    md.push('### Required Dependencies');
    if (dependencyAnalysis.required.length > 0) {
      dependencyAnalysis.required.forEach(dep => md.push(`- ${dep}`));
    } else {
      md.push('- None');
    }
    md.push('');
    
    md.push('### Optional Dependencies');
    if (dependencyAnalysis.optional.length > 0) {
      dependencyAnalysis.optional.forEach(dep => md.push(`- ${dep}`));
    } else {
      md.push('- None');
    }
    md.push('');
    
    if (dependencyAnalysis.conflicting.length > 0) {
      md.push('### Conflicting Dependencies (MCP)');
      dependencyAnalysis.conflicting.forEach(dep => md.push(`- ⚠️ ${dep}`));
      md.push('');
    }
    
    // MCP Adaptation Guide
    md.push(mcpAdaptationGuide);
    
    // Security Information
    if (component.securityStatus !== 'pending') {
      md.push('## Security Analysis');
      md.push(`**Status**: ${component.securityStatus}`);
      
      if (component.vulnerabilities) {
        const vulns = component.vulnerabilities as any[];
        if (vulns.length > 0) {
          md.push('### Identified Issues');
          vulns.forEach(vuln => {
            md.push(`- **${vuln.severity.toUpperCase()}**: ${vuln.description}`);
            if (vuln.line) md.push(`  - Line: ${vuln.line}`);
          });
        } else {
          md.push('No security issues identified.');
        }
        md.push('');
      }
    }
    
    // Tags
    if (component.tags && Array.isArray(component.tags) && component.tags.length > 0) {
      md.push('## Tags');
      (component.tags as string[]).forEach(tag => md.push(`- ${tag}`));
      md.push('');
    }
    
    // Metadata
    md.push('## Metadata');
    md.push(`- **Component ID**: ${component.id}`);
    md.push(`- **Last Scanned**: ${component.lastScanned}`);
    md.push(`- **Flagged By**: ${component.flaggedBy}`);
    md.push(`- **Export Status**: ${component.exportStatus}`);
    
    return md.join('\n');
  }

  /**
   * @CYRANO_REUSABLE: Generates master index of all components
   */
  private async generateMasterIndex(components: ReusableComponent[]): Promise<void> {
    const md = [];
    
    md.push('# Reusable Components Index');
    md.push(`Generated: ${new Date().toISOString()}\n`);
    
    md.push('## Summary');
    md.push(`Total Components: ${components.length}`);
    
    const byType = components.reduce((acc, comp) => {
      acc[comp.componentType] = (acc[comp.componentType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    md.push('\n### By Type');
    Object.entries(byType).forEach(([type, count]) => {
      md.push(`- **${type}**: ${count}`);
    });
    
    const cypherCandidates = components.filter(c => c.cypherCompatibility >= 70);
    md.push(`\n### Cyrano MCP Candidates: ${cypherCandidates.length}`);
    
    md.push('\n## Components\n');
    
    // Group by type
    const grouped = components.reduce((acc, comp) => {
      if (!acc[comp.componentType]) acc[comp.componentType] = [];
      acc[comp.componentType].push(comp);
      return acc;
    }, {} as Record<string, ReusableComponent[]>);
    
    Object.entries(grouped).forEach(([type, comps]) => {
      md.push(`### ${type.charAt(0).toUpperCase() + type.slice(1)} Components\n`);
      
      comps.forEach(comp => {
        md.push(`#### [${comp.name}](./${comp.name}.md)`);
        md.push(`**Path**: ${comp.filePath}`);
        md.push(`**Reusability**: ${comp.reusabilityScore}/100`);
        md.push(`**Cypher Compatibility**: ${comp.cypherCompatibility}/100`);
        md.push(`**Status**: ${comp.exportStatus}`);
        if (comp.description) {
          md.push(`**Description**: ${comp.description.substring(0, 100)}...`);
        }
        md.push('');
      });
    });
    
    const indexPath = join(this.docsOutputPath, 'README.md');
    await mkdir(dirname(indexPath), { recursive: true });
    await writeFile(indexPath, md.join('\n'), 'utf-8');
  }

  /**
   * @CYRANO_REUSABLE: Reads source code from file path
   */
  private async readSourceCode(filePath: string): Promise<string> {
    const fullPath = join(this.projectRoot, filePath);
    return await readFile(fullPath, 'utf-8');
  }
}