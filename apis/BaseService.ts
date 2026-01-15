import { db } from "@/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  startAfter,
  limit,
  documentId
} from "firebase/firestore";

export default class BaseService {
  collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  async getDocIds(filters: Array<any>) {
    try {
      const result: Array<string> = [];
      let q: any = collection(db, this.collectionName);

      if (filters) {
        const constraints = filters.map(f => where(f.a, f.b, f.c));
        q = query(q, ...constraints);
      }

      const snapshot = await getDocs(q);
      snapshot.forEach((doc: any) => {
        result.push(doc.id);
      });

      return result;
    }
    catch (e) {
      console.error(e);
      return null;
    }
  }

  async getById(id: any) {
    try {
      const docRef = doc(db, this.collectionName, id);
      const res = await getDoc(docRef);
      if (res.exists()) {
        return { id: id, ...res.data() };
      }
      else {
        return null;
      }
    } catch (e) {
      console.error(e)
      return null
    }
  }

  async getByIds(ids: Array<string> | undefined) {
    if (ids == null) {
      return [];
    }
    return await this.queryByArray({
      a: documentId(),
      b: 'in',
      c: ids
    });
  }

  async getByFilters(filters: Array<any>) {
    try {
      const result: Array<any> = [];
      let q: any = collection(db, this.collectionName);

      if (filters) {
        const constraints = filters.map(f => where(f.a, f.b, f.c));
        q = query(q, ...constraints);
      }

      const snapshot = await getDocs(q);
      snapshot.forEach((element: any) => {
        result.push({ id: element.id, ...element.data() });
      })
      return result;
    } catch (e) {
      console.error(e)
      return null
    }
  }

  async getByFiltersAndFields(filters: Array<any>, fields: Array<string>) {
    // Note: Client-side field selection is not directly supported in Modular SDK 
    // in the same way 'select()' worked in some contexts, but data() returns the full object.
    // We will fetch full docs and filter fields in memory if strictly necessary, 
    // or just return full objects as typical in Client SDK usage.
    try {
      const result: Array<any> = [];
      let q: any = collection(db, this.collectionName);

      if (filters) {
        const constraints = filters.map(f => where(f.a, f.b, f.c));
        q = query(q, ...constraints);
      }

      const snapshot = await getDocs(q);
      snapshot.forEach((element: any) => {
        const data = element.data();
        if (fields && fields.length > 0) {
          const filteredData: any = { id: element.id };
          fields.forEach(field => {
            if (data[field] !== undefined) filteredData[field] = data[field];
          });
          result.push(filteredData);
        } else {
          result.push({ id: element.id, ...data });
        }
      });

      return result;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async getByFiltersWithPagination(filters: Array<any> | null, lastDoc: any = null, pageSize: number = 10) {
    try {
      const result: Array<any> = [];
      let constraints: any[] = [];

      if (filters) {
        filters.forEach(f => constraints.push(where(f.a, f.b, f.c)));
      }

      // Default sorting by createdAt desc
      constraints.push(orderBy('createdAt', 'desc'));

      if (lastDoc) {
        constraints.push(startAfter(lastDoc));
      }

      constraints.push(limit(pageSize));

      const q = query(collection(db, this.collectionName), ...constraints);
      const snapshot = await getDocs(q);

      snapshot.forEach((doc: any) => {
        result.push({ id: doc.id, ...doc.data() });
      });

      const lastVisible = snapshot.docs[snapshot.docs.length - 1];

      return { songs: result, lastDoc: lastVisible };
    }
    catch (e) {
      console.error(e);
      return null;
    }
  }

  async deleteByFilters(filters: Array<any> | null) {
    try {
      const refs = await this.getByFilters(filters);
      const promises = [];
      if (refs) {
        for (const ref of refs) {
          promises.push(this.delete(ref.id))
        }
        await Promise.all(promises);
      }
      return true;
    } catch (e) {
      console.error(e)
      return false;
    }
  }

  async queryByArray(filter: any) {
    try {
      if (filter) {
        const promises = [];
        const result: any = [];
        // Clone array to avoid modifying original reference if passed
        const itemsToQuery = [...filter.c];

        while (itemsToQuery.length) {
          const subFilters = itemsToQuery.splice(0, 10);

          const q = query(
            collection(db, this.collectionName),
            where(filter.a, filter.b, subFilters)
          );

          promises.push(
            getDocs(q).then((snapshot) => {
              snapshot.forEach((element) => {
                result.push({ id: element.id, ...element.data() });
              })
            })
          );
        }
        await Promise.all(promises);
        return result;
      }
      return null;
    } catch (e) {
      console.error(e)
      return null
    }
  }

  async create(data: any) {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), data);
      return docRef.id;
    } catch (e) {
      console.error(e)
      return null
    }
  }

  async createWithId(id: string, data: any) {
    try {
      const docRef = doc(db, this.collectionName, id);
      await setDoc(docRef, data);
      return id;
    }
    catch (e) {
      console.error(e);
      return null;
    }
  }


  async update(id: string, data: any) {
    try {
      const docRef = doc(db, this.collectionName, id);
      await setDoc(docRef, data, { merge: true });
      return true
    }
    catch (e) {
      console.error(e)
      return false
    }
  }

  async delete(id: string) {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  }
}

