#!/usr/bin/env tsx
// @CYRANO_REUSABLE: CLI tool for managing reusable components
import { ComponentScannerService } from '../server/services/component-scanner.js';
import { ComponentDocumentationService } from '../server/services/component-documentation.js';
import { ComponentExportService } from '../server/services/component-export.js';
import { db } from '../server/db.js';
import { reusableComponents, componentScanReports } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

const commands = {
  scan: 'Scan for reusable components',
  list: 'List all identified components',
  docs: 'Generate documentation for all components',
  export: 'Export component(s) for Cyrano MCP',
  security: 'Run security scan on components',
  report: 'Generate reusability report',
  help: 'Show this help message'
};

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === 'help') {
    showHelp();
    return;
  }

  try {
    switch (command) {
      case 'scan':
        await scanComponents(args[1] || 'full_scan');
        break;
      case 'list':
        await listComponents(args[1]);
        break;
      case 'docs':
        await generateDocs(args[1]);
        break;
      case 'export':
        await exportComponents(args.slice(1));
        break;
      case 'security':
        await securityScan(args[1]);
        break;
      case 'report':
        await generateReport();
        break;
      default:
        console.error(`Unknown command: ${command}`);
        showHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', (error as Error).message);
    process.exit(1);
  }
}

function showHelp() {
  console.log('\n🔧 LexFiat Component Manager');
  console.log('============================\n');
  console.log('Usage: tsx scripts/component-manager.ts <command> [options]\n');
  console.log('Commands:');
  Object.entries(commands).forEach(([cmd, desc]) => {
    console.log(`  ${cmd.padEnd(12)} ${desc}`);
  });
  console.log('\nExamples:');
  console.log('  tsx scripts/component-manager.ts scan full_scan');
  console.log('  tsx scripts/component-manager.ts list services');
  console.log('  tsx scripts/component-manager.ts export component-id mcp_module');
  console.log('  tsx scripts/component-manager.ts docs all');
  console.log('  tsx scripts/component-manager.ts security component-id');
  console.log('');
}

async function scanComponents(scanType: string) {
  console.log(`🔍 Starting ${scanType} scan...`);
  
  const scanner = new ComponentScannerService();
  const scanId = await scanner.scanForReusableComponents(scanType as any);
  
  console.log(`✅ Scan initiated with ID: ${scanId}`);
  
  // Wait for scan to complete and show results
  let attempts = 0;
  const maxAttempts = 30;
  
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const report = await db
      .select()
      .from(componentScanReports)
      .where(eq(componentScanReports.id, scanId))
      .limit(1);
      
    if (report.length > 0 && report[0].status === 'completed') {
      console.log('\n📊 Scan Results:');
      console.log(`   Components Found: ${report[0].componentsFound}`);
      console.log(`   Components Updated: ${report[0].componentsUpdated}`);
      console.log(`   Cypher Candidates: ${report[0].cypherCandidates}`);
      console.log(`   Security Issues: ${report[0].securityIssues || 0}`);
      console.log(`   Duration: ${report[0].scanDuration}ms`);
      break;
    } else if (report.length > 0 && report[0].status === 'failed') {
      console.error('❌ Scan failed');
      break;
    }
    
    attempts++;
    process.stdout.write('.');
  }
  
  if (attempts >= maxAttempts) {
    console.log('\n⏰ Scan is still running in the background');
  }
}

