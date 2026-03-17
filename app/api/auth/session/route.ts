import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';

// Create session cookie
export async function POST(request: NextRequest) {
    try {
        const { idToken } = await request.json();

        // Verify the ID token
        const decodedToken = await adminAuth.verifyIdToken(idToken);

        // Create session cookie (14 days expiry)
        const expiresIn = 60 * 60 * 24 * 14 * 1000; // 14 days
        const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

        const cookieStore = await cookies();
        cookieStore.set('session', sessionCookie, {
            maxAge: expiresIn / 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            sameSite: 'lax',
        });

        return NextResponse.json({
            success: true,
            data: { role: decodedToken.role || 'owner' },
        });
    } catch (error) {
        console.error('Session creation error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create session' },
            { status: 401 }
        );
    }
}

// Destroy session cookie
export async function DELETE() {
    try {
        const cookieStore = await cookies();
        cookieStore.delete('session');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Session deletion error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete session' },
            { status: 500 }
        );
    }
}
