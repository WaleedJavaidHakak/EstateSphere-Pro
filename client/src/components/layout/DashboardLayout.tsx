'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Heart, MessageSquare, Settings, 
  Menu, X, Building2, PlusCircle, Users, BarChart3, LogOut 
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const userLinks: SidebarItem[] = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Favorites', href: '/dashboard/favorites', icon: Heart },
  { name: 'My Inquiries', href: '/dashboard/inquiries', icon: MessageSquare },
  { name: 'Profile Settings', href: '/dashboard/profile', icon: Settings },
];

const agentLinks: SidebarItem[] = [
  { name: 'Overview', href: '/agent/dashboard', icon: LayoutDashboard },
  { name: 'My Properties', href: '/agent/properties', icon: Building2 },
  { name: 'Add Property', href: '/agent/add-property', icon: PlusCircle },
  { name: 'Inquiries', href: '/agent/inquiries', icon: MessageSquare },
  { name: 'Profile Settings', href: '/dashboard/profile', icon: Settings },
];

const adminLinks: SidebarItem[] = [
  { name: 'Analytics', href: '/admin', icon: BarChart3 },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Properties', href: '/admin/properties', icon: Building2 },
  { name: 'Settings', href: '/dashboard/profile', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return null;

  const links = user.role === 'admin' ? adminLinks : user.role === 'agent' ? agentLinks : userLinks;

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-muted/30 pt-16">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-20 left-4 z-40">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-card border border-border rounded-xl shadow-sm text-foreground"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex max-w-[1600px] mx-auto">
        {/* Sidebar */}
        <AnimatePresence mode="wait">
          {(sidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className={cn(
                "fixed lg:sticky top-[4rem] left-0 z-30 w-64 h-[calc(100vh-4rem)] bg-card border-r border-border shrink-0 flex flex-col transition-transform lg:translate-x-0",
                sidebarOpen ? "translate-x-0 shadow-2xl lg:shadow-none" : "-translate-x-full"
              )}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
                    {user.avatar?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.avatar.url} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-bold text-primary">{user.name[0]}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-bold truncate max-w-[140px]">{user.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                  </div>
                </div>

                <nav className="space-y-1.5">
                  {links.map((link) => {
                    const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                          isActive
                            ? "bg-primary text-white shadow-sm"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <link.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-muted-foreground")} />
                        {link.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="mt-auto p-6 border-t border-border">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="w-5 h-5" /> Logout
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-10 w-full overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
