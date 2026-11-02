'use client';

import { useEffect, useState } from 'react';
import { Check, X, Shield, ShieldOff, Search, Trash2 } from 'lucide-react';
import { adminService } from '@/services/propertyService';
import { User } from '@/types';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers({ search, role, limit: 50 });
      setUsers(data.users);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, role]);

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      await adminService.updateUser(id, { isApproved: !currentStatus });
      setUsers(users.map(u => u._id === id ? { ...u, isApproved: !currentStatus } : u));
      toast.success(currentStatus ? 'Agent suspended' : 'Agent approved');
    } catch {
      toast.error('Action failed');
    }
  };

  const deleteUser = async (id: string) => {
    if (!window.confirm('Are you sure? This will delete the user and all their properties.')) return;
    try {
      await adminService.deleteUser(id);
      setUsers(users.filter(u => u._id !== id));
      toast.success('User deleted');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Manage Users</h1>
          <p className="text-muted-foreground mt-1">View and manage all platform users.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <select 
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="px-4 py-2 bg-card border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/30"
          >
            <option value="">All Roles</option>
            <option value="user">Users</option>
            <option value="agent">Agents</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No users found.</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{u.name}</div>
                      <div className="text-muted-foreground">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium capitalize ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                        u.role === 'agent' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 w-max ${
                        u.isApproved ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {u.isApproved ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        {u.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {u.role === 'agent' && (
                        <button 
                          onClick={() => toggleApproval(u._id, u.isApproved)}
                          className={`p-2 rounded-lg border transition ${
                            u.isApproved 
                              ? 'border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-900/20 dark:hover:bg-amber-900/40' 
                              : 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40'
                          }`}
                          title={u.isApproved ? "Suspend Agent" : "Approve Agent"}
                        >
                          {u.isApproved ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                        </button>
                      )}
                      {u.role !== 'admin' && (
                        <button 
                          onClick={() => deleteUser(u._id)}
                          className="p-2 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
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
