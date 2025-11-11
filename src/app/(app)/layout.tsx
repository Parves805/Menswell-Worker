'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Bell,
  LayoutDashboard,
  Users,
  CalendarCheck,
  Factory,
  Banknote,
  HandCoins,
  Settings,
  Search,
  LogOut,
  Home,
  PlusSquare,
  MessageCircle,
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
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GarmentFlowIcon } from '@/components/icons';
import type { NavItem } from '@/lib/types';
import { useAuth, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/BottomNav';

const mainNavItems: NavItem[] = [
  { title: 'Home', href: '/dashboard', icon: <Home /> },
  { title: 'Entry', href: '/entry', icon: <PlusSquare /> },
  { title: 'Chat', href: '/chat', icon: <MessageCircle /> },
  { title: 'Notification', href: '/notifications', icon: <Bell /> },
  { title: 'Setting', href: '/settings', icon: <Settings /> },
];

const secondaryNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard /> },
  { title: 'Workers', href: '/workers', icon: <Users /> },
  { title: 'Attendance', href: '/attendance', icon: <CalendarCheck /> },
  { title: 'Production', href: '/production', icon: <Factory /> },
  { title: 'Salary', href: '/salary', icon: <Banknote /> },
  { title: 'Advances & Bonus', href: '/advances', icon: <HandCoins /> },
];

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
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="icon" className="bg-sidebar">
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="shrink-0" asChild>
              <Link href="/dashboard">
                <GarmentFlowIcon className="size-5 text-sidebar-primary" />
              </Link>
            </Button>
            <h1 className="text-lg font-semibold tracking-tight text-sidebar-foreground">
              GarmentFlow
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
                    className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent"
                    asChild
                  >
                    <div className="flex items-center gap-2">
                        {React.cloneElement(item.icon, { className: "text-sidebar-foreground"})}
                        <span>{item.title}</span>
                    </div>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          <SidebarMenu className="mt-4">
             <SidebarMenuItem>
                <p className="px-2 text-xs font-semibold text-sidebar-foreground/50">Management</p>
             </SidebarMenuItem>
            {secondaryNavItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <Link href={item.href} className="w-full">
                  <SidebarMenuButton
                    tooltip={item.title}
                    className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent"
                    asChild
                  >
                    <div className="flex items-center gap-2">
                        {React.cloneElement(item.icon, { className: "text-sidebar-foreground"})}
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
              <Link href="/settings">
                <SidebarMenuButton
                  tooltip="Settings"
                  className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <Settings className="text-sidebar-foreground" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
          <SidebarTrigger className="flex text-foreground hover:text-foreground md:hidden" />
          <div className="relative flex-1">
            {/* Search can be added back if needed */}
          </div>
          <Button variant="ghost" size="icon" className="rounded-full text-foreground hover:bg-accent hover:text-accent-foreground" asChild>
            <Link href="/notifications">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Toggle notifications</span>
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 cursor-pointer">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.photoURL ?? "https://picsum.photos/seed/99/40/40"} alt="User Avatar" />
                  <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium text-foreground">{user.displayName ?? user.email}</span>
                    <span className="text-xs text-muted-foreground/80">Admin</span>
                </div>
              </div>

            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user.displayName ?? user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/settings">Settings</Link></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 pb-20 md:pb-6">{children}</main>
        <BottomNav navItems={mainNavItems} />
      </SidebarInset>
    </SidebarProvider>
  );
}