async function listComponents(filter?: string) {
  console.log('📋 Listing reusable components...\n');
  
  const components = await db.select().from(reusableComponents);
  
  if (components.length === 0) {
    console.log('No components found. Run a scan first.');
    return;
  }
  
  const filteredComponents = filter 
    ? components.filter(c => c.componentType === filter)
    : components;
  
  console.log(`Found ${filteredComponents.length} components:\n`);
  
  // Group by type
  const byType = filteredComponents.reduce((acc, comp) => {
    if (!acc[comp.componentType]) acc[comp.componentType] = [];
    acc[comp.componentType].push(comp);
    return acc;
  }, {} as Record<string, typeof components>);
  
  Object.entries(byType).forEach(([type, comps]) => {
    console.log(`\n🏷️  ${type.toUpperCase()} (${comps.length})`);
    console.log('─'.repeat(50));
    
    comps.forEach(comp => {
      const cypherIcon = comp.cypherCompatibility >= 70 ? '🎯' : '⚪';
      const securityIcon = 
        comp.securityStatus === 'approved' ? '✅' : 
        comp.securityStatus === 'needs_review' ? '⚠️' : 
        comp.securityStatus === 'rejected' ? '❌' : '⏳';
      
      console.log(`${cypherIcon} ${securityIcon} ${comp.name.padEnd(25)} ${comp.reusabilityScore}/100 📍 ${comp.filePath}`);
      if (comp.description) {
        console.log(`   ${comp.description.substring(0, 80)}...`);
      }
    });
  });
  
  // Summary
  const highReusability = filteredComponents.filter(c => c.reusabilityScore >= 80);
  const cypherCandidates = filteredComponents.filter(c => c.cypherCompatibility >= 70);
  const securityIssues = filteredComponents.filter(c => c.securityStatus === 'needs_review' || c.securityStatus === 'rejected');
  
  console.log('\n📊 Summary:');
  console.log(`   High Reusability (80+): ${highReusability.length}`);
  console.log(`   Cypher Candidates (70+): ${cypherCandidates.length}`);
  console.log(`   Security Issues: ${securityIssues.length}`);
}

async function generateDocs(target?: string) {
  console.log('📚 Generating documentation...\n');
  
  const docService = new ComponentDocumentationService();
  
  if (target && target !== 'all') {
    // Generate docs for specific component
    const component = await db
      .select()
      .from(reusableComponents)
      .where(eq(reusableComponents.id, target))
      .limit(1);
      
    if (component.length === 0) {
      console.error(`Component not found: ${target}`);
      return;
    }
    
    const docPath = await docService.generateComponentDocumentation(target);
    console.log(`✅ Documentation generated: ${docPath}`);
  } else {
    // Generate docs for all components
    const docPaths = await docService.generateAllDocumentation();
    console.log(`✅ Generated documentation for ${docPaths.length} components`);
    console.log(`📂 Documentation available in: docs/reusable-components/`);
  }
}

async function exportComponents(args: string[]) {
  const [componentId, format = 'mcp_module'] = args;
  
  if (!componentId) {
    console.error('Component ID required for export');
    return;
  }
  
  console.log(`📦 Exporting component: ${componentId} as ${format}...\n`);
  
  const exportService = new ComponentExportService();
  const result = await exportService.exportComponent(componentId, {
    format: format as any,
    adaptForCyrano: true,
    includeTests: true,
    includeDocs: true
  });
  
  console.log('✅ Export completed!');
  console.log(`📂 Output: ${result.outputPath}`);
  console.log(`📊 Files: ${result.metadata.fileCount}`);
  console.log(`💾 Size: ${Math.round(result.metadata.totalSize / 1024)}KB`);
  
  if (result.adaptations.length > 0) {
    console.log('\n🔧 Adaptations made:');
    result.adaptations.forEach(adaptation => {
      console.log(`   ${adaptation.type}: ${adaptation.description}`);
    });
  }
}

async function securityScan(componentId?: string) {
  console.log('🛡️  Running security scan...\n');
  
  const scanner = new ComponentScannerService();
  
  if (componentId) {
    // Scan specific component
    const result = await scanner.performSecurityScan(componentId);
    
    console.log(`Security status: ${result.status}`);
    
    if (result.vulnerabilities.length > 0) {
      console.log('\n⚠️  Vulnerabilities found:');
      result.vulnerabilities.forEach((vuln, index) => {
        const severityIcon = {
          critical: '🔴',
          high: '🟠',
          medium: '🟡',
          low: '🟢'
        }[vuln.severity];
        
        console.log(`${index + 1}. ${severityIcon} ${vuln.type.toUpperCase()}`);
        console.log(`   ${vuln.description}`);
        if (vuln.line) console.log(`   📍 Line ${vuln.line}`);
      });
    } else {
      console.log('✅ No security issues found');
    }
  } else {
    // Scan all components
    const components = await db.select().from(reusableComponents);
    
    let totalIssues = 0;
    for (const component of components) {
      try {
        const result = await scanner.performSecurityScan(component.id);
        totalIssues += result.vulnerabilities.length;
        
        if (result.vulnerabilities.length > 0) {
          console.log(`⚠️  ${component.name}: ${result.vulnerabilities.length} issues`);
        }
      } catch (error) {
        console.warn(`Failed to scan ${component.name}:`, (error as Error).message);
      }
    }
    
    console.log(`\n📊 Total security issues found: ${totalIssues}`);
  }
}

