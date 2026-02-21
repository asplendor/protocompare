import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchComparison, type Comparison } from '../utils/supabase';
import PrototypeViewer from '../components/PrototypeViewer';
import Header from '../components/Header';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type LoadState = 'loading' | 'loaded' | 'expired' | 'notfound';

export default function SharedView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [fullscreenSide, setFullscreenSide] = useState<'left' | 'right' | null>(null);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    const check = () => setIsSmallScreen(window.innerWidth < 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!id) {
      setLoadState('notfound');
      return;
    }
    fetchComparison(id)
      .then((data) => {
        setComparison(data);
        setLoadState('loaded');
      })
      .catch(() => {
        setLoadState(UUID_REGEX.test(id) ? 'expired' : 'notfound');
      });
  }, [id]);

  const isFullscreen = fullscreenSide !== null;

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

  // ── Loading ──
  if (loadState === 'loading') {
    return (
      <div
        className="flex flex-col min-h-screen"
        style={{ background: 'var(--color-bg)' }}
      >
        <p
          className="text-center py-4 text-sm shrink-0"
          style={{ color: '#64748b' }}
        >
          Loading comparison…
        </p>
        <div className="flex flex-1 min-h-0">
          <div
            className="w-1/2 border-r animate-pulse"
            style={{ background: '#1e293b', borderColor: 'var(--color-border)' }}
          />
          <div
            className="w-1/2 animate-pulse"
            style={{ background: '#1e293b' }}
          />
        </div>
      </div>
    );
  }

  // ── Expired ──
  if (loadState === 'expired') {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen gap-6 px-4 text-center"
        style={{ background: 'var(--color-bg)' }}
      >
        <div className="space-y-2 max-w-sm">
          <h1 className="text-xl font-semibold" style={{ color: '#f1f5f9' }}>
            This comparison has expired
          </h1>
          <p className="text-sm" style={{ color: '#64748b' }}>
            ProtoCompare links are active for 5 days.
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="rounded-lg px-5 py-2.5 text-sm font-medium transition-colors"
          style={{ background: '#14b8a6', color: '#0f172a' }}
        >
          Create a new comparison →
        </button>
      </div>
    );
  }

  // ── Not found ──
  if (loadState === 'notfound') {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen gap-6 px-4 text-center"
        style={{ background: 'var(--color-bg)' }}
      >
        <div className="space-y-2 max-w-sm">
          <h1 className="text-xl font-semibold" style={{ color: '#f1f5f9' }}>
            Comparison not found
          </h1>
          <p className="text-sm" style={{ color: '#64748b' }}>
            This link may be incorrect or no longer exists.
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="rounded-lg px-5 py-2.5 text-sm font-medium transition-colors"
          style={{ background: '#14b8a6', color: '#0f172a' }}
        >
          Create a new comparison →
        </button>
      </div>
    );
  }

  // ── Loaded ──
  const left = comparison?.left_html ?? null;
  const right = comparison?.right_html ?? null;

  return (
    <div className="flex flex-col flex-1 min-h-0" style={{ background: 'var(--color-bg)' }}>
      {/* Small screen banner */}
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

      {/* Header — no share button in shared view */}
      <Header
        fullscreenMode={isFullscreen}
        onExitFullscreen={() => setFullscreenSide(null)}
      />

      {/* Panes */}
      <div className="flex flex-1 min-h-0">
        {/* LEFT */}
        <div
          className={leftPaneClass}
          style={{ borderColor: 'var(--color-border)' }}
        >
          {left ? (
            <PrototypeViewer
              html={left}
              side="Left"
              zoom={zoom}
              isFullscreen={fullscreenSide === 'left'}
              onExpand={() => setFullscreenSide('left')}
              onCollapse={() => setFullscreenSide(null)}
            />
          ) : (
            !isFullscreen && (
              <div className="flex items-center justify-center w-full h-full">
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  No left prototype loaded
                </p>
              </div>
            )
          )}
        </div>

        {/* RIGHT */}
        <div className={rightPaneClass}>
          {right ? (
            <PrototypeViewer
              html={right}
              side="Right"
              zoom={zoom}
              isFullscreen={fullscreenSide === 'right'}
              onExpand={() => setFullscreenSide('right')}
              onCollapse={() => setFullscreenSide(null)}
            />
          ) : (
            !isFullscreen && (
              <div className="flex items-center justify-center w-full h-full">
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  No right prototype loaded
                </p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Bottom toolbar — zoom only, when at least one pane has content and not fullscreen */}
      {!isFullscreen && (left || right) && (
        <footer
          className="flex items-center gap-3 px-5 py-3 border-t shrink-0"
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Zoom out"
              disabled={zoom <= 50}
              onClick={() => setZoom((z) => Math.max(50, z - 10))}
              className="flex items-center justify-center px-3 py-1.5 rounded-lg text-sm transition-colors btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
            >
              −
            </button>
            <span className="px-2 text-sm min-w-[3ch]" style={{ color: 'var(--color-text-secondary)' }}>
              {zoom}%
            </span>
            <button
              type="button"
              aria-label="Zoom in"
              disabled={zoom >= 150}
              onClick={() => setZoom((z) => Math.min(150, z + 10))}
              className="flex items-center justify-center px-3 py-1.5 rounded-lg text-sm transition-colors btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
