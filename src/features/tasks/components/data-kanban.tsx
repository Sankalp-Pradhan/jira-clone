import { useCallback, useState } from "react";
import { Task, TaskStatus } from "../types";
import {
    DragDropContext, // The wrapper for the entire board
    Droppable,       // The wrapper for each column (Backlog, Todo, etc.)
    Draggable,       // The wrapper for each individual Task card
    DropResult       // The TypeScript type for the result of a drag
} from "@hello-pangea/dnd";
import { KanbanColumnHeader } from "./kanban-column-header";
import { KanbanCard } from "./kanban-card";


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

    const onDragEnd = useCallback((result: DropResult) => {
        if (!result.destination) return;

        const { source, destination } = result;
        const sourceStatus = source.droppableId as TaskStatus;
        const destStatus = destination.droppableId as TaskStatus;

        let updatesPayload: { $id: string; status: TaskStatus; position: number; }[]

        setTasks((prevTasks) => {
            const newTasks = { ...prevTasks };

            const sourceColumn = [...newTasks[sourceStatus]];
            const [movedTask] = sourceColumn.splice(source.index, 1);

            if (!movedTask) {
                console.error("No task found at the source index");
                return prevTasks;
            }


            const updateMovedTasks = sourceStatus != destStatus
                ? { ...movedTask, status: destStatus }
                : movedTask;

            newTasks[sourceStatus] = sourceColumn;

            const destColumn = [...newTasks[destStatus]];
            destColumn.splice(destination.index, 0, updateMovedTasks)
            newTasks[destStatus] = destColumn;

            updatesPayload = [];

            updatesPayload.push({
                $id: updateMovedTasks.$id,
                status: destStatus,
                position: Math.min((destination.index + 1) * 1000, 1_000_000)
            })

            newTasks[destStatus].forEach((task, index) => {
                if (task && task.$id != updateMovedTasks.$id) {
                }
                const newPosition = Math.min((index + 1) * 1000, 1_000_000);
                if (task.position != newPosition) {
                    updatesPayload.push({
                        $id: task.$id,
                        status: destStatus,
                        position: newPosition,
                    })
                }
            })

            if (sourceStatus != destStatus) {
                newTasks[sourceStatus].forEach((task, index) => {
                    if (task) {
                        const newPosition = Math.min((index + 1) * 1000, 1_000_000);
                        if (task.position != newPosition) {
                            updatesPayload.push({
                                $id: task.$id,
                                status: destStatus,
                                position: newPosition,
                            })
                        }
                    }
                })
            }

return newTasks;
        })
    }, [])

    return (
        <div>
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex w-full overflow-x-auto gap-x-2 p-2">
                    {boards.map((board) => {
                        return (
                            <div key={board} className="flex-col bg-muted p-1.5 w-full rounded-md  items-center justify-between ">
                                <KanbanColumnHeader
                                    board={board}
                                    taskCount={tasks[board].length}
                                />
                                <Droppable droppableId={board}>
                                    {(provided) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className="min-h-[200px] py-1.5"
                                        >
                                            {tasks[board].map((task, index) => (
                                                <Draggable
                                                    key={task.$id}
                                                    draggableId={task.$id}
                                                    index={index}
                                                >
                                                    {(provided) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                        >
                                                            <KanbanCard task={task} />
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        )
                    })}
                </div>

            </DragDropContext>
        </div>
    )
} 