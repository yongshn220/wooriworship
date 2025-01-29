import {firestore} from "@/firebase";

export default class BaseService {
  collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  async getDocIds(filters: Array<any>) {
    try {
      const result: Array<string> = [];
      let ref: any = firestore.collection(this.collectionName);

      if (filters) {
        for (let i in filters) {
          ref = ref.where(filters[i].a, filters[i].b, filters[i].c);
        }
      }

      const snapshot = await ref.get();
      snapshot.forEach((doc: any) => {
        result.push(doc.id); // Push only the document ID
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
      const ref = firestore.collection(this.collectionName).doc(id);
      const res = await ref.get();
      if (res.exists) {
        return {id: id, ...res.data()};
      }
      else {
        return null;
      }
    } catch (e) {
      console.log(e)
      return null
    }
  }

  async getByIds(ids: Array<string> | undefined) {
    if (ids == null) {
      return [];
    }
    return await this.queryByArray({
      a: '__name__',
      b: 'in',
      c: ids
    });
  }

  async getByFilters(filters: Array<any>) {
    try {
      const result: Array<any> = [];
      let ref: any = firestore.collection(this.collectionName);
      if (filters) {
        for (let i in filters) {
          ref = ref.where(filters[i].a, filters[i].b, filters[i].c);
        }
        ref = await ref.get();
      } else {
        ref = await ref.get();
      }
      ref.forEach((element: any) => {
        result.push({id: element.id, ...element.data()});
      })
      return result;
    } catch (e) {
      console.log(e)
      return null
    }
  }

  async getByFiltersAndFields(filters: Array<any>, fields: Array<string>) {
    try {
      const result: Array<any> = [];
      let ref: any = firestore.collection(this.collectionName);

      if (filters) {
        for (let i in filters) {
          ref = ref.where(filters[i].a, filters[i].b, filters[i].c);
        }
      }

      // Apply field selection if fields are provided
      if (fields && fields.length > 0) {
        ref = ref.select(...fields);
      }

      ref = await ref.get();
      ref.forEach((element: any) => {
        result.push({ id: element.id, ...element.data() });
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
      let cRef: any = firestore.collection(this.collectionName);

      if (filters) {
        for (let i in filters) {
          cRef = cRef.where(filters[i].a, filters[i].b, filters[i].c);
        }
      }

      // 정렬 기준 추가 (예: 생성 시간순)
      cRef = cRef.orderBy('createdAt', 'desc');

      // 페이지네이션 적용
      if (lastDoc) {
        cRef = cRef.startAfter(lastDoc);
      }
      cRef = cRef.limit(pageSize);

      const snapshot = await cRef.get();

      snapshot.forEach((doc: any) => {
        result.push({id: doc.id, ...doc.data()});
      });

      // 마지막 문서 반환
      const lastVisible = snapshot.docs[snapshot.docs.length - 1];

      return {songs: result, lastDoc: lastVisible};
    }
    catch (e) {
      console.log(e);
      return null;
    }
  }

  async deleteByFilters(filters: Array<any> | null) {
    try {
      const refs = await this.getByFilters(filters);
      const promises = [];
      for (const ref of refs) {
        promises.push(this.delete(ref.id))
      }
      await Promise.all(promises);
      return true;
    } catch (e) {
      console.log(e)
      return false;
    }
  }

  async queryByArray(filter: any) {
    try {
      if (filter) {
        const promises = [];
        const result: any = [];
        console.log(filter.c);
        while (filter.c.length) {
          const subFilters = filter.c.splice(0, 10);
          promises.push(
            firestore.collection(this.collectionName).where(
              filter.a,
              filter.b,
              subFilters
            ).get().then(x => {
              x.forEach(element => {
                result.push({id: element.id, ...element.data()});
              })
            })
          )
        }
        await Promise.all(promises);
        return result;
      }
      console.log("queryByArray: filter is not exist.")
      return null;
    } catch (e) {
      console.log(e)
      return null
    }
  }

  async create(data: any) {
    try {
      const ref = await firestore.collection(this.collectionName).add(data);
      return ref.id;
    } catch (e) {
      console.log(e)
      return null
    }
  }

  async update(id: string, data: any) {
    try {
      await firestore.collection(this.collectionName).doc(id).set(data, {merge: true});
      return true
    }
    catch (e) {
      console.log(e)
      return false
    }
  }

  async delete(id: string) {
    try {
      await firestore.collection(this.collectionName).doc(id).delete();
      return true
    } catch (e) {
      console.log(e)
      return false
    }
  }
}

