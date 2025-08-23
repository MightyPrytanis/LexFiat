# LexFiat Deployment Checklist

## Pre-Deployment Verification

### ✅ Code Quality
- [ ] All TypeScript compilation errors resolved
- [ ] No console errors in browser dev tools
- [ ] All components render properly
- [ ] Demo mode functionality working
- [ ] Logo and branding consistent throughout

### ✅ Environment Configuration
- [ ] `DATABASE_URL` configured
- [ ] `ANTHROPIC_API_KEY` set (required for core functionality)
- [ ] Optional AI keys configured if needed:
  - [ ] `GEMINI_API_KEY`
  - [ ] `OPENAI_API_KEY`
  - [ ] `XAI_API_KEY`
- [ ] Object storage variables set:
  - [ ] `DEFAULT_OBJECT_STORAGE_BUCKET_ID`
  - [ ] `PRIVATE_OBJECT_DIR`
  - [ ] `PUBLIC_OBJECT_SEARCH_PATHS`

### ✅ Database
- [ ] Database schema up to date (`npm run db:push`)
- [ ] Database connection successful
- [ ] Demo data loads correctly
- [ ] Session storage working

### ✅ Functionality Testing
- [ ] Dashboard loads and displays data
- [ ] Demo mode creates realistic scenarios
- [ ] AI provider setup interface works
- [ ] Logo showcase page accessible
- [ ] Settings page functional
- [ ] Navigation between pages works
- [ ] Responsive design on mobile devices

## Deployment Steps

### Step 1: Replit Deployment
1. [ ] Click "Deploy" button in Replit interface
2. [ ] Select deployment type:
   - **Recommended**: Autoscale (supports custom domains, handles traffic spikes)
   - Alternative: Reserved VM (dedicated resources)
3. [ ] Configure deployment settings
4. [ ] Wait for deployment to complete
5. [ ] Test deployed application at provided .replit.app URL

### Step 2: Custom Domain Setup (lexfiat.org)
1. [ ] Navigate to Deployments → Settings
2. [ ] Select "Manually connect from another registrar"
3. [ ] Enter domain: `lexfiat.org`
4. [ ] Copy provided DNS records:
   - [ ] A record: `<IP_ADDRESS>`
   - [ ] TXT record: `<VERIFICATION_TOKEN>`

### Step 3: DNS Configuration
Configure at domain registrar (where lexfiat.org was purchased):

1. [ ] Log into domain registrar account
2. [ ] Navigate to DNS management section
3. [ ] Add A record:
   - Host: `@` (or blank)
   - Value: `<REPLIT_PROVIDED_IP>`
   - TTL: 3600 (or default)
4. [ ] Add TXT record:
   - Host: `@` (or blank)
   - Value: `<REPLIT_PROVIDED_TOKEN>`
   - TTL: 3600 (or default)
5. [ ] Save DNS changes
6. [ ] Wait for propagation (5 minutes to 48 hours)

### Step 4: SSL Certificate
- [ ] SSL automatically configured by Replit
- [ ] Verify HTTPS works at lexfiat.org
- [ ] Check for security warnings

### Step 5: Post-Deployment Testing
1. [ ] Access site at lexfiat.org
2. [ ] Test all major functionality:
   - [ ] Dashboard loads
   - [ ] Demo mode works
   - [ ] AI providers connect
   - [ ] Database operations succeed
   - [ ] Logo and branding display correctly
3. [ ] Test on multiple browsers
4. [ ] Test responsive design on mobile

## Domain Propagation Verification

### Tools to Check DNS Propagation
- [ ] Check with: whatsmydns.net
- [ ] Verify A record points to correct IP
- [ ] Verify TXT record exists
- [ ] Test from multiple geographic locations

### Expected Timeline
- **Immediate**: DNS changes saved at registrar
- **5-15 minutes**: Most locations see changes
- **1-4 hours**: Majority of global DNS servers updated
- **24-48 hours**: Complete global propagation

## Production Environment Checklist

### ✅ Performance
- [ ] Page load times under 3 seconds
- [ ] API responses under 1 second
- [ ] Database queries optimized
- [ ] Images and assets optimized

### ✅ Security
- [ ] All API keys in environment variables
- [ ] No sensitive data in client-side code
- [ ] HTTPS enforced
- [ ] Session security configured

### ✅ Monitoring
- [ ] Error logging in place
- [ ] Database connection monitoring
- [ ] API rate limiting considered
- [ ] Backup strategy defined

## Rollback Plan

### If Deployment Fails
1. [ ] Check Replit deployment logs
2. [ ] Verify environment variables
3. [ ] Test database connection
4. [ ] Review code for recent changes
5. [ ] Contact Replit support if infrastructure issue

### If Custom Domain Fails
1. [ ] Verify DNS records are correct
2. [ ] Check domain registrar settings
3. [ ] Wait additional time for propagation
4. [ ] Test with DNS lookup tools
5. [ ] Use .replit.app URL as temporary fallback

## Post-Launch Tasks

### ✅ Documentation
- [ ] Update README with production URL
- [ ] Document any deployment-specific configurations
- [ ] Share access credentials securely
- [ ] Provide maintenance instructions

### ✅ Handoff to New Developer
- [ ] Share repository access
- [ ] Transfer Replit project ownership
- [ ] Provide environment variable values
- [ ] Share domain registrar access
- [ ] Complete knowledge transfer session

### ✅ Monitoring Setup
- [ ] Set up uptime monitoring
- [ ] Configure error alerts
- [ ] Establish backup procedures
- [ ] Document maintenance schedule

## Emergency Contacts

### Technical Support
- **Replit Support**: support@replit.com
- **Anthropic API Issues**: support@anthropic.com
- **Domain Registrar**: [Contact info for lexfiat.org registrar]

### Project Stakeholders
- **Client**: Mekel Miller, Esq.
- **Domain**: lexfiat.org
- **Primary Contact**: [Contact information]

---

**Deployment Date**: _____
**Deployed By**: _____
**Production URL**: https://lexfiat.org
**Fallback URL**: [Replit app URL]

## Final Verification

- [ ] Application accessible at lexfiat.org
- [ ] All functionality working as expected
- [ ] Performance meets requirements
- [ ] Security measures in place
- [ ] Documentation complete
- [ ] Handoff materials prepared

**Deployment Status**: ⬜ Complete ⬜ Issues Found ⬜ Rollback Required

**Notes**: 
_________________________________
_________________________________
_________________________________