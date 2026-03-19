'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import { Loader2, Building2, ArrowRight, Lock, Mail, ChevronLeft } from 'lucide-react';

import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { signIn } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const redirectPath = searchParams.get('redirect') || '/dashboard';

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    useEffect(() => {
        // Check if already logged in and redirect based on role
        async function checkSession() {
            try {
                const response = await fetch('/api/auth/session', { method: 'GET' });
                const result = await response.json();
                if (result.success && result.data?.role) {
                    if (result.data.role === 'tenant') {
                        router.replace('/home');
                    } else {
                        router.replace('/dashboard');
                    }
                }
            } catch {
                // Not logged in
            }
        }
        checkSession();
    }, [router]);

    async function onSubmit(values: z.infer<typeof loginSchema>) {
        setIsLoading(true);
        try {
            await signIn(values.email, values.password);
            toast.success('Access Granted');

            const response = await fetch('/api/auth/session', { method: 'GET' });
            const result = await response.json();

            if (result.success && result.data?.role === 'tenant') {
                router.push('/home');
            } else {
                router.push(redirectPath);
            }
        } catch (error: unknown) {
            console.error(error);
            const err = error as { message?: string };
            toast.error(err.message || 'Authentication sequence failed');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="w-full max-w-[440px] animate-fade-in">
            <div className="glass-card border-white/10 dark:bg-black/40 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                {/* Subtle internal glow */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10 space-y-8">
                    <div className="space-y-2 text-center">
                        <div className="flex justify-center mb-6">
                            <Link href="/" className="flex items-center gap-1.5 group/logo">
                                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)] group-hover/logo:scale-110 transition-transform">
                                    <Building2 className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white">Rent<span className="text-primary">Flow</span></span>
                            </Link>
                        </div>
                        <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Access Protocol</h2>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Secure Multi-factor Environment</p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Universal Identifier</FormLabel>
                                        <FormControl>
                                            <div className="relative group/input">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within/input:text-primary transition-colors" />
                                                <Input
                                                    placeholder="admin@rentflow.sys"
                                                    className="pl-12 h-14 glass-card border-white/10 dark:bg-white/5 focus:border-primary/30 transition-all font-medium rounded-2xl"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-bold" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <div className="flex items-center justify-between ml-1">
                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Encryption Key</FormLabel>
                                            <Link
                                                href="/forgot-password"
                                                className="text-[10px] font-black uppercase tracking-widest text-primary hover:tracking-[0.25em] transition-all"
                                            >
                                                Recovery
                                            </Link>
                                        </div>
                                        <FormControl>
                                            <div className="relative group/input">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within/input:text-primary transition-colors" />
                                                <Input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    className="pl-12 h-14 glass-card border-white/10 dark:bg-white/5 focus:border-primary/30 transition-all font-medium rounded-2xl"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-[10px] font-bold" />
                                    </FormItem>
                                )}
                            />
                            <Button
                                className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 group hover:scale-[1.02] active:scale-[0.98] transition-all"
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        Initialize Session
                                        <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </Form>

                    <div className="pt-4 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            New Controller?{' '}
                            <Link href="/register" className="text-primary hover:text-primary/80 transition-colors">
                                Register Portfolio
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            <Link href="/" className="mt-8 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                <ChevronLeft className="h-3 w-3" />
                Back to Terminal
            </Link>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#050505] relative overflow-hidden px-4">
            {/* Background elements to match the new landing page */}
            <div className="absolute inset-0 dark:mesh-gradient opacity-30 pointer-events-none" />
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />

            <Suspense fallback={
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">Syncing Cryptographic State</p>
                </div>
            }>
                <LoginForm />
            </Suspense>
        </div>
    );
}

