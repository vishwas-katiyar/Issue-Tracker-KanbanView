import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../api/client";

export function useIssues() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery(["issues"], async () => {
    const res = await apiFetch("/api/issues/");
    if (!res.ok) throw new Error("Failed to fetch issues");
    return res.json();
  }, { refetchInterval: 15000 });

  const createIssue = useMutation(
    async (issue) => {
      const res = await apiFetch("/api/issues/", {
        method: "POST",
        body: JSON.stringify(issue),
      });
      if (!res.ok) throw new Error("Failed to create issue");
      return res.json();
    },
    {
      onSuccess: () => queryClient.invalidateQueries(["issues"]),
    }
  );

  return { issues: data, isLoading, error, createIssue };
}
