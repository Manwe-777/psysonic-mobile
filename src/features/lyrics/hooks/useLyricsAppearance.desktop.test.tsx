import { act, render } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@/store/authStore';
import { resetAuthStore } from '@/test/helpers/storeReset';
import { useLyricsAppearance } from './useLyricsAppearance';

function Surface() {
  const { appearanceStyle, showSizeIndicator } = useLyricsAppearance();
  return <div data-testid="pane" data-badge={String(showSizeIndicator)} style={appearanceStyle} />;
}

beforeEach(resetAuthStore);

// Counterpart of useLyricsAppearance.mobile.test.tsx: the desktop keeps the stored size.
describe('lyrics size on the desktop', () => {
  it('applies the stored size and the size badge setting', () => {
    act(() => useAuthStore.setState({ lyricsScale: 1.5, lyricsSizeIndicatorEnabled: true }));
    const { getByTestId } = render(<Surface />);
    const pane = getByTestId('pane');
    expect(pane.style.getPropertyValue('--lyrics-scale')).toBe('1.5');
    expect(pane.dataset.badge).toBe('true');
  });
});
