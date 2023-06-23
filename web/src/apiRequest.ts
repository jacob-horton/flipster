import { AuthContextProps } from "react-oidc-context";

interface PostRequestData {
    path: string;
    id_token: string;
    payload?: string;
}

interface GetRequestData {
    path: string;
    id_token: string;
    queryParams?: { [key: string]: any };
}

export async function getRequest(data: GetRequestData) {
    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}${data.path}`);

    if (data.queryParams !== undefined) {
        for (const key of Object.keys(data.queryParams)) {
            url.searchParams.append(key, data.queryParams[key].toString());
        }
    }

    return await fetch(url, {
        method: "GET",
        headers: {
            Authorization: "Bearer " + data.id_token,
            "Content-Type": "application/json",
        },
    });
}

export async function postRequest(data: PostRequestData) {
    return await fetch(`${process.env.NEXT_PUBLIC_API_URL}${data.path}`, {
        method: "POST",
        headers: {
            Authorization: "Bearer " + data.id_token,
            "Content-Type": "application/json",
        },
        body: data.payload,
    });
}

// TODO combine withDependency into this function
export async function queryOrDefault<T>(
    query: (token: string) => Promise<T>,
    auth: AuthContextProps,
    def: T // Default value
): Promise<T> {
    const token = auth.user?.id_token;
    if (token === undefined || auth.user?.expired) {
        return def;
    }

    return await query(token);
}

export async function queryOrDefaultWithDependency<T, U>(
    query: (token: string, dependency: U) => Promise<T>,
    auth: AuthContextProps,
    def: T, // Default value
    dependency: U | undefined
): Promise<T> {
    const token = auth.user?.id_token;
    if (dependency === undefined || token === undefined || auth.user?.expired) {
        return def;
    }

    return await query(token, dependency);
}
