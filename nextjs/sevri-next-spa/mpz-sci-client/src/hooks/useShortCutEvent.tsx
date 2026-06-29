import { useEffect } from "react"
type typeEvent = 'ArrowLeft' | 'ArrowRight'
export function useShortcutEvent(type: typeEvent, handleFunction: Function) {
    useEffect(() => {
        const handle = (event: KeyboardEvent) => {
            if (event.key === type) {
                handleFunction()
            }
        }
        window.addEventListener('keydown', handle)
        return () => {
            window.removeEventListener('keydown', handle)
        }
    }, [type, handleFunction])

}