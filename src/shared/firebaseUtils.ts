import firebaseAdmin, { ServiceAccount } from 'firebase-admin';
import serviceAccount from '../../service_account.json';

export const initializeFirebase = () => {
	firebaseAdmin.initializeApp({
		credential: firebaseAdmin.credential.cert(serviceAccount as ServiceAccount),
	});
};

export const getFirebaseAdminInstance = () => firebaseAdmin.firestore();
