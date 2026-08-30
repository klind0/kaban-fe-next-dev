"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React, { useEffect } from "react";
import Cookies from "js-cookie";
import { useUserStore } from "@/app/stores/user-store";

const AUTH_COOKIE_NAME = "EzxqowpoqiaQa";

function ReactQueryProvider({ children }: React.PropsWithChildren) {
    const [queryClient] = React.useState(
        () => new QueryClient({
            defaultOptions: {
                queries: {
                    staleTime: 60 * 1000,
                    refetchOnWindowFocus: false,
                },
            },
        }),
    );

    const logout = useUserStore((state) => state.logout);

    useEffect(() => {
        const checkToken = () => {
            const token = Cookies.get(AUTH_COOKIE_NAME);
            if (!token) {
                logout?.();
            }
        };

        checkToken();
        window.addEventListener("focus", checkToken);

        return () => window.removeEventListener("focus", checkToken);
    }, [logout]);

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
        </QueryClientProvider>
    );
}

export default ReactQueryProvider;