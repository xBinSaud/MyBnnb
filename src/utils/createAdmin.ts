// import { createUserWithEmailAndPassword } from "firebase/auth";
// import { doc, setDoc } from "firebase/firestore";
// import { db } from "../config/firebase";

// export async function createAdminUser() {
//   const email = "admin@mybnb.com";
//   const password = "Admin@123";

//   try {
//     // Create user in Firebase Auth
//     const userCredential = await createUserWithEmailAndPassword(
//       email,
//       password
//     );

//     // Add admin user data to Firestore
//     await setDoc(doc(db, "users", userCredential.user.uid), {
//       id: userCredential.user.uid,
//       email: email,
//       role: "admin",
//       name: "مدير النظام",
//       createdAt: new Date(),
//     });

//     console.log("Admin user created successfully");
//     return { email, password };
//   } catch (error: any) {
//     console.error("Error creating admin user:", error);
//     throw error;
//   }
// }
