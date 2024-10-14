export type QueryKey = string | readonly unknown[];
export type QueryFunction<TData> = () => Promise<TData>;
export type MutationFunction<TData, TVariables> = (
  variables: TVariables
) => Promise<TData>;

export interface QueryOptions<TData> {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  retry?: number | boolean;
  retryDelay?: number;
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
}

export interface MutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  onSettled?: (
    data: TData | undefined,
    error: Error | null,
    variables: TVariables
  ) => void;
}

export interface QueryResult<TData> {
  data: TData | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  isFetching: boolean;
}

export interface MutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  data: TData | undefined;
  reset: () => void;
}

export interface QueryState<TData> {
  data: TData | undefined;
  error: Error | null;
  status: "idle" | "loading" | "error" | "success";
  fetchStatus: "idle" | "fetching";
  lastUpdated: number;
}

export interface QueryClient {
  getQueryData: <TData>(queryKey: QueryKey) => TData | undefined;
  setQueryData: <TData>(queryKey: QueryKey, data: TData) => void;
  invalidateQueries: (queryKey: QueryKey) => void;
}
