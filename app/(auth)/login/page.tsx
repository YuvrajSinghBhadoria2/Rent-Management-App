'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

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
                    // Already logged in, redirect based on role
                    if (result.data.role === 'tenant') {
                        router.replace('/home');
                    } else {
                        router.replace('/dashboard');
                    }
                }
            } catch {
                // Not logged in, stay on login page
            }
        }
        checkSession();
    }, [router]);

    async function onSubmit(values: z.infer<typeof loginSchema>) {
        setIsLoading(true);
        try {
            await signIn(values.email, values.password);
            toast.success('Successfully logged in');
            
            // Get role from session and redirect accordingly
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
            toast.error(err.message || 'Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
                <div className="flex justify-center mb-4">
                    <h1 className="text-3xl font-bold text-primary">RentFlow</h1>
                </div>
                <CardTitle className="text-2xl text-center">Login</CardTitle>
                <CardDescription className="text-center">
                    Enter your email and password to access your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="name@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center justify-between">
                                        <FormLabel>Password</FormLabel>
                                        <Link
                                            href="/forgot-password"
                                            className="text-sm font-medium text-primary hover:underline"
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button className="w-full" type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Sign In
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
                <div className="text-sm text-center text-muted-foreground">
                    Don&apos;t have an account?{' '}
                    <Link href="/register" className="text-primary hover:underline font-medium">
                        Register as Owner
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
}

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <Suspense fallback={
                <div className="flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            }>
                <LoginForm />
            </Suspense>
        </div>
    );
}
