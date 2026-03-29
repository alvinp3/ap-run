'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AppHeaderProps {
  title?: string;
  showShare?: boolean;
}

const NAV = [
  { href: '/',         icon: 'home',           label: 'Today'    },
  { href: '/week',     icon: 'calendar_month', label: 'Week'     },
  { href: '/progress', icon: 'trending_up',    label: 'Progress' },
  { href: '/garmin',   icon: 'watch',          label: 'Garmin'   },
  { href: '/profile',  icon: 'person',         label: 'Profile'  },
  { href: '/settings', icon: 'settings',       label: 'Settings' },
] as const;

export default function AppHeader({ showShare = false }: AppHeaderProps) {
  const pathname = usePathname();

  async function handleShare() {
    const url = window.location.origin + '/share/athlete';
    const text = 'Follow my training for the Houston Marathon and Grasslands 100!';
    if (navigator.share) {
      try { await navigator.share({ title: 'BQ Training', text, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(`${text} ${url}`);
      alert('Share link copied!');
    }
  }

  return (
    <header
      style={{
        background: '#050505',
        borderBottom: '1px solid #2A2A2A',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        paddingTop: 'env(safe-area-inset-top, 0)',
      }}
    >
      {/* Top row: wordmark + share */}
      <div
        className="flex items-center justify-between px-4"
        style={{ height: 48 }}
      >
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 300,
              fontSize: 15,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#0d0df2',
            }}
          >
            BQ
          </span>
          <span
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 300,
              fontSize: 15,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#FFFFFF',
              marginLeft: 6,
            }}
          >
            Training
          </span>
        </Link>

        {showShare && (
          <button
            onClick={handleShare}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#52525B',
              padding: '4px 8px',
            }}
            title="Share"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>share</span>
          </button>
        )}
      </div>

      {/* Nav row: icon-only links */}
      <div
        className="flex items-stretch"
        style={{ borderTop: '1px solid #2A2A2A' }}
      >
        {NAV.map(({ href, icon, label }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className="flex-1 flex flex-col items-center justify-center"
              style={{
                height: 44,
                color: isActive ? '#0d0df2' : '#52525B',
                borderBottom: isActive ? '2px solid #0d0df2' : '2px solid transparent',
                transition: 'color 0.12s, border-color 0.12s',
                textDecoration: 'none',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: 20,
                  fontVariationSettings: isActive
                    ? "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 20"
                    : "'FILL' 0, 'wght' 200, 'GRAD' 0, 'opsz' 20",
                }}
              >
                {icon}
              </span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
