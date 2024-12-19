// import { addDoc, collection } from "firebase/firestore";
// import { db, COLLECTIONS } from "../config/firebase";
// import type { Apartment, Booking } from "../config/firebase";

// const apartments: Omit<Apartment, "id">[] = [
//   {
//     name: "شقة البحر الأزرق",
//     description: "شقة فاخرة مع إطلالة على البحر",
//     pricePerNight: 500,
//     location: "جدة - الكورنيش",
//     amenities: ["مسبح", "واي فاي", "موقف سيارات", "مطبخ مجهز"],
//     images: ["https://example.com/blue-apartment.jpg"],
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   },
//   {
//     name: "جناح الواحة",
//     description: "جناح هادئ في قلب المدينة",
//     pricePerNight: 350,
//     location: "الرياض - العليا",
//     amenities: ["تكييف", "واي فاي", "تلفاز", "غسالة ملابس"],
//     images: ["https://example.com/oasis-suite.jpg"],
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   },
// ];

// const generateBookings = (apartmentIds: string[]): Omit<Booking, "id">[] => {
//   const now = new Date();
//   const bookings: Omit<Booking, "id">[] = [];

//   const statuses: ("pending" | "confirmed" | "cancelled")[] = [
//     "pending",
//     "confirmed",
//     "cancelled",
//   ];
//   const names = [
//     "محمد أحمد",
//     "سارة خالد",
//     "عبدالله محمد",
//     "نورة سعد",
//     "فهد عبدالرحمن",
//   ];

//   for (let i = 0; i < 10; i++) {
//     const checkIn = new Date(now);
//     checkIn.setDate(now.getDate() + Math.floor(Math.random() * 30));
//     const checkOut = new Date(checkIn);
//     checkOut.setDate(checkIn.getDate() + Math.floor(Math.random() * 5) + 1);
//   }

//   return bookings;
// };

export const createTestData = async () => {
  // try {
  //   // Add apartments
  //   const apartmentIds: string[] = [];
  //   for (const apartment of apartments) {
  //     const docRef = await addDoc(
  //       collection(db, COLLECTIONS.APARTMENTS),
  //       apartment
  //     );
  //     apartmentIds.push(docRef.id);
  //   }
  //   // Add bookings
  //   const bookings = generateBookings(apartmentIds);
  //   for (const booking of bookings) {
  //     await addDoc(collection(db, COLLECTIONS.BOOKINGS), booking);
  //   }
  //   console.log("Test data created successfully");
  //   return true;
  // } catch (error) {
  //   console.error("Error creating test data:", error);
  //   return false;
  // }
};
