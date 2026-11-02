'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Settings, AlertCircle, Mail, Briefcase, Camera, Save, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  type Role = 'user' | 'agent' | 'admin';
  const normalizeRole = (role?: string): Role => (role === 'agent' || role === 'admin' ? role : 'user');

  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    role: Role;
    bio: string;
  }>({
    name: user?.name || '',
    email: user?.email || '',
    role: normalizeRole(user?.role),
    bio: user?.bio || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'role' ? (value as Role) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!user) return;
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateUser({ ...user, ...formData });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      role: normalizeRole(user?.role),
      bio: user?.bio || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      <div>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences and personal information.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border overflow-hidden"
      >
        <form onSubmit={handleSubmit}>
          <div className="p-6 sm:p-10">
            {/* Avatar Section */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 overflow-hidden">
                  {user?.avatar?.url ? (
                    <img src={user.avatar.url} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10" />
                  )}
                </div>
                <button
                  type="button"
                  className="absolute bottom-2 right-0 p-1.5 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                >
                  <Camera className="w-3 h-3" />
                </button>
                <input id="avatar-upload" type="file" accept="image/*" className="hidden" />
              </div>
              <h2 className="text-2xl font-bold">{user?.name || 'User'}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>

            {/* Edit Mode Toggle */}
            {!isEditing ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <User className="w-4 h-4" /> Full Name
                    </label>
                    <p className="text-foreground">{user?.name || 'Not set'}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Email Address
                    </label>
                    <p className="text-foreground">{user?.email || 'Not set'}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Briefcase className="w-4 h-4" /> Role
                    </label>
                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium capitalize">
                      {user?.role || 'Role'}
                    </span>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Bio</label>
                    <p className="text-foreground">{user?.bio || 'No bio added yet.'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="w-full sm:w-auto px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Role</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="moderator">Moderator</option>
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      placeholder="Tell us a bit about yourself..."
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 sm:flex-none px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Save className="w-4 h-4" /> Save Changes
                      </div>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 sm:flex-none px-6 py-2 border border-border rounded-lg hover:bg-muted transition-colors font-medium"
                  >
                    <div className="flex items-center gap-2">
                      <X className="w-4 h-4" /> Cancel
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Info Banner */}
        <div className="border-t border-border p-6 bg-muted/30">
          <div className="flex items-start gap-3 text-blue-600 dark:text-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800/50">
            <Settings className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Account Security</p>
              <p className="text-xs opacity-75">For security reasons, password changes and email verification require additional confirmation.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}