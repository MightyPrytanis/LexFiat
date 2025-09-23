#!/usr/bin/env tsx
// @CYRANO_REUSABLE: Script to add tags to existing code files for better component identification
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
// Note: Removed ComponentScannerService import to avoid database dependency for tagging

interface FileTagging {
  filePath: string;
  suggestedTags: TagSuggestion[];
}

interface TagSuggestion {
  tag: string;
  reason: string;
  confidence: number;
}

const REUSABILITY_TAGS = {
  // Component type tags
  '@CYRANO_REUSABLE_SERVICE': 'Marks a service class or module as potentially reusable for MCP integration',
  '@CYRANO_REUSABLE_UTILITY': 'Marks utility functions or helpers as reusable components',
  '@CYRANO_REUSABLE_PARSER': 'Marks data parsing or transformation logic as reusable',
  '@CYRANO_REUSABLE_VALIDATOR': 'Marks validation logic as reusable component',
  '@CYRANO_REUSABLE_WORKFLOW': 'Marks workflow or process logic as reusable',
  '@CYRANO_REUSABLE_COMPONENT': 'Marks React/UI components that could be adapted',
  
  // Quality tags
  '@CYRANO_HIGH_REUSABILITY': 'High reusability score component (80+)',
  '@CYRANO_MCP_CANDIDATE': 'Strong candidate for MCP module conversion (70+ compatibility)',
  '@CYRANO_SECURITY_REVIEWED': 'Component has passed security review',
  '@CYRANO_EXPORTED': 'Component has been exported for Cyrano use',
  
  // Dependency tags
  '@CYRANO_STANDALONE': 'Component with minimal dependencies',
  '@CYRANO_COMPLEX_DEPS': 'Component with complex dependency requirements',
  
  // Documentation tags
  '@CYRANO_DOCUMENTED': 'Component has comprehensive documentation',
  '@CYRANO_NEEDS_DOCS': 'Component needs documentation before export'
};

class ComponentTagger {
  private projectRoot: string;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  /**
   * @CYRANO_REUSABLE: Analyzes files and suggests appropriate tags
   */
  async analyzeAndSuggestTags(): Promise<FileTagging[]> {
    console.log('🏷️  Analyzing files for reusability tagging...\n');
    
    const suggestions: FileTagging[] = [];
    
    // Key files to analyze
    const targetFiles = [
      'server/services/anthropic.ts',
      'server/services/gmail.ts',
      'server/services/clio.ts',
      'server/services/component-scanner.ts',
      'server/services/component-documentation.ts',
      'server/services/component-export.ts',
      'shared/schema.ts',
      'client/src/components/dashboard/workflow-pipeline.tsx',
      'client/src/components/dashboard/red-flags-panel.tsx',
      'client/src/components/ui/checkbox.tsx',
      'client/src/lib/utils.ts'
    ];

    for (const filePath of targetFiles) {
      try {
        const fullPath = join(this.projectRoot, filePath);
        const content = await readFile(fullPath, 'utf-8');
        const tagSuggestions = await this.analyzeFileForTags(filePath, content);
        
        if (tagSuggestions.length > 0) {
          suggestions.push({
            filePath,
            suggestedTags: tagSuggestions
          });
        }
      } catch (error) {
        console.warn(`Could not analyze ${filePath}:`, (error as Error).message);
      }
    }

    return suggestions;
  }

