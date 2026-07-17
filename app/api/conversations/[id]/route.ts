import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { ConversationHistory } from "@/lib/models/ConversationHistory";
import { Messages } from "@/lib/models/Messages";
import { getUserId } from "@/lib/auth/getUserId";

/**
 * @swagger
 * /api/conversations/{id}:
 *   get:
 *     tags:
 *       - Conversations
 *     summary: Get a conversation and its messages
 *     description: Returns the authenticated user's conversation along with all of its messages sorted by creation time.
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
 *                       _id:
 *                         type: string
 *                         example: 6847d52d2f5d8c7f3d6a9b13
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
 *                       suggestion:
 *                         type: string
 *                         example: Hello, im good. How are you sunshine?
 *                       feedback:
 *                         type: string
 *                         example: Great sentence! Try using a contraction like "I'm".
 *                       score:
 *                         type: number
 *                         example: 95
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
    const userId = getUserId(req);
    try {
        await connectDB();

        const conversation = await ConversationHistory.findOne({
            _id: id,
            userId: userId
        }).lean();

        if (!conversation) {
            return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
        }

        const messages = await Messages.find({ conversationId: id })
            .sort({ createdAt: 1 })
            .select("_id role content createdAt score suggestion feedback")
            .lean();

        return NextResponse.json({ conversation, messages });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

/**
 * @swagger
 * /api/conversations/{id}:
 *   delete:
 *     tags:
 *       - Conversations
 *     summary: Delete a conversation
 *     description: Deletes the specified conversation and all associated messages.
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
        const userId = getUserId(req);

        await connectDB();

        const conversation = await ConversationHistory.findOneAndDelete({
            _id: id,
            userId,
        });

        if (!conversation) {
            return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
        }

        // clean up orphaned messages belonging to this conversation
        await Messages.deleteMany({ conversationId: id });

        return NextResponse.json({ success: true, message: "Conversation deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete conversation" }, { status: 500 });
    }
}