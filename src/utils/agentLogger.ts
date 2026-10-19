import { AgentLog } from '../types';
import { eventBus } from './events';

class AgentLogger {
  private logs: AgentLog[] = [];

  log(agent: AgentLog['agent'], message: string, type: AgentLog['type'] = 'info'): AgentLog {
    const logEntry: AgentLog = {
      id: `AGENT-LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      agent,
      message,
      type,
      timestamp: new Date().toISOString()
    };

    this.logs.push(logEntry);

    // Emit event so other systems (like Synapse) can react
    eventBus.emit('agent.logged', logEntry);

    return logEntry;
  }

  getLogs(): AgentLog[] {
    return [...this.logs];
  }
}

export const agentLogger = new AgentLogger();
