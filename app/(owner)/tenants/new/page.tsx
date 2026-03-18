'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
    Loader2,
    ArrowLeft,
    User,
    Home,
    FileText,
    ShieldCheck,
    Upload,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    Building2,
    Sparkles,
    CreditCard,
    Calendar,
    Phone,
    Mail,
    MapPin,
    Building,
    Check
} from 'lucide-react';
import { toast } from 'sonner';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Step Schemas
const step1Schema = z.object({
    name: z.string().min(1, 'Name is required'),
    phone: z.string().min(10, 'Valid phone is required'),
    email: z.string().email().optional().or(z.literal('')),
    permanentAddress: z.string().min(1, 'Permanent address is required'),
});

const step2Schema = z.object({
    buildingId: z.string().min(1, 'Please select a building'),
    roomId: z.string().min(1, 'Please select a room'),
    bedId: z.string().optional(),
});

const step3Schema = z.object({
    startDate: z.string().min(1, 'Start date is required'),
    durationMonths: z.coerce.number().min(1, 'Minimum 1 month'),
    rentAmount: z.coerce.number().min(0),
    securityDeposit: z.coerce.number().min(0).default(0),
});

const step4Schema = z.object({
    kycType: z.enum(['aadhaar', 'pan', 'voter_id']),
    kycNumber: z.string().min(1, 'Identity number is required'),
});

