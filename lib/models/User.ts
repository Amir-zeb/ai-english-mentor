import mongoose, { Schema, models, model } from "mongoose";

export interface IUser {
    _id: mongoose.Types.ObjectId;
    firstName: string;
    lastName: string;
    username: string;
    passwordHash: string;
    createdAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        passwordHash: { type: String, required: true, trim: true },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

export const User = models.User || model<IUser>("User", UserSchema);