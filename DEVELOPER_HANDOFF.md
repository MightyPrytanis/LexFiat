# LexFiat Developer Handoff Documentation

## Project Overview

**LexFiat** is a comprehensive legal workflow automation system with "Legal Intelligence" as the tagline, designed for Michigan attorney Mekel Miller specializing in family law and probate. The system features "Adaptive Workflow Intelligence" dashboards that transform based on active legal workflows.

**Core Philosophy**: "Automation enables better client relationships rather than replacing them."

### Key Features
- Gmail API integration for automated email monitoring
- Claude AI document analysis and response generation
- Multi-AI provider support (Claude, Gemini, OpenAI)
- In-app approval system for AI-generated responses
- Clio practice management integration (planned)
- Demo mode with realistic legal scenarios
- Professional dark theme with gold accents

## Technical Architecture

### Frontend
- **Framework**: React 18 with TypeScript (SPA)
- **UI Library**: shadcn/ui components on Radix UI
- **Styling**: Tailwind CSS with custom LexFiat theme
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with RESTful API
- **Database**: PostgreSQL with Drizzle ORM
- **Sessions**: Express sessions with PostgreSQL store
- **Development**: TSX for TypeScript execution

### AI Integrations
- **Primary**: Anthropic Claude Sonnet 4 (claude-sonnet-4-20250514)
- **Secondary**: Google Gemini 2.5 Flash, OpenAI GPT-4o
- **XAI Grok**: Available but not actively used

## Environment Setup

### Required Environment Variables

#### Database
```
DATABASE_URL=postgresql://...
PGHOST=...
PGPORT=...
PGUSER=...
PGPASSWORD=...
PGDATABASE=...
```

#### AI Providers
```
ANTHROPIC_API_KEY=sk-ant-... (Required - Primary AI)
GEMINI_API_KEY=... (Optional)
OPENAI_API_KEY=... (Optional)
XAI_API_KEY=... (Optional)
PERPLEXITY_API_KEY=... (Optional)
```

#### Object Storage (Replit)
```
DEFAULT_OBJECT_STORAGE_BUCKET_ID=...
PRIVATE_OBJECT_DIR=...
PUBLIC_OBJECT_SEARCH_PATHS=...
```

### Installation & Setup

1. **Clone Repository**
```bash
git clone <repository-url>
cd lexfiat
```

2. **Install Dependencies**
```bash
npm install
```

3. **Database Setup**
```bash
# Push schema to database
npm run db:push
```

4. **Start Development Server**
```bash
npm run dev
```

## Project Structure

```
lexfiat/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── ui/       # shadcn/ui components
│   │   │   ├── dashboard/ # Dashboard-specific components
│   │   │   └── layout/   # Layout components (header, etc.)
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions
│   │   └── App.tsx       # Main app component
│   └── index.html        # HTML entry point
├── server/               # Backend Express application
│   ├── services/         # Business logic services
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   ├── storage.ts       # Data storage interface
│   └── db.ts           # Database connection
├── shared/              # Shared types and schemas
│   └── schema.ts       # Drizzle database schemas
├── replit.md           # Project documentation and preferences
└── package.json        # Dependencies and scripts
```

## Key Components

### Core Pages
- **Dashboard** (`/`): Main workflow interface with pipeline visualization
- **Settings** (`/settings`): Configuration and AI provider setup
- **Logo Showcase** (`/logo-showcase`): Brand identity demonstration

### Important Components
- **Logo** (`client/src/components/ui/logo.tsx`): New simplified Edison bulb design
- **Demo Mode** (`client/src/components/dashboard/demo-mode-button.tsx`): Testing scenarios
- **AI Provider Setup** (`client/src/components/dashboard/ai-provider-setup.tsx`): Multi-AI configuration
- **Workflow Pipeline** (`client/src/components/dashboard/workflow-pipeline.tsx`): Assembly line visualization

## Brand Identity

