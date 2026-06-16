import { db } from "./firebase.js";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

export async function fetchBooks(lastDoc = null, pageSize = 50) {
  let q = query(collection(db, "books"), orderBy("addedAt", "desc"), limit(pageSize));
  if (lastDoc) q = query(q, startAfter(lastDoc));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function saveBook(bookData) {
  const payload = {
    ...bookData,
    addedAt: bookData.addedAt || today()
  };

  const docRef = await addDoc(collection(db, "books"), payload);
  return { id: docRef.id, ...payload };
}

export async function editBook(bookId, bookData) {
  await updateDoc(doc(db, "books", bookId), bookData);
}

export async function removeBook(bookId) {
  await deleteDoc(doc(db, "books", bookId));
}

export async function fetchLendings(lastDoc = null, pageSize = 100) {
  let q = query(collection(db, "lendings"), orderBy("borrowedAt", "desc"), limit(pageSize));
  if (lastDoc) q = query(q, startAfter(lastDoc));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function saveLending(recordData) {
  const payload = {
    status: "Borrowed",
    borrowedAt: new Date().toISOString(),
    ...recordData
  };

  const docRef = await addDoc(collection(db, "lendings"), payload);
  return { id: docRef.id, ...payload };
}

export async function updateLendingStatus(recordId, status) {
  await updateDoc(doc(db, "lendings", recordId), { status });
}

export async function removeLending(recordId) {
  await deleteDoc(doc(db, "lendings", recordId));
}

export async function fetchNotifications() {
  const snapshot = await getDocs(query(collection(db, "notifications"), orderBy("createdAtValue", "desc"), limit(10)));
  return snapshot.docs.map((notificationDoc) => ({ id: notificationDoc.id, ...notificationDoc.data() }));
}

export async function saveNotification(notificationData) {
  const docRef = await addDoc(collection(db, "notifications"), notificationData);
  return { id: docRef.id, ...notificationData };
}

export async function markAllNotificationsRead() {
  const snapshot = await getDocs(query(collection(db, "notifications"), orderBy("createdAtValue", "desc"), limit(10)));
  await Promise.all(snapshot.docs.map((notificationDoc) =>
    updateDoc(doc(db, "notifications", notificationDoc.id), { read: true })
  ));
}

export function subscribeToBooks(callback) {
  return onSnapshot(query(collection(db, "books"), orderBy("addedAt", "desc")), (snapshot) => {
    callback(snapshot.docs.map((bookDoc) => ({ id: bookDoc.id, ...bookDoc.data() })));
  });
}

export function subscribeToLendings(callback) {
  return onSnapshot(query(collection(db, "lendings"), orderBy("borrowedAt", "desc")), (snapshot) => {
    callback(snapshot.docs.map((recordDoc) => ({ id: recordDoc.id, ...recordDoc.data() })));
  });
}

export function subscribeToNotifications(callback) {
  return onSnapshot(query(collection(db, "notifications"), orderBy("createdAtValue", "desc"), limit(10)), (snapshot) => {
    callback(snapshot.docs.map((notificationDoc) => ({ id: notificationDoc.id, ...notificationDoc.data() })));
  });
}

function today() {
  return new Date().toISOString().slice(0, 10);
}
