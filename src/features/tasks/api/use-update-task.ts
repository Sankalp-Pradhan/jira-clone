import { toast } from "sonner";
import { Mutation, QueryClient, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";


type ResponseType = InferResponseType<typeof client.api.tasks[":taskId"]["$patch"], 200>
type RequestType = InferRequestType<typeof client.api.tasks[":taskId"]["$patch"]>

export const useUpdateTask = () => {

    const router = useRouter();
    const queryClient = useQueryClient();

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ json, param }) => {
            const response = await client.api.tasks[":taskId"]["$patch"]({ json, param });//     ({json})

            if (!response.ok) {
                throw new Error("Failed to update tasks");
            }

            return await response.json();
        },

        onSuccess: ({ data }) => {
            toast.success("Task updated");
            queryClient.invalidateQueries({ queryKey: ["tasks"] })
            queryClient.invalidateQueries({ queryKey: ["task", data.$id] })
            router.refresh()
        },
        onError: () => {
            toast.error("Failed to update task");
        }
    });


    return mutation;
}
