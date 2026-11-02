'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Building2, MessageSquare, Eye, PlusCircle, AlertCircle } from 'lucide-react';
import { propertyService, inquiryService } from '@/services/propertyService';
import { useAuthStore } from '@/store/authStore';
import { Property } from '@/types';

export default function AgentDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ properties: 0, inquiries: 0, totalViews: 0 });
  const [recentProperties, setRecentProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const [propData, inqData] = await Promise.all([
          propertyService.getMyProperties(),
          inquiryService.getInquiries()
        ]);
        
        const properties = propData.properties || [];
        const totalViews = properties.reduce((acc: number, curr: Property) => acc + (curr.views || 0), 0);
        
        setStats({
          properties: propData.count || 0,
          inquiries: inqData.count || 0,
          totalViews
        });
        
        setRecentProperties(properties.slice(0, 3));
      } catch (error) {
        console.error("Failed to load agent stats", error);
        setError("Failed to load properties. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    if (user?.isApproved) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user?.isApproved) {
    return (
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 md:p-10 flex flex-col items-center text-center max-w-2xl mx-auto mt-10">
        <AlertCircle className="w-16 h-16 text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold text-amber-900 dark:text-amber-400 mb-2">Account Pending Approval</h2>
        <p className="text-amber-700 dark:text-amber-500/80 mb-6">
          Your agent account is currently under review by our administration team. You will be able to add properties and view inquiries once approved.
        </p>
        <Link href="/" className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Agent Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your properties and inquiries.</p>
        </div>
        <Link 
          href="/agent/add-property" 
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition shadow-sm"
        >
          <PlusCircle className="w-5 h-5" /> Add Property
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center justify-between"
        >
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Total Properties</p>
            <p className="text-3xl font-bold">{stats.properties}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center justify-between"
        >
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Total Inquiries</p>
            <p className="text-3xl font-bold">{stats.inquiries}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center justify-between"
        >
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Total Views</p>
            <p className="text-3xl font-bold">{stats.totalViews.toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
        </motion.div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-xl font-bold">Recent Properties</h2>
          <Link href="/agent/properties" className="text-sm text-primary font-medium hover:underline">
            View All
          </Link>
        </div>
        <div className="p-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : recentProperties.length > 0 ? (
            <div className="space-y-4">
              {recentProperties.map(prop => (
                <Link href={`/properties/${prop._id}`} key={prop._id} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition cursor-pointer border border-transparent hover:border-border">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                      {prop.images?.[0]?.url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={prop.images[0].url} alt={prop.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold line-clamp-1">{prop.title}</p>
                      <p className="text-sm text-muted-foreground">{prop.location?.city || 'N/A'} • PKR {(prop.price || 0).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm font-medium flex-shrink-0 ml-4">
                    <span className="flex items-center gap-1 text-muted-foreground whitespace-nowrap"><Eye className="w-4 h-4" /> {prop.views || 0}</span>
                    <span className={`px-2 py-1 rounded-md text-xs whitespace-nowrap ${prop.isApproved ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                      {prop.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No properties added yet.</p>
              <Link href="/agent/add-property" className="text-sm text-primary font-medium hover:underline mt-2 inline-block">
                Add your first property
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
