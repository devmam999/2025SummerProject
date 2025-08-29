import admin from 'firebase-admin';
// Initialize Firebase Admin on first import
if (!admin.apps.length) {
    const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const projectId = process.env.FIREBASE_PROJECT_ID;
    if (!privateKey || !clientEmail || !projectId) {
        console.warn('Firebase Admin credentials are not fully set. Auth will fail.');
    }
    else {
        admin.initializeApp({
            credential: admin.credential.cert({
                privateKey,
                clientEmail,
                projectId,
            }),
        });
    }
}
export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.substring('Bearer '.length)
            : undefined;
        if (!token)
            return res.status(401).json({ error: 'Missing Bearer token' });
        const decoded = await admin.auth().verifyIdToken(token);
        req.userId = decoded.uid;
        return next();
    }
    catch (error) {
        console.error('Auth error', error);
        return res.status(401).json({ error: 'Invalid token' });
    }
};
