import { Schema, model, type Document } from "mongoose";

export interface IProfile extends Document {
    userId: Schema.Types.ObjectId; // Foreign key reference to Auth model
    name: string;
    phoneNumber: string;
    preferences: string[]; // Array of category strings (e.g., sports, economics, trading)
    location: string;
}

const profileSchema = new Schema<IProfile>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "Auth",
            required: true,
            unique: true, // One profile per user
        },
        name: {
            type: String,
            required: true,
        },
        phoneNumber: {
            type: String,
            required: true,
        },
        preferences: {
            type: [String],
            required: true,
        },
        location: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
    }
);

const Profile = model<IProfile>("Profile", profileSchema);

export default Profile;
