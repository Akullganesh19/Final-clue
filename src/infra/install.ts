import { installRequestCoalescer } from './requestCoalescer';

export function installInvisibleInfrastructure() {
  installRequestCoalescer();
  console.log('[Phantom] Invisible infrastructure installed: Request Coalescing');
}
