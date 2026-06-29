
import { useSevriStore } from "@/store/sevriModel/sevriStore"
import { useEffect } from "react"

export function useSevri() {
    const { getActivities, getEventTypes, getActualSevriProcess } = useSevriStore()
    const fetchActivities = async () => {
        await Promise.all([getActualSevriProcess(), getActivities(), getEventTypes()])
    }
    useEffect(() => {
        fetchActivities()
    }, [])
}