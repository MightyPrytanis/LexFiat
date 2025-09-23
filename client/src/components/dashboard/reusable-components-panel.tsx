// @CYRANO_REUSABLE: Dashboard panel for managing reusable components
import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Scan, 
  Download, 
  FileText, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Eye,
  Settings,
  RefreshCw
} from 'lucide-react';

interface ReusableComponent {
  id: string;
  name: string;
  filePath: string;
  componentType: 'service' | 'component' | 'utility' | 'workflow' | 'parser' | 'validator';
  description: string;
  reusabilityScore: number;
  cypherCompatibility: number;
  securityStatus: 'pending' | 'approved' | 'rejected' | 'needs_review';
  exportStatus: 'identified' | 'documented' | 'exported' | 'integrated';
  lastScanned: string;
  flaggedBy: string;
  tags?: string[];
  vulnerabilities?: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
  }>;
}

interface ScanReport {
  id: string;
  scanType: string;
  status: 'running' | 'completed' | 'failed';
  componentsFound: number;
  cypherCandidates: number;
  securityIssues: number;
  createdAt: string;
}

export function ReusableComponentsPanel() {
  const [components, setComponents] = useState<ReusableComponent[]>([]);
  const [scanReports, setScanReports] = useState<ScanReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<ReusableComponent | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSecurity, setFilterSecurity] = useState<string>('all');

  useEffect(() => {
    loadComponents();
    loadScanReports();
  }, []);

  const loadComponents = async () => {
    try {
      const response = await fetch('/api/components/reusable');
      const data = await response.json();
      setComponents(data);
    } catch (error) {
      console.error('Failed to load components:', error);
    }
  };

  const loadScanReports = async () => {
    try {
      const response = await fetch('/api/components/scan-reports');
      const data = await response.json();
      setScanReports(data.slice(0, 5)); // Show last 5 reports
    } catch (error) {
      console.error('Failed to load scan reports:', error);
    }
  };

  const performScan = async (scanType: 'full_scan' | 'incremental' | 'security_scan' = 'full_scan') => {
    setLoading(true);
    try {
      const response = await fetch('/api/components/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanType })
      });
      
      if (response.ok) {
        // Poll for updates
        setTimeout(() => {
          loadComponents();
          loadScanReports();
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to initiate scan:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDocumentation = async (componentId?: string) => {
    try {
      const url = componentId 
        ? `/api/components/${componentId}/generate-docs`
        : '/api/components/generate-docs';
      
      const response = await fetch(url, { method: 'POST' });
      if (response.ok) {
        loadComponents();
      }
    } catch (error) {
      console.error('Failed to generate documentation:', error);
    }
  };

  const exportComponent = async (componentId: string, format: 'mcp_module' | 'standalone' | 'library' = 'mcp_module') => {
    try {
      const response = await fetch(`/api/components/${componentId}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format, adaptForCyrano: true })
      });
      
      if (response.ok) {
        loadComponents();
      }
    } catch (error) {
      console.error('Failed to export component:', error);
    }
  };

  const performSecurityScan = async (componentId: string) => {
    try {
      const response = await fetch(`/api/components/${componentId}/security-scan`, {
        method: 'POST'
      });
      
      if (response.ok) {
        loadComponents();
      }
    } catch (error) {
      console.error('Failed to perform security scan:', error);
    }
  };

  const getSecurityIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'needs_review': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      service: 'bg-blue-100 text-blue-800',
      component: 'bg-green-100 text-green-800',
      utility: 'bg-purple-100 text-purple-800',
      workflow: 'bg-orange-100 text-orange-800',
      parser: 'bg-pink-100 text-pink-800',
      validator: 'bg-indigo-100 text-indigo-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const filteredComponents = components.filter(component => {
    const typeMatch = filterType === 'all' || component.componentType === filterType;
    const securityMatch = filterSecurity === 'all' || component.securityStatus === filterSecurity;
    return typeMatch && securityMatch;
  });

  const cypherCandidates = components.filter(c => c.cypherCompatibility >= 70);
  const highReusability = components.filter(c => c.reusabilityScore >= 80);
  const securityIssues = components.filter(c => 
    c.vulnerabilities && c.vulnerabilities.some(v => v.severity === 'high' || v.severity === 'critical')
  );

  return (
    <div className="bg-card-dark rounded-xl p-6 shadow-xl border border-border-gray">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Package className="w-6 h-6 text-accent-gold" />
          <h2 className="text-xl font-bold text-primary">Reusable Components</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => performScan('incremental')}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-2 bg-accent-gold text-primary-dark rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Scan className="w-4 h-4" />}
            <span className="text-sm font-medium">Scan</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-primary-dark rounded-lg p-4">
          <div className="text-2xl font-bold text-accent-gold">{components.length}</div>
          <div className="text-sm text-secondary">Total Components</div>
        </div>
        <div className="bg-primary-dark rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-400">{cypherCandidates.length}</div>
          <div className="text-sm text-secondary">Cyrano Candidates</div>
        </div>
        <div className="bg-primary-dark rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400">{highReusability.length}</div>
          <div className="text-sm text-secondary">High Reusability</div>
        </div>
        <div className="bg-primary-dark rounded-lg p-4">
          <div className="text-2xl font-bold text-red-400">{securityIssues.length}</div>
          <div className="text-sm text-secondary">Security Issues</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-primary-dark border border-border-gray rounded-lg px-3 py-2 text-primary"
        >
          <option value="all">All Types</option>
          <option value="service">Services</option>
          <option value="component">Components</option>
          <option value="utility">Utilities</option>
          <option value="workflow">Workflows</option>
          <option value="parser">Parsers</option>
          <option value="validator">Validators</option>
        </select>
        
        <select
          value={filterSecurity}
          onChange={(e) => setFilterSecurity(e.target.value)}
          className="bg-primary-dark border border-border-gray rounded-lg px-3 py-2 text-primary"
        >
          <option value="all">All Security States</option>
          <option value="approved">Approved</option>
          <option value="needs_review">Needs Review</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Components List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {filteredComponents.map((component) => (
          <div
            key={component.id}
            className="bg-primary-dark rounded-lg p-4 border border-border-gray hover:border-accent-gold transition-colors cursor-pointer"
            onClick={() => setSelectedComponent(component)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h3 className="font-semibold text-primary">{component.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(component.componentType)}`}>
                    {component.componentType}
                  </span>
                  {getSecurityIcon(component.securityStatus)}
                </div>
                
                <p className="text-sm text-secondary mt-1 line-clamp-2">
                  {component.description}
                </p>
                
                <div className="flex items-center space-x-4 mt-2 text-xs text-secondary">
                  <span>Reusability: {component.reusabilityScore}/100</span>
                  <span>Cypher: {component.cypherCompatibility}/100</span>
                  <span>Status: {component.exportStatus}</span>
                </div>
                
                {component.tags && component.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {component.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                {component.cypherCompatibility >= 70 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      exportComponent(component.id);
                    }}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    title="Export for Cyrano MCP"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    generateDocumentation(component.id);
                  }}
                  className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  title="Generate Documentation"
                >
                  <FileText className="w-4 h-4" />
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    performSecurityScan(component.id);
                  }}
                  className="p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  title="Security Scan"
                >
                  <Shield className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Scan Reports */}
      {scanReports.length > 0 && (
        <div className="mt-6 pt-6 border-t border-border-gray">
          <h3 className="text-lg font-semibold text-primary mb-4">Recent Scans</h3>
          <div className="space-y-2">
            {scanReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-3 bg-primary-dark rounded-lg">
                <div>
                  <span className="text-sm font-medium text-primary capitalize">
                    {report.scanType.replace('_', ' ')}
                  </span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    report.status === 'completed' ? 'bg-green-100 text-green-800' :
                    report.status === 'running' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {report.status}
                  </span>
                </div>
                <div className="text-sm text-secondary">
                  {report.componentsFound} components • {report.cypherCandidates} candidates
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Component Details Modal */}
      {selectedComponent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-card-dark rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-primary">{selectedComponent.name}</h3>
              <button
                onClick={() => setSelectedComponent(null)}
                className="text-secondary hover:text-primary"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-secondary">File Path</label>
                <p className="text-primary font-mono text-sm">{selectedComponent.filePath}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-secondary">Description</label>
                <p className="text-primary">{selectedComponent.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-secondary">Reusability Score</label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-accent-gold h-2 rounded-full" 
                        style={{ width: `${selectedComponent.reusabilityScore}%` }}
                      ></div>
                    </div>
                    <span className="text-primary text-sm">{selectedComponent.reusabilityScore}/100</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-secondary">Cypher Compatibility</label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-400 h-2 rounded-full" 
                        style={{ width: `${selectedComponent.cypherCompatibility}%` }}
                      ></div>
                    </div>
                    <span className="text-primary text-sm">{selectedComponent.cypherCompatibility}/100</span>
                  </div>
                </div>
              </div>
              
              {selectedComponent.vulnerabilities && selectedComponent.vulnerabilities.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-secondary">Security Issues</label>
                  <div className="space-y-2 mt-2">
                    {selectedComponent.vulnerabilities.map((vuln, index) => (
                      <div key={index} className="p-3 bg-red-900 bg-opacity-20 border border-red-800 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            vuln.severity === 'critical' ? 'bg-red-600 text-white' :
                            vuln.severity === 'high' ? 'bg-orange-600 text-white' :
                            vuln.severity === 'medium' ? 'bg-yellow-600 text-white' :
                            'bg-gray-600 text-white'
                          }`}>
                            {vuln.severity}
                          </span>
                          <span className="text-sm font-medium text-primary">{vuln.type}</span>
                        </div>
                        <p className="text-sm text-secondary mt-1">{vuln.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => exportComponent(selectedComponent.id)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Export for Cyrano
                </button>
                <button
                  onClick={() => generateDocumentation(selectedComponent.id)}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Generate Docs
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}