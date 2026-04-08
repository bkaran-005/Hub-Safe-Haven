import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp 
} from "firebase/firestore";

export interface SOSLog {
  id?: string;
  studentId: string;
  studentName: string;
  latitude: number;
  longitude: number;
  timestamp: any;
  resolved: boolean;
}

const COLLECTION_NAME = "sos_logs";

export const triggerSOS = async (studentId: string, studentName: string, lat: number, lng: number) => {
  return await addDoc(collection(db, COLLECTION_NAME), {
    studentId,
    studentName,
    latitude: lat,
    longitude: lng,
    timestamp: serverTimestamp(),
    resolved: false,
  });
};

export const resolveSOS = async (sosId: string) => {
  const docRef = doc(db, COLLECTION_NAME, sosId);
  return await updateDoc(docRef, {
    resolved: true,
  });
};
