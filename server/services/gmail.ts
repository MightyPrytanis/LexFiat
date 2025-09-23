import { google } from 'googleapis';

// @CYRANO_REUSABLE: Component reusability tags
// @CYRANO_REUSABLE_SERVICE: Marks a service class or module as potentially reusable for MCP integration
// @CYRANO_REUSABLE_PARSER: Marks data parsing or transformation logic as reusable
// @CYRANO_REUSABLE_WORKFLOW: Marks workflow or process logic as reusable
// @CYRANO_HIGH_REUSABILITY: High reusability score component (80+)
// @CYRANO_STANDALONE: Component with minimal dependencies
// @CYRANO_DOCUMENTED: Component has comprehensive documentation

export interface GmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  body: string;
  attachments: Array<{
    filename: string;
    mimeType: string;
    data: string;
  }>;
  receivedAt: Date;
}

export interface DocumentClassification {
  type: 'motion' | 'pleading' | 'discovery' | 'order' | 'notice' | 'settlement' | 'other';
  urgency: 'low' | 'normal' | 'high' | 'critical';
  confidence: number;
  keywords: string[];
}

export class GmailService {
  private gmail: any;

  constructor(credentials: any) {
    const auth = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      process.env.GMAIL_REDIRECT_URI
    );
    
    auth.setCredentials(credentials);
    this.gmail = google.gmail({ version: 'v1', auth });
  }

  async getRecentMessages(maxResults: number = 50): Promise<GmailMessage[]> {
    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        maxResults,
        q: 'is:unread OR (from:(@court.gov OR @clerk.gov OR @lawfirm.com) newer_than:7d)',
      });

      const messages: GmailMessage[] = [];
      
      if (response.data.messages) {
        for (const message of response.data.messages) {
          const fullMessage = await this.gmail.users.messages.get({
            userId: 'me',
            id: message.id,
            format: 'full',
          });

          const parsed = this.parseGmailMessage(fullMessage.data);
          if (parsed) {
            messages.push(parsed);
          }
        }
      }

      return messages;
    } catch (error) {
      throw new Error(`Gmail API error: ${(error as Error).message}`);
    }
  }

  private parseGmailMessage(messageData: any): GmailMessage | null {
    try {
      const headers = messageData.payload.headers;
      const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';
      const from = headers.find((h: any) => h.name === 'From')?.value || '';
      const to = headers.find((h: any) => h.name === 'To')?.value || '';
      const date = headers.find((h: any) => h.name === 'Date')?.value || '';

      let body = '';
      const attachments: any[] = [];

      // Extract body and attachments
      if (messageData.payload.body?.data) {
        body = Buffer.from(messageData.payload.body.data, 'base64').toString();
      } else if (messageData.payload.parts) {
        this.extractBodyAndAttachments(messageData.payload.parts, { body: '', attachments });
      }

      return {
        id: messageData.id,
        threadId: messageData.threadId,
        subject,
        from,
        to,
        body,
        attachments,
        receivedAt: new Date(date),
      };
    } catch (error) {
      console.error('Error parsing Gmail message:', error);
      return null;
    }
  }

  private extractBodyAndAttachments(parts: any[], result: { body: string; attachments: any[] }) {
    for (const part of parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        result.body += Buffer.from(part.body.data, 'base64').toString();
      } else if (part.filename && part.body?.attachmentId) {
        result.attachments.push({
          filename: part.filename,
          mimeType: part.mimeType,
          attachmentId: part.body.attachmentId,
        });
      } else if (part.parts) {
        this.extractBodyAndAttachments(part.parts, result);
      }
    }
  }

  classifyDocument(message: GmailMessage): DocumentClassification {
    const subject = message.subject.toLowerCase();
    const body = message.body.toLowerCase();
    const combined = `${subject} ${body}`;

    // Legal document type classification
    const classifications = [
      {
        type: 'motion' as const,
        keywords: ['motion', 'petition', 'application', 'request for'],
        urgencyKeywords: ['emergency', 'ex parte', 'temporary restraining', 'tro'],
      },
      {
        type: 'pleading' as const,
        keywords: ['complaint', 'answer', 'counterclaim', 'cross-claim'],
        urgencyKeywords: ['service', 'deadline'],
      },
      {
        type: 'discovery' as const,
        keywords: ['interrogatories', 'production', 'deposition', 'subpoena'],
        urgencyKeywords: ['deadline', 'due'],
      },
      {
        type: 'order' as const,
        keywords: ['order', 'judgment', 'decree', 'ruling'],
        urgencyKeywords: ['immediate', 'forthwith'],
      },
      {
        type: 'notice' as const,
        keywords: ['notice', 'hearing', 'trial', 'conference'],
        urgencyKeywords: ['tomorrow', 'today', 'urgent'],
      },
      {
        type: 'settlement' as const,
        keywords: ['settlement', 'offer', 'mediation', 'negotiation'],
        urgencyKeywords: ['expires', 'deadline'],
      },
    ];

    let bestMatch: { type: DocumentClassification['type'], confidence: number, keywords: string[] } = { type: 'other', confidence: 0, keywords: [] };

    for (const classification of classifications) {
      const matchCount = classification.keywords.filter(keyword => 
        combined.includes(keyword)
      ).length;

      if (matchCount > 0) {
        const confidence = matchCount / classification.keywords.length;
        if (confidence > bestMatch.confidence) {
          bestMatch = {
            type: classification.type,
            confidence,
            keywords: classification.keywords.filter(keyword => combined.includes(keyword)),
          };
        }
      }
    }

    // Determine urgency
    let urgency: 'low' | 'normal' | 'high' | 'critical' = 'normal';
    const urgencyKeywords = ['emergency', 'urgent', 'immediate', 'deadline', 'expires', 'tro', 'ex parte'];
    const urgencyMatches = urgencyKeywords.filter(keyword => combined.includes(keyword)).length;

    if (urgencyMatches >= 2 || combined.includes('emergency') || combined.includes('tro')) {
      urgency = 'critical';
    } else if (urgencyMatches === 1) {
      urgency = 'high';
    }

    return {
      type: bestMatch.type,
      urgency,
      confidence: bestMatch.confidence,
      keywords: bestMatch.keywords,
    };
  }
}
