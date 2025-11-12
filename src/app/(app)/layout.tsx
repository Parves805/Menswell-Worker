'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Bell,
  Home,
  PlusSquare,
  MessageCircle,
  User,
  Wallet,
  LogOut,
  Hourglass,
  CircleDollarSign,
  Scissors
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
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
import { GarmentFlowIcon } from '@/components/icons';
import type { NavItem } from '@/lib/types';
import { useAuth, useUser } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { BottomNav } from '@/components/BottomNav';

const mainNavItems: NavItem[] = [
  { title: 'হোম', href: '/dashboard', icon: <Home /> },
  { title: 'দৈনিক এন্ট্রি', href: '/entry', icon: <PlusSquare /> },
  { title: 'সকল এন্ট্রি', href: '/all-entries', icon: <Scissors /> },
  { title: 'অগ্রিম', href: '/advances', icon: <CircleDollarSign /> },
  { title: 'ওভারটাইম', href: '/overtime', icon: <Hourglass /> },
  { title: 'চ্যাট', href: '/chat', icon: <MessageCircle /> },
];

const bottomNavItems: NavItem[] = [
    { title: 'হোম', href: '/dashboard', icon: <Home /> },
    { title: 'চ্যাট', href: '/chat', icon: <MessageCircle /> },
    { title: 'টাকার অনুরোধ', href: '/request-advance', icon: <CircleDollarSign /> },
    { title: 'নোটিফিকেশন', href: '/notifications', icon: <Bell /> },
    { title: 'অ্যাকাউন্ট', href: '/profile', icon: <User /> },
]

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();


  // In a real app, these would come from Firestore settings
  const companyName = 'গার্মেন্টফ্লো';
  const companyLogo = <GarmentFlowIcon className="size-5 text-white" />;


  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const handleLogout = () => {
    if (auth) {
      auth.signOut();
    }
  };

  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <>
      <Sidebar side="left" collapsible="icon" className="data-[mobile=true]:bg-background data-[mobile=true]:text-foreground bg-primary text-primary-foreground">
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="shrink-0" asChild>
              <Link href="/dashboard">
                {companyLogo}
              </Link>
            </Button>
            <h1 className="text-lg font-semibold tracking-tight">
              {companyName}
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {mainNavItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <Link href={item.href} className="w-full" onClick={() => setOpenMobile(false)}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className="hover:bg-primary-dark data-[active=true]:bg-primary-dark data-[active=true]:text-white data-[active=true]:border-l-4 border-white text-white/80"
                    isActive={pathname === item.href}
                    asChild
                  >
                    <div className="flex items-center gap-2">
                        {React.cloneElement(item.icon, { className: "text-white/80 data-[active=true]:text-white"})}
                        <span>{item.title}</span>
                    </div>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/profile" onClick={() => setOpenMobile(false)}>
                <SidebarMenuButton
                  tooltip="প্রোফাইল"
                  isActive={pathname === '/profile'}
                  className="hover:bg-primary-dark data-[active=true]:bg-primary-dark data-[active=true]:text-white data-[active=true]:border-l-4 border-white text-white/80"
                >
                  <User />
                  <span>প্রোফাইল</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background text-foreground px-4 sm:px-6">
          <SidebarTrigger className="flex text-foreground hover:text-foreground md:hidden" />
          <div className="relative flex-1">
            {/* Search can be added back if needed */}
          </div>
          <Button variant="ghost" size="icon" className="rounded-full text-foreground hover:bg-muted hover:text-foreground" asChild>
            <Link href="/notifications">
              <Bell className="h-5 w-5" />
              <span className="sr-only">নোটিফিকেশন দেখান</span>
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 cursor-pointer p-1 h-auto rounded-full hover:bg-muted">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.photoURL ?? "https://picsum.photos/seed/99/40/40"} alt="ব্যবহারকারীর ছবি" />
                  <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium text-foreground">{user.displayName ?? "আয়েশা খানম"}</span>
                    <span className="text-xs text-muted-foreground">সুইং অপারেটর</span>
                </div>
              </Button>

            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user.displayName ?? user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link href="/profile">প্রোফাইল</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/settings">সেটিংস</Link></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>লগআউট</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 pb-20 md:pb-6">{children}</main>
        <BottomNav navItems={bottomNavItems} />
      </SidebarInset>
    </>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </SidebarProvider>
  )
}
