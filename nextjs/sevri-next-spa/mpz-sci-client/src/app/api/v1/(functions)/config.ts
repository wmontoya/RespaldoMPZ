const request = async (url: string, method: string, body?: any) => {
    const response = await fetch(`${process.env.BACKEND_URL}${url}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
        },
        body: body ? body : undefined,
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
};

export const get = async (url: string) => {
    return await request(url, "GET");
};

export const post = async (url: string, body: any) => {
    return await request(url, "POST", body);
};

export const put = async (url: string, body: any) => {
    return await request(url, "PUT", body);
};

export const del = async (url: string) => {
    return await request(url, "DELETE");
};

const requestOdoo = async (url: string, method: string, body?: any) => {
    const response = await fetch(`${process.env.BACKEND_URL_SSL}${url}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
        },
        body: body ? body : undefined,
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
};

export const getOdoo = async (url: string) => {
    return await requestOdoo(url, "GET");
};

export const postOdoo = async (url: string, body: any) => {
    return await requestOdoo(url, "POST", body);
};

export const putOdoo = async (url: string, body: any) => {
    return await requestOdoo(url, "PUT", body);
};

export const delOdoo = async (url: string) => {
    return await requestOdoo(url, "DELETE");
};