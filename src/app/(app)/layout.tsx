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
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
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
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/BottomNav';

const mainNavItems: NavItem[] = [
  { title: 'হোম', href: '/dashboard', icon: <Home /> },
  { title: 'দৈনিক এন্ট্রি', href: '/entry', icon: <PlusSquare /> },
  { title: 'চ্যাট', href: '/chat', icon: <MessageCircle /> },
  { title: 'লেনদেন', href: '/transactions', icon: <Wallet /> },
];

const bottomNavItems: NavItem[] = [
    { title: 'হোম', href: '/dashboard', icon: <Home /> },
    { title: 'এন্ট্রি', href: '/entry', icon: <PlusSquare /> },
    { title: 'চ্যাট', href: '/chat', icon: <MessageCircle /> },
    { title: 'লেনদেন', href: '/transactions', icon: <Wallet /> },
    { title: 'নোটিফিকেশন', href: '/notifications', icon: <Bell /> },
]


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

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
    <SidebarProvider>
      <Sidebar side="left" collapsible="icon" className="data-[mobile=true]:bg-primary data-[mobile=true]:text-primary-foreground">
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="shrink-0" asChild>
              <Link href="/dashboard">
                <GarmentFlowIcon className="size-5" />
              </Link>
            </Button>
            <h1 className="text-lg font-semibold tracking-tight">
              গার্মেন্টফ্লো
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {mainNavItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <Link href={item.href} className="w-full">
                  <SidebarMenuButton
                    tooltip={item.title}
                    className="hover:bg-primary/10 data-[active=true]:bg-primary/15 data-[active=true]:text-primary"
                    asChild
                  >
                    <div className="flex items-center gap-2">
                        {React.cloneElement(item.icon, { className: "text-muted-foreground data-[active=true]:text-primary"})}
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
              <Link href="/profile">
                <SidebarMenuButton
                  tooltip="প্রোফাইল"
                  className="hover:bg-primary/10"
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
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-primary text-primary-foreground px-4 sm:px-6">
          <SidebarTrigger className="flex text-primary-foreground hover:text-primary-foreground md:hidden" />
          <div className="relative flex-1">
            {/* Search can be added back if needed */}
          </div>
          <Button variant="ghost" size="icon" className="rounded-full text-primary-foreground hover:bg-white/20 hover:text-primary-foreground" asChild>
            <Link href="/notifications">
              <Bell className="h-5 w-5" />
              <span className="sr-only">নোটিফিকেশন দেখান</span>
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 cursor-pointer p-1 h-auto rounded-full hover:bg-white/20">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.photoURL ?? "https://picsum.photos/seed/99/40/40"} alt="ব্যবহারকারীর ছবি" />
                  <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium text-primary-foreground">{user.displayName ?? "আয়েশা খানম"}</span>
                    <span className="text-xs text-primary-foreground/80">সুইং অপারেটর</span>
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
    </SidebarProvider>
  );
}
