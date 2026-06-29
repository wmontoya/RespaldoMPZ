
import { fetchData } from "@/utils/fetchData";
import { AxiosError } from "axios";
import { create } from "zustand";
type response = "error" | "success" | "no department "
interface GlobalStore {
    department_id: number,
    user_id: number,
    department_name: string,
    setDepartmentId: (id: number) => void,
    setDepartmentName: (name: string) => void,
    setUserId: (id: number) => void,
    loadFromLocalStorage: () => void;
    verifyToken: () => Promise<response>
    logout: () => Promise<void>
}
interface TokenPayloadProps {
    department: number
    department_name: string
    email: string
    user_id: number
}
export const useGlobalState = create<GlobalStore>((set, get) => ({
    department_id: typeof window !== 'undefined' ? parseInt(localStorage.getItem('department_id') || '') : 1,
    department_name: typeof window !== 'undefined' ? localStorage.getItem('department_name') || '' : '',
    user_id: typeof window !== 'undefined' ? parseInt(localStorage.getItem('user_id') || '') : 1,
    logout: async () => {
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        localStorage.removeItem('department_id');
        localStorage.removeItem('user_id');
        localStorage.removeItem('department_name');

    },
    loadFromLocalStorage: () => {
        const department_id = parseInt(localStorage.getItem("department_id") || "");
        const department_name = localStorage.getItem("department_name") || "";
        const user_id = parseInt(localStorage.getItem("user_id") || "");

        set({
            department_id,
            department_name,
            user_id,
        });
    },
    setDepartmentName: (name) => {
        localStorage.setItem('department_name', name);
        set({ department_name: name });
    },
    setDepartmentId: (id) => {
        localStorage.setItem('department_id', id.toString());
        set({ department_id: id });
    },
    setUserId: (id) => {
        localStorage.setItem('user_id', id.toString());
        set({ user_id: id });
    },
    verifyToken: async () => {

        const response = await fetchData<TokenPayloadProps>('/api/v1/token/verify', 'POST')
        if ((response as unknown as AxiosError).isAxiosError) {
            return "error"
        }
        if (!response.department) {
            return "no department "
        }
        localStorage.setItem('department_id', response.department.toString());
        localStorage.setItem('user_id', response.user_id.toString());
        localStorage.setItem('department_name', response.department_name);

        set({
            department_id: response.department,
            department_name: response.department_name,
            user_id: response.user_id,
        })

        return "success"
    }
}))