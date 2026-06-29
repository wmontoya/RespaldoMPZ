import { BodyType, MethodType } from "@/types/fetch";
export async function fetchData<T>(url: string, method?: MethodType, body?: BodyType): Promise<T> {
    const response = await fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
        },
        body: body ? JSON.stringify(body) : undefined,
        cache: "no-cache",
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Fetch error: ${response.status} ${response.statusText} - ${url}`, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json() as T;
}