'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  CalendarDays,
  TrendingUp,
  BrainCircuit,
  Watch,
  User,
  Settings,
  Share2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  title?: string;
  showShare?: boolean;
}

const NAV = [
  { href: '/',         Icon: Home,         label: 'Today'    },
  { href: '/week',     Icon: CalendarDays, label: 'Week'     },
  { href: '/progress', Icon: TrendingUp,   label: 'Progress' },
  { href: '/coach',    Icon: BrainCircuit, label: 'Coach'    },
  { href: '/garmin',   Icon: Watch,        label: 'Garmin'   },
  { href: '/profile',  Icon: User,         label: 'Profile'  },
  { href: '/settings', Icon: Settings,     label: 'Settings' },
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
    }
  }

  return (
    <header
      className="sticky top-0 z-30 flex flex-col"
      style={{
        background: '#050505',
        borderBottom: '1px solid #2A2A2A',
        paddingTop: 'env(safe-area-inset-top, 0)',
      }}
    >
      {/* Row 1 — wordmark + share */}
      <div className="flex items-center justify-between px-4 h-12">
        <Link href="/" className="flex items-center gap-0 no-underline leading-none">
          <span
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 400,
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#0d0df2',
              whiteSpace: 'nowrap',
            }}
          >
            Boston Qualifier
          </span>
          <span
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 300,
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#3A3A3A',
              margin: '0 4px',
            }}
          >
            ·
          </span>
          <span
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 400,
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#FFFFFF',
              whiteSpace: 'nowrap',
            }}
          >
            Grasslands 100
          </span>
        </Link>

        {showShare && (
          <button
            onClick={handleShare}
            className="flex items-center justify-center w-9 h-9 transition-colors"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#52525B',
            }}
            title="Share"
          >
            <Share2 size={16} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Row 2 — icon nav */}
      <div
        className="flex items-stretch"
        style={{ borderTop: '1px solid #1A1A1A' }}
      >
        {NAV.map(({ href, Icon, label }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 no-underline transition-colors',
                'h-11'
              )}
              style={{
                color: isActive ? '#0d0df2' : '#52525B',
                borderBottom: isActive ? '1px solid #0d0df2' : '1px solid transparent',
              }}
            >
              <Icon
                size={18}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 9,
                  fontWeight: isActive ? 500 : 400,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
