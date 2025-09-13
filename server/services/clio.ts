export interface ClioMatter {
  id: string;
  display_number: string;
  description: string;
  client: {
    id: string;
    name: string;
    email: string;
  };
  practice_area: string;
  status: string;
  billable_hours: number;
  outstanding_balance: number;
}

export interface ClioContact {
  id: string;
  name: string;
  email: string;
  type: 'Person' | 'Company';
}

export class ClioService {
  private baseUrl = 'https://app.clio.com/api/v4';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Clio API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getMatters(): Promise<ClioMatter[]> {
    const response = await this.makeRequest('/matters');
    return response.data || [];
  }

  async getMatterById(id: string): Promise<ClioMatter | null> {
    try {
      const response = await this.makeRequest(`/matters/${id}`);
      return response.data || null;
    } catch (error) {
      if ((error as Error).message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  async findMattersByClient(clientName: string): Promise<ClioMatter[]> {
    const response = await this.makeRequest(`/matters?query=${encodeURIComponent(clientName)}`);
    return response.data || [];
  }

  async findMattersByKeywords(keywords: string[]): Promise<ClioMatter[]> {
    const query = keywords.join(' ');
    const response = await this.makeRequest(`/matters?query=${encodeURIComponent(query)}`);
    return response.data || [];
  }

  async createActivity(matterId: string, activity: {
    type: string;
    description: string;
    date: string;
    hours?: number;
  }): Promise<any> {
    const response = await this.makeRequest('/activities', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          matter: { id: matterId },
          type: activity.type,
          description: activity.description,
          date: activity.date,
          quantity: activity.hours ? activity.hours * 60 : 0, // Clio uses minutes
        },
      }),
    });
    return response.data;
  }

  async createDocument(matterId: string, document: {
    name: string;
    description?: string;
    content?: string;
  }): Promise<any> {
    const response = await this.makeRequest('/documents', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          matter: { id: matterId },
          name: document.name,
          description: document.description,
          // Note: For actual file uploads, you'd need to handle multipart/form-data
        },
      }),
    });
    return response.data;
  }

  async createTask(matterId: string, task: {
    name: string;
    description?: string;
    due_date?: string;
    priority?: 'Low' | 'Normal' | 'High';
  }): Promise<any> {
    const response = await this.makeRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          matter: { id: matterId },
          name: task.name,
          description: task.description,
          due_date: task.due_date,
          priority: task.priority || 'Normal',
        },
      }),
    });
    return response.data;
  }

  async getBillableHours(matterId: string): Promise<number> {
    const response = await this.makeRequest(`/activities?matter_id=${matterId}&type=TimeEntry`);
    const activities = response.data || [];
    return activities.reduce((total: number, activity: any) => {
      return total + (activity.quantity / 60); // Convert minutes to hours
    }, 0);
  }

  async getOutstandingBalance(matterId: string): Promise<number> {
    const response = await this.makeRequest(`/matters/${matterId}/bills`);
    const bills = response.data || [];
    return bills.reduce((total: number, bill: any) => {
      return total + (bill.total - bill.paid);
    }, 0);
  }
}
