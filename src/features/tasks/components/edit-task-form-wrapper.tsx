// import { Card, CardContent } from "@/components/ui/card";
// import { useGetMembers } from "@/features/members/api/use-get-member";
// import { useGetProjects } from "@/features/projects/api/use-get-projects";
// import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
// import { Loader } from "lucide-react";
// import { CreateTaskForm } from "./create-task-form";


// interface CreateTaskFormWrapperProps {
//     onCancel: () => void;
// }

// export const CreateTaskFormWrapper = ({
//     onCancel
// }: CreateTaskFormWrapperProps) => {
//     const workspaceId = useWorkspaceId()

//     const { data: projects, isLoading: isLoadingProjects } = useGetProjects({ workspaceId })
//     const { data: members, isLoading: isLoadingMembers } = useGetMembers({ workspaceId })

//     const projectOptions = projects?.documents.map((project) => ({
//         id: project.$id,
//         name: project.name,
//         imageUrl: project.imageUrl,
//     }))
//     const memberOptions = members?.documents.map((project) => ({
//         id: project.$id,
//         name: project.name,
//         imageUrl: project.imageUrl,
//     }))

//     const isLoading = isLoadingProjects || isLoadingMembers;

//     if (isLoading) {
//         return (
//             <Card className="w-full h-[714px] border-none shadow-none">
//                 <CardContent className="flex items-center justify-center h-full" >
//                     <Loader className="size-5 animate-spin text-muted-foreground">
//                     </Loader>
//                 </CardContent>
//             </Card>
//         )

//     }

//     return (
//         <div>
//             <CreateTaskForm
//                 onCancel={onCancel}
//                 projectOptions={projectOptions ?? []}
//                 memberOptions={memberOptions ?? []}
//             />
//         </div>
//     )
// }



// import { Card, CardContent } from "@/components/ui/card";
// import { useGetMembers } from "@/features/members/api/use-get-member";
// import { useGetProjects } from "@/features/projects/api/use-get-projects";
// import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
// import { Loader } from "lucide-react";
// import { CreateTaskForm } from "./create-task-form";

// interface CreateTaskFormWrapperProps {
//     onCancel: () => void;
// }

// export const CreateTaskFormWrapper = ({
//     onCancel
// }: CreateTaskFormWrapperProps) => {
//     // FIX 1: Corrected hook assignment
//     const workspaceId = useWorkspaceId();

//     const { data: projects, isLoading: isLoadingProjects } = useGetProjects({ workspaceId });
//     const { data: members, isLoading: isLoadingMembers } = useGetMembers({ workspaceId });


//     const projectOptions = projects?.documents.map((c) => ({
//         id: c.project?.$id,
//         name: c.project?.name,
//         imageUrl: c.project?.imageUrl,
//     }));

// // const projectOptions = projects?.documents.map((project) => ({
// //         id: project.$id,
// //         name: project.name,
// //          imageUrl: project?.imageUrl,
// //     })) ?? [];

//     // const memberOptions = members?.documents.map((member) => ({
//     //     id: member.$id,
//     //     name: member.name, // Ensure 'name' exists on the member document

//     // }));


//     const memberOptions = members?.documents.map((project) => ({
//         id: project.$id,
//         name: project.name,

//     })) ?? [];

//     const isLoading = isLoadingProjects || isLoadingMembers;

//     if (isLoading) {
//         return (
//             <Card className="w-full h-[714px] border-none shadow-none">
//                 <CardContent className="flex items-center justify-center h-full" >
//                     <Loader className="size-5 animate-spin text-muted-foreground" />
//                 </CardContent>
//             </Card>
//         );
//     }

//     return (

//         <CreateTaskForm
//             onCancel={onCancel}
//             projectOptions={projectOptions ?? []}
//             memberOptions={memberOptions ?? []}
//         />

//     );
// };




import { Card, CardContent } from "@/components/ui/card";
import { useGetMembers } from "@/features/members/api/use-get-member";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { Loader } from "lucide-react";
import { CreateTaskForm } from "./create-task-form";
import { useGetTask } from "../api/use-get-task";
import { EditTaskForm } from "./edit-task-form";

interface EditTaskFormWrapperProps {
    onCancel: () => void;
    id: string;
}

export const EditTaskFormWrapper = ({
    onCancel,
    id
}: EditTaskFormWrapperProps) => {
    const workspaceId = useWorkspaceId();

    const { data: projects, isLoading: isLoadingProjects } = useGetProjects({ workspaceId });
    const { data: members, isLoading: isLoadingMembers } = useGetMembers({ workspaceId });
    const { data: initialValues, isLoading: isLoadingTask } = useGetTask({ taskId: id })

    const projectOptions = projects?.documents.map((project) => ({
        id: project.$id,
        name: project.name,
        imageUrl: project.imageUrl,
    })) ?? [];
    const memberOptions = members?.documents.map((member) => ({
        id: member.$id ?? "",
        name: member.name ?? "",
    })).filter((member) => member.id && member.name) ?? [];

    const isLoading = isLoadingProjects || isLoadingMembers || isLoadingTask;

    if (isLoading) {
        return (
            <Card className="w-full h-[714px] border-none shadow-none">
                <CardContent className="flex items-center justify-center h-full">
                    <Loader className="size-5 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    if (!initialValues) {
        return null;
    }

    return (
        <EditTaskForm
            onCancel={onCancel}
            projectOptions={projectOptions}
            memberOptions={memberOptions}
            initialValues={initialValues}
        />
    );
};