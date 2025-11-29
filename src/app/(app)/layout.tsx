

'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Home,
  PlusSquare,
  MessageCircle,
  User,
  Wallet2,
  LogOut,
  Bell,
  Menu,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GarmentFlowIcon, TakaIcon } from '@/components/icons';
import type { NavItem, AppSettings } from '@/lib/types';
import { useAuth, useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { BottomNav } from '@/components/BottomNav';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from '@/lib/utils';
import { doc } from 'firebase/firestore';

const mainNavItems: NavItem[] = [
  { title: 'হোম', href: '/dashboard', icon: <Home /> },
  { title: 'দৈনিক এন্ট্রি', href: '/entry', icon: <PlusSquare /> },
  { title: 'সকল এন্ট্রি', href: '/all-entries', icon: <TakaIcon /> },
  { title: 'অগ্রিম', href: '/advances', icon: <TakaIcon /> },
  { title: 'চ্যাট', href: '/chat', icon: <MessageCircle /> },
];

const bottomNavItems: NavItem[] = [
    { title: 'হোম', href: '/dashboard', icon: <Home /> },
    { title: 'টাকার অনুরোধ', href: '/request-advance', icon: <Wallet2 /> },
    { title: 'চ্যাট', href: '/chat', icon: <MessageCircle /> },
    { title: 'নোটিফিকেশন', href: '/notifications', icon: <Bell /> },
    { title: 'অ্যাকাউন্ট', href: '/profile', icon: <User /> },
]

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const firestore = useFirestore();

  const settingsDocRef = useMemoFirebase(() => 
    firestore ? doc(firestore, 'settings', 'global') : null,
    [firestore]
  );
  const { data: settings } = useDoc<AppSettings>(settingsDocRef);
  
  React.useEffect(() => {
    // This is the single source of truth for protecting the app routes.
    // If auth state is determined and there is no user, redirect to login.
    if (!isUserLoading && !user) {
      router.replace('/');
    }
  }, [user, isUserLoading, router]);

  const handleLogout = () => {
    if (auth) {
      auth.signOut();
    }
  };

  // Show a loading screen while the auth state is being determined.
  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>লোড হচ্ছে...</p>
      </div>
    );
  }

  // Render the full layout only when we are sure a user is logged in.
  return (
    <div className='flex min-h-screen w-full flex-col'>
       <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-30">
          <div className="flex items-center gap-2">
             <Link
                href="/dashboard"
                className="flex items-center gap-3 text-lg font-semibold md:text-base"
              >
                {settings?.logoUrl ? (
                  <Avatar className="size-8 rounded-none">
                      <AvatarImage src={settings.logoUrl} alt="Company Logo" className='object-contain' />
                      <AvatarFallback className="bg-transparent"></AvatarFallback>
                  </Avatar>
                ) : (
                  !settings?.companyName && <GarmentFlowIcon className="size-8 text-primary" />
                )}
                {settings?.companyName && <span className="font-bold">{settings.companyName}</span>}
                {!settings?.logoUrl && !settings?.companyName && <span className="font-bold">গার্মেন্টফ্লো</span>}
              </Link>
          </div>
          
          <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
            <div className='flex-1'></div>
             <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
              {mainNavItems.map(item => (
                   <Link
                      key={item.title}
                      href={item.href}
                      className={cn("transition-colors hover:text-foreground", pathname.startsWith(item.href) ? "text-foreground" : "text-muted-foreground")}
                  >
                      {item.title}
                  </Link>
              ))}
            </nav>
            <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  {settings?.logoUrl ? (
                    <Avatar className="size-8 rounded-none">
                        <AvatarImage src={settings.logoUrl} alt="Company Logo" className='object-contain' />
                        <AvatarFallback className="bg-transparent"></AvatarFallback>
                    </Avatar>
                  ) : (
                     !settings?.companyName && <GarmentFlowIcon className="size-8 text-primary" />
                  )}
                  {settings?.companyName && <span>{settings.companyName}</span>}
                  {!settings?.logoUrl && !settings?.companyName && <span>গার্মেন্টফ্লো</span>}
                </Link>
                 {mainNavItems.map(item => (
                    <Link
                        key={item.title}
                        href={item.href}
                        className={cn("flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary", pathname.startsWith(item.href) ? "text-primary bg-muted" : "text-muted-foreground")}
                    >
                      {React.cloneElement(item.icon, { className: "h-4 w-4"})}
                      {item.title}
                    </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 pb-20 md:pb-8">{children}</main>
        <BottomNav navItems={bottomNavItems} />
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppLayoutContent>{children}</AppLayoutContent>
  )
}