  /**
   * @CYRANO_REUSABLE: Analyzes a single file and suggests tags
   */
  private async analyzeFileForTags(filePath: string, content: string): Promise<TagSuggestion[]> {
    const suggestions: TagSuggestion[] = [];
    
    // Skip if already tagged
    if (content.includes('@CYRANO_REUSABLE')) {
      return suggestions;
    }

    // Analyze based on file patterns
    const fileName = filePath.toLowerCase();
    const lines = content.split('\n');
    
    // Service detection
    if (fileName.includes('service') || /class \w+Service/.test(content)) {
      suggestions.push({
        tag: '@CYRANO_REUSABLE_SERVICE',
        reason: 'Contains service class or is in services directory',
        confidence: 90
      });
    }
    
    // Utility detection
    if (fileName.includes('util') || fileName.includes('lib') || fileName.includes('helper')) {
      suggestions.push({
        tag: '@CYRANO_REUSABLE_UTILITY',
        reason: 'File appears to contain utility functions',
        confidence: 85
      });
    }
    
    // Parser detection
    if (fileName.includes('parser') || fileName.includes('transform') || 
        content.includes('parse') || content.includes('transform')) {
      suggestions.push({
        tag: '@CYRANO_REUSABLE_PARSER',
        reason: 'Contains parsing or transformation logic',
        confidence: 80
      });
    }
    
    // Validator detection
    if (fileName.includes('valid') || content.includes('validate') || 
        content.includes('schema') || content.includes('zod')) {
      suggestions.push({
        tag: '@CYRANO_REUSABLE_VALIDATOR',
        reason: 'Contains validation logic',
        confidence: 85
      });
    }
    
    // Component detection
    if (fileName.includes('component') || content.includes('export function') && 
        content.includes('tsx')) {
      suggestions.push({
        tag: '@CYRANO_REUSABLE_COMPONENT',
        reason: 'React component that could be adapted',
        confidence: 70
      });
    }
    
    // Workflow detection
    if (fileName.includes('workflow') || fileName.includes('pipeline') ||
        content.includes('workflow') || content.includes('process')) {
      suggestions.push({
        tag: '@CYRANO_REUSABLE_WORKFLOW',
        reason: 'Contains workflow or process logic',
        confidence: 75
      });
    }
    
    // High quality indicators
    const exportCount = (content.match(/export/g) || []).length;
    const functionCount = (content.match(/function|const.*=.*=>/g) || []).length;
    const classCount = (content.match(/class \w+/g) || []).length;
    const interfaceCount = (content.match(/interface \w+/g) || []).length;
    
    if (exportCount >= 3 || functionCount >= 5 || classCount >= 1 && interfaceCount >= 2) {
      suggestions.push({
        tag: '@CYRANO_HIGH_REUSABILITY',
        reason: `Rich API surface: ${exportCount} exports, ${functionCount} functions, ${classCount} classes`,
        confidence: exportCount >= 5 ? 95 : 80
      });
    }
    
    // MCP candidate detection
    const asyncFunctions = (content.match(/async.*function|async.*=>/g) || []).length;
    const hasInterfaces = interfaceCount > 0;
    const hasJsonHandling = content.includes('JSON') || content.includes('json');
    const hasFetchOrHttp = content.includes('fetch') || content.includes('http');
    
    let mcpScore = 0;
    if (asyncFunctions >= 2) mcpScore += 25;
    if (hasInterfaces) mcpScore += 20;
    if (hasJsonHandling) mcpScore += 15;
    if (hasFetchOrHttp) mcpScore += 20;
    if (exportCount >= 3) mcpScore += 20;
    
    if (mcpScore >= 70) {
      suggestions.push({
        tag: '@CYRANO_MCP_CANDIDATE',
        reason: `High MCP compatibility score: async functions, interfaces, JSON handling`,
        confidence: mcpScore
      });
    }
    
    // Dependency analysis
    const importCount = (content.match(/import.*from/g) || []).length;
    if (importCount <= 3) {
      suggestions.push({
        tag: '@CYRANO_STANDALONE',
        reason: `Minimal dependencies (${importCount} imports)`,
        confidence: importCount === 0 ? 100 : 90 - (importCount * 10)
      });
    } else if (importCount > 10) {
      suggestions.push({
        tag: '@CYRANO_COMPLEX_DEPS',
        reason: `Complex dependency tree (${importCount} imports)`,
        confidence: 85
      });
    }
    
    // Documentation detection
    const hasJsdoc = content.includes('/**') || content.includes('//');
    const hasTypeAnnotations = content.includes(': ') && (content.includes('string') || content.includes('number'));
    
    if (hasJsdoc && hasTypeAnnotations) {
      suggestions.push({
        tag: '@CYRANO_DOCUMENTED',
        reason: 'Has JSDoc comments and type annotations',
        confidence: 80
      });
    } else if (!hasJsdoc) {
      suggestions.push({
        tag: '@CYRANO_NEEDS_DOCS',
        reason: 'Lacks comprehensive documentation',
        confidence: 70
      });
    }
    
    return suggestions.filter(s => s.confidence >= 70);
  }

