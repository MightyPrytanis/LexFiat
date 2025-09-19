# LexFiat - Legal Intelligence Platform

> **"Automation enables better client relationships rather than replacing them."**

LexFiat is a comprehensive legal workflow automation system designed for modern law practices. Built for a busy solo family law attorney, it transforms traditional legal workflows through AI-powered document analysis, intelligent case management, and adaptive dashboard interfaces.

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

## ✨ Key Features

### Adaptive Workflow Intelligence
- **Dynamic Dashboards**: Interfaces that transform based on active legal workflows
- **Assembly Line Metaphor**: Three-stage workflow (Intake → Processing → Output & Delivery)
- **Real-time Updates**: Live data synchronization across all components

### AI-Powered Legal Analysis
- **Multi-AI Support**: Claude Sonnet 4 (primary), Gemini 2.5 Flash, OpenAI GPT-4o
- **Document Intelligence**: Automated analysis of legal documents and correspondence
- **Red Flag Detection**: Intelligent identification of urgent legal matters
- **Response Generation**: AI-drafted responses with attorney approval workflow

### Professional Legal Branding
- **Custom Logo**: Simplified Edison bulb design representing "Legal Intelligence"
- **Dark Theme**: Professional navy and gold color scheme
- **Responsive Design**: Optimized for desktop and mobile use

### Demo Mode
- **Realistic Scenarios**: Johnson v Johnson divorce, Hartley Estate probate cases
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

## 📁 Project Structure

```
lexfiat/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   └── lib/             # Utilities
├── server/                   # Express backend
│   ├── services/            # Business logic
│   ├── routes.ts           # API endpoints
│   └── storage.ts          # Data layer
├── shared/                  # Shared types
│   └── schema.ts           # Database schemas
├── DEVELOPER_HANDOFF.md    # Complete handoff guide
├── DEPLOYMENT_CHECKLIST.md # Production deployment
└── replit.md              # Project documentation
```

## 🎨 Brand Identity

### Design System
- **Colors**: Navy backgrounds with gold accents
- **Typography**: Inter font family exclusively
- **Logo**: Simplified Edison bulb with geometric filament
- **Theme**: Professional dark mode optimized for legal work

### Logo Variations
- **Full Logo**: Icon + wordmark for headers
- **Icon Only**: App icons and favicons
- **Wordmark**: Text-only for constrained spaces

Visit `/logo-showcase` to see all brand variations and usage guidelines.

## 🚀 Deployment

### Production Deployment
1. **Deploy on Replit** (recommended: Autoscale)
2. **Configure Custom Domain** (lexfiat.org)
3. **Set DNS Records** at domain registrar
4. **Verify SSL Certificate** and functionality

See `DEPLOYMENT_CHECKLIST.md` for detailed deployment instructions.

### Environment Variables
```env
# Database (Required)
DATABASE_URL=postgresql://...

# AI Providers
ANTHROPIC_API_KEY=sk-ant-...    # Required
GEMINI_API_KEY=...              # Optional
OPENAI_API_KEY=...              # Optional

# Object Storage (Replit)
DEFAULT_OBJECT_STORAGE_BUCKET_ID=...
PRIVATE_OBJECT_DIR=...
PUBLIC_OBJECT_SEARCH_PATHS=...
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
- Consult `replit.md` for project-specific documentation

### Production Support
- **Domain**: lexfiat.org
- **Client**: Mekel Miller, Esq. - Michigan Family Law & Probate
- **Platform**: Replit Deployments with PostgreSQL

## 📄 License

This project is proprietary software developed for legal practice automation.

---

**LexFiat** - *Legal Intelligence Platform*  
*"Let There Be Law"* through intelligent automation.

Built with ⚡ by expert developers, designed for legal professionals.