export default function NewTenantPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Data State
    const [formData, setFormData] = useState<any>({});
    const [buildings, setBuildings] = useState<any[]>([]);
    const [rooms, setRooms] = useState<any[]>([]);
    const [selectedBuilding, setSelectedBuilding] = useState<any>(null);
    const [selectedRoom, setSelectedRoom] = useState<any>(null);

    // Files State
    const [kycFront, setKycFront] = useState<File | null>(null);
    const [kycBack, setKycBack] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const steps = [
        { id: 1, label: 'Profile', icon: User, description: 'Basic tenant information' },
        { id: 2, label: 'Allocation', icon: Building2, description: 'Room and building assignment' },
        { id: 3, label: 'Financials', icon: CreditCard, description: 'Rent and security deposit' },
        { id: 4, label: 'Verification', icon: ShieldCheck, description: 'KYC and identity proof' },
    ];

    useEffect(() => {
        fetchBuildings();
    }, []);

    async function fetchBuildings() {
        try {
            const response = await fetch('/api/buildings');
            const result = await response.json();
            if (result.success) setBuildings(result.data);
        } catch (error) {
            console.error(error);
        }
    }

    async function fetchRooms(bId: string) {
        try {
            const response = await fetch(`/api/rooms?buildingId=${bId}`);
            const result = await response.json();
            if (result.success) setRooms(result.data);
        } catch (error) {
            console.error(error);
        }
    }

    // individual forms per step
    const form1 = useForm<z.infer<typeof step1Schema>>({
        resolver: zodResolver(step1Schema),
        defaultValues: { name: '', phone: '', email: '', permanentAddress: '' }
    });

    const form2 = useForm<z.infer<typeof step2Schema>>({
        resolver: zodResolver(step2Schema),
        defaultValues: { buildingId: '', roomId: '', bedId: '' }
    });

    const form3 = useForm<z.infer<typeof step3Schema>>({
        resolver: zodResolver(step3Schema),
        defaultValues: { startDate: new Date().toISOString().split('T')[0], durationMonths: 11, rentAmount: 0, securityDeposit: 0 }
    });

    const form4 = useForm<z.infer<typeof step4Schema>>({
        resolver: zodResolver(step4Schema),
        defaultValues: { kycType: 'aadhaar', kycNumber: '' }
    });

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const onStep1Submit = (values: z.infer<typeof step1Schema>) => {
        setFormData({ ...formData, ...values });
        nextStep();
    };

    const onStep2Submit = (values: z.infer<typeof step2Schema>) => {
        if (selectedBuilding?.type === 'pg_hostel' && !values.bedId) {
            toast.error('Please select a bed for this PG building');
            return;
        }
        setFormData({ ...formData, ...values });
        if (selectedRoom) {
            form3.setValue('rentAmount', selectedRoom.monthlyRent);
        }
        nextStep();
    };

    const onStep3Submit = (values: z.infer<typeof step3Schema>) => {
        setFormData({ ...formData, ...values });
        nextStep();
    };

    const uploadFile = async (file: File, path: string): Promise<string> => {
        const storageRef = ref(storage, path);
        const uploadTask = uploadBytesResumable(storageRef, file);

        return new Promise((resolve, reject) => {
            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(progress);
                },
                (error) => reject(error),
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        resolve(downloadURL);
                    });
                }
            );
        });
    };

    const onFinalSubmit = async (values: z.infer<typeof step4Schema>) => {
        setIsLoading(true);
        try {
            const combinedData = { ...formData, ...values };
            const timestamp = Date.now();

            let frontUrl: string | null = null;
            let backUrl: string | null = null;

            if (kycFront) {
                frontUrl = (await uploadFile(kycFront, `kyc/${combinedData.phone}_${timestamp}_front`)) as string;
            }
            if (kycBack) {
                backUrl = (await uploadFile(kycBack, `kyc/${combinedData.phone}_${timestamp}_back`)) as string;
            }

            const tenantRes = await fetch('/api/tenants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: combinedData.name,
                    phone: combinedData.phone,
                    email: combinedData.email,
                    permanentAddress: combinedData.permanentAddress,
                    kyc: {
                        type: combinedData.kycType,
                        number: combinedData.kycNumber,
                        frontUrl: frontUrl,
                        backUrl: backUrl,
                    }
                }),
            });

            const tenantResult = await tenantRes.json();
            if (!tenantRes.ok) throw new Error(tenantResult.error || 'Failed to create tenant profile');

            const leaseRes = await fetch('/api/leases', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tenantId: tenantResult.data.id,
                    buildingId: combinedData.buildingId,
                    roomId: combinedData.roomId,
                    bedId: combinedData.bedId || null,
                    startDate: combinedData.startDate,
                    durationMonths: combinedData.durationMonths,
                    rentAmount: combinedData.rentAmount,
                    securityDeposit: combinedData.securityDeposit,
                }),
            });

            const leaseResult = await leaseRes.json();
            if (!leaseRes.ok) throw new Error(leaseResult.error || 'Failed to create lease');

            toast.success('Tenant onboarded and room allocated successfully!');
            router.push('/tenants');
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="space-y-12 max-w-5xl mx-auto pb-24 animate-fade-in px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push('/tenants')}
                        className="rounded-full hover:bg-white/10 glass-card"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">Onboard Resident</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium italic">
                            Initialize a new residency profile and execute lease agreement.
                        </p>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-3 glass-card px-5 py-2.5 rounded-full border-none">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">System Ready</span>
                </div>
            </div>

            {/* Premium Stepper */}
            <div className="relative max-w-4xl mx-auto">
                <div className="flex justify-between items-center relative z-10">
                    {steps.map((s, idx) => (
                        <div key={s.id} className="flex flex-col items-center group">
                            <div
                                className={cn(
                                    "w-14 h-14 rounded-[1.5rem] flex items-center justify-center border-2 transition-all duration-500 relative",
                                    step >= s.id
                                        ? "bg-primary border-primary text-white shadow-[0_0_20px_rgba(var(--primary),0.3)]"
                                        : "bg-white dark:bg-black/40 border-gray-100 dark:border-white/10 text-gray-400"
                                )}
                            >
                                {step > s.id ? (
                                    <Check className="h-6 w-6 stroke-[3]" />
                                ) : (
                                    <s.icon className={cn("h-6 w-6 transition-transform duration-300 group-hover:scale-110", step === s.id && "animate-pulse")} />
                                )}
                                {step === s.id && (
                                    <div className="absolute -inset-1 rounded-[1.75rem] border border-primary/20 animate-ping opacity-20" />
                                )}
                            </div>
                            <div className="hidden sm:block absolute mt-20 text-center w-32">
                                <p className={cn(
                                    "text-[10px] font-black uppercase tracking-widest transition-colors duration-300",
                                    step >= s.id ? "text-primary" : "text-gray-400"
                                )}>
                                    {s.label}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Connector Line */}
                <div className="absolute top-7 left-0 right-0 h-[2px] bg-gray-100 dark:bg-white/5 -z-0">
                    <div
                        className="h-full bg-primary transition-all duration-700 ease-in-out"
                        style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                    />
                </div>
            </div>

            {/* Form Content */}
            <div className="max-w-3xl mx-auto pt-10">
                {step === 1 && (
                    <Card className="glass-card border-none rounded-[2.5rem] shadow-none overflow-hidden animate-in slide-in-from-bottom-5 duration-500">
                        <Form {...form1}>
                            <form onSubmit={form1.handleSubmit(onStep1Submit)}>
                                <CardHeader className="p-10 pb-6 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
                                        <User className="h-8 w-8" />
                                    </div>
                                    <CardTitle className="text-3xl font-black tracking-tight">Identity Details</CardTitle>
                                    <CardDescription className="text-gray-500 font-medium">Capture the primary resident's personal information.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-10 pt-0 space-y-8">
                                    <FormField
                                        control={form1.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Full Legal Name</FormLabel>
                                                <FormControl>
                                                    <div className="relative group">
                                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                                        <Input placeholder="Enter full name" className="pl-12 h-14 rounded-2xl bg-white dark:bg-black/20 border-gray-100 dark:border-white/10 focus:ring-primary/20 transition-all font-bold" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <FormField
                                            control={form1.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Verified Phone</FormLabel>
                                                    <FormControl>
                                                        <div className="relative group">
                                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                                            <Input placeholder="10-digit number" className="pl-12 h-14 rounded-2xl bg-white dark:bg-black/20 border-gray-100 dark:border-white/10 focus:ring-primary/20 transition-all font-bold" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form1.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Email Address</FormLabel>
                                                    <FormControl>
                                                        <div className="relative group">
                                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                                            <Input placeholder="Optional" className="pl-12 h-14 rounded-2xl bg-white dark:bg-black/20 border-gray-100 dark:border-white/10 focus:ring-primary/20 transition-all font-bold" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form1.control}
                                        name="permanentAddress"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Permanent Address</FormLabel>
                                                <FormControl>
                                                    <div className="relative group">
                                                        <MapPin className="absolute left-4 top-4 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                                        <Input placeholder="Full home address" className="pl-12 h-14 rounded-2xl bg-white dark:bg-black/20 border-gray-100 dark:border-white/10 focus:ring-primary/20 transition-all font-bold" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                                <CardFooter className="p-10 pt-0">
                                    <Button type="submit" className="w-full h-16 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.25em] shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]">
                                        Proceed to Allocation
                                        <ChevronRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </CardFooter>
                            </form>
                        </Form>
                    </Card>
                )}

                {step === 2 && (
                    <Card className="glass-card border-none rounded-[2.5rem] shadow-none overflow-hidden animate-in slide-in-from-right-5 duration-500">
                        <Form {...form2}>
                            <form onSubmit={form2.handleSubmit(onStep2Submit)}>
                                <CardHeader className="p-10 pb-6 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-6">
                                        <Building2 className="h-8 w-8" />
                                    </div>
                                    <CardTitle className="text-3xl font-black tracking-tight">Space Selection</CardTitle>
                                    <CardDescription className="text-gray-500 font-medium">Allocate a building unit or bed to the resident.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-10 pt-0 space-y-8">
                                    <FormField
                                        control={form2.control}
                                        name="buildingId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Target Building</FormLabel>
                                                <Select
                                                    onValueChange={(val) => {
                                                        field.onChange(val);
                                                        const b = buildings.find(b => b.id === val);
                                                        setSelectedBuilding(b);
                                                        setSelectedRoom(null);
                                                        form2.setValue('roomId', '');
                                                        form2.setValue('bedId', '');
                                                        fetchRooms(val);
                                                    }}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="h-14 rounded-2xl bg-white dark:bg-black/20 border-gray-100 dark:border-white/10 font-bold focus:ring-primary/20">
                                                            <SelectValue placeholder="Choose building" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="rounded-2xl border-none shadow-2xl glass-card">
                                                        {buildings.map(b => (
                                                            <SelectItem key={b.id} value={b.id} className="rounded-xl font-bold py-3">{b.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {form2.watch('buildingId') && (
                                        <FormField
                                            control={form2.control}
                                            name="roomId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Inventory Unit</FormLabel>
                                                    <Select
                                                        onValueChange={(val) => {
                                                            field.onChange(val);
                                                            const r = rooms.find(r => r.id === val);
                                                            setSelectedRoom(r);
                                                        }}
                                                        defaultValue={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger className="h-14 rounded-2xl bg-white dark:bg-black/20 border-gray-100 dark:border-white/10 font-bold focus:ring-primary/20">
                                                                <SelectValue placeholder="Choose room" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="rounded-2xl border-none shadow-2xl glass-card">
                                                            {rooms.filter(r => r.status === 'vacant' || (selectedBuilding?.type === 'pg_hostel' && r.beds.some((b: any) => b.status === 'vacant'))).map(r => (
                                                                <SelectItem key={r.id} value={r.id} className="rounded-xl font-bold py-3">Room {r.number} ({r.type})</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}

                                    {selectedBuilding?.type === 'pg_hostel' && selectedRoom && (
                                        <FormField
                                            control={form2.control}
                                            name="bedId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Bed Assignment</FormLabel>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                        {selectedRoom.beds.map((bed: any) => (
                                                            <div
                                                                key={bed.id}
                                                                className={cn(
                                                                    "p-5 rounded-[1.5rem] cursor-pointer text-center transition-all duration-300 border-2",
                                                                    bed.status === 'occupied'
                                                                        ? "bg-gray-100 dark:bg-white/5 opacity-50 cursor-not-allowed border-transparent"
                                                                        : field.value === bed.id
                                                                            ? "border-primary bg-primary/10 ring-4 ring-primary/5"
                                                                            : "border-gray-50 dark:border-white/5 hover:border-primary/30"
                                                                )}
                                                                onClick={() => bed.status !== 'occupied' && field.onChange(bed.id)}
                                                            >
                                                                <span className="font-black text-lg block">{bed.bedNumber}</span>
                                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">{bed.status}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                </CardContent>
                                <CardFooter className="p-10 pt-0 flex flex-col sm:flex-row gap-4">
                                    <Button type="button" variant="ghost" onClick={prevStep} className="h-16 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.25em] px-8">
                                        <ChevronLeft className="mr-2 h-5 w-5" />
                                        Back
                                    </Button>
                                    <Button type="submit" className="flex-1 h-16 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.25em] transition-all hover:scale-[1.02]">
                                        Confirm Selection
                                        <ChevronRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </CardFooter>
                            </form>
                        </Form>
                    </Card>
                )}

                {step === 3 && (
                    <Card className="glass-card border-none rounded-[2.5rem] shadow-none overflow-hidden animate-in slide-in-from-right-5 duration-500">
                        <Form {...form3}>
                            <form onSubmit={form3.handleSubmit(onStep3Submit)}>
                                <CardHeader className="p-10 pb-6 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-6">
                                        <CreditCard className="h-8 w-8" />
                                    </div>
                                    <CardTitle className="text-3xl font-black tracking-tight">Lease Agreement</CardTitle>
                                    <CardDescription className="text-gray-500 font-medium">Define the financial parameters of the residency.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-10 pt-0 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <FormField
                                            control={form3.control}
                                            name="startDate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Lease Start</FormLabel>
                                                    <FormControl>
                                                        <div className="relative group">
                                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                                            <Input type="date" className="pl-12 h-14 rounded-2xl bg-white dark:bg-black/20 border-gray-100 dark:border-white/10 font-bold focus:ring-primary/20" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form3.control}
                                            name="durationMonths"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Tenure (Months)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" className="h-14 rounded-2xl bg-white dark:bg-black/20 border-gray-100 dark:border-white/10 font-bold focus:ring-primary/20" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <FormField
                                            control={form3.control}
                                            name="rentAmount"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Monthly Rent (₹)</FormLabel>
                                                    <FormControl>
                                                        <div className="relative group">
                                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400 group-focus-within:text-primary transition-colors">₹</span>
                                                            <Input type="number" className="pl-8 h-14 rounded-2xl bg-white dark:bg-black/20 border-gray-100 dark:border-white/10 font-bold focus:ring-primary/20 text-xl" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form3.control}
                                            name="securityDeposit"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Security Deposit (₹)</FormLabel>
                                                    <FormControl>
                                                        <div className="relative group">
                                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400 group-focus-within:text-primary transition-colors">₹</span>
                                                            <Input type="number" className="pl-8 h-14 rounded-2xl bg-white dark:bg-black/20 border-gray-100 dark:border-white/10 font-bold focus:ring-primary/20" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter className="p-10 pt-0 flex flex-col sm:flex-row gap-4">
                                    <Button type="button" variant="ghost" onClick={prevStep} className="h-16 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.25em] px-8">
                                        <ChevronLeft className="mr-2 h-5 w-5" />
                                        Back
                                    </Button>
                                    <Button type="submit" className="flex-1 h-16 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.25em] shadow-xl hover:scale-[1.02]">
                                        Next Strategy
                                        <ChevronRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </CardFooter>
                            </form>
                        </Form>
                    </Card>
                )}

                {step === 4 && (
                    <Card className="glass-card border-none rounded-[2.5rem] shadow-none overflow-hidden animate-in slide-in-from-right-5 duration-500">
                        <Form {...form4}>
                            <form onSubmit={form4.handleSubmit(onFinalSubmit)}>
                                <CardHeader className="p-10 pb-6 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
                                        <ShieldCheck className="h-8 w-8" />
                                    </div>
                                    <CardTitle className="text-3xl font-black tracking-tight">Vetting & KYC</CardTitle>
                                    <CardDescription className="text-gray-500 font-medium">Finalize onboarding with identity verification.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-10 pt-0 space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <FormField
                                            control={form4.control}
                                            name="kycType"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Proof Category</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-14 rounded-2xl bg-white dark:bg-black/20 border-gray-100 dark:border-white/10 font-bold">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="rounded-2xl border-none shadow-2xl glass-card">
                                                            <SelectItem value="aadhaar" className="rounded-xl font-bold py-3">Aadhaar Card</SelectItem>
                                                            <SelectItem value="pan" className="rounded-xl font-bold py-3">PAN Card</SelectItem>
                                                            <SelectItem value="voter_id" className="rounded-xl font-bold py-3">Voter ID</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form4.control}
                                            name="kycNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Document ID</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter document number" className="h-14 rounded-2xl bg-white dark:bg-black/20 border-gray-100 dark:border-white/10 font-bold" {...field} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Front Visual</FormLabel>
                                            <div className="group border-2 border-dashed rounded-[2rem] p-8 flex flex-col items-center justify-center gap-4 hover:bg-primary/5 hover:border-primary/50 transition-all cursor-pointer relative overflow-hidden h-48">
                                                {kycFront ? (
                                                    <div className="text-center">
                                                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-2">
                                                            <CheckCircle2 className="h-6 w-6" />
                                                        </div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 truncate max-w-[150px]">{kycFront.name}</p>
                                                        <Button variant="ghost" size="sm" className="mt-2 text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10" onClick={() => setKycFront(null)}>Reset</Button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                            <Upload className="h-6 w-6 text-gray-400 group-hover:text-primary" />
                                                        </div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-primary">Click to scan front</p>
                                                        <Input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setKycFront(e.target.files?.[0] || null)} />
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Rear Visual</FormLabel>
                                            <div className="group border-2 border-dashed rounded-[2rem] p-8 flex flex-col items-center justify-center gap-4 hover:bg-primary/5 hover:border-primary/50 transition-all cursor-pointer relative overflow-hidden h-48">
                                                {kycBack ? (
                                                    <div className="text-center">
                                                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-2">
                                                            <CheckCircle2 className="h-6 w-6" />
                                                        </div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 truncate max-w-[150px]">{kycBack.name}</p>
                                                        <Button variant="ghost" size="sm" className="mt-2 text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10" onClick={() => setKycBack(null)}>Reset</Button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                            <Upload className="h-6 w-6 text-gray-400 group-hover:text-primary" />
                                                        </div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-primary">Click to scan back</p>
                                                        <Input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setKycBack(e.target.files?.[0] || null)} />
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {isLoading && uploadProgress > 0 && (
                                        <div className="space-y-4 p-6 rounded-3xl bg-primary/5 border border-primary/10">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                    Syncing Documents
                                                </span>
                                                <span className="text-[10px] font-black text-primary font-mono">{Math.round(uploadProgress)}%</span>
                                            </div>
                                            <Progress value={uploadProgress} className="h-2 rounded-full bg-primary/10" />
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="p-10 pt-0 flex flex-col sm:flex-row gap-4">
                                    <Button type="button" variant="ghost" onClick={prevStep} className="h-16 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.25em] px-8" disabled={isLoading}>
                                        <ChevronLeft className="mr-2 h-5 w-5" />
                                        Back
                                    </Button>
                                    <Button type="submit" disabled={isLoading} className="flex-1 h-16 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.25em] shadow-2xl transition-all hover:scale-[1.02]">
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Executing Onboarding...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="mr-2 h-5 w-5" />
                                                Finalize Residency
                                            </>
                                        )}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Form>
                    </Card>
                )}
            </div>
        </div>
    );
}

