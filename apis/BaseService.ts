import { firestore } from "@/firebase";

export default class BaseService {
    collectionName: string;
    constructor(collectionName: string) {
        this.collectionName = collectionName;
    }

    async getById(id: any) {
        try {
            const ref = firestore.collection(this.collectionName).doc(id);
            const res = await ref.get();
            if(res.exists) {
                return {id: id, ... res.data()};
            } else {
                return null;
            }
        }
        catch (e) {
            console.log(e)
            return null
        }
    }

    async getByIds(ids: Array<string>|undefined) {
        if(ids == null) {
            return [];
        }
        return await this.queryByArray({
            a: '__name__',
            b: 'in',
            c: ids
        });
    }

    async getByEmail(email: string) {
        const query = await firestore.collection(this.collectionName).where('email', '==', email).get();
        if (!query.empty) {
            // Assuming there's only one user per email, so we're getting the first document
            const doc = query.docs[0];
            return { id: doc.id, ...doc.data() };
        }
        else {
            console.log("err: getByEamil")
            return null;
        }
    }

    async getByFilters(filters: Array<any> | null) {
        try {
            console.log("getByFilters: ", this.collectionName)
            const result: Array<any> = [];
            let ref: any = firestore.collection(this.collectionName);
            if(filters) {
                for(let i in filters) {
                    ref = ref.where(filters[i].a, filters[i].b, filters[i].c);
                }
                ref = await ref.get();
            } else {
                ref = await ref.get();
            }
            ref.forEach((element: any) => {
                result.push({id: element.id, ... element.data()});
            })
            return result;
        }
        catch (e) {
            console.log(e)
            return null
        }
    }

    async deleteByFilters(filters: Array<any> | null) {
        try {
            const refs = await this.getByFilters(filters);
            const promises = [];
            for(const ref of refs) {
                promises.push(this.delete(ref.id))
            }
            await Promise.all(promises);
            return true;
        }
        catch (e) {
            console.log(e)
            return false;
        }
    }

    async queryByArray(filter: any) {
        try {
            if(filter) {
                const promises = [];
                const result:any = [];
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
                                result.push({id: element.id, ... element.data()});
                            })
                        })
                    )
                }
                await Promise.all(promises);
                return result;
            }
            console.log("queryByArray: filter is not exist.")
            return null;
        }
        catch (e) {
            console.log(e)
            return null
        }
    }

    async getAll() {
        return await this.getByFilters(null);
    }

    async create(data: any) {
        try {
            const ref = await firestore.collection(this.collectionName).add(data);
            const id = ref.id;
            return id;
        }
        catch (e) {
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
        }
        catch (e) {
            console.log(e)
            return false
        }
    }
}

