import { db, collection, addDoc, updateDoc, doc, query, where, orderBy, onSnapshot, serverTimestamp } from "@/lib/firebase";

export interface SOSLog {
  id?: string;
  studentId: string;
  studentName: string;
  roomNo?: string;
  phone?: string;
  latitude: number;
  longitude: number;
  timestamp: any;
  resolved: boolean;
}

const COLLECTION_NAME = "sos_logs";

export const triggerSOS = async (
  studentId: string, 
  studentName: string, 
  lat: number, 
  lng: number,
  roomNo?: string,
  phone?: string
) => {
  return await addDoc(collection(db, COLLECTION_NAME), {
    studentId,
    studentName,
    roomNo: roomNo || "N/A",
    phone: phone || "N/A",
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

export const watchActiveSOS = (callback: (logs: SOSLog[]) => void, onError?: (error: any) => void) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where("resolved", "==", false),
    orderBy("timestamp", "desc")
  );
  
  return onSnapshot(q, (snapshot: any) => {
    const logs = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as SOSLog));
    callback(logs);
  }, onError);
};
