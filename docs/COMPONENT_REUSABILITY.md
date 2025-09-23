# LexFiat Component Reusability System

> **"Transforming LexFiat components into reusable Cyrano MCP modules through intelligent automation."**

## Overview

The LexFiat Component Reusability System is a comprehensive solution for identifying, documenting, and exporting reusable code components for integration with the Cyrano MCP (Model Context Protocol) framework. This system enables the systematic discovery and adaptation of LexFiat's legal intelligence components for broader reuse.

## 🎯 Key Features

### 1. Automated Component Discovery
- **Smart Scanning**: Automatically scans the entire codebase for reusable components
- **Reusability Scoring**: Assigns scores (0-100) based on API surface, dependencies, and code quality
- **Cypher Compatibility**: Evaluates components for MCP module conversion (70+ compatibility recommended)
- **Type Classification**: Categorizes components as services, utilities, parsers, validators, workflows, or UI components

### 2. Intelligent Tagging System
- **Auto-Tagging**: Adds `@CYRANO_REUSABLE` annotations to identify reusable components
- **Tag Categories**: Uses semantic tags for better organization and discovery
- **Confidence Scoring**: Provides confidence levels for each suggested tag

### 3. Security Compliance
- **Vulnerability Scanning**: Automated security analysis of flagged components
- **Approval Workflow**: Security status tracking (pending, approved, needs_review, rejected)
- **Risk Assessment**: Identifies potential security issues before export

### 4. Documentation Generation
- **Auto-Documentation**: Generates comprehensive markdown documentation for each component
- **MCP Adaptation Guides**: Provides specific guidance for converting components to MCP modules
- **Dependency Analysis**: Identifies required, optional, and conflicting dependencies
- **API Surface Documentation**: Documents all exports, functions, classes, and interfaces

### 5. Export Workflow
- **Multiple Formats**: Supports MCP module, standalone, and library export formats
- **Code Adaptation**: Automatically adapts code for Cyrano MCP compatibility
- **Package Generation**: Creates complete npm packages with MCP server wrappers
- **Batch Export**: Supports exporting multiple components simultaneously

### 6. Periodic Monitoring
- **Scheduled Scans**: Configurable periodic scanning for new components
- **Trend Analysis**: Tracks component discovery and reusability trends
- **Automated Reporting**: Generates regular reports on component status

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- TypeScript 5+
- PostgreSQL database
- LexFiat project setup

### Installation
The system is integrated into the LexFiat project. No additional installation required.

### Basic Usage

#### 1. Tag Existing Components
```bash
# Analyze files and suggest tags (dry run)
npm run components:tag

# Apply tags to files
npm run components:tag-apply
```

#### 2. Scan for Components
```bash
# Perform a full component scan
npm run components:scan

# List discovered components
npm run components:list

# List only services
npm run components:list services
```

#### 3. Generate Documentation
```bash
# Generate docs for all components
npm run components:docs

# Generate report
npm run components:report
```

#### 4. Using the CLI Tool
```bash
# Full scan
tsx scripts/component-manager.ts scan full_scan

# Export a component
tsx scripts/component-manager.ts export <component-id> mcp_module

# Security scan
tsx scripts/component-manager.ts security <component-id>
```

## 📊 Dashboard Integration

The system includes a React dashboard component accessible from the main LexFiat dashboard:

- **Component Overview**: Statistics and metrics
- **Filtering**: By type, security status, and compatibility
- **Actions**: Export, document generation, security scanning
- **Real-time Updates**: Live scan status and results

## 🏗️ Architecture

### Database Schema
- `reusableComponents`: Core component tracking
- `componentScanReports`: Scan analytics and history
- `componentExports`: Export tracking and metadata

### Services
- `ComponentScannerService`: Core scanning and analysis
- `ComponentDocumentationService`: Documentation generation
- `ComponentExportService`: Component extraction and adaptation
- `PeriodicScannerService`: Automated scanning

### API Endpoints
- `GET /api/components/reusable` - List components
- `POST /api/components/scan` - Initiate scan
- `POST /api/components/:id/export` - Export component
- `POST /api/components/:id/security-scan` - Security scan

## 🎨 Tag System

### Component Type Tags
- `@CYRANO_REUSABLE_SERVICE` - Service classes/modules
- `@CYRANO_REUSABLE_UTILITY` - Utility functions
- `@CYRANO_REUSABLE_PARSER` - Data parsing logic
- `@CYRANO_REUSABLE_VALIDATOR` - Validation logic
- `@CYRANO_REUSABLE_WORKFLOW` - Process/workflow logic
- `@CYRANO_REUSABLE_COMPONENT` - UI components

