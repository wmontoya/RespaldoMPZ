import { useSharedStore } from "@/store/shared/sharedStore"
import { useEffect } from "react"

export function useShared() {
    const { getUsers } = useSharedStore()
    const fetchUsers = async () => {
        await Promise.all([getUsers()])
    }
    useEffect(() => {
        fetchUsers()
    }, [])
}