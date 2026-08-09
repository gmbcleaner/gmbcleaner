import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/admin';

function getCollection(colName: string) {
  return adminDb.collection(colName);
}

// GET - fetch documents
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const col = searchParams.get('collection');
    const docId = searchParams.get('docId');
    const subCol = searchParams.get('subCollection');
    const subDocId = searchParams.get('subDocId');
    const orderByField = searchParams.get('orderBy');
    const limitNum = searchParams.get('limit');

    if (!col) return NextResponse.json({ error: 'collection required' }, { status: 400 });

    // Subcollection: /collection/docId/subCollection
    if (subCol) {
      let ref = getCollection(col).doc(docId!).collection(subCol);
      if (orderByField) ref = ref.orderBy(orderByField, 'asc') as any;
      if (limitNum) ref = ref.limit(parseInt(limitNum)) as any;
      const snap = await ref.get();
      return NextResponse.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }

    // Single document
    if (docId) {
      const snap = await getCollection(col).doc(docId).get();
      if (!snap.exists) return NextResponse.json(null);
      return NextResponse.json({ id: snap.id, ...snap.data() });
    }

    // Collection query
    let ref: any = getCollection(col);
    if (orderByField) ref = ref.orderBy(orderByField, 'desc');
    if (limitNum) ref = ref.limit(parseInt(limitNum));
    const snap = await ref.get();
    return NextResponse.json(snap.docs.map((d: any) => ({ id: d.id, ...d.data() })));
  } catch (e: any) {
    console.error('API GET error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST - add document
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { collection: col, data, docId, subCollection, subDocId } = body;
    if (!col || !data) return NextResponse.json({ error: 'collection and data required' }, { status: 400 });

    const docData = { ...data, created_at: new Date().toISOString() };

    // Subcollection add
    if (subCollection && docId) {
      const ref = await getCollection(col).doc(docId).collection(subCollection).add(docData);
      return NextResponse.json({ id: ref.id });
    }

    if (docId) {
      await getCollection(col).doc(docId).set(docData);
      return NextResponse.json({ id: docId });
    }

    const ref = await getCollection(col).add(docData);
    return NextResponse.json({ id: ref.id });
  } catch (e: any) {
    console.error('API POST error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PUT - update document
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { collection: col, docId, data } = body;
    if (!col || !docId || !data) return NextResponse.json({ error: 'collection, docId, data required' }, { status: 400 });

    await getCollection(col).doc(docId).update(data);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('API PUT error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE - delete document
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const col = searchParams.get('collection');
    const docId = searchParams.get('docId');
    if (!col || !docId) return NextResponse.json({ error: 'collection and docId required' }, { status: 400 });

    await getCollection(col).doc(docId).delete();
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('API DELETE error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
