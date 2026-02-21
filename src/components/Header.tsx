import React from 'react';
import { Layers } from 'lucide-react';

interface HeaderProps {
  rightSlot?: React.ReactNode;
  /** When true, "← Back to split" button is shown instead of normal header actions */
  fullscreenMode?: boolean;
  onExitFullscreen?: () => void;
}

export default function Header({ rightSlot, fullscreenMode, onExitFullscreen }: HeaderProps) {
  return (
    <header
      className="flex items-center justify-between px-5 py-3 border-b"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        minHeight: '52px',
      }}
    >
      {fullscreenMode ? (
        <button
          onClick={onExitFullscreen}
          className="btn-ghost flex items-center gap-2 px-3 py-1.5 rounded text-sm"
        >
          ← Back to split
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <Layers size={20} style={{ color: 'var(--color-primary)' }} />
          <span className="font-semibold tracking-tight text-base" style={{ color: 'var(--color-text)' }}>
            ProtoCompare<sup className="text-xs align-super" style={{ marginLeft: '-3px' }}>™</sup>
          </span>
        </div>
      )}

      <div className="flex items-center gap-3">{rightSlot}</div>
    </header>
  );
}
