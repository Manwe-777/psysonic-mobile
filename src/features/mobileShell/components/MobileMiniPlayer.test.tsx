import { beforeEach, describe, expect, it } from 'vitest';
import { act, fireEvent, screen } from '@testing-library/react';
import { useLocation } from 'react-router';
import { renderWithProviders } from '@/test/helpers/renderWithProviders';
import { resetAllStores } from '@/test/helpers/storeReset';
import { makeTrack, seedQueue } from '@/test/helpers/factories';
import { registerDefaultCoverInvokeHandlers } from '@/test/mocks/tauri';
import { swipe } from '@/test/helpers/touch';
import { useOrbitStore } from '@/features/orbit';
import { usePlayerStore } from '@/features/playback';
import { useHubStore } from '@/features/hub';
import MobileMiniPlayer from './MobileMiniPlayer';

function Location() {
  return <div data-testid="location">{useLocation().pathname}</div>;
}

function renderMini() {
  return renderWithProviders(<><MobileMiniPlayer /><Location /></>, { route: '/' });
}

describe('MobileMiniPlayer', () => {
  beforeEach(() => {
    resetAllStores();
    registerDefaultCoverInvokeHandlers();
  });

  it('shows the station logo for a radio station that has one, the radio icon otherwise', () => {
    usePlayerStore.setState({ currentRadio: { id: 'r1', name: 'SmoothJazz', streamUrl: 'https://x', coverArt: 'ra-r1', serverId: 'srv' } });
    const { container, unmount } = renderMini();
    expect(container.querySelector('.mobile-miniplayer__cover svg.lucide-radio')).toBeNull();
    unmount();
    usePlayerStore.setState({ currentRadio: { id: 'r2', name: '1fm', streamUrl: 'https://y' } });
    const second = renderMini();
    expect(second.container.querySelector('.mobile-miniplayer__cover svg.lucide-radio')).not.toBeNull();
  });

  it('renders nothing while nothing plays', () => {
    const { container } = renderMini();
    expect(container.querySelector('.mobile-miniplayer')).toBeNull();
  });

  it('shows the current track and opens the player on tap', () => {
    const track = makeTrack({ title: 'Chaos', artist: 'Stormwind' });
    seedQueue([track]);
    renderMini();
    expect(screen.getByText('Chaos')).toBeInTheDocument();
    expect(screen.getByText('Stormwind')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Chaos/ }));
    expect(screen.getByTestId('location')).toHaveTextContent('/now-playing');
  });

  it('VoiceOver hears German in a German app: no "Now Playing" or "Play"', () => {
    seedQueue([makeTrack({ title: 'Chaos' })]);
    renderWithProviders(<MobileMiniPlayer />, { route: '/', language: 'de' });
    expect(screen.getByRole('button', { name: 'Läuft gerade: Chaos' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Abspielen' })).toBeInTheDocument();
  });

  it('swiping it up opens the player', () => {
    seedQueue([makeTrack({ title: 'Chaos' })]);
    const { container } = renderMini();
    const bar = container.querySelector('.mobile-miniplayer') as HTMLElement;
    act(() => { swipe(bar, { x: 200, y: 830 }, { x: 205, y: 700 }); });
    expect(screen.getByTestId('location')).toHaveTextContent('/now-playing');
  });

  it('a sideways swipe does not open the player', () => {
    seedQueue([makeTrack({ title: 'Chaos' })]);
    const { container } = renderMini();
    const bar = container.querySelector('.mobile-miniplayer') as HTMLElement;
    act(() => { swipe(bar, { x: 100, y: 830 }, { x: 300, y: 810 }); });
    expect(screen.getByTestId('location')).toHaveTextContent('/');
  });

  it('an Orbit guest gets no Next button (the host skips); the host keeps it', () => {
    seedQueue([makeTrack({ title: 'Chaos' })]);
    useOrbitStore.setState({ role: 'guest', phase: 'active' });
    const { unmount } = renderMini();
    expect(screen.queryByRole('button', { name: 'Next Track' })).toBeNull();
    unmount();
    useOrbitStore.setState({ role: 'host', phase: 'active' });
    renderMini();
    expect(screen.getByRole('button', { name: 'Next Track' })).toBeInTheDocument();
  });
});

describe('MobileMiniPlayer with a hub', () => {
  const hubOff = { enabled: false, url: '', token: '', status: 'off' as const, devices: [], remoteState: null, joined: true };

  beforeEach(() => {
    resetAllStores();
    registerDefaultCoverInvokeHandlers();
    useHubStore.setState(hubOff);
  });

  it('keeps Next and shows no hub button while no hub is set up', () => {
    seedQueue([makeTrack({ title: 'Chaos' })]);
    renderMini();
    expect(screen.getByRole('button', { name: 'Next Track' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Play on a device' })).toBeNull();
  });

  it('puts the hub button where Next was once a hub is set up', () => {
    useHubStore.setState({ enabled: true, url: 'https://hub.example.com', token: 'secret', status: 'connected' });
    seedQueue([makeTrack({ title: 'Chaos' })]);
    renderMini();
    expect(screen.getByRole('button', { name: 'Play on a device' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next Track' })).toBeNull();
  });

  it('shows the track another device plays and names that device', () => {
    const me = useHubStore.getState().deviceId;
    useHubStore.setState({
      enabled: true, url: 'https://hub.example.com', token: 'secret', status: 'connected',
      devices: [
        { id: me, name: 'Phone', kind: 'phone', active: false },
        { id: 'desk-other', name: 'Living Room', kind: 'desktop', active: true },
      ],
    });
    useHubStore.getState().setRuntime({
      remoteState: { from: 'desk-other', ts: 1, trackId: 't-remote', title: 'Elsewhere', artist: 'Band', playing: true },
      remoteStateAt: Date.now(),
    });
    renderMini();
    expect(screen.getByText('Elsewhere')).toBeInTheDocument();
    expect(screen.getByText('Playing on Living Room')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
  });
});
