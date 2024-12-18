import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const ADMIN_EMAIL = 'admin@mybnb.com';
const ADMIN_PASSWORD = 'Admin@123';

export async function setupAdminAccount() {
  try {
    // First, try to sign in to check if admin exists
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
      
      // If we get here, it means the admin account was created successfully
      // Now let's add the admin data to Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        id: userCredential.user.uid,
        email: ADMIN_EMAIL,
        role: 'admin',
        name: 'مدير النظام',
        createdAt: new Date(),
      });

      console.log('Admin account created successfully');
      return {
        success: true,
        message: 'تم إنشاء حساب الأدمن بنجاح',
        credentials: {
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
        },
      };
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        // Admin account already exists, let's verify it has the correct role in Firestore
        const existingUser = await auth.signInWithEmailAndPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
        const userDoc = await getDoc(doc(db, 'users', existingUser.user.uid));
        
        if (!userDoc.exists()) {
          // User exists in Auth but not in Firestore, let's add them
          await setDoc(doc(db, 'users', existingUser.user.uid), {
            id: existingUser.user.uid,
            email: ADMIN_EMAIL,
            role: 'admin',
            name: 'مدير النظام',
            createdAt: new Date(),
          });
        }

        return {
          success: true,
          message: 'حساب الأدمن موجود مسبقاً',
          credentials: {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
          },
        };
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error setting up admin account:', error);
    return {
      success: false,
      message: error.message || 'حدث خطأ أثناء إنشاء حساب الأدمن',
    };
  }
}
