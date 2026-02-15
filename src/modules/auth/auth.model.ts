import bcrypt from "bcrypt";
import { Schema, model, type Document } from "mongoose";

export interface IAuth extends Document {
    email: string;
    password: string;
    refreshToken?: string;
    validationToken?: string;
}

const authSchema = new Schema<IAuth>({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: String,
    },
    validationToken: {
        type: String,
    },
});

authSchema.pre("save", async function () {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password as string, 12);
    }
});

const Auth = model<IAuth>("Auth", authSchema);

export default Auth;