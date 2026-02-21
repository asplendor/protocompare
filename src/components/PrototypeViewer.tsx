import { Maximize2, Minimize2 } from 'lucide-react';

interface PrototypeViewerProps {
  html: string;
  side: 'Left' | 'Right';
  zoom?: number;
  isFullscreen: boolean;
  onExpand: () => void;
  onCollapse: () => void;
}

export default function PrototypeViewer({
  html,
  side,
  zoom = 100,
  isFullscreen,
  onExpand,
  onCollapse,
}: PrototypeViewerProps) {
  const hasContent = typeof html === 'string' && html.trim().length > 0;
  const scale = zoom / 100;
  const wrapperHeightPercent = 100 / scale;

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Toolbar strip */}
      <div
        className="flex items-center justify-between px-3 py-1.5 border-b shrink-0"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          {side}
        </span>
        <button
          onClick={isFullscreen ? onCollapse : onExpand}
          title={isFullscreen ? 'Exit fullscreen' : 'Expand'}
          className="rounded p-1 transition-colors"
          style={{ color: 'var(--color-text-secondary)' }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = 'var(--color-primary)')
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-secondary)')
          }
        >
          {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </button>
      </div>

      {hasContent ? (
        <div className="flex-1 min-h-0 overflow-hidden">
          <div
            style={{
              height: `${wrapperHeightPercent}%`,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              width: `${wrapperHeightPercent}%`,
            }}
          >
            <iframe
              srcDoc={html}
              sandbox="allow-scripts allow-forms allow-popups"
              title={`${side} prototype preview`}
              className="w-full border-0 block"
              style={{ height: '100%' }}
            />
          </div>
        </div>
      ) : (
        <div
          className="flex-1 flex items-center justify-center border-2 border-dashed min-h-0"
          style={{ borderColor: '#334155' }}
        >
          <p className="text-sm" style={{ color: '#64748b' }}>
            Drop your first HTML prototype here
          </p>
        </div>
      )}
    </div>
  );
}