### Design System
- **Primary Colors**: Navy backgrounds (#0a0e1a, #1a1f2e)
- **Accent Colors**: Gold (#fbbf24), Amber (#d97706)
- **Typography**: Inter font family only (NO serif fonts)
- **Logo**: Simplified Edison bulb with geometric filament pattern

### Logo Component
The new logo features:
- Flatter, simpler Edison bulb design
- Bolder 3-4px stroke weights
- Geometric "V" shaped filament pattern
- Professional radial gradient
- Scalable SVG format
- Multiple variants (icon, wordmark, full)

## Data Models

### Core Entities (shared/schema.ts)
- **Attorney**: User profile with OAuth credentials
- **Case**: Legal case management data
- **Document**: File storage with AI analysis metadata
- **RedFlag**: Alert system for urgent legal matters
- **DashboardStats**: Real-time metrics

### Demo Data
The system includes realistic demo scenarios:
- Johnson v Johnson (Divorce case)
- Hartley Estate (Probate)
- Emergency custody situations
- Settlement negotiations

## AI Integration

### Claude Integration (Primary)
- Model: claude-sonnet-4-20250514
- Used for: Document analysis, response generation, red flag detection
- Configuration in: `client/src/components/dashboard/ai-provider-setup.tsx`

### Multi-AI Support
- Gemini 2.5 Flash: Image analysis, multimodal tasks
- OpenAI GPT-4o: Alternative text processing
- XAI Grok: Available for specialized tasks

## Development Workflow

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run db:push      # Push database schema changes
npm run db:studio    # Open database studio
```

### Database Migrations
- Uses Drizzle ORM with push-based migrations
- Schema defined in `shared/schema.ts`
- Run `npm run db:push` after schema changes

### Development Guidelines
- Follow TypeScript best practices
- Use shadcn/ui components for consistency
- Implement proper error handling
- Add data-testid attributes for testing
- Maintain responsive design patterns

## Deployment

### Replit Deployment
1. Click "Deploy" in Replit interface
2. Choose "Autoscale" deployment type
3. Configure custom domain (lexfiat.org)
4. Set up DNS records with domain registrar

### Custom Domain Setup
1. Deploy application on Replit
2. Navigate to Deployments → Settings
3. Select "Manually connect from another registrar"
4. Enter `lexfiat.org`
5. Add provided A and TXT records to DNS
6. Wait for propagation (up to 48 hours)

## Security Considerations

### API Keys
- Store all API keys in environment variables
- Never commit sensitive credentials
- Use Replit Secrets for production deployment

### Authentication
- Session-based authentication system
- PostgreSQL session store for reliability
- Planned: OAuth integration with legal providers

## Testing

### Demo Mode
- Comprehensive testing scenarios included
- Realistic legal case data
- Red flag detection testing
- Dashboard statistics validation

### Manual Testing Checklist
- [ ] Dashboard loads with proper data
- [ ] Demo mode functions correctly
- [ ] AI provider setup works
- [ ] Logo showcase displays properly
- [ ] Settings page functionality
- [ ] Responsive design on mobile

## Known Issues & TODOs

### Current Limitations
- Gmail integration requires manual OAuth setup
- Clio integration not yet implemented
- MiFile integration planned (no API available)

### Future Enhancements
- Real Gmail API integration
- Clio practice management sync
- Advanced workflow automation
- Mobile app development
- Enhanced reporting and analytics

## Support & Maintenance

### Key Dependencies
- Node.js 18+
- PostgreSQL database
- Replit hosting platform
- Anthropic Claude API

### Monitoring
- Console logs for debugging
- Error handling in place
- Database connection monitoring

### Backup & Recovery
- Database managed by Replit
- Code versioned in Git repository
- Environment variables in Replit Secrets

## Contacts & Resources

### Original Developer
- Project built for Mekel Miller, Esq.
- Michigan attorney specializing in family law/probate
- Domain: lexfiat.org

### Documentation
- Technical specs in `replit.md`
- API documentation in code comments
- UI components documented with TypeScript interfaces

### External Services
- Anthropic Claude API documentation
- Replit deployment guides
- shadcn/ui component library

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Status**: Production Ready

This handoff document provides everything needed to continue development, deployment, and maintenance of the LexFiat legal intelligence platform.