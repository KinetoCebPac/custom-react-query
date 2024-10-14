import React from "react";
import { useQueryClient } from "../customQuery/QueryClientProvider";
import { useMutation, useQuery } from "../customQuery/hooks";

interface User {
  id: number;
  name: string;
}

const ExampleComponent: React.FC = () => {
  const queryClient = useQueryClient();

  const {
    data: users,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<User[]>(
    "users",
    () =>
      fetch("https://jsonplaceholder.typicode.com/users").then((res) =>
        res.json()
      ),
    { staleTime: 5000, retry: 3 }
  );

  const { mutate: createUser, isLoading: isCreating } = useMutation<
    User,
    { name: string }
  >(
    (variables) =>
      fetch("https://jsonplaceholder.typicode.com/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(variables),
      }).then((res) => res.json()),
    {
      onSuccess: (data) => {
        console.log("User created:", data);
        queryClient.invalidateQueries("users");
      },
    }
  );

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Users</h1>
      {isLoading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      ) : isError ? (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error?.message}</span>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-gray-200">
            {users?.map((user) => (
              <li
                key={user.id}
                className="py-4 flex items-center hover:bg-gray-50"
              >
                <span className="text-lg text-gray-700">{user.name}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex space-x-4">
            <button
              onClick={() => createUser({ name: "New User" })}
              disabled={isCreating}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? "Creating..." : "Create User"}
            </button>
            <button
              onClick={() => refetch()}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
            >
              Refetch Users
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ExampleComponent;
