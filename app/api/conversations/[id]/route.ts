import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { ConversationHistory } from "@/lib/models/ConversationHistory";
import { Messages } from "@/lib/models/Messages";

/**
 * @swagger
 * /api/conversations/{id}:
 *   get:
 *     tags:
 *       - ConversationHistory
 *     summary: Get a conversation and its messages
 *     description: Returns a conversation along with all of its messages.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
 *         example: 6847d52d2f5d8c7f3d6a9b12
 *     responses:
 *       200:
 *         description: Conversation retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 conversation:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 6847d52d2f5d8c7f3d6a9b12
 *                     title:
 *                       type: string
 *                       example: Hello, how are you?
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-07-09T12:34:56.789Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-07-09T12:40:21.123Z
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       role:
 *                         type: string
 *                         enum:
 *                           - user
 *                           - assistant
 *                           - system
 *                         example: user
 *                       content:
 *                         type: string
 *                         example: Hello, how are you?
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2026-07-09T12:34:56.789Z
 *       404:
 *         description: Conversation not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Conversation not found
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    await connectDB();

    const conversation = await ConversationHistory.findById(id).lean();
    if (!conversation) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const messages = await Messages.find({ conversationId: id })
        .sort({ createdAt: 1 })
        .select("role content createdAt")
        .lean();

    return NextResponse.json({ conversation, messages });
}

/**
 * @swagger
 * /api/conversations/{id}:
 *   delete:
 *     tags:
 *       - ConversationHistory
 *     summary: Delete a conversation
 *     description: Deletes a conversation and all messages associated with it.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Conversation ID
 *         example: 6847d52d2f5d8c7f3d6a9b12
 *     responses:
 *       200:
 *         description: Conversation deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Conversation deleted successfully
 *       404:
 *         description: Conversation not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Conversation not found
 *       500:
 *         description: Failed to delete the conversation.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to delete conversation
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await connectDB();

        const conversation = await ConversationHistory.findByIdAndDelete(id);
        if (!conversation) {
            return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
        }

        // clean up orphaned messages belonging to this conversation
        await Messages.deleteMany({ conversationId: id });

        return NextResponse.json({ success: true, message: "Conversation deleted successfully" });
    } catch (error) {
        console.error("Delete conversation error:", error);
        return NextResponse.json({ error: "Failed to delete conversation" }, { status: 500 });
    }
}