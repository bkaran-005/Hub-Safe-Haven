import { db, collection, addDoc, updateDoc, doc, onSnapshot, query, where, orderBy, getDoc, serverTimestamp } from "@/lib/firebase";

export interface OutingRequest {
  id?: string;
  studentId: string;
  studentName: string;
  roomNo: string;
  reason: string;
  destination: string;
  fromDate: string;
  fromTime: string;
  toDate: string;
  toTime: string;
  status: "pending" | "approved" | "rejected" | "exited" | "returned" | "returned_late";
  wardenNote?: string;
  exitTimestamp?: any;
  returnTimestamp?: any;
  minutesLate?: number;
  phone?: string;
  lateAlertSent?: boolean;
  parentFcmToken?: string;
  createdAt: any;
}

const COLLECTION_NAME = "outings";

export const submitOutingRequest = async (studentId: string, data: Partial<OutingRequest>) => {
  return await addDoc(collection(db, COLLECTION_NAME), {
    studentId,
    ...data,
    status: "pending",
    createdAt: serverTimestamp(),
  });
};

export const approveOuting = async (outingId: string, note: string) => {
  const docRef = doc(db, COLLECTION_NAME, outingId);
  return await updateDoc(docRef, {
    status: "approved",
    wardenNote: note,
  });
};

export const rejectOuting = async (outingId: string, reason: string) => {
  const docRef = doc(db, COLLECTION_NAME, outingId);
  return await updateDoc(docRef, {
    status: "rejected",
    wardenNote: reason,
  });
};

export const recordGateExit = async (outingId: string) => {
  const docRef = doc(db, COLLECTION_NAME, outingId);
  return await updateDoc(docRef, {
    status: "exited",
    exitTimestamp: serverTimestamp(),
  });
};

export const recordGateReturn = async (outingId: string, toDate: string, toTime: string) => {
  const docRef = doc(db, COLLECTION_NAME, outingId);

  const deadline = new Date(`${toDate}T${toTime}:00`);
  const now      = new Date();
  const isLate   = now > deadline;
  const minutesLate = isLate ? Math.round((now.getTime() - deadline.getTime()) / 60000) : 0;

  return await updateDoc(docRef, {
    status: isLate ? "returned_late" : "returned",
    returnTimestamp: serverTimestamp(),
    ...(isLate ? { minutesLate } : {}),
  });
};

export const getOutingById = async (outingId: string) => {
  const docRef = doc(db, COLLECTION_NAME, outingId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as OutingRequest;
  }
  return null;
};

export const watchStudentOutings = (studentId: string, callback: (outings: OutingRequest[]) => void, onError?: (error: any) => void) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where("studentId", "==", studentId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snapshot: any) => {
    const outings = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as OutingRequest));
    callback(outings);
  }, onError);
};

export const watchPendingOutings = (callback: (outings: OutingRequest[]) => void, onError?: (error: any) => void) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where("status", "==", "pending"),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snapshot: any) => {
    const outings = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as OutingRequest));
    callback(outings);
  }, onError);
};

export const watchAllOutings = (callback: (outings: OutingRequest[]) => void, onError?: (error: any) => void) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snapshot: any) => {
    const outings = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as OutingRequest));
    callback(outings);
  }, onError);
};

export const watchLateReturns = (callback: (outings: OutingRequest[]) => void, onError?: (error: any) => void) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where("status", "==", "returned_late"),
    orderBy("returnTimestamp", "desc")
  );
  return onSnapshot(q, (snapshot: any) => {
    const outings = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as OutingRequest));
    callback(outings);
  }, onError);
};
