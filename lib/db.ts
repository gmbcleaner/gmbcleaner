import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  setDoc,
  query,
  where,
  orderBy as fbOrderBy,
  limit as fbLimit,
  getDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

export interface QueryFilter {
  field: string;
  op: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'array-contains';
  value: any;
}

function checkDb() {
  if (!db) throw new Error('Firestore not connected. Check Firebase config.');
}

export async function fetchCollection(
  colName: string,
  filters?: QueryFilter[],
  orderByField?: string,
  limitCount?: number
) {
  checkDb();
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
  checkDb();
  const docRef = await addDoc(collection(db, colName), {
    ...data,
    is_deleted: false,
    created_at: new Date().toISOString(),
  });
  return docRef.id;
}

export async function addDocumentWithId(colName: string, id: string, data: Record<string, any>) {
  checkDb();
  const docRef = doc(db, colName, id);
  await setDoc(docRef, { ...data, id, is_deleted: false });
}

export async function updateDocument(colName: string, docId: string, data: Record<string, any>) {
  checkDb();
  await updateDoc(doc(db, colName, docId), data);
}

export async function deleteDocument(colName: string, docId: string) {
  checkDb();
  await updateDoc(doc(db, colName, docId), { is_deleted: true, deleted_at: new Date().toISOString() });
}

export async function hardDeleteDocument(colName: string, docId: string) {
  checkDb();
  const { deleteDoc } = await import('firebase/firestore');
  await deleteDoc(doc(db, colName, docId));
}

export async function getDocument(colName: string, docId: string) {
  checkDb();
  const snap = await getDoc(doc(db, colName, docId));
  if (!snap.exists()) return null;
  const data = snap.data();
  if (data.is_deleted) return null;
  return { id: snap.id, ...data };
}

export async function countDocuments(colName: string, filters?: QueryFilter[]) {
  const allFilters = [...(filters || [])];
  return fetchCollection(colName, allFilters.length > 0 ? allFilters : undefined).then(d => d.length);
}

export async function fetchSubcollection(
  colName: string,
  docId: string,
  subColName: string,
  orderByField?: string
) {
  checkDb();
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
  checkDb();
  const docRef = await addDoc(collection(db, colName, docId, subColName), {
    ...data,
    created_at: new Date().toISOString(),
  });
  return docRef.id;
}

export async function batchUpdate(updates: { col: string; id: string; data: Record<string, any> }[]) {
  checkDb();
  const batch = writeBatch(db);
  updates.forEach(({ col, id, data }) => {
    batch.update(doc(db, col, id), data);
  });
  await batch.commit();
}
