import { db } from "@/lib/firebase";
import { 
  collection, 
  setDoc, 
  doc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  getDocs,
  serverTimestamp 
} from "firebase/firestore";

export interface AttendanceRecord {
  studentId: string;
  date: string; // YYYY-MM-DD
  present: boolean;
  markedBy: string;
  timestamp: any;
}

const COLLECTION_NAME = "attendance";

export const markAttendance = async (studentId: string, date: string, present: boolean, markedBy: string) => {
  const docId = `${studentId}_${date}`;
  const docRef = doc(db, COLLECTION_NAME, docId);
  return await setDoc(docRef, {
    studentId,
    date,
    present,
    markedBy,
    timestamp: serverTimestamp(),
  }, { merge: true });
};

export const getMonthAttendance = async (studentId: string, month: string) => {
  // month format YYYY-MM
  const q = query(
    collection(db, COLLECTION_NAME),
    where("studentId", "==", studentId),
    where("date", ">=", `${month}-01`),
    where("date", "<=", `${month}-31`)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as AttendanceRecord);
};

export const watchTodayAttendance = (date: string, callback: (records: AttendanceRecord[]) => void) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where("date", "==", date)
  );
  return onSnapshot(q, (snapshot) => {
    const records = snapshot.docs.map(doc => doc.data() as AttendanceRecord);
    callback(records);
  });
};
