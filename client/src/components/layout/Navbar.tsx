'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/store/authStore';
import {
  Home, Building2, Info, Phone, LogIn, UserPlus, Menu, X,
  Sun, Moon, User, LayoutDashboard, Heart, LogOut, ChevronDown,
  Settings, Bell
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import toast from 'react-hot-toast';

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/properties', label: 'Properties', icon: Building2 },
  { href: '/about', label: 'About', icon: Info },
  { href: '/contact', label: 'Contact', icon: Phone },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setIsOpen(false); setUserMenuOpen(false); }, [pathname]);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  const getDashboardLink = () => {
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'agent') return '/agent/dashboard';
    return '/dashboard';
  };

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled || isOpen
        ? 'bg-background/95 backdrop-blur-md shadow-lg border-b border-border'
        : 'bg-transparent'
    )}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-md group-hover:shadow-primary/40 transition-shadow">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl hidden sm:block">
              <span className="text-primary">Real</span>
              <span className="text-foreground">Estate</span>
              <span className="text-primary text-sm font-semibold ml-0.5">Pro</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  pathname === href
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-foreground/70 hover:text-foreground hover:bg-muted'
                )}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-muted transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                    {user.avatar?.url && user.avatar.url.includes('cloudinary') ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.avatar.url} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      getInitials(user.name)
                    )}
                  </div>
                  <span className="hidden sm:block text-sm font-medium max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                  <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", userMenuOpen && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-xl py-1.5 z-50"
                    >
                      <div className="px-3 py-2 border-b border-border mb-1">
                        <p className="text-sm font-semibold truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        <span className={cn(
                          "inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                          user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400' :
                          user.role === 'agent' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' :
                          'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                        )}>{user.role}</span>
                      </div>

                      <Link href={getDashboardLink()} className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted rounded-lg mx-1 transition-colors">
                        <LayoutDashboard className="w-4 h-4 text-primary" /> Dashboard
                      </Link>
                      <Link href="/dashboard/profile" className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted rounded-lg mx-1 transition-colors">
                        <User className="w-4 h-4 text-primary" /> Profile
                      </Link>
                      {user.role === 'user' && (
                        <Link href="/dashboard/favorites" className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted rounded-lg mx-1 transition-colors">
                          <Heart className="w-4 h-4 text-primary" /> Favorites
                        </Link>
                      )}
                      <div className="border-t border-border mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-destructive/10 text-destructive rounded-lg mx-1 transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login" className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                  Sign In
                </Link>
                <Link href="/register" className="px-4 py-2 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-sm hover:shadow-primary/30">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background/98 backdrop-blur-lg"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                    pathname === href
                      ? 'bg-primary text-white'
                      : 'hover:bg-muted text-foreground/80'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
              {!isAuthenticated && (
                <div className="pt-2 grid grid-cols-2 gap-2">
                  <Link href="/login" className="flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors">
                    <LogIn className="w-4 h-4" /> Sign In
                  </Link>
                  <Link href="/register" className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all">
                    <UserPlus className="w-4 h-4" /> Register
                  </Link>
                </div>
              )}
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
