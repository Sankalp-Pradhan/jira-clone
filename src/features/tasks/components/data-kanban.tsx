import { useState } from "react";
import { Task, TaskStatus } from "../types";
import {
    DragDropContext, // The wrapper for the entire board
    Droppable,       // The wrapper for each column (Backlog, Todo, etc.)
    Draggable,       // The wrapper for each individual Task card
    DropResult       // The TypeScript type for the result of a drag
} from "@hello-pangea/dnd";
import { KanbanColumnHeader } from "./kanban-column-header";


const boards: TaskStatus[] = [
    TaskStatus.BACKLOG,
    TaskStatus.TODO,
    TaskStatus.IN_PROGRESS,
    TaskStatus.IN_REVIEW,
    TaskStatus.DONE,
]

interface DataKanbanProps {
    data: Task[];
};



type TaskState = {
    [key in TaskStatus]: Task[];
}
export const DataKanban = ({
    data,
}: DataKanbanProps) => {
    const [tasks, setTasks] = useState<TaskState>(() => {
        const initialTasks: TaskState = {
            [TaskStatus.BACKLOG]: [],
            [TaskStatus.TODO]: [],
            [TaskStatus.IN_PROGRESS]: [],
            [TaskStatus.IN_REVIEW]: [],
            [TaskStatus.DONE]: [],
        }

        data.forEach((task) => {
            initialTasks[task.status].push(task);
        })

        Object.keys(initialTasks).forEach((status) => {
            initialTasks[status as TaskStatus].sort((a, b) => a.position - b.position)
        })

        return initialTasks;
    })

    return (
        <div>
            <DragDropContext onDragEnd={() => { }}>
                <div className="flex w-full overflow-x-auto gap-x-2 p-2">
                    {boards.map((board) => {
                        return (
                            <div key={board} className=" bg-muted p-1.5 w-full rounded-md flex items-center justify-between ">
                                <KanbanColumnHeader
                                board={board}
                                taskCount={tasks[board].length}
                                />
                            </div>
                        )
                    })}
                </div>

            </DragDropContext>
        </div>
    )
} 