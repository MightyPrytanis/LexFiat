# LexFiat - Legal Intelligence Platform

Always follow these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Bootstrap, Build, and Test the Repository

1. **Install Dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```
   - REQUIRED: Use `--legacy-peer-deps` due to Vite/TailwindCSS version conflict
   - Takes ~25 seconds. NEVER CANCEL. Set timeout to 60+ seconds.

2. **TypeScript Check** (Optional - has known errors)
   ```bash
   npm run check
   ```
   - Takes ~15 seconds but currently has 35 TypeScript errors
   - Build still succeeds despite errors - do not block on this

3. **Build the Application**
   ```bash
   npm run build
   ```
   - Takes ~5 seconds. NEVER CANCEL. Set timeout to 30+ seconds.
   - Builds both frontend (Vite) and backend (esbuild)
   - Output: `dist/public/` (frontend) and `dist/index.js` (backend)

4. **Database Setup** (Requires environment variables)
   ```bash
   npm run db:push
   ```
   - Requires `DATABASE_URL` environment variable
   - Fails with "DATABASE_URL, ensure the database is provisioned" if not configured

### Run the Application

1. **Development Server**
   ```bash
   npm run dev
   ```
   - Starts on port 5000
   - Takes ~2 seconds to start
   - NEVER CANCEL development server
   - Access at `http://localhost:5000`

2. **Production Server**
   ```bash
   npm run start
   ```
   - Requires build to be completed first
   - Serves from `dist/` directory

## Validation

### Manual Testing Scenarios
ALWAYS run through these user scenarios after making changes:

1. **Basic Application Load**
   - Visit `http://localhost:5000`
   - Verify the dashboard loads with "Legal Intelligence Assembly Line" header
   - Check for active cases (Johnson v Johnson, Hartley Estate, Towne v Michigan Dept)
   - Verify countdown timer shows "47:23:15 Hours remaining"
   - Check browser console for JavaScript errors (expected: some external resource blocks are normal)

2. **Demo Mode Testing** (Critical validation workflow)
   - Click "Demo Mode" button on dashboard
   - Verify modal opens with three demo scenarios:
     - Emergency Family Law Response (2 min exploration)
     - Complex Probate Administration (3 min exploration) 
     - Full Workflow Intelligence (5 min exploration)
   - Select any scenario and verify checkmark appears
   - Test "Start Demo" button activation
   - Close modal to return to dashboard

3. **Settings and Configuration**
   - Navigate to `/settings` 
   - Verify 5 tabs: Profile, Integrations, AI Providers, Preferences, Feedback
   - Test Profile tab: verify form fields for name, email, specialization
   - Test AI Providers tab: verify all 5 providers listed (Claude, Gemini, ChatGPT, Grok, Perplexity)
   - Verify Claude shows as "Configured" with enabled toggle
   - Verify other providers show "No API key configured"

4. **Navigation and UI Components**
   - Test header navigation between Dashboard and Logo Showcase
   - Verify status indicators: "Gmail Live", "Claude Connected", "Clio Syncing"
   - Test attorney profile display in top-right corner
   - Verify responsive design on different screen sizes

### Required Environment Variables
Configure these before full functionality testing:

```env
# Database (Required)
DATABASE_URL=postgresql://...

# AI Providers
ANTHROPIC_API_KEY=sk-ant-...    # Required - Primary AI
GEMINI_API_KEY=...              # Optional
OPENAI_API_KEY=...              # Optional
XAI_API_KEY=...                 # Optional

# Object Storage (Replit)
DEFAULT_OBJECT_STORAGE_BUCKET_ID=...
PRIVATE_OBJECT_DIR=...
PUBLIC_OBJECT_SEARCH_PATHS=...
```

## Timing Expectations

**MEASURED BUILD TIMES** (with 50% safety buffer):
- **npm install --legacy-peer-deps**: 25 seconds actual → **Set timeout: 60+ seconds** 
- **npm run build**: 5 seconds actual → **Set timeout: 30+ seconds**
- **npm run check**: 15 seconds actual (35 TypeScript errors, build still succeeds)
- **npm run dev**: 2 seconds to start → **Set timeout: 15+ seconds**
- **npm run db:push**: 3 seconds (if DATABASE_URL configured) → **Set timeout: 15+ seconds**

**NEVER CANCEL** any of these commands. Always set timeouts to at least double the expected time.

## Common Tasks

