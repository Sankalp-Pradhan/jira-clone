import { useParams } from "next/navigation";

export const useProjectId = () => {
    const params = useParams();
    // This must match the folder name in your (dashboard) or [projectId] route
    return params.projectId as string;
};