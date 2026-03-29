'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  CalendarDays,
  TrendingUp,
  BrainCircuit,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ProfileDrawer from './ProfileDrawer';

const NAV = [
  { href: '/',         Icon: Home,         label: 'Today'    },
  { href: '/week',     Icon: CalendarDays, label: 'Week'     },
  { href: '/progress', Icon: TrendingUp,   label: 'Progress' },
  { href: '/coach',    Icon: BrainCircuit, label: 'Coach'    },
] as const;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function AppHeader(_props: { title?: string; showShare?: boolean } = {}) {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <>
      <header
        className="sticky top-0 z-30 flex flex-col"
        style={{
          background: '#050505',
          borderBottom: '1px solid #2A2A2A',
          paddingTop: 'env(safe-area-inset-top, 0)',
        }}
      >
        {/* Row 1 — wordmark + profile button */}
        <div className="flex items-center justify-between px-4 h-12">
          <Link href="/" className="flex items-center gap-0 no-underline leading-none">
            <span
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 400,
                fontSize: 11,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#5B5BFF',
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

          <button
            onClick={() => setProfileOpen(true)}
            className="flex items-center justify-center"
            style={{
              width: 36, height: 36,
              background: profileOpen ? 'rgba(13,13,242,0.12)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${profileOpen ? 'rgba(13,13,242,0.4)' : '#2A2A2A'}`,
              borderRadius: 10,
              cursor: 'pointer',
              color: profileOpen ? '#5B5BFF' : '#52525B',
              transition: 'all 0.15s',
              minHeight: 'unset',
            }}
            title="Profile & Settings"
          >
            <User size={16} strokeWidth={1.5} />
          </button>
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
                  color: isActive ? '#5B5BFF' : '#52525B',
                  borderBottom: isActive ? '1px solid #5B5BFF' : '1px solid transparent',
                }}
              >
                <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
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

      <ProfileDrawer isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}
