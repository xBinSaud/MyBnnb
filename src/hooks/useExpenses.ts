import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, deleteDoc, doc, where, orderBy } from 'firebase/firestore';
import { db, COLLECTIONS, Expense } from '../config/firebase';

export function useExpenses(year?: string, month?: string) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let q = query(collection(db, COLLECTIONS.EXPENSES), orderBy('createdAt', 'desc'));

    if (year && month) {
      q = query(
        collection(db, COLLECTIONS.EXPENSES),
        where('year', '==', parseInt(year)),
        where('month', '==', parseInt(month)),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const expensesData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: data.date?.toDate ? data.date.toDate() : new Date(data.date),
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
          } as Expense;
        });
        setExpenses(expensesData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching expenses:', error);
        setError(error as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [year, month]);

  const deleteExpense = async (expenseId: string) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.EXPENSES, expenseId));
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  };

  return { expenses, loading, error, deleteExpense };
}
