import { eventBus } from './eventBus';
import { createAuditLog } from './audit';
import { AuditTrail, Linkage } from '../types';

export function initializeAuditBridge(
  getLogs: () => AuditTrail[],
  setLogs: (updater: (prev: AuditTrail[]) => AuditTrail[]) => void
) {
  eventBus.on('linkage.status_changed', (linkage: Linkage, author: string = "System Event Bridge") => {
    setLogs((prevLogs) => {
      const details = `Status changed to ${linkage.investigatorStatus} for linkage ${linkage.id}`;
      return createAuditLog(prevLogs, 'LINKAGE_STATUS_CHANGED', details, author);
    });
  });
}
