import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, initializeFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Use initializeFirestore with settings optimized for stability in this environment
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  host: 'firestore.googleapis.com',
  ssl: true,
}, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  const errorJson = JSON.stringify(errInfo);
  console.error('Firestore Error: ', errorJson);
  throw new Error(errorJson);
}

// Critical: Validate connection to Firestore with retries
async function testConnection(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      // Attempt to read a dummy document to verify connectivity
      await getDocFromServer(doc(db, 'system', 'connection-test'));
      console.log("Firestore connection verified successfully.");
      return;
    } catch (error) {
      const isUnavailable = error instanceof Error && (
        error.message.includes('unavailable') || 
        error.message.includes('Could not reach') ||
        error.message.includes('client is offline')
      );
      
      if (isUnavailable && i < retries - 1) {
        console.warn(`Firestore connection attempt ${i + 1} failed. Retrying...`);
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }
      
      if (isUnavailable) {
        console.error("Firebase connection check failed consistently. The backend might be unreachable or still provisioning.");
      }
      break;
    }
  }
}

testConnection();
