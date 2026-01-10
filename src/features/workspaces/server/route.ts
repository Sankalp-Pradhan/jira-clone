import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createWorkspaceSchema, updateWorkspaceSchema } from "../schemas";
import { sessionMiddleware } from "@/lib/session-middleware";
import { DATABASE_ID, IMAGES_BUCKET_ID, MEMBERS_ID, WORKSPACES_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { MemberRole } from "@/features/members/types";
import { generateInviteCode } from "@/lib/utils";
import { getMember } from "@/features/members/utils";
import { Workspace } from "../types";

const app = new Hono()
    // worksapce creation
    .get("/", sessionMiddleware, async (c) => {
        const databases = c.get("databases");
        const user = c.get("user");

        const members = await databases.listDocuments(
            DATABASE_ID,
            MEMBERS_ID,
            [Query.equal("userId", user.$id)]
        );

        if (members.total === 0) {
            return c.json({ data: { documents: [], total: 0 } });
        }

        const workspaceIds = members.documents.map((member) => member.workspaceId);

        const workspaces = await databases.listDocuments(
            DATABASE_ID,
            WORKSPACES_ID,
            [
                Query.orderDesc("$createdAt"),
                Query.contains("$id", workspaceIds),
            ],
        );
        return c.json({ data: workspaces });
    })
    // image upload
    .post(
        "/",
        zValidator("form", createWorkspaceSchema),
        sessionMiddleware,

        async (c) => {
            const databases = c.get("databases");
            const user = c.get("user");
            const storage = c.get("storage");
            const { name, image } = c.req.valid("form");

            let uploadImageUrl: string | undefined;

            if (image instanceof File) {
                const file = await storage.createFile(
                    IMAGES_BUCKET_ID,
                    ID.unique(),
                    image,
                )

                const arrayBuffer = await storage.getFileView(
                    IMAGES_BUCKET_ID,
                    file.$id,
                );

                uploadImageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`
            }

            const workspaces = await databases.createDocument(
                DATABASE_ID,
                WORKSPACES_ID,
                ID.unique(),
                {
                    name,
                    userId: user.$id,
                    imageUrl: uploadImageUrl,
                    inviteCode: generateInviteCode(6),
                },
            );

            await databases.createDocument(
                DATABASE_ID,
                MEMBERS_ID,
                ID.unique(),
                {
                    userId: user.$id,
                    workspaceId: workspaces.$id,
                    role: MemberRole.ADMIN,
                }
            )

            return c.json({ data: workspaces })
        }

    )

    .patch(
        "/:workspaceId",
        zValidator("form", updateWorkspaceSchema),
        sessionMiddleware,
        async (c) => {
            const databases = c.get("databases");
            const storage = c.get("storage");
            const user = c.get("user");

            const { workspaceId } = c.req.param();
            const { name, image } = c.req.valid("form");

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            });

            if (!member || member.role !== MemberRole.ADMIN) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            let uploadImageUrl: string | undefined;

            if (image instanceof File) {
                const file = await storage.createFile(
                    IMAGES_BUCKET_ID,
                    ID.unique(),
                    image,
                )

                const arrayBuffer = await storage.getFileView(
                    IMAGES_BUCKET_ID,
                    file.$id,
                );
                uploadImageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`
            } else {
                uploadImageUrl = image;
            }

            const workspce = await databases.updateDocument(
                DATABASE_ID,
                WORKSPACES_ID,
                workspaceId,
                {
                    name,
                    imageUrl: uploadImageUrl,
                }
            );
            return c.json({ data: workspce });
        }
    )
    //delete workspace
    .delete(
        "/:workspaceId",
        sessionMiddleware,
        async (c) => {
            const databases = c.get("databases");
            const user = c.get("user");

            const { workspaceId } = c.req.param();
            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            });

            if (!member || member.role !== MemberRole.ADMIN) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            await databases.deleteDocument(
                DATABASE_ID,
                WORKSPACES_ID,
                workspaceId,
            );
            return c.json({ data: { $id: workspaceId } });
        }
    )
    //reset invite link
    .post(
        "/:workspaceId/reset-invite-code",
        sessionMiddleware,
        async (c) => {
            const databases = c.get("databases");
            const user = c.get("user");

            const { workspaceId } = c.req.param();
            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            });

            if (!member || member.role !== MemberRole.ADMIN) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const workspace = await databases.updateDocument(
                DATABASE_ID,
                WORKSPACES_ID,
                workspaceId,
                {
                    inviteCode: generateInviteCode(6),
                }
            )
            return c.json({ data: workspace }
            );

        }
    )
    
    .post(
        "/:workspaceId/join",
        sessionMiddleware,
        zValidator("json", z.object({ code: z.string() })),
        async (c) => {
            const { workspaceId } = c.req.param();
            const { code } = c.req.valid("json");

            const databases = c.get("databases");
            const user = c.get("user")

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            })

            if (member) {
                return c.json({ error: "Already a Member" },400);
            }

            const workspace = await databases.getDocument<Workspace>(
                DATABASE_ID,
                WORKSPACES_ID,
                workspaceId
            )

            if (workspace.inviteCode !== code) {
                return c.json({ error: "Invalid invite code" }, 400)
            }

            await databases.createDocument(
                DATABASE_ID,
                MEMBERS_ID,
                ID.unique(),
                {
                    workspaceId,
                    userId: user.$id,
                    role: MemberRole.MEMBER
                }
            )
            return c.json({ data: workspace })
        }
    )



export default app;