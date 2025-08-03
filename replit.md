# Lex Fiat - Legal Intelligence Platform

## Overview

Lex Fiat is an advanced legal workflow automation system designed for legal professionals. The platform provides AI-powered document analysis, Gmail integration, and intelligent case management to streamline legal workflows. The system features a modern React frontend with a Node.js/Express backend, utilizing in-memory storage for demo purposes and Anthropic's Claude AI for document intelligence.

The application showcases modular and adaptive workflows for different legal scenarios, from case initiation to emergency response handling, with a professional dark theme that emphasizes intentionality and efficiency while maintaining human empathy.

## User Preferences

Preferred communication style: Simple, everyday language.
Design preferences: Lighter, less cluttered interface (15% reduction in visual complexity)
Theme: Professional dark theme with lighter navy/charcoal colors, aqua accents, and streamlined components

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
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **Schema**: Comprehensive legal domain model including:
  - Attorney profiles with OAuth credentials
  - Legal cases with case management data
  - Document storage with analysis metadata
  - Red flag detection and tracking system
- **Migrations**: Drizzle Kit for schema migrations and database management

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