
'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Bell,
  Home,
  Users,
  Settings,
  LogOut,
  Scissors,
  MessageSquare,
  Shapes,
  Wallet,
  CheckSquare,
  Image as ImageIcon,
  Landmark,
  Menu,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
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
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';


const mainNavItems: NavItem[] = [
  { title: 'ড্যাশবোর্ড', href: '/admin/dashboard', icon: <Home /> },
  { title: 'কর্মী', href: '/admin/workers', icon: <Users /> },
  { title: 'উৎপাদন', href: '/admin/production', icon: <Scissors /> },
  { title: 'উৎপাদন অনুরোধ', href: '/admin/production-requests', icon: <CheckSquare /> },
  { title: 'টাকার অনুরোধ', href: '/admin/advance-requests', icon: <Wallet /> },
  { title: 'কর্মীর খরচ', href: '/admin/worker-expenses', icon: <Wallet /> },
  { title: 'অগ্রিম প্রদান', href: '/admin/advance-payments', icon: <Landmark /> },
  { title: 'ক্যাটাগরি', href: '/admin/categories', icon: <Shapes /> },
  { title: 'স্লাইডার', href: '/admin/slider', icon: <ImageIcon /> },
  { title: 'চ্যাট', href: '/admin/chat', icon: <MessageSquare /> },
  { title: 'বিজ্ঞপ্তি', href: '/admin/notifications', icon: <Bell /> },
  { title: 'সেটিংস', href: '/admin/settings', icon: <Settings /> },
];

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const settingsDocRef = useMemoFirebase(() => 
    firestore ? doc(firestore, 'settings', 'global') : null,
    [firestore]
  );
  const { data: settings, isLoading: isLoadingSettings } = useDoc<AppSettings>(settingsDocRef);
  
  React.useEffect(() => {
    if (settings?.companyName) {
      document.title = `${settings.companyName} | অ্যাডমিন প্যানেল`;
    } else {
        document.title = 'মেনসওয়েল | অ্যাডমিন প্যানেল';
    }
  }, [settings]);

  React.useEffect(() => {
    if (isUserLoading || pathname === '/admin/login') {
      return;
    }

    if (!user) {
      router.replace('/admin/login');
      return;
    }
    
    if (user.email !== 'admin@example.com') {
      auth?.signOut();
      toast({
        variant: 'destructive',
        title: 'প্রবেশাধিকার নেই',
        description: 'শুধুমাত্র অ্যাডমিন এই প্যানেলে প্রবেশ করতে পারবেন।',
      });
      router.replace('/admin/login');
    }
  }, [user, isUserLoading, router, auth, toast, pathname]);

  const handleLogout = () => {
    if (auth) {
      auth.signOut().then(() => router.push('/admin/login'));
    }
  };

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (isUserLoading || !user || user.email !== 'admin@example.com') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>অ্যাডমিন প্যানেল লোড হচ্ছে...</p>
      </div>
    );
  }
  
  const renderLogoOrName = () => {
    if (isLoadingSettings) {
        return <Skeleton className="h-10 w-40" />;
    }
    if (settings?.logoUrl) {
        return (
            <div className="relative h-10 w-40">
                <Image 
                    src={settings.logoUrl} 
                    alt={settings.companyName || 'Company Logo'} 
                    fill 
                    className="object-contain"
                />
            </div>
        );
    }
    if (settings?.companyName) {
        return <span className="font-bold">{settings.companyName}</span>;
    }
    return <Skeleton className="h-10 w-40" />;
  };


  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
              {renderLogoOrName()}
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {mainNavItems.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                    pathname.startsWith(item.href) && 'bg-muted text-primary'
                  )}
                >
                  {item.icon}
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </aside>
      <div className="flex flex-col">
        <header className="flex h-14 items-center justify-between gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 font-semibold md:hidden"
          >
            {renderLogoOrName()}
          </Link>
          
          <div className="w-full flex-1 md:hidden">
          </div>
          
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">ন্যাভিগেশন মেনু খুলুন</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
              <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold" onClick={() => setIsMobileMenuOpen(false)}>
                  {renderLogoOrName()}
                </Link>
              </div>
              <nav className="grid gap-2 text-lg font-medium p-4 overflow-y-auto">
                {mainNavItems.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground',
                      pathname.startsWith(item.href) && 'bg-muted text-foreground'
                    )}
                  >
                    {item.icon}
                    {item.title}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarImage src={user.photoURL ?? "https://picsum.photos/seed/admin/40/40"} alt="অ্যাডমিনের ছবি" />
                    <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="sr-only">ব্যবহারকারী মেনু</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.displayName ?? user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/admin/settings')}>সেটিংস</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>লগআউট</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-x-auto">
          {children}
        </main>
      </div>
    </div>
  );
}


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
      <div className="admin-panel">
          <AdminLayoutContent>{children}</AdminLayoutContent>
      </div>
  )
}
