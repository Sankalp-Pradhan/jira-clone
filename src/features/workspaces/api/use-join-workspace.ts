import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useMutation } from "@tanstack/react-query";


type ResponseType = InferResponseType<typeof client.api.workspaces[":workspaceId"]["join"]["$post"], 200>
type RequestType = InferRequestType<typeof client.api.workspaces[":workspaceId"]["join"]["$post"]>

export const useJoinWorkspace = () => {

    const queryClient = useQueryClient();

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ param, json }) => {
            const response = await client.api.workspaces[":workspaceId"]["join"]["$post"]({ param, json });//     ({json})

            if (!response.ok) {
                throw new Error("Failed to join workspace");
            }

            return await response.json();
        },

        onSuccess: (response) => {

            if ("data" in response) {
                toast.success("Joined workspace");
                queryClient.invalidateQueries({ queryKey: ["workspaces"] });
                queryClient.invalidateQueries({ queryKey: ["workspace", response.data.$id] });
            }
        },
    });


    return mutation;
}
