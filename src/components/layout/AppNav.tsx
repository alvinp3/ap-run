'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/',          icon: '🏠', label: 'Today' },
  { href: '/week',      icon: '📅', label: 'Week' },
  { href: '/progress',  icon: '📈', label: 'Progress' },
  { href: '/profile',   icon: '👤', label: 'Profile' },
  { href: '/settings',  icon: '⚙️', label: 'Settings' },
];

export default function AppNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 safe-bottom"
      style={{
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border-subtle)',
        paddingTop: 8,
        paddingLeft: 'env(safe-area-inset-left, 0)',
        paddingRight: 'env(safe-area-inset-right, 0)',
      }}
    >
      <div className="flex items-stretch justify-around max-w-lg mx-auto">
        {navItems.map(({ href, icon, label }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-colors min-h-0 min-w-0 flex-1"
              style={{
                color: isActive ? 'var(--accent-teal)' : 'var(--text-tertiary)',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}
            >
              <span className="text-xl leading-none mb-1">{icon}</span>
              <span
                className="text-[10px] font-medium tracking-wide"
                style={{ color: isActive ? 'var(--accent-teal)' : 'var(--text-tertiary)' }}
              >
                {label}
              </span>
              {isActive && (
                <span
                  className="absolute bottom-1 w-1 h-1 rounded-full"
                  style={{ background: 'var(--accent-teal)' }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
