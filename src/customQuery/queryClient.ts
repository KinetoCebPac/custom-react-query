/* eslint-disable @typescript-eslint/no-explicit-any */
import { QueryKey, QueryState } from "./types";

class QueryClient {
  // Cache to store query states
  private readonly cache: Map<string, QueryState<any>> = new Map();
  // Set of subscriber callbacks
  private readonly subscribers: Set<() => void> = new Set();

  // Retrieve data for a specific query
  getQueryData<TData>(queryKey: QueryKey): TData | undefined {
    const cacheKey = JSON.stringify(queryKey);
    return this.cache.get(cacheKey)?.data;
  }

  // Set data for a specific query
  setQueryData<TData>(queryKey: QueryKey, data: TData): void {
    const cacheKey = JSON.stringify(queryKey);
    const existingState = this.cache.get(cacheKey);
    this.cache.set(cacheKey, {
      ...existingState,
      data,
      status: "success",
      fetchStatus: "idle",
      lastUpdated: Date.now(),
      error: null, // Explicitly set error to null
    } as QueryState<TData>);
    this.notify();
  }

  // Mark a query as invalid, forcing a refetch on next access
  invalidateQueries(queryKey: QueryKey): void {
    const cacheKey = JSON.stringify(queryKey);
    const existingState = this.cache.get(cacheKey);
    if (existingState) {
      this.cache.set(cacheKey, {
        ...existingState,
        lastUpdated: 0,
      });
      this.notify();
    }
  }

  // Get the full state of a query
  getQueryState<TData>(queryKey: QueryKey): QueryState<TData> | undefined {
    const cacheKey = JSON.stringify(queryKey);
    return this.cache.get(cacheKey);
  }

  // Update the state of a query
  setQueryState<TData>(
    queryKey: QueryKey,
    state: Partial<QueryState<TData>>
  ): void {
    const cacheKey = JSON.stringify(queryKey);
    const existingState = this.cache.get(cacheKey) || { data: undefined };
    this.cache.set(cacheKey, {
      ...existingState,
      ...state,
      lastUpdated: Date.now(),
      data: state.data ?? existingState.data,
    } as QueryState<TData>);
    this.notify();
  }

  // Add a subscriber to be notified of cache changes
  subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  // Notify all subscribers of a cache change
  private notify(): void {
    this.subscribers.forEach((callback) => callback());
  }
}

// Create and export a single instance of QueryClient
export const queryClient = new QueryClient();
