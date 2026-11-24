import { describe, expect, it } from 'vitest';
import { parseHubConnectLink } from './hubConnectLink';

const link = (query: string) => `psysonic-hub://connect?${query}`;

describe('parseHubConnectLink', () => {
  it('reads address and token, URL-decoded', () => {
    expect(parseHubConnectLink(link('v=1&url=https%3A%2F%2Fhub.example.com&token=a%2Bb%3Dc'))).toEqual({
      url: 'https://hub.example.com',
      token: 'a+b=c',
    });
  });

  it('accepts a LAN address with a port and surrounding whitespace', () => {
    expect(parseHubConnectLink(`  ${link('v=1&url=http%3A%2F%2F192.168.1.5%3A5533&token=t1')}\n`)).toEqual({
      url: 'http://192.168.1.5:5533',
      token: 't1',
    });
  });

  it('ignores another scheme', () => {
    expect(parseHubConnectLink('https://hub.example.com/?v=1&url=https%3A%2F%2Fx&token=t')).toBeNull();
    expect(parseHubConnectLink('psysonic://connect?v=1&url=https%3A%2F%2Fx&token=t')).toBeNull();
  });

  it('ignores an unknown version or target', () => {
    expect(parseHubConnectLink(link('v=2&url=https%3A%2F%2Fx&token=t'))).toBeNull();
    expect(parseHubConnectLink(link('url=https%3A%2F%2Fx&token=t'))).toBeNull();
    expect(parseHubConnectLink('psysonic-hub://pair?v=1&url=https%3A%2F%2Fx&token=t')).toBeNull();
  });

  it('needs an http(s) address and a token', () => {
    expect(parseHubConnectLink(link('v=1&url=https%3A%2F%2Fx'))).toBeNull();
    expect(parseHubConnectLink(link('v=1&token=t'))).toBeNull();
    expect(parseHubConnectLink(link('v=1&url=javascript%3Aalert(1)&token=t'))).toBeNull();
  });

  it('ignores plain text', () => {
    expect(parseHubConnectLink('hello')).toBeNull();
    expect(parseHubConnectLink('')).toBeNull();
  });
});
