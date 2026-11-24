/**
 * The hub's QR code (`psysonic-hub://connect?v=1&url=…&token=…`, hub repository
 * `docs/PROTOCOL.md`, "Connecting by QR code"). Anything with another scheme, another `v`,
 * or without both values is not a hub code.
 *
 * The token is a secret: callers store it, never show or log it.
 */
export interface HubConnectLink {
  url: string;
  token: string;
}

const SCHEME = 'psysonic-hub:';
const VERSION = '1';

export function parseHubConnectLink(text: string): HubConnectLink | null {
  const raw = text.trim();
  if (!raw.toLowerCase().startsWith(`${SCHEME}//`)) return null;
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return null;
  }
  // `psysonic-hub://connect?…`: a custom scheme puts "connect" in the host.
  const target = (parsed.host || parsed.pathname.replace(/^\/+/, '')).toLowerCase();
  if (target !== 'connect') return null;
  if (parsed.searchParams.get('v') !== VERSION) return null;
  const url = parsed.searchParams.get('url')?.trim() ?? '';
  const token = parsed.searchParams.get('token') ?? '';
  if (!/^https?:\/\//i.test(url) || !token) return null;
  return { url, token };
}
