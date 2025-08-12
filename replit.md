# Lex Fiat - Legal Intelligence Platform

## Overview

LexFiat is a comprehensive legal workflow automation system with "Legal Intelligence" as the tagline. The platform integrates Gmail monitoring, Claude API for document analysis, and Clio practice management to create "Adaptive Workflow Intelligence" - dashboards that transform based on active legal workflows rather than displaying static information. 

Core philosophy: "Automation enables better client relationships rather than replacing them." The system operates like an intelligent assembly line for legal work with three main stages: Intake (Gmail monitoring) → Processing (Claude AI analysis) → Output & Delivery (Review & approval).

The application features a professional dark theme using the official LexFiat design system with navy backgrounds and gold accents, implementing an assembly line metaphor with conveyor belt animations and uniform workflow indicators.

## LexFiat's Unique Value Proposition

**Adaptive Workflow Intelligence** - Unlike static dashboards from Gmail, Clio, or Westlaw, LexFiat's dashboard transforms based on the active legal workflow:

1. **Gmail API Integration** - Automatically fetches emails from attorney Gmail accounts
2. **Claude AI Analysis** - Analyzes each email for legal importance, red flags, and urgency using Claude Sonnet 4
3. **Intelligent Draft Generation** - Creates contextually appropriate legal responses
4. **In-App Approval System** - Attorneys review, edit, and approve responses within LexFiat interface
5. **Automated Sending** - Approved responses sent automatically via Gmail API
6. **Task Prioritization** - Transparent, modifiable criteria for triage and priority assignment
7. **Carryover Management** - Tracks incomplete tasks across days with intelligent scheduling

## Workflow Structure & Design Philosophy

The dashboard is **workflow-driven**, not information-driven. Each legal scenario (Emergency Response, Document Analysis, Discovery Management, Settlement Negotiation) has its own adaptive interface that surfaces only relevant information and actions for that specific workflow stage.

## User Preferences

Preferred communication style: Simple, everyday language.
Design preferences: Professional, intelligent, innovative, trustworthy interface following official LexFiat design system
Theme: Official LexFiat color palette - dark navy backgrounds (#0a0e1a, #1a1f2e) with gold accents (#fbbf24, #d97706)
Logo: Gold lightbulb icon in radial gradient circle (per official brand standards)
Typography: Inter font family only - NO serif fonts allowed (design specification requirement)
Workflow philosophy: Assembly line metaphor with three-stage workflow (Intake → Processing → Output & Delivery)
Content standards: Use consistent case examples (Johnson v Johnson, Hartley Estate, Towne v Michigan Dept)

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript in SPA (Single Page Application) configuration
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom dark theme color palette (navy, charcoal, aqua, light-green)
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with RESTful API design
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Session Management**: Express sessions with PostgreSQL store (connect-pg-simple)
- **Development**: TSX for TypeScript execution in development

### Data Storage Solutions
- **Development**: In-memory storage for demo and development purposes
- **Production**: PostgreSQL with Neon serverless hosting planned
- **Schema**: Comprehensive legal domain model including:
  - Attorney profiles with OAuth credentials
  - Legal cases with case management data
  - Document storage with analysis metadata
  - Red flag detection and tracking system
  - Task completion tracking with carryover management
  - Draft approval workflow states
- **Migrations**: Drizzle Kit for schema migrations and database management

### Draft Approval Workflow
- **In-App Review**: All AI-generated drafts reviewed within LexFiat interface
- **Side-by-Side Comparison**: Original email and AI draft displayed together
- **Edit Capabilities**: Attorneys can edit drafts directly in LexFiat before approval
- **Approval Actions**: Approve & Send, Edit & Save, or Reject options
- **Gmail API Sending**: Approved responses sent automatically via Gmail API
- **MiFile Integration**: Pleading filing requires manual intervention (no API available)

### Task Management & Prioritization
- **Transparent Criteria**: Priority assignment based on deadlines, case importance, client type
- **Modifiable Rules**: Attorneys can adjust prioritization criteria
- **Carryover Tracking**: Incomplete tasks automatically carry to next day with adjusted priority
- **Completion Monitoring**: Real-time tracking of task completion rates and bottlenecks

### Authentication and Authorization
- **Gmail Integration**: OAuth 2.0 flow for Gmail API access
- **Clio Integration**: API key-based authentication for practice management
- **Session-based**: Server-side session management for user authentication

## External Dependencies

### AI and Machine Learning
- **Anthropic Claude**: Latest claude-sonnet-4-20250514 model for document analysis, red flag detection, and legal response generation
- **Document Intelligence**: AI-powered classification and analysis of legal documents

### Email Integration
- **Gmail API**: Google APIs client for email fetching, parsing, and attachment processing
- **Automatic Classification**: AI-powered categorization of incoming legal communications

### Practice Management
- **Clio API**: Integration with Clio practice management system for matter synchronization, client data, and billing information

### Database and Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Replit Hosting**: Development and deployment platform with integrated development tools

### UI and Design System
- **Radix UI**: Headless UI primitives for accessibility and keyboard navigation
- **Lucide Icons**: Consistent iconography throughout the application
- **Google Fonts**: Inter and DM Serif Display for typography
- **Custom CSS Variables**: Dark theme implementation with legal industry color scheme

### Development Tools
- **Vite**: Fast development server with hot module replacement
- **ESBuild**: Production bundling and TypeScript compilation
- **TailwindCSS**: Utility-first styling with PostCSS processing