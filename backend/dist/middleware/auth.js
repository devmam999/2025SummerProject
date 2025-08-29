"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
// Initialize Firebase Admin on first import
if (!firebase_admin_1.default.apps.length) {
    const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const projectId = process.env.FIREBASE_PROJECT_ID;
    if (!privateKey || !clientEmail || !projectId) {
        console.warn('Firebase Admin credentials are not fully set. Auth will fail.');
    }
    else {
        firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert({
                privateKey,
                clientEmail,
                projectId,
            }),
        });
    }
}
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.substring('Bearer '.length)
            : undefined;
        if (!token)
            return res.status(401).json({ error: 'Missing Bearer token' });
        const decoded = await firebase_admin_1.default.auth().verifyIdToken(token);
        req.userId = decoded.uid;
        return next();
    }
    catch (error) {
        console.error('Auth error', error);
        return res.status(401).json({ error: 'Invalid token' });
    }
};
exports.authenticate = authenticate;
