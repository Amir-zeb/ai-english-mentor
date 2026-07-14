import mongoose, { Schema, models, model } from "mongoose";

export interface IMessage {
    _id: mongoose.Types.ObjectId;
    conversationId: mongoose.Types.ObjectId;
    role: "user" | "assistant" | "system";
    score: number,
    content: string;
    suggestion: string;
    createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
    {
        conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
        role: { type: String, enum: ["user", "assistant", "system"], required: true },
        content: { type: String, required: true, trim: true },
        suggestion: { type: String, trim: true },
        score: { type: Number, required: false }
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

export const Messages =
    models.Messages || model<IMessage>("Messages", MessageSchema);