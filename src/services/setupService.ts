import { db, doc, setDoc, collection, addDoc, serverTimestamp } from "@/lib/firebase";
import { UserProfile } from "./authService";

/**
 * Initializes the basic config document in Firestore.
 * This sets up the hostel_settings/main document.
 */
export const seedInitialConfig = async () => {
  const settingsRef = doc(db, "hostel_settings", "main");
  await setDoc(settingsRef, {
    wardenName: "Mrs. Mehra",
    messFeeAmount: 4500,
    currentMonth: new Date().toISOString().slice(0, 7),
    wardenFcmToken: "",
  }, { merge: true });

  // Add an initial announcement to verify seeding
  await addDoc(collection(db, "announcements"), {
    title: "System Initialized",
    body: "The HostelHub Firebase backend has been successfully configured.",
    sentBy: "system",
    wardenName: "System",
    sendToAll: true,
    createdAt: serverTimestamp(),
  });
};

/**
 * Helper to create a user profile in Firestore after registration.
 */
export const registerUserProfile = async (uid: string, profile: Partial<UserProfile>) => {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, {
    ...profile,
    createdAt: serverTimestamp(),
  });
};
