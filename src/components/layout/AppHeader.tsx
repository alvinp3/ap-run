'use client';

import Link from 'next/link';

interface AppHeaderProps {
  title?: string;
  showShare?: boolean;
  onToggleTheme?: () => void;
}

export default function AppHeader({
  title = 'BQ Training',
  showShare = true,
  onToggleTheme,
}: AppHeaderProps) {
  async function handleShare() {
    const url = window.location.origin + '/share/athlete';
    const text = 'Follow my training for the Houston Marathon and Grasslands 100!';
    if (navigator.share) {
      try {
        await navigator.share({ title: 'BQ Training', text, url });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(`${text} ${url}`);
      alert('Share link copied to clipboard!');
    }
  }

  return (
    <header
      className="flex items-center justify-between px-4 pt-safe-top"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
        paddingBottom: 12,
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Logo/Title */}
      <Link
        href="/"
        className="flex items-center gap-2 min-h-0"
        style={{ textDecoration: 'none' }}
      >
        <span className="text-xl">🏃</span>
        <span
          className="font-black text-lg tracking-tight"
          style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--accent-teal)' }}
        >
          {title}
        </span>
      </Link>

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        {showShare && (
          <button
            onClick={handleShare}
            className="btn-secondary"
            style={{ padding: '8px 12px', minHeight: 40, fontSize: 18, background: 'transparent', border: 'none' }}
            title="Share your training"
          >
            🔗
          </button>
        )}
        <Link
          href="/settings"
          className="btn-secondary"
          style={{ padding: '8px 12px', minHeight: 40, fontSize: 18, background: 'transparent', border: 'none' }}
          title="Settings"
        >
          ⚙️
        </Link>
        <Link
          href="/nutrition"
          className="btn-secondary"
          style={{ padding: '8px 12px', minHeight: 40, fontSize: 18, background: 'transparent', border: 'none' }}
          title="Nutrition"
        >
          🥗
        </Link>
        <Link
          href="/gear"
          className="btn-secondary"
          style={{ padding: '8px 12px', minHeight: 40, fontSize: 18, background: 'transparent', border: 'none' }}
          title="Gear"
        >
          👟
        </Link>
      </div>
    </header>
  );
}
