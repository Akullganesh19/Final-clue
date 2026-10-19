export interface Case {
  id: string;
  title: string;
  date: string;
  location: string;
  narrative: string;
  moDescription: string;
  moCategories: string[];
  entities: {
    person: string[];
    vehicle: string[];
    location: string[];
    weapon: string[];
  };
  evidenceDocUrl?: string;
  status: 'open' | 'cold' | 'linked';
  notes?: string;
}

export interface Linkage {
  id: string;
  caseA: Case;
  caseB: Case;
  confidence: number; // 0 to 100
  signals: {
    semantic: number;
    entity: number;
    temporal: number;
    mo: number;
  };
  evidence: string[]; // matching quotes or items
  criticFlags: {
    type: 'warning' | 'conflict' | 'info';
    message: string;
  }[];
  summary: string;
  investigatorStatus: 'pending' | 'confirmed' | 'rejected' | 'more_info';
  notes?: string;
}

export interface AgentLog {
  id: string;
  agent: 'Planner' | 'Retrieval' | 'Evidence' | 'Critic' | 'Summarizer' | 'Audit';
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'warn' | 'action';
}

export interface AuditTrail {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  author: string;
}

export interface SystemWeights {
  semantic: number; // e.g. 0.3
  entity: number;   // e.g. 0.3
  temporal: number; // e.g. 0.2
  mo: number;       // e.g. 0.2
}