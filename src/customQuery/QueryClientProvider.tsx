import React, { createContext, useContext } from "react";
import { QueryClient } from "./types";
import { queryClient } from "./queryClient";

// Create a context to hold the QueryClient instance
const QueryClientContext = createContext<QueryClient | undefined>(undefined);

// QueryClientProvider component to wrap the app and provide the QueryClient instance
export const QueryClientProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    // Provide the queryClient instance to all child components
    <QueryClientContext.Provider value={queryClient}>
      {children}
    </QueryClientContext.Provider>
  );
};

// Custom hook to access the QueryClient instance from any component
export const useQueryClient = () => {
  // Attempt to get the QueryClient from the context
  const context = useContext(QueryClientContext);

  // Throw an error if the hook is used outside of a QueryClientProvider
  if (!context) {
    throw new Error("useQueryClient must be used within a QueryClientProvider");
  }

  // Return the QueryClient instance
  return context;
};
