import { toast } from "sonner";
import { Mutation, QueryClient, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useMutation } from "@tanstack/react-query";


type ResponseType = InferResponseType<typeof client.api.workspaces[":workspaceId"]["$delete"], 200>
type RequestType = InferRequestType<typeof client.api.workspaces[":workspaceId"]["$delete"]>

export const useDeleteWorkspce = () => {

    const queryClient = useQueryClient();

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ param }) => {
            const response = await client.api.workspaces[":workspaceId"]["$delete"]({ param });//     ({json})

            if (!response.ok) {
                throw new Error("Failed to delete workspace");
            }

            return await response.json();
        },

        onSuccess: ({ data }) => {
            toast.success("Workspace deleted");
            queryClient.invalidateQueries({ queryKey: ["workspaces"] })
            queryClient.invalidateQueries({ queryKey: ["workspaces", data.$id] })
        },
        onError: () => {
            toast.error("Failed to create workspace");
        }
    });


    return mutation;
}
