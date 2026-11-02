'use client';

import { useEffect, useState } from 'react';
import { Check, X, Shield, ShieldAlert, Eye, Search, Trash2 } from 'lucide-react';
import { adminService, propertyService } from '@/services/propertyService';
import { Property } from '@/types';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isApproved, setIsApproved] = useState<string>('');

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAdminProperties({ 
        search, 
        isApproved: isApproved === 'true' ? true : isApproved === 'false' ? false : undefined,
        limit: 50 
      });
      setProperties(data.properties);
    } catch (error) {
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [search, isApproved]);

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      await adminService.approveProperty(id, !currentStatus);
      setProperties(properties.map(p => p._id === id ? { ...p, isApproved: !currentStatus } : p));
      toast.success(currentStatus ? 'Property rejected' : 'Property approved');
    } catch {
      toast.error('Action failed');
    }
  };

  const deleteProperty = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this property? This cannot be undone.')) return;
    try {
      await propertyService.deleteProperty(id);
      setProperties(properties.filter(p => p._id !== id));
      toast.success('Property deleted');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete property');
    }
  };

  const toggleFeature = async (id: string) => {
    try {
      await adminService.toggleFeature(id);
      setProperties(properties.map(p => p._id === id ? { ...p, isFeatured: !p.isFeatured } : p));
      toast.success('Property feature status updated');
    } catch {
      toast.error('Failed to update feature status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Manage Properties</h1>
          <p className="text-muted-foreground mt-1">Review and manage all property listings.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by title..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <select 
            value={isApproved}
            onChange={(e) => setIsApproved(e.target.value)}
            className="px-4 py-2 bg-card border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/30"
          >
            <option value="">All Statuses</option>
            <option value="true">Approved</option>
            <option value="false">Pending Review</option>
          </select>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Property</th>
                <th className="px-6 py-4">Agent</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : properties.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No properties found.</td></tr>
              ) : (
                properties.map(p => (
                  <tr key={p._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                          {p.images?.[0]?.url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-muted" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-foreground line-clamp-1 max-w-[200px]">{p.title}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{p.location.city}</div>
                          {p.isFeatured && <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-bold uppercase rounded">Featured</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{p.agent?.name || 'Unknown'}</div>
                      <div className="text-xs text-muted-foreground">{p.agent?.email || '-'}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      PKR {p.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 w-max ${
                        p.isApproved ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {p.isApproved ? <Check className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                        {p.isApproved ? 'Approved' : 'Review Required'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link 
                        href={`/properties/${p._id}`}
                        target="_blank"
                        className="inline-flex p-2 rounded-lg border border-border bg-card hover:bg-muted transition"
                        title="View Property"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      
                      <button 
                        onClick={() => toggleFeature(p._id)}
                        className={`p-2 rounded-lg border transition ${
                          p.isFeatured 
                            ? 'border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-900/20 dark:hover:bg-amber-900/40' 
                            : 'border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                        title={p.isFeatured ? "Remove Featured" : "Make Featured"}
                      >
                        ★
                      </button>

                      <button 
                        onClick={() => toggleApproval(p._id, p.isApproved)}
                        className={`p-2 rounded-lg border transition ${
                          p.isApproved 
                            ? 'border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-900/20 dark:hover:bg-amber-900/40' 
                            : 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40'
                        }`}
                        title={p.isApproved ? "Reject Property" : "Approve Property"}
                      >
                        {p.isApproved ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                      </button>

                      <button 
                        onClick={() => deleteProperty(p._id)}
                        className="p-2 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition"
                        title="Delete Property"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
