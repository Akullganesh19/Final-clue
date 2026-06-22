import { eventBus } from './eventBus';
import { AgentLog } from '../types';

export const agentLogger = {
  logAction: (agent: AgentLog['agent'], message: string) => {
    const log: AgentLog = {
      id: `AGENT-LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      agent,
      message,
      timestamp: new Date().toISOString(),
      type: 'action'
    };

    // System A (Agent System) emits this event blindly
    eventBus.emit('agent.log', log);
    return log;
  },

  logInfo: (agent: AgentLog['agent'], message: string) => {
     const log: AgentLog = {
      id: `AGENT-LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      agent,
      message,
      timestamp: new Date().toISOString(),
      type: 'info'
    };
    eventBus.emit('agent.log', log);
    return log;
  }
};
