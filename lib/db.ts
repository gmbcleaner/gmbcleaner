import {
  ref,
  push,
  set,
  update,
  remove,
  get,
  child,
} from 'firebase/database';
import { rtdb } from './firebase';

export interface QueryFilter {
  field: string;
  op: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'array-contains';
  value: any;
}

function checkDb() {
  if (!rtdb) throw new Error('Firebase Realtime Database not connected.');
}

function snapshotToArray(snapshot: any): any[] {
  const data = snapshot.val();
  if (!data) return [];
  if (typeof data === 'object' && !Array.isArray(data)) {
    return Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val }));
  }
  return data;
}

export async function fetchCollection(
  colName: string,
  filters?: QueryFilter[],
  orderByField?: string,
  limitCount?: number,
  includeDeleted?: boolean
) {
  checkDb();
  const dbRef = ref(rtdb);
  const snap = await get(child(dbRef, colName));
  let results = snapshotToArray(snap);

  // Default: exclude soft-deleted records (unless explicitly requested)
  if (!includeDeleted) {
    results = results.filter((item: any) => item.is_deleted !== true);
  }

  if (filters) {
    results = results.filter((item: any) => {
      return filters.every((f) => {
        const val = item[f.field];
        switch (f.op) {
          case '==': return val === f.value;
          case '!=': return val !== f.value;
          case '<': return val < f.value;
          case '<=': return val <= f.value;
          case '>': return val > f.value;
          case '>=': return val >= f.value;
          case 'in': return Array.isArray(f.value) && f.value.includes(val);
          case 'array-contains': return Array.isArray(val) && val.includes(f.value);
          default: return true;
        }
      });
    });
  }

  if (orderByField) {
    results.sort((a: any, b: any) => {
      const aVal = a[orderByField] || '';
      const bVal = b[orderByField] || '';
      return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
    });
  }

  if (limitCount) results = results.slice(0, limitCount);

  return results;
}

export async function addDocument(colName: string, data: Record<string, any>) {
  checkDb();
  const newRef = push(ref(rtdb, colName));
  const payload = {
    ...data,
    created_at: new Date().toISOString(),
  };
  console.log(`[RTDB] addDocument('${colName}'):`, payload);
  await set(newRef, payload);
  console.log(`[RTDB] addDocument('${colName}') SUCCESS, id: ${newRef.key}`);
  return newRef.key!;
}

export async function addDocumentWithId(colName: string, id: string, data: Record<string, any>) {
  checkDb();
  await set(ref(rtdb, `${colName}/${id}`), { ...data, id });
}

export async function updateDocument(colName: string, docId: string, data: Record<string, any>) {
  checkDb();
  await update(ref(rtdb, `${colName}/${docId}`), data);
}

export async function deleteDocument(colName: string, docId: string) {
  checkDb();
  await update(ref(rtdb, `${colName}/${docId}`), { is_deleted: true, deleted_at: new Date().toISOString() });
}

export async function hardDeleteDocument(colName: string, docId: string) {
  checkDb();
  await remove(ref(rtdb, `${colName}/${docId}`));
}

export async function getDocument(colName: string, docId: string) {
  checkDb();
  const snap = await get(child(ref(rtdb), `${colName}/${docId}`));
  if (!snap.exists()) return null;
  const data = snap.val();
  if (data.is_deleted) return null;
  return { id: docId, ...data };
}

export async function countDocuments(colName: string, filters?: QueryFilter[]) {
  const data = await fetchCollection(colName, filters);
  return Array.isArray(data) ? data.length : 0;
}

export async function fetchSubcollection(
  colName: string,
  docId: string,
  subColName: string,
  orderByField?: string
) {
  checkDb();
  const path = `${colName}/${docId}/${subColName}`;
  const snap = await get(child(ref(rtdb), path));
  let results = snapshotToArray(snap);
  if (orderByField) {
    results.sort((a: any, b: any) => {
      const aVal = a[orderByField] || '';
      const bVal = b[orderByField] || '';
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    });
  }
  return results;
}

export async function addSubcollectionDoc(
  colName: string,
  docId: string,
  subColName: string,
  data: Record<string, any>
) {
  checkDb();
  const newRef = push(ref(rtdb, `${colName}/${docId}/${subColName}`));
  await set(newRef, {
    ...data,
    created_at: new Date().toISOString(),
  });
  return newRef.key!;
}

export async function batchUpdate(updates: { col: string; id: string; data: Record<string, any> }[]) {
  checkDb();
  const updatesObj: Record<string, any> = {};
  updates.forEach(({ col, id, data }) => {
    updatesObj[`${col}/${id}`] = data;
  });
  await update(ref(rtdb), updatesObj);
}
