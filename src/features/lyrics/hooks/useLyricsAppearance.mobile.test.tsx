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

describe('lyrics size in the touch shell', () => {
  it('ignores a stored size and hides the size badge (no size control on the phone)', () => {
    act(() => useAuthStore.setState({ lyricsScale: 1.5, lyricsSizeIndicatorEnabled: true }));
    const { getByTestId } = render(<Surface />);
    const pane = getByTestId('pane');
    expect(pane.style.getPropertyValue('--lyrics-scale')).toBe('1');
    expect(pane.dataset.badge).toBe('false');
  });
});
