import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MonitorSpeaker } from 'lucide-react';
import { HubPlayOnList, HubStatusBadge, useHubStore } from '@/features/hub';
import MobileSheet from '@/features/mobileShell/components/MobileSheet';
import { useMobileHubSetUp } from '@/features/mobileShell/hooks/useMobileHubSetUp';

/**
 * "Play on" button of the touch shell (player bar and player footer) with its sheet: the
 * devices on the hub and the "Hub control" switch. Renders nothing while no hub is set up.
 */
export default function MobileHubButton({ className, iconSize = 22 }: { className: string; iconSize?: number }) {
  const { t } = useTranslation();
  const setUp = useMobileHubSetUp();
  const status = useHubStore(s => s.status);
  const joined = useHubStore(s => s.joined);
  const myId = useHubStore(s => s.deviceId);
  const active = useHubStore(s => s.devices.find(d => d.active && d.kind !== 'web'));
  const [open, setOpen] = useState(false);

  if (!setUp) return null;
  const elsewhere = status === 'connected' && joined && !!active && active.id !== myId;

  return (
    <>
      <button
        type="button"
        className={`${className}${elsewhere ? ' is-active' : ''}`}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={elsewhere ? t('player.hubPlayingOn', { name: active.name }) : t('player.hubPlayOnDevice')}
      >
        <MonitorSpeaker size={iconSize} aria-hidden="true" />
      </button>
      {open && (
        <MobileSheet title={t('player.hubPlayOn')} onClose={() => setOpen(false)} className="mobile-hub-sheet">
          {status !== 'connected' && (
            <div className="mobile-hub-sheet__status"><HubStatusBadge /></div>
          )}
          <HubPlayOnList className="hub-device-list--touch" onPicked={() => setOpen(false)} />
        </MobileSheet>
      )}
    </>
  );
}
