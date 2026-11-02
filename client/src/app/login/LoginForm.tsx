
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
  Building2,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react';

import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const returnUrl = searchParams.get('returnUrl') || '/';

  const { login, isLoading } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      // Use Zustand authentication store
      await login(data.email, data.password);

      // Get the authenticated user
      const user = useAuthStore.getState().user;

      if (!user) {
        throw new Error('Unable to retrieve user information.');
      }

      // Store additional user information
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userId', String((user as any)._id || (user as any).id || ''));
      localStorage.setItem('userName', user.name);

      toast.success(`Welcome back, ${user.name}!`);

      // Redirect based on role or return URL
      if (returnUrl !== '/') {
        router.push(returnUrl);
      } else if (user.role === 'admin') {
        router.push('/admin');
      } else if (user.role === 'agent') {
        router.push('/agent/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);

      toast.error(
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please check your credentials.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col justify-center py-12 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          href="/"
          className="flex justify-center items-center gap-2 mb-8"
        >
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Building2 className="w-6 h-6 text-white" />
          </div>

          <span className="font-bold text-2xl">
            <span className="text-primary">Real</span>Estate
            <span className="text-primary text-sm font-semibold">
              Pro
            </span>
          </span>
        </Link>

        <h2 className="text-center text-3xl font-extrabold text-foreground">
          Welcome back
        </h2>

        <p className="mt-2 text-center text-sm text-muted-foreground">
          Sign in to your account to continue
        </p>
      </div>

      {/* Login Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-card py-8 px-4 shadow-xl border border-border sm:rounded-2xl sm:px-10">

          <form
            className="space-y-6"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >

            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Email address
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>

                <input
                  {...register('email')}
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  aria-describedby={
                    errors.email ? 'login-email-error' : undefined
                  }
                  className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  placeholder="you@example.com"
                />
              </div>

              {errors.email && (
                <p
                  id="login-email-error"
                  role="alert"
                  className="mt-1 text-sm text-destructive"
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between mb-2">
                <label
                  htmlFor="login-password"
                  className="block text-sm font-medium text-foreground"
                >
                  Password
                </label>

                <Link
                  href="/forgot-password"
                  className="text-sm font-semibold text-primary hover:text-primary/80"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>

                <input
                  {...register('password')}
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                  aria-describedby={
                    errors.password ? 'login-password-error' : undefined
                  }
                  className="block w-full pl-10 pr-10 py-3 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  placeholder="••••••••"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                  )}
                </button>
              </div>

              {errors.password && (
                <p
                  id="login-password-error"
                  role="alert"
                  className="mt-1 text-sm text-destructive"
                >
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              {isLoading || isSubmitting ? (
                'Signing in...'
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* Registration Link */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>

              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">
                  New to RealEstate Pro?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/register"
                className="w-full flex justify-center py-3 px-4 border border-border rounded-xl shadow-sm text-sm font-semibold bg-background hover:bg-muted transition-colors"
              >
                Create an account
              </Link>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
