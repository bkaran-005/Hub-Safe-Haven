import { db } from "@/lib/firebase";
import { 
  collection, 
  setDoc, 
  addDoc,
  doc, 
  getDoc,
  getDocs,
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";

export interface MealOptIn {
  studentId: string;
  date: string;
  meal: "breakfast" | "lunch" | "dinner";
  opted: boolean;
  timestamp: any;
}

export interface Payment {
  id?: string;
  studentId: string;
  amount: number;
  month: string;
  receiptId: string;
  method: string;
  paidAt: any;
}

export interface HostelSettings {
  wardenFcmToken: string;
  wardenName: string;
  messFeeAmount: number;
  currentMonth: string;
}

export const toggleMealOptIn = async (studentId: string, date: string, meal: MealOptIn["meal"], opted: boolean) => {
  const docId = `${studentId}_${date}_${meal}`;
  const docRef = doc(db, "meal_optins", docId);
  return await setDoc(docRef, {
    studentId,
    date,
    meal,
    opted,
    timestamp: serverTimestamp(),
  }, { merge: true });
};

export const getMealOptins = async (studentId: string, month: string) => {
  const q = query(
    collection(db, "meal_optins"),
    where("studentId", "==", studentId),
    where("date", ">=", `${month}-01`),
    where("date", "<=", `${month}-31`)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as MealOptIn);
};

export const getMessFee = async (): Promise<HostelSettings | null> => {
  const docRef = doc(db, "hostel_settings", "main");
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as HostelSettings;
  }
  return null;
};

export const savePayment = async (studentId: string, data: Partial<Payment>) => {
  return await addDoc(collection(db, "payments"), {
    studentId,
    ...data,
    paidAt: serverTimestamp(),
  });
};

export const getPaymentHistory = async (studentId: string) => {
  const q = query(
    collection(db, "payments"),
    where("studentId", "==", studentId),
    orderBy("paidAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payment));
};
