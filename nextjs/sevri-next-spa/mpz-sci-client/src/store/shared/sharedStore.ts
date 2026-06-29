import { User } from "@/types/sevri";
import { fetchData } from "@/utils/fetchData";
import { create } from "zustand";

interface SharedStore {
    users: User[];
    getUsers: () => Promise<User[] | null>;
}
export const useSharedStore = create<SharedStore>((set) => ({
    users: [],
    getUsers: async () => {
        const response = await fetchData<User[]>("/api/v1/shared/users");
        if (!response.length) return null;
        set({ users: response });
        return response;
    },
}));