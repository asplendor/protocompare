import { useState } from 'react';
import { Share2, Loader2 } from 'lucide-react';
import { saveComparison } from '../utils/supabase';

interface ShareButtonProps {
  leftHTML: string | null;
  rightHTML: string | null;
}

type ButtonState = 'idle' | 'saving' | 'copied' | 'error';

export default function ShareButton({ leftHTML, rightHTML }: ShareButtonProps) {
  const [state, setState] = useState<ButtonState>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const disabled = !leftHTML && !rightHTML;

  const handleShare = async () => {
    if (disabled || state === 'saving') return;

    setState('saving');
    setMessage(null);

    try {
      const id = await saveComparison(leftHTML, rightHTML);
      const url = `${window.location.origin}/compare/${id}`;
      await navigator.clipboard.writeText(url);

      // Calculate relative expiry date (5 days from now)
      const expiryDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
      const formatted = expiryDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      setState('copied');
      setMessage(`Link copied! Expires ${formatted}`);

      // Reset after 4 seconds
      setTimeout(() => {
        setState('idle');
        setMessage(null);
      }, 4000);
    } catch (_e) {
      setState('error');
      setMessage('Error — try again');
      setTimeout(() => {
        setState('idle');
        setMessage(null);
      }, 3000);
    }
  };

  const getButtonContent = () => {
    switch (state) {
      case 'saving':
        return (
          <>
            <Loader2 size={15} className="animate-spin" />
            <span>Saving…</span>
          </>
        );
      case 'copied':
        return <span>✓ Link copied!</span>;
      case 'error':
        return <span>Error — try again</span>;
      default:
        return (
          <>
            <Share2 size={15} />
            <span>Share</span>
          </>
        );
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleShare}
        disabled={disabled || state === 'saving'}
        className="btn-primary flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm"
        title={disabled ? 'Load at least one prototype to share' : 'Share this comparison'}
      >
        {getButtonContent()}
      </button>

      {message && state !== 'idle' && (
        <span
          className="text-xs"
          style={{
            color: state === 'error' ? '#f87171' : 'var(--color-text-secondary)',
          }}
        >
          {message}
        </span>
      )}
    </div>
  );
}
