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
    Search,
    Building2,
    Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
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
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

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
        // Pre-fill rent from room
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

            // Upload KYC files if present
            let frontUrl: string | null = null;
            let backUrl: string | null = null;

            if (kycFront) {
                frontUrl = (await uploadFile(kycFront, `kyc/${combinedData.phone}_${timestamp}_front`)) as string;
            }
            if (kycBack) {
                backUrl = (await uploadFile(kycBack, `kyc/${combinedData.phone}_${timestamp}_back`)) as string;
            }

            // 1. Create Tenant
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

            // 2. Create Lease
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
        <div className="space-y-8 max-w-4xl mx-auto pb-20">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push('/tenants')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Onboard Tenant</h1>
                    <p className="text-muted-foreground">Follow the steps to register a new tenant and allocate a room.</p>
                </div>
            </div>

            {/* Stepper Header */}
            <div className="relative">
                <div className="flex justify-between mb-4">
                    {[
                        { step: 1, label: 'Profile', icon: User },
                        { step: 2, label: 'Allocation', icon: Home },
                        { step: 3, label: 'Lease', icon: FileText },
                        { step: 4, label: 'KYC', icon: ShieldCheck },
                    ].map((item) => (
                        <div key={item.step} className="flex flex-col items-center z-10">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${step >= item.step ? 'bg-primary border-primary text-white' : 'bg-white border-muted text-muted-foreground'
                                }`}>
                                {step > item.step ? <CheckCircle2 className="h-6 w-6" /> : <item.icon className="h-5 w-5" />}
                            </div>
                            <span className={`text-xs mt-2 font-medium ${step >= item.step ? 'text-primary' : 'text-muted-foreground'}`}>
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
                <Progress value={(step - 1) * 33.33} className="absolute top-5 h-0.5 w-[90%] left-[5%] -z-0" />
            </div>

            {/* Step 1: Personal Info */}
            {step === 1 && (
                <Card>
                    <Form {...form1}>
                        <form onSubmit={form1.handleSubmit(onStep1Submit)}>
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                                <CardDescription>Primary contact details of the tenant.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form1.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name*</FormLabel>
                                            <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form1.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone Number*</FormLabel>
                                                <FormControl><Input placeholder="9876543210" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form1.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email Address</FormLabel>
                                                <FormControl><Input placeholder="john@example.com" {...field} /></FormControl>
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
                                            <FormLabel>Permanent Address*</FormLabel>
                                            <FormControl><Input placeholder="Full home address" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                            <CardFooter className="flex justify-end">
                                <Button type="submit">
                                    Next Step
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </form>
                    </Form>
                </Card>
            )}

            {/* Step 2: Allocation */}
            {step === 2 && (
                <Card>
                    <Form {...form2}>
                        <form onSubmit={form2.handleSubmit(onStep2Submit)}>
                            <CardHeader>
                                <CardTitle>Room Allocation</CardTitle>
                                <CardDescription>Select property and room for this tenant.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <FormField
                                    control={form2.control}
                                    name="buildingId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Select Building</FormLabel>
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
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Choose building" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {buildings.map(b => (
                                                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
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
                                                <FormLabel>Select Room</FormLabel>
                                                <Select
                                                    onValueChange={(val) => {
                                                        field.onChange(val);
                                                        const r = rooms.find(r => r.id === val);
                                                        setSelectedRoom(r);
                                                    }}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Choose room" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {rooms.filter(r => r.status === 'vacant' || (selectedBuilding?.type === 'pg_hostel' && r.beds.some((b: any) => b.status === 'vacant'))).map(r => (
                                                            <SelectItem key={r.id} value={r.id}>Room {r.number} ({r.type})</SelectItem>
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
                                                <FormLabel>Select Bed</FormLabel>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                    {selectedRoom.beds.map((bed: any) => (
                                                        <div
                                                            key={bed.id}
                                                            className={`p-3 border-2 rounded-lg cursor-pointer text-center transition-all ${bed.status === 'occupied'
                                                                    ? 'bg-muted opacity-50 cursor-not-allowed'
                                                                    : field.value === bed.id
                                                                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                                                        : 'border-muted hover:border-primary/50'
                                                                }`}
                                                            onClick={() => bed.status !== 'occupied' && field.onChange(bed.id)}
                                                        >
                                                            <span className="font-bold">{bed.bedNumber}</span>
                                                            <p className="text-[10px] uppercase opacity-60">{bed.status}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button type="button" variant="outline" onClick={prevStep}>
                                    <ChevronLeft className="mr-2 h-4 w-4" />
                                    Back
                                </Button>
                                <Button type="submit">
                                    Next Step
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </form>
                    </Form>
                </Card>
            )}

            {/* Step 3: Lease Details */}
            {step === 3 && (
                <Card>
                    <Form {...form3}>
                        <form onSubmit={form3.handleSubmit(onStep3Submit)}>
                            <CardHeader>
                                <CardTitle>Lease & Rent Configuration</CardTitle>
                                <CardDescription>Setup the financial terms of the lease.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form3.control}
                                        name="startDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Lease Start Date</FormLabel>
                                                <FormControl><Input type="date" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form3.control}
                                        name="durationMonths"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Duration (Months)</FormLabel>
                                                <FormControl><Input type="number" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form3.control}
                                        name="rentAmount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Monthly Rent (₹)</FormLabel>
                                                <FormControl><Input type="number" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form3.control}
                                        name="securityDeposit"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Security Deposit (₹)</FormLabel>
                                                <FormControl><Input type="number" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button type="button" variant="outline" onClick={prevStep}>
                                    <ChevronLeft className="mr-2 h-4 w-4" />
                                    Back
                                </Button>
                                <Button type="submit">
                                    Next Step
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </form>
                    </Form>
                </Card>
            )}

            {/* Step 4: KYC */}
            {step === 4 && (
                <Card>
                    <Form {...form4}>
                        <form onSubmit={form4.handleSubmit(onFinalSubmit)}>
                            <CardHeader>
                                <CardTitle>Identity Verification (KYC)</CardTitle>
                                <CardDescription>Upload identity proof documents.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form4.control}
                                        name="kycType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Identity Proof Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="aadhaar">Aadhaar Card</SelectItem>
                                                        <SelectItem value="pan">PAN Card</SelectItem>
                                                        <SelectItem value="voter_id">Voter ID</SelectItem>
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
                                                <FormLabel>Identity Number</FormLabel>
                                                <FormControl><Input placeholder="Number on ID" {...field} /></FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <FormLabel>Front Side Image</FormLabel>
                                        <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 hover:bg-muted/50 transition-all cursor-pointer relative overflow-hidden">
                                            {kycFront ? (
                                                <div className="text-center">
                                                    <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto" />
                                                    <p className="text-sm font-medium mt-2">{kycFront.name}</p>
                                                    <Button variant="ghost" size="sm" className="mt-2 text-destructive" onClick={() => setKycFront(null)}>Remove</Button>
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload className="h-10 w-10 text-muted-foreground" />
                                                    <p className="text-sm font-medium">Click to upload front side</p>
                                                    <Input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setKycFront(e.target.files?.[0] || null)} />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <FormLabel>Back Side Image (Optional)</FormLabel>
                                        <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 hover:bg-muted/50 transition-all cursor-pointer relative overflow-hidden">
                                            {kycBack ? (
                                                <div className="text-center">
                                                    <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto" />
                                                    <p className="text-sm font-medium mt-2">{kycBack.name}</p>
                                                    <Button variant="ghost" size="sm" className="mt-2 text-destructive" onClick={() => setKycBack(null)}>Remove</Button>
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload className="h-10 w-10 text-muted-foreground" />
                                                    <p className="text-sm font-medium">Click to upload back side</p>
                                                    <Input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setKycBack(e.target.files?.[0] || null)} />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {isLoading && uploadProgress > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-medium">
                                            <span>Uploading documents...</span>
                                            <span>{Math.round(uploadProgress)}%</span>
                                        </div>
                                        <Progress value={uploadProgress} className="h-1.5" />
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button type="button" variant="outline" onClick={prevStep} disabled={isLoading}>
                                    <ChevronLeft className="mr-2 h-4 w-4" />
                                    Back
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                                    Finish Onboarding
                                </Button>
                            </CardFooter>
                        </form>
                    </Form>
                </Card>
            )}
        </div>
    );
}
