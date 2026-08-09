export interface QueryFilter {
  field: string;
  op: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'array-contains';
  value: any;
}

const API = '/api/db';

export async function fetchCollection(
  colName: string,
  filters?: QueryFilter[],
  orderByField?: string,
  limitCount?: number
) {
  const params = new URLSearchParams({ collection: colName });
  if (orderByField) params.set('orderBy', orderByField);
  if (limitCount) params.set('limit', String(limitCount));
  const res = await fetch(`${API}?${params}`);
  if (!res.ok) throw new Error(`Fetch ${colName} failed`);
  let data = await res.json();
  if (filters && filters.length > 0) {
    data = data.filter((doc: any) => {
      return filters.every(f => {
        const val = doc[f.field];
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
  return data;
}

export async function addDocument(colName: string, data: Record<string, any>) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ collection: colName, data }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Add failed');
  return json.id;
}

export async function addDocumentWithId(colName: string, id: string, data: Record<string, any>) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ collection: colName, data, docId: id }),
  });
  if (!res.ok) throw new Error('Add with ID failed');
}

export async function updateDocument(colName: string, docId: string, data: Record<string, any>) {
  const res = await fetch(API, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ collection: colName, docId, data }),
  });
  if (!res.ok) throw new Error('Update failed');
}

export async function deleteDocument(colName: string, docId: string) {
  const res = await fetch(`${API}?collection=${colName}&docId=${docId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Delete failed');
}

export async function getDocument(colName: string, docId: string) {
  const res = await fetch(`${API}?collection=${colName}&docId=${docId}`);
  if (!res.ok) return null;
  return await res.json();
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
  const params = new URLSearchParams({
    collection: colName,
    docId,
    subCollection: subColName,
  });
  if (orderByField) params.set('orderBy', orderByField);
  const res = await fetch(`${API}?${params}`);
  if (!res.ok) return [];
  return await res.json();
}

export async function addSubcollectionDoc(
  colName: string,
  docId: string,
  subColName: string,
  data: Record<string, any>
) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      collection: colName,
      docId,
      subCollection: subColName,
      data,
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Subcollection add failed');
  return json.id;
}

export async function batchUpdate(updates: { col: string; id: string; data: Record<string, any> }[]) {
  await Promise.all(updates.map(u => updateDocument(u.col, u.id, u.data)));
}
