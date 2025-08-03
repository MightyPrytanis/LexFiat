# Lex Fiat - Legal Intelligence Platform

## Overview

Lex Fiat is an advanced legal workflow automation system designed for legal professionals. The platform provides AI-powered document analysis, Gmail integration, and intelligent case management to streamline legal workflows. The system features a modern React frontend with a Node.js/Express backend, utilizing in-memory storage for demo purposes and Anthropic's Claude AI for document intelligence.

The application showcases modular and adaptive workflows for different legal scenarios, from case initiation to emergency response handling, with a professional light theme that emphasizes clarity, efficiency, and abundant whitespace while maintaining human empathy.

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
Design preferences: Serious professional interface that suggests inexorability and competence
Theme: Professional blues and golds color palette - more serious than "Mondrian" bright colors but not "Imperial Star Destroyer" dark
Logo: Negative space Edison bulb design with white filament/rays on dark circle, representing legal intelligence "piercing darkness"
Workflow philosophy: Uniform roadmaps suggesting legal tasks will get completed - "it will, it must get done, it's only a matter of time"

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