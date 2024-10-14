import { useState, useEffect, useCallback, useRef } from "react";
import { queryClient } from "./queryClient";
import {
  QueryKey,
  QueryFunction,
  QueryOptions,
  QueryResult,
  MutationFunction,
  MutationOptions,
  MutationResult,
} from "./types";

export function useQuery<TData>(
  queryKey: QueryKey,
  queryFn: QueryFunction<TData>,
  options: QueryOptions<TData> = {}
): QueryResult<TData> {
  const [, forceUpdate] = useState({});
  // Use a ref for options to avoid unnecessary re-renders
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Get or initialize the query state
  const queryState = queryClient.getQueryState<TData>(queryKey) || {
    status: "idle",
    fetchStatus: "idle",
    data: undefined,
    error: null,
    lastUpdated: 0,
  };

  // Define the fetch function
  const fetch = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    if (queryState.fetchStatus === "fetching") return;

    queryClient.setQueryState(queryKey, {
      status: "loading",
      fetchStatus: "fetching",
    });
    try {
      const data = await queryFn();
      queryClient.setQueryState(queryKey, {
        status: "success",
        data,
        fetchStatus: "idle",
        lastUpdated: Date.now(),
      });
      optionsRef.current.onSuccess?.(data);
    } catch (error) {
      queryClient.setQueryState(queryKey, {
        status: "error",
        error: error instanceof Error ? error : new Error("An error occurred"),
        fetchStatus: "idle",
      });
      optionsRef.current.onError?.(
        error instanceof Error ? error : new Error("An error occurred")
      );
    }
  }, [queryFn, queryKey]);

  // Subscribe to query client updates
  useEffect(() => {
    const unsubscribe = queryClient.subscribe(() => forceUpdate({}));
    return unsubscribe;
  }, []);

  // Use a ref to track if initial fetch has occurred
  const initialFetchRef = useRef(false);

  // Effect to handle initial and subsequent fetches
  useEffect(() => {
    // Skip if initial fetch has already occurred
    if (initialFetchRef.current) return;

    // Determine if we should fetch
    const shouldFetch =
      options.enabled !== false &&
      (queryState.status === "idle" ||
        Date.now() - queryState.lastUpdated > (options.staleTime ?? 0));

    if (shouldFetch) {
      initialFetchRef.current = true;
      fetch();
    }
  }, [
    fetch,
    options.enabled,
    options.staleTime,
    queryState.status,
    queryState.lastUpdated,
  ]);

  // Define refetch function
  const refetch = useCallback(() => {
    return fetch();
  }, [fetch]);

  // Return query result
  return {
    data: queryState.data,
    isLoading: queryState.status === "loading",
    isError: queryState.status === "error",
    error: queryState.error,
    refetch,
    isFetching: queryState.fetchStatus === "fetching",
  };
}

export function useMutation<TData, TVariables>(
  mutationFn: MutationFunction<TData, TVariables>,
  options: MutationOptions<TData, TVariables> = {}
): MutationResult<TData, TVariables> {
  const [state, setState] = useState<{
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    data: TData | undefined;
  }>({
    isLoading: false,
    isError: false,
    error: null,
    data: undefined,
  });

  const mutate = useCallback(
    async (variables: TVariables) => {
      setState({
        isLoading: true,
        isError: false,
        error: null,
        data: undefined,
      });
      try {
        const data = await mutationFn(variables);
        setState({ isLoading: false, isError: false, error: null, data });
        options.onSuccess?.(data, variables);
        options.onSettled?.(data, null, variables);
        return data;
      } catch (error) {
        const errorObject =
          error instanceof Error ? error : new Error("An error occurred");
        setState({
          isLoading: false,
          isError: true,
          error: errorObject,
          data: undefined,
        });
        options.onError?.(errorObject, variables);
        options.onSettled?.(undefined, errorObject, variables);
        throw error;
      }
    },
    [mutationFn, options]
  );

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      isError: false,
      error: null,
      data: undefined,
    });
  }, []);

  return {
    mutate,
    ...state,
    reset,
  };
}
