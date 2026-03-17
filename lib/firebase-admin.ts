let adminDb: any = null;
let adminAuth: any = null;
let isInitialized = false;

function initializeFirebaseAdmin() {
    if (typeof window !== 'undefined' || isInitialized) return;
    
    // Check if we have valid credentials
    if (!process.env.FIREBASE_PROJECT_ID || 
        !process.env.FIREBASE_CLIENT_EMAIL || 
        !process.env.FIREBASE_PRIVATE_KEY ||
        process.env.FIREBASE_PRIVATE_KEY.includes('-----BEGIN PRIVATE KEY-----...')) {
        console.warn('Firebase Admin credentials not configured. API routes requiring auth will not work.');
        return;
    }
    
    try {
        const { initializeApp, getApps, cert } = require('firebase-admin/app');
        const { getFirestore } = require('firebase-admin/firestore');
        const { getAuth } = require('firebase-admin/auth');

        if (getApps().length === 0) {
            initializeApp({
                credential: cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                }),
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            });
        }
        
        adminDb = getFirestore();
        adminAuth = getAuth();
        isInitialized = true;
    } catch (error) {
        console.error('Firebase admin initialization error:', error);
    }
}

// Only initialize on server-side
if (typeof window === 'undefined') {
    initializeFirebaseAdmin();
}

export { adminDb, adminAuth };
