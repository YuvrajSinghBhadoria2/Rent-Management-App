'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Loader2,
    ArrowLeft,
    Send,
    Wrench,
    AlertTriangle,
    Lightbulb,
    Wifi,
    Package,
    ShieldAlert,
    HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const complaintSchema = z.object({
    category: z.enum(['plumbing', 'electrical', 'furniture', 'internet', 'cleaning', 'security', 'other']),
    priority: z.enum(['urgent', 'normal', 'low']),
    title: z.string().min(5, 'Title must be at least 5 characters').max(100),
    description: z.string().min(20, 'Please provide more detail (min 20 chars)').max(1000),
});

type ComplaintFormValues = z.infer<typeof complaintSchema>;

interface CategoryOption {
    value: 'plumbing' | 'electrical' | 'furniture' | 'internet' | 'cleaning' | 'security' | 'other';
    label: string;
    icon: typeof Wrench;
}

const categories: CategoryOption[] = [
    { value: 'plumbing', label: 'Plumbing', icon: Wrench },
    { value: 'electrical', label: 'Electrical/Power', icon: Lightbulb },
    { value: 'furniture', label: 'Furniture/Assets', icon: Package },
    { value: 'internet', label: 'Internet/WiFi', icon: Wifi },
    { value: 'cleaning', label: 'Cleaning/Waste', icon: HelpCircle },
    { value: 'security', label: 'Security/Access', icon: ShieldAlert },
    { value: 'other', label: 'Other Issues', icon: AlertTriangle },
];

interface ComplaintFormProps {
    onSubmit?: (values: ComplaintFormValues) => Promise<void>;
    isLoading?: boolean;
    defaultValues?: Partial<ComplaintFormValues>;
    showHeader?: boolean;
    className?: string;
}

export function ComplaintForm({
    onSubmit: externalOnSubmit,
    isLoading: externalLoading,
    defaultValues = {
        category: 'plumbing',
        priority: 'normal',
        title: '',
        description: '',
    },
    showHeader = true,
    className,
}: ComplaintFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const internalLoading = externalLoading ?? false;

    const form = useForm<ComplaintFormValues>({
        resolver: zodResolver(complaintSchema),
        defaultValues,
    });

    async function handleSubmit(values: ComplaintFormValues) {
        if (externalOnSubmit) {
            await externalOnSubmit(values);
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/complaints', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            const result = await response.json();
            if (result.success) {
                toast.success('Complaint submitted successfully');
                router.push('/complaints');
            } else {
                toast.error(result.error || 'Failed to submit complaint');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    }

    const loading = isSubmitting || internalLoading;

    return (
        <div className={className}>
            {showHeader && (
                <>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="-ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <div className="space-y-2 mt-4 mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Report an Issue</h1>
                        <p className="text-gray-500">Provide clear details to help us resolve your issue faster.</p>
                    </div>
                </>
            )}

            <Card className="shadow-sm border-gray-200 dark:border-gray-800">
                {showHeader && (
                    <CardHeader className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
                        <CardTitle className="text-base">Maintenance Request</CardTitle>
                        <CardDescription>Your request will be notified to the building owner immediately.</CardDescription>
                    </CardHeader>
                )}
                <CardContent className={showHeader ? 'pt-6' : 'p-0'}>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Issue Category</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {categories.map((cat) => (
                                                        <SelectItem key={cat.value} value={cat.value}>
                                                            <div className="flex items-center gap-2">
                                                                <cat.icon className="h-4 w-4 text-gray-400" />
                                                                {cat.label}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="priority"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Priority Level</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Set priority" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="low">Low - Not urgent</SelectItem>
                                                    <SelectItem value="normal">Normal - Standard</SelectItem>
                                                    <SelectItem value="urgent">Urgent - Emergency</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                High priority is for leaks, fire hazards, or security issues.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Short Summary</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g. Kitchen tap leaking, No WiFi in Room 302"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Detailed Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Please describe the issue in detail. Mention exactly where it is and when it started."
                                                className="min-h-[120px] resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="pt-4 flex flex-col sm:flex-row gap-3">
                                <Button
                                    type="submit"
                                    className="flex-1 sm:flex-none sm:min-w-[200px]"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="mr-2 h-4 w-4" />
                                            Submit Request
                                        </>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
