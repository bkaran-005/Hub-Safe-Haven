import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";

export interface Announcement {
  id?: string;
  title: string;
  body: string;
  sentBy: string;
  wardenName: string;
  sendToAll: boolean;
  createdAt: any;
}

const COLLECTION_NAME = "announcements";

export const sendAnnouncement = async (title: string, body: string, wardenId: string, wardenName: string, sendToAll: boolean = true) => {
  return await addDoc(collection(db, COLLECTION_NAME), {
    title,
    body,
    sentBy: wardenId,
    wardenName,
    sendToAll,
    createdAt: serverTimestamp(),
  });
};

export const watchAnnouncements = (callback: (announcements: Announcement[]) => void) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const announcements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement));
    callback(announcements);
  });
};
