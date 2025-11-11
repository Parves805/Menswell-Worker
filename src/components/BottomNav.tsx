'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import type { NavItem } from '@/lib/types';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  navItems: NavItem[];
}

export function BottomNav({ navItems }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t bg-background z-20">
      <div className="flex h-full items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground w-full h-full',
                isActive && 'text-primary'
              )}
            >
              {React.cloneElement(item.icon, {
                className: cn('h-5 w-5', isActive && 'text-primary'),
              })}
              <span>{item.title}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