  /**
   * @CYRANO_REUSABLE: Applies tags to files
   */
  async applyTags(suggestions: FileTagging[], dryRun: boolean = true): Promise<void> {
    console.log(`${dryRun ? '🧪 DRY RUN:' : '✏️  APPLYING:'} Tagging ${suggestions.length} files...\n`);
    
    for (const fileSuggestion of suggestions) {
      try {
        const fullPath = join(this.projectRoot, fileSuggestion.filePath);
        const content = await readFile(fullPath, 'utf-8');
        
        // Build tag comment block
        const tagComments = [];
        tagComments.push('// @CYRANO_REUSABLE: Component reusability tags');
        
        fileSuggestion.suggestedTags.forEach(tag => {
          tagComments.push(`// ${tag.tag}: ${REUSABILITY_TAGS[tag.tag as keyof typeof REUSABILITY_TAGS] || tag.reason}`);
        });
        
        tagComments.push('');
        
        // Insert tags at the top of the file (after imports)
        const lines = content.split('\n');
        let insertIndex = 0;
        
        // Find a good place to insert (after imports, before first export)
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line.startsWith('import') || line.startsWith('//') || line.startsWith('/*') || line === '') {
            insertIndex = i + 1;
          } else {
            break;
          }
        }
        
        // Insert tag comments
        lines.splice(insertIndex, 0, ...tagComments);
        const newContent = lines.join('\n');
        
        if (dryRun) {
          console.log(`📁 ${fileSuggestion.filePath}`);
          fileSuggestion.suggestedTags.forEach(tag => {
            console.log(`   ${tag.tag} (${tag.confidence}%) - ${tag.reason}`);
          });
          console.log('');
        } else {
          await writeFile(fullPath, newContent, 'utf-8');
          console.log(`✅ Tagged ${fileSuggestion.filePath} with ${fileSuggestion.suggestedTags.length} tags`);
        }
      } catch (error) {
        console.error(`❌ Failed to tag ${fileSuggestion.filePath}:`, error);
      }
    }
  }

  /**
   * @CYRANO_REUSABLE: Generates tagging report
   */
  generateTaggingReport(suggestions: FileTagging[]): string {
    const report = [];
    
    report.push('# Component Tagging Report');
    report.push(`Generated: ${new Date().toISOString()}\n`);
    
    const tagCounts = suggestions.reduce((acc, file) => {
      file.suggestedTags.forEach(tag => {
        acc[tag.tag] = (acc[tag.tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);
    
    report.push('## Tag Distribution');
    Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([tag, count]) => {
        report.push(`- **${tag}**: ${count} files`);
      });
    report.push('');
    
    report.push('## Files to Tag');
    suggestions.forEach(file => {
      report.push(`### ${file.filePath}`);
      file.suggestedTags.forEach(tag => {
        report.push(`- ${tag.tag} (${tag.confidence}%): ${tag.reason}`);
      });
      report.push('');
    });
    
    report.push('## Tag Descriptions');
    Object.entries(REUSABILITY_TAGS).forEach(([tag, desc]) => {
      report.push(`- **${tag}**: ${desc}`);
    });
    
    return report.join('\n');
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'analyze';
  const dryRun = !args.includes('--apply');
  
  const tagger = new ComponentTagger();
  
  try {
    switch (command) {
      case 'analyze':
      case 'suggest':
        const suggestions = await tagger.analyzeAndSuggestTags();
        
        if (suggestions.length === 0) {
          console.log('✨ No files need tagging (all files are already tagged or don\'t meet criteria)');
          return;
        }
        
        console.log('📊 Tagging Analysis Complete\n');
        console.log(`Found ${suggestions.length} files that should be tagged:`);
        console.log(`Total tags to apply: ${suggestions.reduce((sum, f) => sum + f.suggestedTags.length, 0)}\n`);
        
        await tagger.applyTags(suggestions, dryRun);
        
        if (dryRun) {
          console.log('\n💡 Run with --apply to actually add tags to files');
        }
        
        break;
        
      case 'report':
        const reportSuggestions = await tagger.analyzeAndSuggestTags();
        const report = tagger.generateTaggingReport(reportSuggestions);
        console.log(report);
        break;
        
      default:
        console.log('Usage: tsx scripts/add-component-tags.ts [analyze|report] [--apply]');
        console.log('');
        console.log('Commands:');
        console.log('  analyze  - Analyze files and suggest tags (default)');
        console.log('  report   - Generate detailed tagging report');
        console.log('');
        console.log('Options:');
        console.log('  --apply  - Actually apply tags to files (default is dry run)');
    }
  } catch (error) {
    console.error('Error:', (error as Error).message);
    process.exit(1);
  }
}

main().catch(console.error);