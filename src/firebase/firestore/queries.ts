'use client';

import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  limit,
} from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

/**
 * Finds a worker document by their phone number.
 * @param firestore - The Firestore instance.
 * @param phoneNumber - The phone number to search for.
 * @returns The worker data if found, otherwise null.
 */
export async function getUserByPhoneNumber(
  firestore: Firestore,
  phoneNumber: string
) {
  const workersRef = collection(firestore, 'workers');
  const q = query(workersRef, where('contact', '==', phoneNumber), limit(1));

  try {
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      // Return the data of the first document found
      const userDoc = querySnapshot.docs[0];
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error: any) {
    const permissionError = new FirestorePermissionError({
        path: workersRef.path,
        operation: 'list' // getDocs is a 'list' operation
    });

    errorEmitter.emit('permission-error', permissionError);

    // Re-throw the original or a more specific error if needed,
    // but the global handler will catch the emitted one.
    throw permissionError;
  }
}
