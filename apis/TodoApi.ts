import { db } from "@/firebase";
import {
    collection, doc, getDoc, getDocs,
    query, where, orderBy, Timestamp,
    writeBatch, setDoc, updateDoc, deleteDoc
} from "firebase/firestore";
import { Todo } from "@/models/todo";

/**
 * TodoApi (V3 Static Class)
 * Manages todo items for teams, users, and services.
 */
export class TodoApi {

    // =========================================================================
    // 1. Fetching (Read)
    // =========================================================================

    /**
     * Fetches todos with optional filtering.
     * @param teamId - Team ID
     * @param options - Optional filters: { completed?: boolean }
     * @returns Array of todos ordered by createdAt DESC
     */
    static async getTodos(
        teamId: string,
        options?: { completed?: boolean }
    ): Promise<Todo[]> {
        const constraints = [
            ...(options?.completed !== undefined
                ? [where("completed", "==", options.completed)]
                : [where("completed", "==", false)]),
            orderBy("createdAt", "desc")
        ];

        const q = query(
            collection(db, `teams/${teamId}/todos`),
            ...constraints
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Todo));
    }

    /**
     * Fetches incomplete todos assigned to a specific user.
     * @param teamId - Team ID
     * @param userId - User ID
     * @returns Array of todos assigned to user
     */
    static async getMyTodos(teamId: string, userId: string): Promise<Todo[]> {
        const q = query(
            collection(db, `teams/${teamId}/todos`),
            where("completed", "==", false),
            where("assigneeIds", "array-contains", userId)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Todo));
    }

    /**
     * Fetches todos for a specific service.
     * @param teamId - Team ID
     * @param serviceId - Service ID
     * @returns Array of todos ordered by order ASC
     */
    static async getServiceTodos(teamId: string, serviceId: string): Promise<Todo[]> {
        const q = query(
            collection(db, `teams/${teamId}/todos`),
            where("serviceId", "==", serviceId),
            orderBy("order", "asc")
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Todo));
    }

    // =========================================================================
    // 2. Writing (Create / Update / Delete)
    // =========================================================================

    /**
     * Creates a single todo.
     * @param teamId - Team ID
     * @param data - Todo data (id will be auto-generated)
     * @returns The new todo ID
     */
    static async createTodo(
        teamId: string,
        data: Omit<Todo, 'id'>
    ): Promise<string> {
        const newDocRef = doc(collection(db, `teams/${teamId}/todos`));
        const todoId = newDocRef.id;

        const todoData: Todo = {
            id: todoId,
            ...data
        };

        await setDoc(newDocRef, todoData);
        return todoId;
    }

    /**
     * Batch creates multiple todos for a service.
     * @param teamId - Team ID
     * @param serviceId - Service ID
     * @param serviceTitle - Service title for denormalization
     * @param todos - Array of todo data
     */
    static async createServiceTodos(
        teamId: string,
        serviceId: string,
        serviceTitle: string,
        todos: Array<{
            title: string;
            assigneeIds: string[];
            order: number;
            createdBy: string;
        }>
    ): Promise<void> {
        const batch = writeBatch(db);
        const now = Timestamp.now();

        for (const todoData of todos) {
            const newDocRef = doc(collection(db, `teams/${teamId}/todos`));
            const todoId = newDocRef.id;

            const todo: Todo = {
                id: todoId,
                teamId,
                title: todoData.title,
                completed: false,
                completedAt: null,
                completedBy: null,
                assigneeIds: todoData.assigneeIds,
                serviceId,
                serviceTitle,
                dueDate: null,
                createdBy: todoData.createdBy,
                createdAt: now,
                updatedAt: now,
                order: todoData.order
            };

            batch.set(newDocRef, todo);
        }

        await batch.commit();
    }

    /**
     * Updates a todo with partial data.
     * @param teamId - Team ID
     * @param todoId - Todo ID
     * @param data - Partial todo data
     */
    static async updateTodo(
        teamId: string,
        todoId: string,
        data: Partial<Todo>
    ): Promise<void> {
        const ref = doc(db, `teams/${teamId}/todos/${todoId}`);

        // Safety check: remove undefined values
        const cleanData = Object.fromEntries(
            Object.entries(data).filter(([_, v]) => v !== undefined)
        );

        const updateData: any = {
            ...cleanData,
            updatedAt: Timestamp.now()
        };

        await updateDoc(ref, updateData);
    }

    /**
     * Toggles todo completion status.
     * @param teamId - Team ID
     * @param todoId - Todo ID
     * @param completed - Completion status
     * @param userId - User ID who toggled
     */
    static async toggleTodo(
        teamId: string,
        todoId: string,
        completed: boolean,
        userId: string
    ): Promise<void> {
        const ref = doc(db, `teams/${teamId}/todos/${todoId}`);

        const updateData: any = {
            completed,
            completedAt: completed ? Timestamp.now() : null,
            completedBy: completed ? userId : null,
            updatedAt: Timestamp.now()
        };

        await updateDoc(ref, updateData);
    }

    /**
     * Deletes a single todo.
     * @param teamId - Team ID
     * @param todoId - Todo ID
     */
    static async deleteTodo(teamId: string, todoId: string): Promise<void> {
        const ref = doc(db, `teams/${teamId}/todos/${todoId}`);
        await deleteDoc(ref);
    }

    /**
     * Batch deletes multiple todos.
     * @param teamId - Team ID
     * @param todoIds - Array of todo IDs to delete
     */
    static async batchDeleteTodos(teamId: string, todoIds: string[]): Promise<void> {
        if (todoIds.length === 0) return;

        const batch = writeBatch(db);
        for (const todoId of todoIds) {
            const ref = doc(db, `teams/${teamId}/todos/${todoId}`);
            batch.delete(ref);
        }
        await batch.commit();
    }

    /**
     * Batch updates multiple todos with partial data.
     * @param teamId - Team ID
     * @param updates - Array of { id, data } objects
     */
    static async batchUpdateTodos(
        teamId: string,
        updates: Array<{ id: string; data: Partial<Todo> }>
    ): Promise<void> {
        if (updates.length === 0) return;

        const batch = writeBatch(db);
        const now = Timestamp.now();

        for (const { id, data } of updates) {
            const ref = doc(db, `teams/${teamId}/todos/${id}`);
            const cleanData = Object.fromEntries(
                Object.entries(data).filter(([_, v]) => v !== undefined)
            );
            batch.update(ref, { ...cleanData, updatedAt: now });
        }
        await batch.commit();
    }

    /**
     * Orphans all todos linked to a service (sets serviceId and serviceTitle to null).
     * Called when a service is deleted.
     * @param teamId - Team ID
     * @param serviceId - Service ID
     */
    static async orphanServiceTodos(teamId: string, serviceId: string): Promise<void> {
        const q = query(
            collection(db, `teams/${teamId}/todos`),
            where("serviceId", "==", serviceId)
        );

        const snapshot = await getDocs(q);
        if (snapshot.empty) return;

        const batch = writeBatch(db);
        const now = Timestamp.now();

        snapshot.docs.forEach(docSnapshot => {
            batch.update(docSnapshot.ref, {
                serviceId: null,
                serviceTitle: null,
                updatedAt: now
            });
        });

        await batch.commit();
    }
}
