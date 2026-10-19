import { eventBus } from './eventBus';
import { AgentLog, AuditTrail } from '../types';
import { createAuditLog } from './audit';

// In a real application, this would interface with a database or a global state store.
// For this connection, we expose a shared array to simulate the persistent global Audit System.
export const globalAuditStore: AuditTrail[] = [];

export class SynapseBridge {
  private auditLogs: AuditTrail[];

  constructor(initialAuditLogs: AuditTrail[] = globalAuditStore) {
    this.auditLogs = initialAuditLogs;
    this.initializeConnection();
  }

  private initializeConnection() {
    // System A (Agents) emits events, System B (Audit) listens
    // Creates emergent intelligence: actions are now implicitly tracked without agents knowing
    eventBus.on('agent.log', (log: AgentLog) => {
      // Enrichment Pattern: Translating one domain's concept to another
      if (log.type === 'action') {
        const actionName = `AGENT_ACTION_${log.agent.toUpperCase()}`;
        console.log(`[SynapseBridge] Neural pathway firing: Agent ${log.agent} action mapped to Audit System`);

        const newLogs = createAuditLog(
          this.auditLogs,
          actionName,
          log.message,
          `System Agent (${log.agent})`
        );

        // Update the reference to the new array created by createAuditLog
        // and sync it back to the global store so the rest of the application can read it.
        this.auditLogs = newLogs;

        // Mutate the global store to reflect the new state
        globalAuditStore.length = 0;
        globalAuditStore.push(...newLogs);
      }
    });
  }

  public getAuditLogs(): AuditTrail[] {
    return this.auditLogs;
  }
}

// Instantiate the singleton globally so the listener is active as soon as the file is imported.
export const synapseBridgeInstance = new SynapseBridge();
