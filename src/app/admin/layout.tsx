'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Bell,
  LayoutDashboard,
  Users,
  Factory,
  Settings,
  LogOut,
  MessageCircle,
  Wallet,
  Shapes,
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
import { useToast } from '@/hooks/use-toast';


const adminNavItems: NavItem[] = [
  { title: 'ড্যাশবোর্ড', href: '/admin/dashboard', icon: <LayoutDashboard /> },
  { title: 'কর্মী', href: '/admin/workers', icon: <Users /> },
  { title: 'উৎপাদন', href: '/admin/production', icon: <Factory /> },
  { title: 'ক্যাটাগরি', href: '/admin/categories', icon: <Shapes /> },
  { title: 'লেনদেন', href: '/admin/transactions', icon: <Wallet /> },
  { title: 'চ্যাট', href: '/admin/chat', icon: <MessageCircle /> },
  { title: 'নোটিফিকেশন', href: '/admin/notifications', icon: <Bell /> },
  { title: 'সেটিংস', href: '/admin/settings', icon: <Settings /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  React.useEffect(() => {
    if (isUserLoading) {
      return; // Wait until user loading is complete.
    }

    if (!user) {
      // If no user is logged in, redirect to the admin login page.
      // We don't need to check the path, as this layout only applies to admin routes.
      router.push('/admin/login');
      return;
    }

    // User is logged in, now check for admin claims.
    user.getIdTokenResult(true) // Force refresh to get the latest claims.
      .then((idTokenResult) => {
        if (!idTokenResult.claims.isAdmin) {
          // It's a regular user, not an admin.
          // Redirect them away from the admin section.
          toast({
            variant: 'destructive',
            title: 'প্রবেশাধিকার নেই',
            description: 'এই পৃষ্ঠাটি শুধুমাত্র অ্যাডমিনদের জন্য।',
          });
          router.push('/dashboard'); // Redirect to the user dashboard.
        }
        // If they are an admin, they are allowed to stay.
      })
      .catch((error) => {
        console.error("Error getting ID token result:", error);
        // If we can't verify claims, sign out and redirect to login for safety.
        auth?.signOut();
        router.push('/admin/login');
      });

  }, [user, isUserLoading, router, auth, toast]);

  const handleLogout = () => {
    if (auth) {
      auth.signOut();
    }
  };

  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center admin-panel font-sans">
        <p>অ্যাডমিন প্যানেল লোড হচ্ছে...</p>
      </div>
    );
  }


  return (
    <div className="admin-panel font-sans">
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
                অ্যাডমিন প্যানেল
              </h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {adminNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <Link href={item.href} className="w-full">
                    <SidebarMenuButton
                      isActive={pathname.startsWith(item.href)}
                      tooltip={item.title}
                      className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-primary"
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
                 <SidebarMenuButton
                    onClick={handleLogout}
                    tooltip="লগআউট"
                    className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <LogOut className="text-sidebar-foreground/80" />
                    <span>লগআউট</span>
                  </SidebarMenuButton>
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
              asChild
            >
             <Link href="/admin/notifications">
                <Bell className="h-5 w-5" />
                <span className="sr-only">নোটিফিকেশন দেখান</span>
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 cursor-pointer">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={user?.photoURL ?? `https://i.pravatar.cc/40?u=admin`}
                      alt="অ্যাডমিনের ছবি"
                    />
                    <AvatarFallback>
                      {user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium text-foreground">
                      {user?.displayName ?? 'অ্যাডমিন'}
                    </span>
                    <span className="text-xs text-muted-foreground/80">
                      অ্যাডমিনিস্ট্রেটর
                    </span>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user?.displayName ?? user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings">সেটিংস</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>লগআউট</span>
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
