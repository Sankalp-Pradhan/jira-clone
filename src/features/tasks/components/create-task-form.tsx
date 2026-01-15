"use client"

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useRef } from "react";

import {
    Form,
    FormItem,
    FormControl,
    FormLabel,
    FormField,
    FormMessage,
} from "@/components/ui/form";
import { DottedSeperator } from "@/components/dotted-seperator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useCreateTask } from "../api/use-create-task";
import { createTasksFormSchema } from "../schema";
import { DatePicker } from "@/components/date-picker";
import { MemberAvatar } from "@/features/workspaces/components/member-avatar";
import { TaskStatus } from "../types";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";


interface CreateTaskFormProps {
    onCancel?: () => void;
    projectOptions: { id: string, name: string, imageUrl: string }[];
    memberOptions: { id: string, name: string }[];  
}

// Define output type for the form (after coercion)
type FormValues = z.infer<typeof createTasksFormSchema>;

export const CreateTaskForm = ({ onCancel, projectOptions, memberOptions }: CreateTaskFormProps) => {
    const workspaceId = useWorkspaceId();
    const router = useRouter();
    const { mutate, isPending } = useCreateTask();

    const inputRef = useRef<HTMLInputElement>(null)

    const form = useForm<FormValues>({
        resolver: zodResolver(createTasksFormSchema),
        defaultValues: {
            workspaceId,
        }
    });


    const onSubmit = (values: FormValues) => {
        // ✅ Transform Date to ISO string before sending to API
        mutate({
            json: {
                ...values,
                dueDate: values.dueDate.toISOString(), // Convert Date to string
            }
        }, {
            onSuccess: () => {
                form.reset();
                onCancel?.();
            }
        });
    };

    return (

        <Card className="w-full h-full border-none shadow-none">
            <CardHeader>
                <CardTitle>
                    Create a new Task
                </CardTitle>
            </CardHeader>
            <div className="px-7 ">
                <DottedSeperator />
            </div>
            <CardContent className="p-7">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="flex flex-col gap-y-4">


                            {/* task name */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Task Name
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Enter task name"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* due date */}
                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Due Date
                                        </FormLabel>
                                        <FormControl>
                                            {/* <DatePicker{...field} /> */}
                                            <DatePicker
                                                value={field.value as Date | undefined}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* assignee */}
                            <FormField
                                control={form.control}
                                name="assigneeId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Assignee
                                        </FormLabel>
                                        <Select
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select assignee" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <FormMessage />
                                            <SelectContent>
                                                {memberOptions.map((member) => (
                                                    <SelectItem key={member.id} value={member.id}>
                                                        <div className="flex items-center gap-x-2">
                                                            <MemberAvatar
                                                                className="size-6"
                                                                name={member.name}
                                                            />
                                                            {member.name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* status */}
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Status
                                        </FormLabel>
                                        <Select
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <FormMessage />
                                            <SelectContent>
                                                <SelectItem value={TaskStatus.BACKLOG}><span className="text-red-500 font-semibold">BACKLOG</span></SelectItem>
                                                <SelectItem value={TaskStatus.DONE}><span className="text-green-500 font-semibold">DONE</span></SelectItem>
                                                <SelectItem value={TaskStatus.IN_PROGRESS}><span className="text-green-400 font-semibold">IN_PROGRESS</span></SelectItem>
                                                <SelectItem value={TaskStatus.IN_REVIEW}><span className="font-semibold text-yellow-500">IN_REVIEW</span></SelectItem>
                                                <SelectItem value={TaskStatus.TODO}><span className="font-semibold text-gray-500">TODO</span></SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="projectId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Project
                                        </FormLabel>
                                        <Select
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select project" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <FormMessage />
                                            <SelectContent>
                                                {projectOptions.length === 0 && (
                                                    <div className="p-2 text-sm text-muted-foreground">No projects found</div>
                                                )}
                                                {projectOptions.map((project) => (
                                                    <SelectItem key={project.id} value={project.id}>
                                                        <div className="flex items-center gap-x-2">
                                                            <ProjectAvatar
                                                                className="size-6"
                                                                name={project.name}
                                                                image={project.imageUrl}
                                                            />
                                                            {project.name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DottedSeperator className="py-7" />
                        <div className="flex items-center justify-between">
                            <Button
                                type="button"
                                size="lg"
                                variant="secondary"
                                onClick={onCancel}
                                disabled={isPending}
                                className={cn(!onCancel && "invisible")}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="lg"
                                disabled={isPending}
                            >
                                Create Task
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card >
    )

}   