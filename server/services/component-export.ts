// @CYRANO_REUSABLE: Component Export Service for extracting reusable components
import { readFile, writeFile, mkdir, cp } from 'fs/promises';
import { join, dirname, basename } from 'path';
import { db } from '../db.js';
import { reusableComponents, componentExports } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';
import type { ReusableComponent } from '../../shared/schema.js';

export interface ExportOptions {
  format: 'mcp_module' | 'standalone' | 'library';
  includeTests: boolean;
  includeDocs: boolean;
  adaptForCyrano: boolean;
  outputPath: string;
}

export interface ExportResult {
  exportId: string;
  outputPath: string;
  adaptations: Array<{
    type: string;
    description: string;
    file: string;
  }>;
  metadata: {
    originalComponent: ReusableComponent;
    exportedAt: Date;
    fileCount: number;
    totalSize: number;
  };
}

export class ComponentExportService {
  private readonly projectRoot: string;
  private readonly defaultExportPath: string;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
    this.defaultExportPath = join(projectRoot, 'exports', 'cyrano-components');
  }

  /**
   * @CYRANO_REUSABLE: Exports a component for Cyrano MCP integration
   */
  async exportComponent(componentId: string, options: Partial<ExportOptions> = {}): Promise<ExportResult> {
    const component = await db
      .select()
      .from(reusableComponents)
      .where(eq(reusableComponents.id, componentId))
      .limit(1);

    if (component.length === 0) {
      throw new Error('Component not found');
    }

    const comp = component[0];
    const exportOptions: ExportOptions = {
      format: 'mcp_module',
      includeTests: true,
      includeDocs: true,
      adaptForCyrano: true,
      outputPath: join(this.defaultExportPath, comp.name),
      ...options
    };

    // Create export record
    const exportRecord = await db.insert(componentExports).values({
      componentId: comp.id,
      exportPath: exportOptions.outputPath,
      exportFormat: exportOptions.format,
      status: 'pending'
    }).returning({ id: componentExports.id });

    const exportId = exportRecord[0].id;

    try {
      const result = await this.performExport(comp, exportOptions, exportId);
      
      // Update export record
      await db
        .update(componentExports)
        .set({
          status: 'completed',
          adaptations: result.adaptations,
          exportMetadata: result.metadata
        })
        .where(eq(componentExports.id, exportId));

      // Update component status
      await db
        .update(reusableComponents)
        .set({
          exportStatus: 'exported',
          updatedAt: new Date()
        })
        .where(eq(reusableComponents.id, comp.id));

      return result;
    } catch (error) {
      // Update export record with error
      await db
        .update(componentExports)
        .set({
          status: 'failed'
        })
        .where(eq(componentExports.id, exportId));
      
      throw error;
    }
  }

  /**
   * @CYRANO_REUSABLE: Exports multiple components as a batch
   */
  async exportBatch(componentIds: string[], options: Partial<ExportOptions> = {}): Promise<ExportResult[]> {
    const results: ExportResult[] = [];
    
    for (const componentId of componentIds) {
      try {
        const result = await this.exportComponent(componentId, options);
        results.push(result);
      } catch (error) {
        console.error('Failed to export component %s:', componentId, error);
      }
    }
    
    return results;
  }

  /**
   * @CYRANO_REUSABLE: Performs the actual export process
   */
  private async performExport(
    component: ReusableComponent, 
    options: ExportOptions, 
    exportId: string
  ): Promise<ExportResult> {
    const outputPath = options.outputPath;
    const adaptations: ExportResult['adaptations'] = [];
    
    // Ensure output directory exists
    await mkdir(outputPath, { recursive: true });

    // Read original source code
    const sourceFile = join(this.projectRoot, component.filePath);
    const originalCode = await readFile(sourceFile, 'utf-8');

    let adaptedCode = originalCode;
    let fileCount = 1;
    let totalSize = originalCode.length;

    // Apply adaptations based on format
    switch (options.format) {
      case 'mcp_module':
        adaptedCode = await this.adaptForMCPModule(component, originalCode, adaptations);
        break;
      case 'standalone':
        adaptedCode = await this.adaptForStandalone(component, originalCode, adaptations);
        break;
      case 'library':
        adaptedCode = await this.adaptForLibrary(component, originalCode, adaptations);
        break;
    }

    // Write main component file
    const mainFileName = `${component.name}.ts`;
    const mainFilePath = join(outputPath, mainFileName);
    await writeFile(mainFilePath, adaptedCode, 'utf-8');
    totalSize = adaptedCode.length;

    // Generate package.json for MCP modules
    if (options.format === 'mcp_module') {
      const packageJson = this.generatePackageJson(component);
      const packagePath = join(outputPath, 'package.json');
      await writeFile(packagePath, JSON.stringify(packageJson, null, 2), 'utf-8');
      fileCount++;
      totalSize += JSON.stringify(packageJson).length;
    }

    // Generate MCP server wrapper
    if (options.format === 'mcp_module') {
      const serverCode = this.generateMCPServerWrapper(component);
      const serverPath = join(outputPath, 'server.ts');
      await writeFile(serverPath, serverCode, 'utf-8');
      fileCount++;
      totalSize += serverCode.length;
      
      adaptations.push({
        type: 'mcp_server_wrapper',
        description: 'Generated MCP server wrapper for the component',
        file: 'server.ts'
      });
    }

    // Include documentation if requested
    if (options.includeDocs) {
      const readmePath = join(outputPath, 'README.md');
      const readme = await this.generateExportReadme(component, options, adaptations);
      await writeFile(readmePath, readme, 'utf-8');
      fileCount++;
      totalSize += readme.length;
    }

    // Copy dependencies if they exist in the project
    if (component.dependencies && Array.isArray(component.dependencies)) {
      await this.copyLocalDependencies(component.dependencies as string[], outputPath);
    }

    return {
      exportId,
      outputPath,
      adaptations,
      metadata: {
        originalComponent: component,
        exportedAt: new Date(),
        fileCount,
        totalSize
      }
    };
  }

  /**
   * @CYRANO_REUSABLE: Adapts code for MCP module format
   */
  private async adaptForMCPModule(
    component: ReusableComponent, 
    code: string, 
    adaptations: ExportResult['adaptations']
  ): Promise<string> {
    let adaptedCode = code;

    // Remove React/DOM specific imports
    adaptedCode = adaptedCode.replace(/import.*from\s+['"`]react['"`];?\n?/g, '');
    adaptedCode = adaptedCode.replace(/import.*from\s+['"`]react-dom['"`];?\n?/g, '');
    
    if (adaptedCode !== code) {
      adaptations.push({
        type: 'remove_react_imports',
        description: 'Removed React-specific imports for MCP compatibility',
        file: `${component.name}.ts`
      });
    }

    // Add MCP imports at the top
    const mcpImports = `// @CYRANO_REUSABLE: MCP Module Adaptation
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

`;

    adaptedCode = mcpImports + adaptedCode;
    
    adaptations.push({
      type: 'add_mcp_imports',
      description: 'Added MCP SDK imports for server functionality',
      file: `${component.name}.ts`
    });

    // Add MCP export wrapper if it's a service
    if (component.componentType === 'service') {
      const serviceMatch = adaptedCode.match(/export class (\w+)/);
      if (serviceMatch) {
        const className = serviceMatch[1];
        adaptedCode += `

// @CYRANO_REUSABLE: MCP Service Wrapper
export function createMCPService(): ${className} {
  return new ${className}();
}

export const mcpServiceInstance = createMCPService();
`;
        
        adaptations.push({
          type: 'add_mcp_wrapper',
          description: `Added MCP service wrapper for ${className}`,
          file: `${component.name}.ts`
        });
      }
    }

    return adaptedCode;
  }

  /**
   * @CYRANO_REUSABLE: Adapts code for standalone format
   */
  private async adaptForStandalone(
    component: ReusableComponent, 
    code: string, 
    adaptations: ExportResult['adaptations']
  ): Promise<string> {
    let adaptedCode = code;

    // Add standalone wrapper
    const standaloneWrapper = `// @CYRANO_REUSABLE: Standalone Module
// This module has been extracted and adapted for standalone use

`;

    // Add module exports
    adaptedCode = standaloneWrapper + adaptedCode;

    adaptations.push({
      type: 'standalone_wrapper',
      description: 'Added standalone module wrapper',
      file: `${component.name}.ts`
    });

    return adaptedCode;
  }

  /**
   * @CYRANO_REUSABLE: Adapts code for library format
   */
  private async adaptForLibrary(
    component: ReusableComponent, 
    code: string, 
    adaptations: ExportResult['adaptations']
  ): Promise<string> {
    let adaptedCode = code;

    // Add library exports
    const libraryWrapper = `// @CYRANO_REUSABLE: Library Module
// This module is part of the LexFiat utilities library

`;

    adaptedCode = libraryWrapper + adaptedCode;

    adaptations.push({
      type: 'library_wrapper',
      description: 'Added library module wrapper',
      file: `${component.name}.ts`
    });

    return adaptedCode;
  }

  /**
   * @CYRANO_REUSABLE: Generates package.json for MCP modules
   */
  private generatePackageJson(component: ReusableComponent): any {
    return {
      name: `@cyrano-mcp/${component.name.toLowerCase()}`,
      version: '1.0.0',
      description: component.description || `MCP module for ${component.name}`,
      type: 'module',
      main: 'server.js',
      scripts: {
        build: 'tsc',
        start: 'node server.js',
        dev: 'tsx server.ts'
      },
      dependencies: {
        '@modelcontextprotocol/sdk': '^1.0.0'
      },
      devDependencies: {
        'typescript': '^5.0.0',
        'tsx': '^4.0.0'
      },
      mcp: {
        server: {
          command: 'node',
          args: ['server.js']
        }
      },
      keywords: [
        'mcp',
        'cyrano',
        'reusable',
        component.componentType,
        'lexfiat'
      ],
      author: 'LexFiat Component Export System',
      license: 'MIT',
      reusabilityMetadata: {
        originalPath: component.filePath,
        reusabilityScore: component.reusabilityScore,
        cypherCompatibility: component.cypherCompatibility,
        exportedAt: new Date().toISOString()
      }
    };
  }

  /**
   * @CYRANO_REUSABLE: Generates MCP server wrapper
   */
  private generateMCPServerWrapper(component: ReusableComponent): string {
    const serverCode = `// @CYRANO_REUSABLE: MCP Server Wrapper for ${component.name}
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool
} from '@modelcontextprotocol/sdk/types.js';
import { mcpServiceInstance } from './${component.name}.js';

class ${component.name}MCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: '${component.name.toLowerCase()}',
        version: '1.0.0',
        description: '${component.description || `MCP server for ${component.name}`}'
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.getTools()
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      switch (name) {
        // Add tool handlers based on component API
        default:
          throw new Error(\`Unknown tool: \${name}\`);
      }
    });
  }

  private getTools(): Tool[] {
    // Generate tools based on component API surface
    const tools: Tool[] = [];
    
    ${this.generateMCPTools(component)}
    
    return tools;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('${component.name} MCP server running on stdio');
  }
}

const server = new ${component.name}MCPServer();
server.run().catch(console.error);
`;

    return serverCode;
  }

  /**
   * @CYRANO_REUSABLE: Generates MCP tools based on component API surface
   */
  private generateMCPTools(component: ReusableComponent): string {
    if (!component.apiSurface) return '';
    
    const apiSurface = component.apiSurface as any;
    const tools: string[] = [];
    
    if (apiSurface.functions && Array.isArray(apiSurface.functions)) {
      apiSurface.functions.forEach((func: string) => {
        tools.push(`
    tools.push({
      name: '${func}',
      description: 'Execute ${func} function from ${component.name}',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      }
    });`);
      });
    }
    
    return tools.join('\n');
  }

  /**
   * @CYRANO_REUSABLE: Generates README for exported component
   */
  private async generateExportReadme(
    component: ReusableComponent, 
    options: ExportOptions, 
    adaptations: ExportResult['adaptations']
  ): Promise<string> {
    const readme = [];
    
    readme.push(`# ${component.name}`);
    readme.push(`Exported from LexFiat - ${new Date().toISOString()}\n`);
    
    readme.push('## Overview');
    readme.push(component.description || 'No description available');
    readme.push('');
    
    readme.push('## Original Component Details');
    readme.push(`- **Type**: ${component.componentType}`);
    readme.push(`- **Original Path**: ${component.filePath}`);
    readme.push(`- **Reusability Score**: ${component.reusabilityScore}/100`);
    readme.push(`- **Cypher Compatibility**: ${component.cypherCompatibility}/100`);
    readme.push('');
    
    if (options.format === 'mcp_module') {
      readme.push('## MCP Module Usage');
      readme.push('This component has been adapted as an MCP module for Cyrano integration.');
      readme.push('');
      readme.push('### Installation');
      readme.push('```bash');
      readme.push('npm install');
      readme.push('npm run build');
      readme.push('```');
      readme.push('');
      readme.push('### Running the MCP Server');
      readme.push('```bash');
      readme.push('npm start');
      readme.push('```');
      readme.push('');
    }
    
    if (adaptations.length > 0) {
      readme.push('## Adaptations Made');
      adaptations.forEach(adaptation => {
        readme.push(`### ${adaptation.type}`);
        readme.push(`**File**: ${adaptation.file}`);
        readme.push(`**Description**: ${adaptation.description}`);
        readme.push('');
      });
    }
    
    readme.push('## License');
    readme.push('This component is extracted from LexFiat and adapted for reuse.');
    readme.push('Please respect the original licensing terms.');
    
    return readme.join('\n');
  }

  /**
   * @CYRANO_REUSABLE: Copies local dependencies if they exist in the project
   */
  private async copyLocalDependencies(dependencies: string[], outputPath: string): Promise<void> {
    const localDeps = dependencies.filter(dep => dep.startsWith('./') || dep.startsWith('../'));
    
    for (const dep of localDeps) {
      try {
        const depPath = join(this.projectRoot, dep);
        const targetPath = join(outputPath, 'dependencies', basename(dep));
        await mkdir(dirname(targetPath), { recursive: true });
        await cp(depPath, targetPath, { recursive: true });
      } catch (error) {
        console.warn(`Could not copy dependency ${dep}:`, error);
      }
    }
  }
}