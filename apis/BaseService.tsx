import { firestore } from "@/firebase";

export default class BaseService {
    collectionName: String;
    constructor(collectionName: String) {
        this.collectionName = collectionName;
    }

    async getById(id) {
        const ref = firestore.collection(this.collectionName).doc(id);
        const res = await ref.get();
        if(res.exists) {
            return {id: id, ... res.data()};
        } else {
            return null;
        }
    }

    async getByFilters(filters) {
        const result = [];
        let ref = firestore.collection(this.collectionName);
        if(filters) {
            for(let i in filters) {
                ref = ref.where(filters[i].a, filters[i].b, filters[i].c);
            }
            ref = await ref.get();
        } else {
            ref = await ref.get();
        }
        ref.forEach((element) => {
            result.push({id: element.id, ... element.data()});
        })
        return result;
    }

    async queryByArray(filter) {
        if(filter) {
            const promises = [];
            const result = [];
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
        return null;
    }

    async getAll() {
        return await this.getByFilters();
    }

    async create(data) {
        const ref = await firestore.collection(this.collectionName).add(data);
        const id = ref.id;
        return id;
    } 

    async update(id, data) {
        await firestore.collection(this.collectionName).doc(id).set(data, {merge: true});
    }

    async delete(id) {
        await firestore.collection(this.collectionName).doc(id).delete();
    }
}

