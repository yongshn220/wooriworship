import BaseService from "./BaseService";

class TagService extends BaseService {
  constructor() {
    super("tags");
  }

  async getTeamTags(teamId: string) {
    try {
      const q = query(collection(db, "teams", teamId, "tags"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async addNewTag(teamId: string, tagName: string) {
    const newTag = {
      team_id: teamId,
      name: tagName
    }
    // Use tagName as ID for uniqueness within team
    const ref = doc(db, "teams", teamId, "tags", tagName);
    await setDoc(ref, newTag);
    return tagName;
  }

  async addNewTags(teamId: string, tagNames: Array<string>) {
    const updates = [];
    for (let tagName of tagNames) {
      updates.push(this.addNewTag(teamId, tagName));
    }
    try {
      await Promise.all(updates);
      return true
    } catch (err) {
      console.error('Error occured: ' + err);
      return false
    }
  }

  async deleteTag(teamId: string, tagName: string) {
    try {
      const ref = doc(db, "teams", teamId, "tags", tagName);
      await deleteDoc(ref);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async getById(teamId: string, tagId: string) {
    try {
      const ref = doc(db, "teams", teamId, "tags", tagId);
      const snap = await getDoc(ref);
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() };
    } catch (e) {
      console.error(e);
      return null;
    }
  }
}

export default new TagService();
