'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import { Loader2, Building2, User, Mail, Phone, Lock, ArrowRight, ChevronLeft } from 'lucide-react';

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

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            phone: '',
        },
    });

    async function onSubmit(values: RegisterFormValues) {
        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/register-owner', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration sequence aborted');
            }

            toast.success('Owner Profile Initialized');
            router.push('/login');
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Identity verification failed');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#050505] relative overflow-hidden px-4 py-12">
            {/* Background elements */}
            <div className="absolute inset-0 dark:mesh-gradient opacity-30 pointer-events-none" />
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />

            <div className="w-full max-w-[480px] animate-fade-in relative z-10">
                <div className="glass-card border-white/10 dark:bg-black/40 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                    <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />

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
                            <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Owner Registration</h2>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Initialize your property empire</p>
                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Controller Name</FormLabel>
                                            <FormControl>
                                                <div className="relative group/input">
                                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within/input:text-primary transition-colors" />
                                                    <Input
                                                        placeholder="Portfolio Manager"
                                                        className="pl-12 h-12 glass-card border-white/10 dark:bg-white/5 focus:border-primary/30 transition-all font-medium rounded-2xl text-sm"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold" />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email</FormLabel>
                                                <FormControl>
                                                    <div className="relative group/input">
                                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within/input:text-primary transition-colors" />
                                                        <Input
                                                            placeholder="sys@admin.io"
                                                            className="pl-12 h-12 glass-card border-white/10 dark:bg-white/5 focus:border-primary/30 transition-all font-medium rounded-2xl text-sm"
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
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Contact</FormLabel>
                                                <FormControl>
                                                    <div className="relative group/input">
                                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within/input:text-primary transition-colors" />
                                                        <Input
                                                            placeholder="+91..."
                                                            className="pl-12 h-12 glass-card border-white/10 dark:bg-white/5 focus:border-primary/30 transition-all font-medium rounded-2xl text-sm"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-[10px] font-bold" />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Encryption Key</FormLabel>
                                            <FormControl>
                                                <div className="relative group/input">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within/input:text-primary transition-colors" />
                                                    <Input
                                                        type="password"
                                                        placeholder="••••••••"
                                                        className="pl-12 h-12 glass-card border-white/10 dark:bg-white/5 focus:border-primary/30 transition-all font-medium rounded-2xl text-sm"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-[10px] font-bold" />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 group hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
                                    type="submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <>
                                            Deploy Identity
                                            <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </Form>

                        <div className="pt-4 text-center border-t border-white/5">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                Existing Manager?{' '}
                                <Link href="/login" className="text-primary hover:text-primary/80 transition-colors">
                                    Authenticate
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
        </div>
    );
}

