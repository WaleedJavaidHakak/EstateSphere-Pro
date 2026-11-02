'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, MessageSquare, Building2, ArrowRight } from 'lucide-react';
import { favoriteService, inquiryService } from '@/services/propertyService';
import { useAuthStore } from '@/store/authStore';

export default function DashboardOverview() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    favorites: 0,
    inquiries: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [favData, inqData] = await Promise.all([
          favoriteService.getFavorites(),
          inquiryService.getMyInquiries()
        ]);
        setStats({
          favorites: favData.count,
          inquiries: inqData.count
        });
      } catch (error) {
        console.error("Failed to load stats", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="text-muted-foreground mt-2">Here's what's happening with your account today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center justify-between"
        >
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Saved Properties</p>
            <p className="text-3xl font-bold">{stats.favorites}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center justify-between"
        >
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">My Inquiries</p>
            <p className="text-3xl font-bold">{stats.inquiries}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/properties" className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted transition-colors group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg"><Building2 className="w-5 h-5 text-primary" /></div>
                <span className="font-medium">Browse Properties</span>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
            <Link href="/dashboard/favorites" className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted transition-colors group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg"><Heart className="w-5 h-5 text-red-500" /></div>
                <span className="font-medium">View Favorites</span>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-red-500 transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
