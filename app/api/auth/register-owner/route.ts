import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validated = registerSchema.parse(body);

        // 1. Create Firebase Auth user
        const userRecord = await adminAuth.createUser({
            email: validated.email,
            password: validated.password,
            displayName: validated.name,
        });

        // 2. Set custom claim for owner role
        await adminAuth.setCustomUserClaims(userRecord.uid, { role: 'owner' });

        // 3. Create Firestore user document
        await adminDb.collection('users').doc(userRecord.uid).set({
            uid: userRecord.uid,
            name: validated.name,
            email: validated.email,
            phone: validated.phone || null,
            role: 'owner',
            profilePhotoUrl: null,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });

        return NextResponse.json(
            { success: true, data: { uid: userRecord.uid } },
            { status: 201 }
        );
    } catch (error: unknown) {
        console.error('Registration error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: error.errors[0].message },
                { status: 400 }
            );
        }

        const firebaseError = error as { code?: string; message?: string };
        if (firebaseError.code === 'auth/email-already-exists') {
            return NextResponse.json(
                { success: false, error: 'An account with this email already exists' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Failed to create account' },
            { status: 500 }
        );
    }
}
