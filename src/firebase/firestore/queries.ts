'use client';

import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  limit,
} from 'firebase/firestore';

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
  } catch (error) {
    console.error('Error getting user by phone number:', error);
    // Depending on requirements, you might want to re-throw or handle differently
    throw error;
  }
}
