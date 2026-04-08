import { db, storage } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export interface Complaint {
  id?: string;
  studentId: string;
  studentName: string;
  roomNo: string;
  category: "room" | "hygiene" | "safety" | "food";
  description: string;
  imageUrl?: string;
  isAnonymous: boolean;
  status: "open" | "in_progress" | "resolved";
  slaDeadline?: any;
  resolvedAt?: any;
  createdAt: any;
}

const COLLECTION_NAME = "complaints";

export const raiseComplaint = async (studentId: string, data: Partial<Complaint>, imageFile?: File) => {
  let imageUrl = "";
  if (imageFile) {
    const storageRef = ref(storage, `complaints/${studentId}/${Date.now()}_${imageFile.name}`);
    await uploadBytes(storageRef, imageFile);
    imageUrl = await getDownloadURL(storageRef);
  }

  return await addDoc(collection(db, COLLECTION_NAME), {
    studentId,
    ...data,
    imageUrl,
    status: "open",
    createdAt: serverTimestamp(),
  });
};

export const updateComplaintStatus = async (complaintId: string, status: Complaint["status"]) => {
  const docRef = doc(db, COLLECTION_NAME, complaintId);
  const updates: any = { status };
  if (status === "resolved") {
    updates.resolvedAt = serverTimestamp();
  }
  return await updateDoc(docRef, updates);
};

export const watchComplaints = (callback: (complaints: Complaint[]) => void, onError?: (error: any) => void) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const complaints = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint));
    callback(complaints);
  }, onError);
};

export const watchStudentComplaints = (studentId: string, callback: (complaints: Complaint[]) => void, onError?: (error: any) => void) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where("studentId", "==", studentId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const complaints = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Complaint));
    callback(complaints);
  }, onError);
};
