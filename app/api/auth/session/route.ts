import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';

// Get current session
export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('session')?.value;

        if (!sessionCookie) {
            return NextResponse.json({ success: false, error: 'No session' }, { status: 401 });
        }

        // Verify the session cookie
        const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
        
        // Get user role from Firestore
        const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
        const userData = userDoc.data();
        
        return NextResponse.json({
            success: true,
            data: { 
                uid: decodedToken.uid,
                role: userData?.role || decodedToken.role || 'owner',
                email: decodedToken.email,
            },
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
    }
}

// Create session cookie
export async function POST(request: NextRequest) {
    try {
        const { idToken } = await request.json();

        // Verify the ID token
        const decodedToken = await adminAuth.verifyIdToken(idToken);

        // Get user role from Firestore
        const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
        const userData = userDoc.data();
        const role = userData?.role || decodedToken.role || 'owner';

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

        // Also set user_role cookie for middleware (non-httpOnly so client can read)
        cookieStore.set('user_role', role, {
            maxAge: expiresIn / 1000,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            sameSite: 'lax',
        });

        return NextResponse.json({
            success: true,
            data: { role },
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
        cookieStore.delete('user_role');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Session deletion error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete session' },
            { status: 500 }
        );
    }
}
