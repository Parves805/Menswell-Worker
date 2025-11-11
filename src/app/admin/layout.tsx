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
  LogOut,
  AreaChart,
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
import { usePathname } from 'next/navigation';

const adminNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard /> },
  { title: 'Workers', href: '/admin/workers', icon: <Users /> },
  { title: 'Attendance', href: '/admin/attendance', icon: <CalendarCheck /> },
  { title: 'Production', href: '/admin/production', icon: <Factory /> },
  { title: 'Salaries', href: '/admin/salaries', icon: <Banknote /> },
  { title: 'Advances', href: '/admin/advances', icon: <HandCoins /> },
  { title: 'Expenses', href: '/admin/expenses', icon: <AreaChart /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/admin/login');
    }
    // No need to check for isAdmin here. Let the login page handle redirection.
    // If a non-admin tries to access, the login page will redirect them away.
  }, [user, isUserLoading, router]);

  const handleLogout = () => {
    if (auth) {
      auth.signOut();
    }
  };

  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center admin-panel">
        <p>Loading Admin Panel...</p>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <SidebarProvider>
        <Sidebar side="left" collapsible="icon">
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="shrink-0" asChild>
                <Link href="/admin/dashboard">
                  <GarmentFlowIcon className="size-5 text-primary" />
                </Link>
              </Button>
              <h1 className="text-lg font-semibold tracking-tight text-foreground">
                Admin Panel
              </h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {adminNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <Link href={item.href} className="w-full">
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                      tooltip={item.title}
                      className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent"
                      asChild
                    >
                      <div className="flex items-center gap-2">
                        {React.cloneElement(item.icon, {
                          className: 'text-sidebar-foreground/80 group-data-[active=true]:text-primary',
                        })}
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
                <Link href="/admin/settings">
                  <SidebarMenuButton
                    tooltip="Settings"
                    isActive={pathname === '/admin/settings'}
                    className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <Settings className="text-sidebar-foreground/80 group-data-[active=true]:text-primary" />
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
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <Bell className="h-5 w-5" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 cursor-pointer">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={user?.photoURL ?? `https://i.pravatar.cc/40?u=admin`}
                      alt="Admin photo"
                    />
                    <AvatarFallback>
                      {user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium text-foreground">
                      {user?.displayName ?? 'Admin User'}
                    </span>
                    <span className="text-xs text-muted-foreground/80">
                      Administrator
                    </span>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user?.displayName ?? user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
