import { db, collection, addDoc, updateDoc, doc, onSnapshot, query, where, orderBy, serverTimestamp } from "@/lib/firebase";

export interface Visitor {
  id?: string;
  name: string;
  phone: string;
  purpose: string;
  hostStudentId: string;
  wardenApproved: boolean;
  checkInTime: any;
  checkOutTime?: any;
  createdAt: any;
}

const COLLECTION_NAME = "visitors";

export const logVisitor = async (data: Partial<Visitor>) => {
  return await addDoc(collection(db, COLLECTION_NAME), {
    ...data,
    wardenApproved: false,
    checkInTime: serverTimestamp(),
    createdAt: serverTimestamp(),
  });
};

export const approveVisitor = async (visitorId: string) => {
  const docRef = doc(db, COLLECTION_NAME, visitorId);
  return await updateDoc(docRef, {
    wardenApproved: true,
  });
};

export const watchTodayVisitors = (callback: (visitors: Visitor[]) => void) => {
  // Simplification: query all for now, filter logic can be added
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snapshot: any) => {
    const visitors = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Visitor));
    callback(visitors);
  });
};