### Quality Tags
- `@CYRANO_HIGH_REUSABILITY` - High reusability score (80+)
- `@CYRANO_MCP_CANDIDATE` - Strong MCP candidate (70+ compatibility)
- `@CYRANO_SECURITY_REVIEWED` - Security approved
- `@CYRANO_EXPORTED` - Successfully exported

### Dependency Tags
- `@CYRANO_STANDALONE` - Minimal dependencies
- `@CYRANO_COMPLEX_DEPS` - Complex dependency requirements

## 📈 Scoring System

### Reusability Score (0-100)
- **API Surface** (0-50): Exports, functions, classes, interfaces
- **Dependencies** (0-20): Fewer dependencies = higher score
- **Code Quality** (0-20): Documentation, type annotations
- **Patterns** (0-10): Reusable patterns and naming

### Cypher Compatibility (0-100)
- **Async Support** (0-25): Async functions and promises
- **Interface Design** (0-20): Well-defined interfaces
- **Data Handling** (0-20): JSON/data processing capabilities
- **HTTP Integration** (0-20): Network request handling
- **Modularity** (0-15): Export structure and modularity

## 🛡️ Security Features

### Automated Vulnerability Detection
- **Code Injection**: `eval()` usage detection
- **XSS Prevention**: `innerHTML` usage analysis
- **Secret Detection**: Hardcoded credentials scanning
- **Information Disclosure**: Environment variable exposure

### Approval Workflow
1. **Pending**: Initial security scan
2. **Approved**: Cleared for export
3. **Needs Review**: Manual review required
4. **Rejected**: Security issues prevent export

## 📝 Export Formats

### MCP Module Format
- Complete npm package structure
- MCP server wrapper generation
- Tool schema definitions
- Cyrano-specific adaptations

### Standalone Format
- Self-contained modules
- Minimal dependency modifications
- Standalone documentation

### Library Format
- Library module structure
- Preserved original structure
- Documentation integration

## 🔄 Periodic Scanning

### Configuration Options
```typescript
{
  enabled: true,
  intervalHours: 24,
  scanType: 'incremental',
  autoGenerateDocs: true,
  notificationThreshold: 70,
  maxComponentsPerScan: 100
}
```

### Automated Actions
- Component discovery
- Documentation generation
- Security scanning
- Trend analysis
- Report generation

## 🚀 Future Enhancements

### Planned Features
- **AI-Powered Analysis**: Enhanced component evaluation using LLMs
- **Cross-Repository Scanning**: Scan multiple repositories
- **Integration Testing**: Automated MCP module testing
- **Version Management**: Component versioning and updates
- **Community Sharing**: Public component repository

### Integration Roadmap
- **GitHub Actions**: CI/CD integration
- **Slack/Teams**: Notification integration
- **JIRA/Linear**: Issue tracking integration
- **Docker**: Containerized scanning

## 📚 Examples

### High-Value Components Identified

#### AnthropicService
- **Type**: Service
- **Reusability**: 95/100
- **Cypher Compatibility**: 90/100
- **Status**: Ready for export
- **Use Case**: AI analysis service for Cyrano

#### Document Parser
- **Type**: Utility
- **Reusability**: 88/100
- **Cypher Compatibility**: 85/100
- **Status**: Documented
- **Use Case**: Document processing for MCP

#### Validation Schema
- **Type**: Validator
- **Reusability**: 82/100
- **Cypher Compatibility**: 78/100
- **Status**: Security reviewed
- **Use Case**: Input validation for MCP tools

## 🔧 Troubleshooting

### Common Issues

#### Database Connection
```bash
# Ensure DATABASE_URL is set
export DATABASE_URL="postgresql://user:pass@host:port/db"
```

#### TypeScript Errors
```bash
# Check TypeScript configuration
npm run check
```

#### Permission Issues
```bash
# Ensure write permissions for export directories
chmod -R 755 exports/
```

## 📞 Support

For issues or questions about the Component Reusability System:

1. Check the generated documentation in `docs/reusable-components/`
2. Review scan reports for component-specific guidance
3. Use the dashboard for visual component management
4. Run `npm run components:report` for detailed analytics

## 📄 License

This component reusability system is part of the LexFiat project and follows the same licensing terms. Components exported for Cyrano MCP use should respect original licensing requirements.

---

*Generated by LexFiat Component Reusability System*