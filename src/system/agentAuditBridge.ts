import { eventBus } from '../utils/eventBus';
import { AgentLog } from '../types';

/**
 * SYNAPSE CONNECTION: Agent Logging ↔ Cryptographic Audit Trail
 *
 * The agent system produces logs about its thought process.
 * The audit system maintains a cryptographic chain of custody on the server.
 * They don't talk. We'll connect them so that any 'action' taken by an
 * agent is automatically POSTed to the audit trail without the agent needing
 * to know about the audit system.
 */

export function setupAgentAuditBridge() {
  eventBus.on('agent.log', async (log: AgentLog) => {
    // Only care about substantive actions that modify state or produce findings
    if (log.type === 'action') {
      const actionStr = `AGENT_ACTION_${log.agent.toUpperCase()}`;

      try {
        const response = await fetch('/api/audit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: actionStr,
            details: log.message,
            author: `Agent System: ${log.agent}`
          })
        });

        if (response.ok) {
           console.log(`[Synapse Bridge] Connected agent log ${log.id} to audit trail via HTTP.`);
        } else {
           console.error('[Synapse Bridge] Server failed to record audit log', await response.text());
        }
      } catch (error) {
         console.error('[Synapse Bridge] Network error recording audit log', error);
      }
    }
  });
}
