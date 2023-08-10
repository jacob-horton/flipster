import axios, { AxiosInstance } from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";

export function useAxios() {
    const auth = useAuth();

    const [isLoading, setIsLoading] = useState(true);
    const [instance, setInstance] = useState<AxiosInstance>(() =>
        axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL })
    );

    useEffect(() => {
        setInstance(() => {
            return axios.create({
                baseURL: process.env.NEXT_PUBLIC_API_URL,
                transformRequest: [
                    (data, headers) => {
                        headers["Authorization"] =
                            "Bearer " + auth.user?.id_token;
                        return data;
                    },
                ],
            });
        });

        if (!auth.isLoading) setIsLoading(false);
    }, [auth.user?.id_token, auth.isLoading, setInstance]);

    return { axios: instance, isLoading };
}
