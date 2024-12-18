import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc, 
  Timestamp 
} from 'firebase/firestore';
import { db, COLLECTIONS } from '../config/firebase';
import type { Apartment } from '../config/firebase';

export const useApartments = () => {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, COLLECTIONS.APARTMENTS),
      orderBy('name', 'asc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const apartmentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Apartment));
        
        setApartments(apartmentsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching apartments:', err);
        setError('حدث خطأ أثناء جلب البيانات');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addApartment = async (apartmentData: Omit<Apartment, 'id'>) => {
    try {
      await addDoc(collection(db, COLLECTIONS.APARTMENTS), apartmentData);
    } catch (err) {
      console.error('Error adding apartment:', err);
      throw new Error('حدث خطأ أثناء إضافة الشقة');
    }
  };

  const updateApartment = async (
    apartmentId: string,
    apartmentData: Partial<Omit<Apartment, 'id'>>
  ) => {
    try {
      const apartmentRef = doc(db, COLLECTIONS.APARTMENTS, apartmentId);
      await updateDoc(apartmentRef, apartmentData);
    } catch (err) {
      console.error('Error updating apartment:', err);
      throw new Error('حدث خطأ أثناء تحديث الشقة');
    }
  };

  const deleteApartment = async (apartmentId: string) => {
    try {
      const apartmentRef = doc(db, COLLECTIONS.APARTMENTS, apartmentId);
      await deleteDoc(apartmentRef);
    } catch (err) {
      console.error('Error deleting apartment:', err);
      throw new Error('حدث خطأ أثناء حذف الشقة');
    }
  };

  return {
    apartments,
    loading,
    error,
    addApartment,
    updateApartment,
    deleteApartment,
  };
};
