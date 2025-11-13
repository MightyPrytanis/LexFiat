# Lex Fiat

<!-- Last updated: 2025-10-07 --> - Legal Intelligence Platform

> **Practicing law can be a real grind.  It doesn't have to be.**   

LexFiat is a comprehensive legal workflow automation system designed for modern law practices. Coneived initially for for a busy solo family law practitioner, LexFiat transforms traditional legal workflows through AI-powered document analysis and verification, intelligent case management, and adaptive user interfaces.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Anthropic Claude API key

### Installation
```bash
# Clone repository
git clone <repository-url>
cd lexfiat

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up database
npm run db:push

# Start development server
npm run dev
```

Visit `http://localhost:5000` to see LexFiat in action.

**LexFiat uses automation to free lawyers from repetitive, time-consuming but necessary chores** 

## ✨ Key Features

### Adaptive Workflow Intelligence
- **Dynamic Dashboards**: Interfaces that transform based on active legal workflows
- **Assembly Line Metaphor**: Three-stage workflow (Intake → Processing → Output & Delivery)
- **Real-time Updates**: Live data synchronization across all components

### AI-Powered Legal Analysis
- **Multi-AI Support**: Respects user sovereignty by allowing the user to select any AI assistant for orchestration or specific tasks.
- **Off the Shelf Solution**: Native support for Perplexity, OpenAI, XAi, Google, and Claude Models.
- **Document Intelligence**: Automated analysis of legal documents and correspondence
- **Red Flag Detection**: Intelligent identification of urgent legal matters
- **Response Generation**: AI-drafted responses with mandatory attorney review/approval workflow
- **Multimodal AI Coordination**: Allow AI panels to approach workflows in compete/compare, critique/crosscheck, or fully collaborative/cooperative modes.

### Professional Legal Branding
- **Custom Logo**: An elegant simplified Edison bulb design incorporating the traditional scales of justice, but in a novel way that instantly commnicates the app's purpose and philosophy
- **Dark Theme**: Professional navy and gold color scheme
- **Responsive, Customizable Design**: Optimized for desktop and mobile use

### Demo Mode
- **Realistic Scenarios**: Fictitious but realistic cases: Johnson v Johnson divorce, Hartley Estate probate, Towne v Department employment suit.
- **Interactive Testing**: Full workflow demonstration without real client data
- **Educational Tool**: Perfect for showcasing capabilities to potential clients

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript
- **shadcn/ui** component library
- **Tailwind CSS** for styling
- **TanStack Query** for state management
- **Wouter** for routing

### Backend
- **Express.js** with TypeScript
- **Drizzle ORM** with PostgreSQL
- **Session-based authentication**
- **RESTful API design**

### AI Integration
```typescript
// Multi-provider AI support
const aiProviders = {
  claude: 'claude-sonnet-4-20250514',    // Primary
  gemini: 'gemini-2.5-flash',           // Multimodal
  openai: 'gpt-4o',                     // Alternative
  xai: 'grok-2-1212'                    // Specialized
};
```

##Platform Migration Summary

**Replit Dependencies Removed:**
- All Replit-specific Vite plugins eliminated
- Replit object storage replaced with local filesystem storage
- Replit deployment documentation updated with platform-agnostic alternatives
- All environment variables converted to generic, cloud-agnostic formats

**New Deployment Options Added:**
- **Docker**: Complete containerization with docker-compose.yml for full-stack deployment
- **GitHub Codespaces**: DevContainer configuration for cloud development environments  
- **Platform-as-a-Service**: Support for Heroku, Railway, DigitalOcean App Platform
- **Traditional VPS**: PM2, nginx, and SSL certificate setup guides
- **Local Development**: Simplified setup with standard Node.js tools

**Open Source Alternatives:**
- File storage: Local filesystem with configurable paths (replaces Replit object storage)
- Development tools: Standard Vite setup without proprietary plugins
- SSL/Domain: Let's Encrypt and cloud provider SSL options
- Environment management: Standard .env files with comprehensive examples



## 📁 Project Structure

```
Cyrano/
├── Lex Fiat/                    # React frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   └── lib/             # Utilities
├── shared/                  # Shared types
│   └── schema.ts           # Database schemas

```





Deprecated `/logo-showcase` to see all brand variations and usage guidelines.

## 🚀 Deployment

### Production Deployment Options

#### Option 1: Docker Deployment (Recommended)
1. **Build Docker image** from provided Dockerfile
2. **Deploy to any cloud provider** (AWS, GCP, Azure, DigitalOcean)
3. **Configure environment variables** for your deployment
4. **Set up SSL certificate** with Let's Encrypt or cloud provider

#### Option 2: Traditional Hosting
1. **Deploy to VPS or dedicated server** with Node.js support
2. **Configure reverse proxy** (nginx, Apache)
3. **Set up SSL certificate** and domain configuration
4. **Configure PM2 or systemd** for process management

#### Option 3: Platform-as-a-Service
1. **Deploy to Heroku, Railway, or similar PaaS**
2. **Configure custom domain** (lexfiat.org)
3. **Set environment variables** in platform dashboard
4. **Enable auto-scaling** based on traffic

#### Deployment Status
- Tested build/deployment on Replit (UI only) 8/2025 
- Tested build/deployment on Render (LexFiat, Cyrano MCP, and database) 10/2025



### Environment Variables
```env
# Database (Required)
DATABASE_URL=postgresql://...

# AI Providers
ANTHROPIC_API_KEY=sk-ant-...    # Required
GEMINI_API_KEY=...              # Optional
OPENAI_API_KEY=...              # Optional

# File Storage (Local/Cloud)
PUBLIC_OBJECT_SEARCH_PATHS=public/uploads,public/assets
PRIVATE_OBJECT_DIR=private/uploads
```

## 📊 Demo Mode

Experience LexFiat's capabilities with realistic legal scenarios:

### Available Scenarios
- **Johnson v Johnson**: High-conflict divorce with custody disputes
- **Hartley Estate**: Complex probate with family disagreements
- **Emergency Response**: Urgent custody modification requests
- **Settlement Negotiation**: Multi-party settlement conferences

Access demo mode via the dashboard "Demo Mode" button.

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run db:push      # Update database schema
npm run db:studio    # Open database browser
```

### Code Standards
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- shadcn/ui components
- Responsive design patterns

## 📈 Features Roadmap

### Current Features (✅ Complete)
- Multi-AI provider integration
- Demo mode with realistic scenarios  
- Professional branding and logo design
- Responsive dashboard interface
- Database-driven architecture

### Planned Enhancements
- Gmail API integration for email monitoring
- Clio practice management synchronization
- Advanced workflow automation
- Mobile application
- Enhanced reporting and analytics

## 🔐 Security & Privacy

- Environment variable management
- Session-based authentication
- HTTPS enforcement in production
- API key protection
- No client-side sensitive data exposure

## 📞 Support

### Technical Issues
- Review `DEVELOPER_HANDOFF.md` for comprehensive setup guide
- Check `DEPLOYMENT_CHECKLIST.md` for deployment troubleshooting
- Consult project documentation for implementation details

### Production Support
- **Domain**: lexfiat.org
- **Client**: Mekel Miller, Esq. - Michigan Family Law & Probate
- **Platform**: Cloud-agnostic deployment with PostgreSQL

## 📄 License

This project is proprietary software developed for legal practice automation.

---


Built with ⚡ by expert developers, designed for legal professionals.

Copyright 2025 Cognisint LLC - Made available under Apache 2.0 License - Please see our AI fraud, errors, and abuse poicy