### Repository Structure
```
lexfiat/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # UI components (dashboard, layout, ui)
│   │   ├── pages/           # Page components (dashboard, settings, etc.)
│   │   ├── hooks/           # Custom React hooks
│   │   └── lib/             # Utilities
├── server/                   # Express backend
│   ├── services/            # AI integrations (anthropic.ts, etc.)
│   ├── routes.ts           # API endpoints
│   ├── storage.ts          # Data layer
│   └── index.ts            # Server entry point
├── shared/                  # Shared types
│   └── schema.ts           # Drizzle database schemas
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Frontend build config
├── drizzle.config.ts       # Database config
└── tsconfig.json           # TypeScript config
```

### Key Files to Check After Changes
- Always check `shared/schema.ts` after database changes
- Always check `server/routes.ts` after API changes
- Always check `client/src/components/dashboard/` after UI changes
- Always verify `package.json` scripts work after dependency changes

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite + shadcn/ui + Tailwind CSS
- **Backend**: Node.js + Express.js + TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **AI**: Anthropic Claude (primary), Gemini, OpenAI support
- **Deployment**: Replit Autoscale with custom domain

### Known Issues
- **TypeScript strict mode has 35 errors** but build succeeds - do not block on `npm run check`
- **npm install requires `--legacy-peer-deps` flag** due to Vite 7.x / TailwindCSS version conflict
- **Database operations require DATABASE_URL environment variable** - `npm run db:push` fails without it
- **No linting or testing infrastructure** currently configured
- **External resources blocked** in browser console (fonts.googleapis.com, replit.com) - this is normal

### Development Guidelines
- Use shadcn/ui components for consistency
- Follow TypeScript best practices where possible
- Implement proper error handling
- Maintain responsive design patterns
- Test changes in demo mode scenarios

### Validated Demo Scenarios
The application includes fully functional demo mode with realistic legal scenarios:

1. **Emergency Family Law Response** (2 min exploration)
   - Urgent custody modification scenario
   - Features: Critical deadline tracking, emotional client email analysis, multi-AI cross-checking, priority task automation
   - Test case: Johnson v Johnson (Wayne County Family Division)

2. **Complex Probate Administration** (3 min exploration) 
   - Multi-beneficiary estate with contested assets
   - Features: Document classification, red flag detection, court deadline management, beneficiary communication
   - Test case: Hartley Estate (Oakland County Probate)

3. **Full Workflow Intelligence** (5 min exploration)
   - Complete LexFiat experience across multiple case types
   - Features: Gmail monitoring simulation, AI-powered draft generation, workflow pipeline visualization, cross-case pattern analysis

**Demo Testing Protocol**: Always test demo mode after changes to verify core functionality works without requiring external API keys or database setup.

### Deployment Considerations
- Built for Replit Autoscale deployment
- Custom domain: lexfiat.org  
- Uses environment variables for configuration
- PostgreSQL database managed by Replit
- Static assets served from `dist/public/`

## Troubleshooting

### Common Build Issues
1. **npm install fails**: Use `--legacy-peer-deps` flag
2. **TypeScript errors**: Known issue, build still succeeds
3. **Database errors**: Check DATABASE_URL environment variable
4. **Port 5000 in use**: Stop other services or change port in server/index.ts

### Performance Notes
- Build is very fast (~5 seconds)
- Development server starts quickly (~2 seconds)
- Database operations require proper connection string
- Frontend uses Vite for fast hot reloading

Always verify your changes work by running the development server and testing core functionality before committing.

## Validation Results

These instructions have been **EXHAUSTIVELY VALIDATED** on January 20, 2025:

### ✅ Successfully Tested Commands
- `npm install --legacy-peer-deps` (25 seconds) - ✅ WORKS
- `npm run build` (5 seconds) - ✅ WORKS (despite TypeScript errors)
- `npm run dev` (2 seconds startup) - ✅ WORKS - Server responds on port 5000
- `npm run check` (15 seconds) - ✅ RUNS (35 TypeScript errors expected)
- `npm run db:push` - ✅ CORRECTLY FAILS without DATABASE_URL (expected behavior)

### ✅ Successfully Tested User Scenarios
- **Dashboard Load**: ✅ Loads correctly with Legal Intelligence Assembly Line interface
- **Demo Mode**: ✅ All 3 scenarios load and function properly
- **Settings Navigation**: ✅ All 5 tabs work (Profile, Integrations, AI Providers, Preferences, Feedback)
- **AI Provider Configuration**: ✅ Shows all 5 providers with correct status
- **Responsive Design**: ✅ Interface adapts properly

### ✅ Browser Compatibility
- Chrome (tested) - ✅ WORKS
- Console errors for blocked external resources are normal and expected

**Result**: These instructions provide a complete, working development environment that can be used immediately by any developer.