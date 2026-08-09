import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  query,
  where,
  orderBy as fbOrderBy,
  limit as fbLimit,
  getDoc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export interface QueryFilter {
  field: string;
  op: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'array-contains';
  value: any;
}

export async function fetchCollection(
  colName: string,
  filters?: QueryFilter[],
  orderByField?: string,
  limitCount?: number
) {
  const constraints: any[] = [];
  if (filters) {
    filters.forEach((f) => constraints.push(where(f.field, f.op, f.value)));
  }
  if (orderByField) {
    constraints.push(fbOrderBy(orderByField, 'desc'));
  }
  if (limitCount) {
    constraints.push(fbLimit(limitCount));
  }
  const q = query(collection(db, colName), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addDocument(colName: string, data: Record<string, any>) {
  const docRef = await addDoc(collection(db, colName), {
    ...data,
    created_at: new Date().toISOString(),
  });
  return docRef.id;
}

export async function addDocumentWithId(colName: string, id: string, data: Record<string, any>) {
  const docRef = doc(db, colName, id);
  await setDoc(docRef, { ...data, id });
}

export async function updateDocument(colName: string, docId: string, data: Record<string, any>) {
  await updateDoc(doc(db, colName, docId), data);
}

export async function deleteDocument(colName: string, docId: string) {
  await deleteDoc(doc(db, colName, docId));
}

export async function getDocument(colName: string, docId: string) {
  const snap = await getDoc(doc(db, colName, docId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function countDocuments(colName: string, filters?: QueryFilter[]) {
  const constraints: any[] = [];
  if (filters) {
    filters.forEach((f) => constraints.push(where(f.field, f.op, f.value)));
  }
  const q = query(collection(db, colName), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.size;
}

export async function fetchSubcollection(
  colName: string,
  docId: string,
  subColName: string,
  orderByField?: string
) {
  const constraints: any[] = [];
  if (orderByField) {
    constraints.push(fbOrderBy(orderByField, 'asc'));
  }
  const q = query(collection(db, colName, docId, subColName), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addSubcollectionDoc(
  colName: string,
  docId: string,
  subColName: string,
  data: Record<string, any>
) {
  const docRef = await addDoc(collection(db, colName, docId, subColName), {
    ...data,
    created_at: new Date().toISOString(),
  });
  return docRef.id;
}

export async function batchUpdate(updates: { col: string; id: string; data: Record<string, any> }[]) {
  const batch = writeBatch(db);
  updates.forEach(({ col, id, data }) => {
    batch.update(doc(db, col, id), data);
  });
  await batch.commit();
}
