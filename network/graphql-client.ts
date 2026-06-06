import { axiosInstance } from "./axios-instance";
import { ENDPOINTS } from "./endpoints";

interface GraphQLErrorExtensions {
  code?: string;
  originalError?: {
    statusCode?: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string; extensions?: GraphQLErrorExtensions }[];
}

export async function gqlRequest<T, V = Record<string, unknown>>(
  query: string,
  variables?: V,
): Promise<T> {
  const response = await axiosInstance.post<GraphQLResponse<T>>(
    ENDPOINTS.GRAPHQL,
    {
      query,
      variables,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (response.data.errors?.length) {
    const err = response.data.errors[0];
    throw {
      statusCode: err.extensions?.originalError?.statusCode ?? 400,
      message: err.message,
      error: err.extensions?.code ?? "ERR_GRAPHQL",
    };
  }

  return response.data.data as T;
}
