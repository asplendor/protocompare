import { Maximize2, Minimize2 } from 'lucide-react';

interface PrototypeViewerProps {
  html: string;
  side: 'Left' | 'Right';
  isFullscreen: boolean;
  onExpand: () => void;
  onCollapse: () => void;
}

export default function PrototypeViewer({
  html,
  side,
  isFullscreen,
  onExpand,
  onCollapse,
}: PrototypeViewerProps) {
  const hasContent = typeof html === 'string' && html.trim().length > 0;

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
        <iframe
          srcDoc={html}
          sandbox="allow-scripts allow-forms allow-popups"
          title={`${side} prototype preview`}
          className="flex-1 w-full border-0"
          style={{ display: 'block' }}
        />
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
