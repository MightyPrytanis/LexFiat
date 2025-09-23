import { 
  MaeWorkflow, 
  MaeWorkflowStep, 
  MaeWorkflowExecution,
  InsertMaeWorkflow,
  InsertMaeWorkflowStep,
  InsertMaeWorkflowExecution
} from "../../shared/schema.js";

export interface MaeWorkflowConfig {
  agents?: string[];
  steps?: MaeWorkflowStepConfig[];
  triggers?: string[];
  outputs?: string[];
}

export interface MaeWorkflowStepConfig {
  name: string;
  type: 'compare' | 'critique' | 'collaborate' | 'custom';
  agent?: string;
  inputs?: string[];
  outputs?: string[];
  conditions?: Record<string, any>;
}

export class MaeWorkflowService {
  /**
   * Get predefined MAE workflow templates
   */
  static getWorkflowTemplates(): MaeWorkflowTemplate[] {
    return [
      {
        id: 'compare',
        name: 'Compare',
        type: 'compare',
        description: 'Multi-agent document comparison and analysis workflow',
        icon: 'FileComparison',
        config: {
          agents: ['document_analyzer', 'legal_comparator', 'fact_checker'],
          steps: [
            {
              name: 'Document Ingestion',
              type: 'compare',
              agent: 'document_analyzer',
              inputs: ['documents'],
              outputs: ['parsed_content', 'metadata']
            },
            {
              name: 'Comparative Analysis',
              type: 'compare',
              agent: 'legal_comparator',
              inputs: ['parsed_content'],
              outputs: ['comparison_report', 'differences', 'similarities']
            },
            {
              name: 'Fact Verification',
              type: 'compare',
              agent: 'fact_checker',
              inputs: ['comparison_report'],
              outputs: ['verified_facts', 'discrepancies', 'confidence_scores']
            }
          ],
          triggers: ['document_upload', 'comparison_request'],
          outputs: ['comparison_report', 'analysis_summary', 'recommendations']
        },
        isDefault: true
      },
      {
        id: 'critique',
        name: 'Critique',
        type: 'critique',
        description: 'Legal document review and critique workflow',
        icon: 'MessageSquareText',
        config: {
          agents: ['legal_reviewer', 'compliance_checker', 'quality_assessor'],
          steps: [
            {
              name: 'Legal Review',
              type: 'critique',
              agent: 'legal_reviewer',
              inputs: ['document'],
              outputs: ['legal_analysis', 'issues_identified', 'suggestions']
            },
            {
              name: 'Compliance Check',
              type: 'critique',
              agent: 'compliance_checker',
              inputs: ['document', 'legal_analysis'],
              outputs: ['compliance_status', 'violations', 'corrective_actions']
            },
            {
              name: 'Quality Assessment',
              type: 'critique',
              agent: 'quality_assessor',
              inputs: ['document', 'legal_analysis', 'compliance_status'],
              outputs: ['quality_score', 'improvement_recommendations', 'final_critique']
            }
          ],
          triggers: ['document_review_request', 'quality_check'],
          outputs: ['critique_report', 'recommendations', 'quality_metrics']
        },
        isDefault: true
      },
      {
        id: 'collaborate',
        name: 'Collaborate',
        type: 'collaborate',
        description: 'Multi-party collaboration workflow',
        icon: 'Users',
        config: {
          agents: ['collaboration_coordinator', 'task_manager', 'communication_facilitator'],
          steps: [
            {
              name: 'Collaboration Setup',
              type: 'collaborate',
              agent: 'collaboration_coordinator',
              inputs: ['participants', 'objectives'],
              outputs: ['collaboration_plan', 'roles_assignments', 'timeline']
            },
            {
              name: 'Task Distribution',
              type: 'collaborate',
              agent: 'task_manager',
              inputs: ['collaboration_plan', 'participants'],
              outputs: ['task_assignments', 'deadlines', 'dependencies']
            },
            {
              name: 'Communication Facilitation',
              type: 'collaborate',
              agent: 'communication_facilitator',
              inputs: ['task_assignments', 'progress_updates'],
              outputs: ['status_reports', 'coordination_messages', 'collaboration_metrics']
            }
          ],
          triggers: ['collaboration_request', 'multi_party_task'],
          outputs: ['collaboration_results', 'team_performance', 'deliverables']
        },
        isDefault: true
      },
      {
        id: 'custom',
        name: 'Custom Workflow',
        type: 'custom',
        description: 'Build your own custom workflow',
        icon: 'Settings',
        config: {
          agents: [],
          steps: [],
          triggers: [],
          outputs: []
        },
        isDefault: false
      }
    ];
  }

  /**
   * Create a new MAE workflow from template or custom configuration
   */
  static createWorkflowFromTemplate(
    templateId: string, 
    customConfig?: Partial<MaeWorkflowConfig>,
    attorneyId?: string
  ): InsertMaeWorkflow {
    const template = this.getWorkflowTemplates().find(t => t.id === templateId);
    if (!template) {
      throw new Error(`Workflow template ${templateId} not found`);
    }

    const config = customConfig ? { ...template.config, ...customConfig } : template.config;

    return {
      name: template.name,
      type: template.type,
      description: template.description,
      config: config,
      isTemplate: false,
      attorneyId: attorneyId || null
    };
  }

  /**
   * Generate workflow steps from configuration
   */
  static generateWorkflowSteps(workflowId: string, config: MaeWorkflowConfig): InsertMaeWorkflowStep[] {
    const steps: InsertMaeWorkflowStep[] = [];
    
    if (config.steps) {
      config.steps.forEach((stepConfig, index) => {
        steps.push({
          workflowId,
          stepOrder: index + 1,
          stepType: 'agent_action',
          stepName: stepConfig.name,
          config: stepConfig
        });
      });
    }

    return steps;
  }

  /**
   * Execute a MAE workflow
   */
  static async executeWorkflow(
    workflowId: string, 
    caseId: string, 
    executionData?: Record<string, any>
  ): Promise<InsertMaeWorkflowExecution> {
    return {
      workflowId,
      caseId,
      status: 'pending',
      currentStep: 1,
      results: null,
      executionData: executionData || {}
    };
  }

  /**
   * Get workflow execution status
   */
  static getExecutionStatus(execution: MaeWorkflowExecution): {
    status: string;
    progress: number;
    currentStepName?: string;
    estimatedTimeRemaining?: string;
  } {
    const progress = execution.currentStep ? (execution.currentStep / 3) * 100 : 0; // Assuming 3 steps average
    
    return {
      status: execution.status,
      progress: Math.min(progress, 100),
      currentStepName: `Step ${execution.currentStep}`,
      estimatedTimeRemaining: execution.status === 'running' ? '2-5 minutes' : undefined
    };
  }
}

export interface MaeWorkflowTemplate {
  id: string;
  name: string;
  type: 'compare' | 'critique' | 'collaborate' | 'custom';
  description: string;
  icon: string;
  config: MaeWorkflowConfig;
  isDefault: boolean;
}