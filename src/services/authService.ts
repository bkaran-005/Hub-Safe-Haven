import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, getDocs, query, collection, where, limit } from "firebase/firestore";

export type Role = "resident" | "warden" | "parent";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: Role;
  roomNo?: string;
  phone?: string;
  parentPhone?: string;
  parentUid?: string;
  fcmToken?: string;
  parentFcmToken?: string;
  wardenFcmToken?: string;
  studentUid?: string;
  createdAt: any;
}

export const loginUser = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = async () => {
  return await signOut(auth);
};

export const getUserDoc = async (uid: string): Promise<UserProfile | null> => {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { uid, ...docSnap.data() } as UserProfile;
  }
  return null;
};

export const getStudentByParentUid = async (parentUid: string): Promise<UserProfile | null> => {
  const parentDoc = await getUserDoc(parentUid);
  if (parentDoc?.studentUid) {
    return await getUserDoc(parentDoc.studentUid);
  }
  return null;
};
