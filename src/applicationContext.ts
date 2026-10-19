import { eventBus } from './utils/eventBus';
import { initializeAuditBridge } from './utils/synapse';
import { AuditTrail, Linkage } from './types';

// Example Application Context (since full App.tsx is not present)

let applicationAuditLogs: AuditTrail[] = [
  {
    id: 'AUDIT-ROOT-1',
    timestamp: new Date().toISOString(),
    action: 'SYSTEM_STARTUP',
    details: 'System initialized',
    author: 'System',
    hash: 'CHK-ROOT-GENESIS-CHAIN-STABLE'
  }
];

export const getAuditLogs = () => applicationAuditLogs;
export const setAuditLogs = (updater: (prev: AuditTrail[]) => AuditTrail[]) => {
  applicationAuditLogs = updater(applicationAuditLogs);
};

// Initialize the intelligence bridge
initializeAuditBridge(getAuditLogs, setAuditLogs);

// Provide a helper function that the rest of the application (e.g. UI components)
// can call when a linkage's status is modified. This avoids coupling the UI
// directly to the audit system.
export function updateLinkageStatus(linkage: Linkage, newStatus: Linkage['investigatorStatus'], author: string) {
  linkage.investigatorStatus = newStatus;
  // This event emission acts as the trigger for the Synapse bridge
  eventBus.emit('linkage.status_changed', linkage, author);
}
