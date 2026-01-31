import { atom } from "recoil";
import { Todo } from "@/models/todo";

// List of todos currently displayed
export const todoListAtom = atom<Todo[]>({
    key: "todoListAtom",
    default: [],
});

// Increment to trigger re-fetch of todo list
export const todoUpdaterAtom = atom<number>({
    key: "todoUpdaterAtom",
    default: 0,
});

// Whether to show completed todos
export const showCompletedAtom = atom<boolean>({
    key: "showCompletedAtom",
    default: false,
});
