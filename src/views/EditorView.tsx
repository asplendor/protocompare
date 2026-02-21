import { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import Header from '../components/Header';
import FileUploader from '../components/FileUploader';
import PrototypeViewer from '../components/PrototypeViewer';
import ShareButton from '../components/ShareButton';

type Side = 'left' | 'right';
type FullscreenSide = Side | null;

export default function EditorView() {
  const [leftHTML, setLeftHTML] = useState<string | null>(null);
  const [rightHTML, setRightHTML] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState<Side | null>(null);
  const [fullscreenSide, setFullscreenSide] = useState<FullscreenSide>(null);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Detect small screens (below 900px) for banner
  useEffect(() => {
    const check = () => setIsSmallScreen(window.innerWidth < 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const isFullscreen = fullscreenSide !== null;

  // Pane CSS classes — CSS-only toggle, iframes never remount
  const leftPaneClass = [
    'pane-transition overflow-hidden border-r flex flex-col',
    fullscreenSide === 'right'
      ? 'hidden'
      : fullscreenSide === 'left'
        ? 'w-full'
        : 'w-1/2',
  ].join(' ');

  const rightPaneClass = [
    'pane-transition overflow-hidden flex flex-col',
    fullscreenSide === 'left'
      ? 'hidden'
      : fullscreenSide === 'right'
        ? 'w-full'
        : 'w-1/2',
  ].join(' ');

  return (
    <div className="flex flex-col flex-1 min-h-0" style={{ background: 'var(--color-bg)' }}>
      {/* Small screen banner — non-blocking */}
      {isSmallScreen && (
        <div
          className="px-4 py-2 text-sm text-center shrink-0"
          style={{
            background: 'rgba(20,184,166,0.12)',
            borderBottom: '1px solid rgba(20,184,166,0.25)',
            color: 'var(--color-primary)',
          }}
        >
          ProtoCompare is optimized for desktop. For the best experience, open this on a larger screen.
        </div>
      )}

      {/* Header */}
      <Header
        fullscreenMode={isFullscreen}
        onExitFullscreen={() => setFullscreenSide(null)}
        rightSlot={
          !isFullscreen && (
            <ShareButton leftHTML={leftHTML} rightHTML={rightHTML} />
          )
        }
      />

      {/* Hero + how it works — only when not fullscreen; collapse based on content */}
      {!isFullscreen && !leftHTML && !rightHTML && (
        <>
          <section className="text-center py-6 shrink-0">
            <h1 className="text-2xl font-semibold" style={{ color: '#f1f5f9' }}>
              Compare two HTML prototypes side by side.
            </h1>
            <p className="text-base mt-1" style={{ color: '#64748b' }}>
              Feedback faster.
            </p>
          </section>
          <div
            className="text-center text-xs shrink-0 pb-3"
            style={{ color: '#64748b' }}
          >
            ① Upload or paste HTML → ② Compare side by side → ③ Share a link
          </div>
        </>
      )}
      {!isFullscreen && (!!leftHTML !== !!rightHTML) && (
        <div
          className="text-center text-xs shrink-0 pb-3"
          style={{ color: '#64748b' }}
        >
          ① Upload or paste HTML → ② Compare side by side → ③ Share a link
        </div>
      )}

      {/* Main panes */}
      <div className="flex flex-1 min-h-0" style={{ borderColor: 'var(--color-border)' }}>
        {/* LEFT PANE */}
        <div
          className={leftPaneClass}
          style={{ borderColor: 'var(--color-border)' }}
        >
          {leftHTML ? (
            <PrototypeViewer
              html={leftHTML}
              side="Left"
              isFullscreen={fullscreenSide === 'left'}
              onExpand={() => setFullscreenSide('left')}
              onCollapse={() => setFullscreenSide(null)}
            />
          ) : (
            <EmptyPane
              side="Left"
              hidden={fullscreenSide === 'right'}
              onOpen={() => setOpenModal('left')}
            />
          )}
        </div>

        {/* RIGHT PANE */}
        <div
          className={rightPaneClass}
          style={fullscreenSide === 'right' ? { marginLeft: 'auto' } : undefined}
        >
          {rightHTML ? (
            <PrototypeViewer
              html={rightHTML}
              side="Right"
              isFullscreen={fullscreenSide === 'right'}
              onExpand={() => setFullscreenSide('right')}
              onCollapse={() => setFullscreenSide(null)}
            />
          ) : (
            <EmptyPane
              side="Right"
              hidden={fullscreenSide === 'left'}
              onOpen={() => setOpenModal('right')}
            />
          )}
        </div>
      </div>

      {/* Footer toolbar */}
      {!isFullscreen && (
        <footer
          className="flex items-center justify-center gap-3 px-5 py-3 border-t shrink-0"
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <LoadButton
            side="Left"
            hasContent={!!leftHTML}
            onClick={() => setOpenModal('left')}
          />
          <div
            className="w-px h-5"
            style={{ background: 'var(--color-border)' }}
          />
          <LoadButton
            side="Right"
            hasContent={!!rightHTML}
            onClick={() => setOpenModal('right')}
          />
        </footer>
      )}

      {/* File uploader modal */}
      {openModal && (
        <FileUploader
          side={openModal === 'left' ? 'Left' : 'Right'}
          onLoad={(html) => {
            if (openModal === 'left') setLeftHTML(html);
            else setRightHTML(html);
          }}
          onClose={() => setOpenModal(null)}
        />
      )}
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────── */

interface EmptyPaneProps {
  side: 'Left' | 'Right';
  hidden: boolean;
  onOpen: () => void;
}

function EmptyPane({ side, hidden, onOpen }: EmptyPaneProps) {
  if (hidden) return null;
  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full h-full">
      <div
        className="rounded-full p-5"
        style={{ background: 'rgba(20,184,166,0.08)' }}
      >
        <Upload size={28} style={{ color: 'var(--color-primary)' }} />
      </div>
      <div className="text-center space-y-1">
        <p className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
          {side} prototype
        </p>
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          Upload an .html file or paste code
        </p>
      </div>
      <button
        onClick={onOpen}
        className="btn-primary rounded-lg px-5 py-2 text-sm"
      >
        Load {side}
      </button>
    </div>
  );
}

interface LoadButtonProps {
  side: 'Left' | 'Right';
  hasContent: boolean;
  onClick: () => void;
}

function LoadButton({ side, hasContent, onClick }: LoadButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors btn-ghost"
    >
      <Upload size={14} />
      {hasContent ? `Replace ${side}` : `Load ${side}`}
    </button>
  );
}
