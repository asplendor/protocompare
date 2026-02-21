import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, Layers } from 'lucide-react';
import { fetchComparison, type Comparison } from '../utils/supabase';
import PrototypeViewer from '../components/PrototypeViewer';
import Header from '../components/Header';

type LoadState = 'loading' | 'loaded' | 'expired' | 'error';

export default function SharedView() {
  const { id } = useParams<{ id: string }>();
  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [fullscreenSide, setFullscreenSide] = useState<'left' | 'right' | null>(null);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const check = () => setIsSmallScreen(window.innerWidth < 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!id) {
      setLoadState('error');
      return;
    }
    fetchComparison(id)
      .then((data) => {
        setComparison(data);
        setLoadState('loaded');
      })
      .catch(() => {
        // Either expired (filtered by RLS) or genuinely not found
        setLoadState('expired');
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
        className="flex items-center justify-center h-screen gap-3"
        style={{ background: 'var(--color-bg)', color: 'var(--color-text-secondary)' }}
      >
        <Loader2 size={20} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
        <span className="text-sm">Loading comparison…</span>
      </div>
    );
  }

  // ── Expired / Not found ──
  if (loadState === 'expired' || loadState === 'error') {
    return (
      <div
        className="flex flex-col items-center justify-center h-screen gap-6 px-4 text-center"
        style={{ background: 'var(--color-bg)' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Layers size={22} style={{ color: 'var(--color-primary)' }} />
          <span className="font-semibold text-base" style={{ color: 'var(--color-text)' }}>
            ProtoCompare
          </span>
        </div>
        <div className="space-y-2 max-w-sm">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
            This comparison has expired
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }} className="text-sm">
            ProtoCompare links last 5 days. This one is no longer available.
          </p>
        </div>
        <Link
          to="/"
          className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm"
        >
          Create a new comparison →
        </Link>
      </div>
    );
  }

  // ── Loaded ──
  const left = comparison?.left_html ?? null;
  const right = comparison?.right_html ?? null;

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--color-bg)' }}>
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
    </div>
  );
}
