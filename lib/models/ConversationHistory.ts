import mongoose, { Schema, models, model } from "mongoose";

export interface IConversationHistory {
    _id: mongoose.Types.ObjectId;
    title: string;
    model: string;
    createdAt: Date;
    updatedAt: Date;
}

const ConversationHistorySchema = new Schema<IConversationHistory>(
    {
        title: { type: String, default: "New conversation", trim: true, required: true },
        model: { type: String, required: true },
    },
    { timestamps: true }
);

export const ConversationHistory =
    models.ConversationHistory || model<IConversationHistory>("ConversationHistory", ConversationHistorySchema);