async function generateReport() {
  console.log('📊 Generating reusability report...\n');
  
  const components = await db.select().from(reusableComponents);
  const reports = await db.select().from(componentScanReports);
  
  console.log('🏗️  LEXFIAT REUSABILITY REPORT');
  console.log('=' .repeat(50));
  console.log(`Generated: ${new Date().toISOString()}\n`);
  
  // Overall stats
  console.log('📈 OVERVIEW');
  console.log(`Total Components: ${components.length}`);
  console.log(`Total Scans: ${reports.length}`);
  
  // By type
  const byType = components.reduce((acc, comp) => {
    acc[comp.componentType] = (acc[comp.componentType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('\n🏷️  BY TYPE');
  Object.entries(byType).forEach(([type, count]) => {
    console.log(`${type.padEnd(15)} ${count}`);
  });
  
  // Reusability distribution
  const reusabilityRanges = {
    'Excellent (80-100)': components.filter(c => c.reusabilityScore >= 80).length,
    'Good (60-79)': components.filter(c => c.reusabilityScore >= 60 && c.reusabilityScore < 80).length,
    'Average (40-59)': components.filter(c => c.reusabilityScore >= 40 && c.reusabilityScore < 60).length,
    'Poor (0-39)': components.filter(c => c.reusabilityScore < 40).length,
  };
  
  console.log('\n📊 REUSABILITY DISTRIBUTION');
  Object.entries(reusabilityRanges).forEach(([range, count]) => {
    console.log(`${range.padEnd(20)} ${count}`);
  });
  
  // Cypher candidates
  const cypherCandidates = components.filter(c => c.cypherCompatibility >= 70);
  console.log('\n🎯 CYRANO MCP CANDIDATES');
  console.log(`High Compatibility (70+): ${cypherCandidates.length}`);
  
  if (cypherCandidates.length > 0) {
    console.log('\nTop Candidates:');
    cypherCandidates
      .sort((a, b) => b.cypherCompatibility - a.cypherCompatibility)
      .slice(0, 10)
      .forEach((comp, index) => {
        console.log(`${(index + 1).toString().padStart(2)}. ${comp.name.padEnd(25)} ${comp.cypherCompatibility}/100`);
      });
  }
  
  // Security status
  const securityStatus = components.reduce((acc, comp) => {
    acc[comp.securityStatus] = (acc[comp.securityStatus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('\n🛡️  SECURITY STATUS');
  Object.entries(securityStatus).forEach(([status, count]) => {
    console.log(`${status.padEnd(15)} ${count}`);
  });
  
  // Export status
  const exportStatus = components.reduce((acc, comp) => {
    acc[comp.exportStatus] = (acc[comp.exportStatus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('\n📦 EXPORT STATUS');
  Object.entries(exportStatus).forEach(([status, count]) => {
    console.log(`${status.padEnd(15)} ${count}`);
  });
  
  // Recent activity
  const recentReports = reports
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
  
  if (recentReports.length > 0) {
    console.log('\n🕐 RECENT SCAN ACTIVITY');
    recentReports.forEach(report => {
      const date = new Date(report.createdAt).toLocaleDateString();
      console.log(`${date} ${report.scanType.padEnd(15)} ${report.status} (${report.componentsFound} found)`);
    });
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('End of Report\n');
}

// Run the CLI
main().catch(console.error);