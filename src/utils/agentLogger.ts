import { eventBus } from './eventBus';
import { AgentLog } from '../types';

export function logAgentAction(agent: AgentLog['agent'], type: AgentLog['type'], message: string) {
  const log: AgentLog = {
    id: `LOG-${Date.now()}`,
    agent,
    type,
    message,
    timestamp: new Date().toISOString()
  };
  // Emit event to the bridge (System A -> EventBus)
  eventBus.emit('agent.log_created', log);
}
