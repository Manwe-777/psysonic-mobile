import { useHubStore } from '@/features/hub';

/** True once a hub is set up on this phone: only then do the hub button and "Playing on" show. */
export function useMobileHubSetUp(): boolean {
  return useHubStore(s => s.enabled && !!s.url && !!s.token);
}
