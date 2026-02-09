import { SheetAnnotation } from "@/models/sheet_annotation"
import { getFirebaseTimestampNow } from "@/components/util/helper/helper-functions"
import { db as defaultDb } from "@/firebase"
import { doc, getDoc, setDoc, deleteDoc, Firestore } from "firebase/firestore"

class SheetAnnotationApi {
  private static instance: SheetAnnotationApi
  protected db: Firestore

  private constructor(db?: Firestore) {
    this.db = db || defaultDb
  }

  public static getInstance(db?: Firestore): SheetAnnotationApi {
    if (!SheetAnnotationApi.instance) {
      SheetAnnotationApi.instance = new SheetAnnotationApi(db)
    }
    return SheetAnnotationApi.instance
  }

  private getDocRef(teamId: string, songId: string, sheetId: string, pageIndex: number, userId: string) {
    return doc(this.db, "teams", teamId, "songs", songId, "sheets", sheetId, "annotations", userId, "pages", String(pageIndex))
  }

  async getAnnotation(teamId: string, songId: string, sheetId: string, pageIndex: number, userId: string): Promise<SheetAnnotation | null> {
    try {
      const ref = this.getDocRef(teamId, songId, sheetId, pageIndex, userId)
      const docSnap = await getDoc(ref)
      if (!docSnap.exists()) return null
      return docSnap.data() as SheetAnnotation
    } catch (e) {
      console.error("DEBUG_ERROR:", e)
      return null
    }
  }

  async saveAnnotation(teamId: string, songId: string, sheetId: string, pageIndex: number, userId: string, data: Partial<SheetAnnotation>): Promise<void> {
    try {
      const ref = this.getDocRef(teamId, songId, sheetId, pageIndex, userId)
      // Deep-clean undefined values that Firestore rejects
      const cleanData = JSON.parse(JSON.stringify(data))
      await setDoc(ref, { ...cleanData, updated_at: getFirebaseTimestampNow() }, { merge: true })
    } catch (e) {
      console.error("DEBUG_ERROR:", e)
      throw e
    }
  }

  async deleteAnnotation(teamId: string, songId: string, sheetId: string, pageIndex: number, userId: string): Promise<void> {
    try {
      const ref = this.getDocRef(teamId, songId, sheetId, pageIndex, userId)
      await deleteDoc(ref)
    } catch (e) {
      console.error("DEBUG_ERROR:", e)
    }
  }
}

export default SheetAnnotationApi.getInstance()
