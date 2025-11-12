'use client';

import * as React from 'react';
import Link from 'next/link';
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
  User,
  Image as ImageIcon,
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
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';


const mainNavItems: NavItem[] = [
  { title: 'ড্যাশবোর্ড', href: '/admin/dashboard', icon: <Home /> },
  { title: 'কর্মী', href: '/admin/workers', icon: <Users /> },
  { title: 'উৎপাদন', href: '/admin/production', icon: <Scissors /> },
  { title: 'উৎপাদন অনুরোধ', href: '/admin/production-requests', icon: <CheckSquare /> },
  { title: 'অ্যাডভান্স অনুরোধ', href: '/admin/advance-requests', icon: <Wallet /> },
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
  const { setOpenMobile } = useSidebar();

  React.useEffect(() => {
    if (isUserLoading) return;

    if (!user) {
      router.push('/admin/login');
      return;
    }
    
    user.getIdTokenResult(true).then((idTokenResult) => {
      if (!idTokenResult.claims.isAdmin) {
        auth?.signOut();
        router.push('/dashboard');
        toast({
            variant: 'destructive',
            title: 'প্রবেশাধিকার নেই',
            description: 'শুধুমাত্র অ্যাডমিন এই প্যানেলে প্রবেশ করতে পারবেন।',
        });
      }
    });

  }, [user, isUserLoading, router, auth, toast]);

  const handleLogout = () => {
    if (auth) {
      auth.signOut().then(() => router.push('/admin/login'));
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
    <div className="admin-panel">
        <Sidebar side="left" collapsible="icon">
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="shrink-0" asChild>
                <Link href="/admin/dashboard">
                  <GarmentFlowIcon className="size-5" />
                </Link>
              </Button>
              <h1 className="text-lg font-semibold tracking-tight">
                অ্যাডমিন প্যানেল
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
                      className="hover:bg-primary/10 data-[active=true]:bg-primary/15 data-[active=true]:text-primary"
                      isActive={pathname === item.href}
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
        </Sidebar>
        <SidebarInset className="flex flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
            <SidebarTrigger className="flex text-foreground hover:text-foreground md:hidden" />
            <div className="relative flex-1">
              {/* Search can be added here if needed */}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3 cursor-pointer p-1 h-auto rounded-full hover:bg-muted">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.photoURL ?? "https://picsum.photos/seed/admin/40/40"} alt="অ্যাডমিনের ছবি" />
                    <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start">
                      <span className="text-sm font-medium text-foreground">{user.displayName ?? "অ্যাডমিন"}</span>
                      <span className="text-xs text-muted-foreground">সুপার অ্যাডমিন</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.displayName ?? user.email}</DropdownMenuLabel>
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
    </div>
  );
}


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SidebarProvider>
  )
}
