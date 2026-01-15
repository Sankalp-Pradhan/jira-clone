"use client"

import { ResponsiveModal } from "@/components/responsive-model";

import { CreateTaskFormWrapper } from "./create-task-form-wrapper";
import { useEditTaskModal } from "../hooks/use-edit-task-modal";
import { EditTaskFormWrapper } from "./edit-task-form-wrapper";

export const EditTaskModal = () => {
    const { taskId, setTaskId, close } = useEditTaskModal();

    return (
        <ResponsiveModal open={!!taskId} onOpenChange={close} >
            {taskId && (
                <EditTaskFormWrapper id={taskId} onCancel={close} />
            )}
        </ResponsiveModal>
    )
}   